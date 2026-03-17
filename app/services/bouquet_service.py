from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.bouquet_repository import BouquetRepository
from app.repositories.flower_repository import FlowerRepository
from app.schemas.bouquet import BouquetCreateRequest, BouquetListResponse, BouquetResponse
from app.utils.money import to_money


class BouquetService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.bouquet_repository = BouquetRepository(session)
        self.flower_repository = FlowerRepository(session)

    async def create(self, business_id: int, payload: BouquetCreateRequest) -> BouquetResponse:
        flower_quantities = {item.flower_id: item.quantity for item in payload.items}
        flower_ids = list(flower_quantities.keys())

        flowers = await self.flower_repository.get_by_ids_for_update(business_id, flower_ids)
        flowers_by_id = {flower.id: flower for flower in flowers}

        missing_ids = [flower_id for flower_id in flower_ids if flower_id not in flowers_by_id]
        if missing_ids:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Flowers not found: {missing_ids}",
            )

        bouquet_items_data: list[dict] = []
        total_cost = Decimal("0.00")
        total_price = Decimal("0.00")

        for request_item in payload.items:
            flower = flowers_by_id[request_item.flower_id]
            quantity = request_item.quantity

            if flower.stock_quantity < quantity:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Insufficient stock for flower_id={flower.id}",
                )

            cost_per_unit = to_money(Decimal(flower.purchase_price))
            sale_price_per_unit = to_money(
                Decimal(flower.purchase_price)
                + (Decimal(flower.purchase_price) * Decimal(flower.markup_percent) / Decimal("100"))
            )

            item_total_cost = to_money(cost_per_unit * quantity)
            item_total_price = to_money(sale_price_per_unit * quantity)
            item_total_profit = to_money(item_total_price - item_total_cost)

            flower.stock_quantity -= quantity
            if flower.stock_quantity < 0:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"stock_quantity cannot be negative for flower_id={flower.id}",
                )

            bouquet_items_data.append(
                {
                    "flower_id": flower.id,
                    "quantity": quantity,
                    "cost_per_unit": cost_per_unit,
                    "sale_price_per_unit": sale_price_per_unit,
                    "total_cost": item_total_cost,
                    "total_price": item_total_price,
                    "total_profit": item_total_profit,
                }
            )

            total_cost = to_money(total_cost + item_total_cost)
            total_price = to_money(total_price + item_total_price)

        total_profit = to_money(total_price - total_cost)

        bouquet = await self.bouquet_repository.create(
            business_id=business_id,
            total_cost=total_cost,
            total_price=total_price,
            total_profit=total_profit,
            items=bouquet_items_data,
        )

        saved_bouquet = await self.bouquet_repository.get_by_id(business_id, bouquet.id)
        if not saved_bouquet:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to load created bouquet",
            )

        return BouquetResponse.model_validate(saved_bouquet)

    async def list(self, business_id: int, offset: int, limit: int) -> BouquetListResponse:
        bouquets, total = await self.bouquet_repository.get_list(business_id=business_id, offset=offset, limit=limit)
        return BouquetListResponse(
            total=total,
            offset=offset,
            limit=limit,
            items=[BouquetResponse.model_validate(item) for item in bouquets],
        )
