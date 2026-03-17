from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import Flower
from app.repositories.flower_repository import FlowerRepository
from app.schemas.flower import FlowerCreate, FlowerListResponse, FlowerResponse, FlowerUpdate
from app.utils.money import to_money


class FlowerService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.flower_repository = FlowerRepository(session)

    async def list(self, business_id: int, offset: int, limit: int) -> FlowerListResponse:
        flowers, total = await self.flower_repository.get_list(business_id=business_id, offset=offset, limit=limit)
        return FlowerListResponse(
            total=total,
            offset=offset,
            limit=limit,
            items=[FlowerResponse.model_validate(item) for item in flowers],
        )

    async def create(self, business_id: int, payload: FlowerCreate) -> FlowerResponse:
        normalized_name = payload.name.strip()
        if not normalized_name:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="name cannot be empty",
            )

        flower = Flower(
            name=normalized_name,
            purchase_price=to_money(Decimal(payload.purchase_price)),
            markup_percent=to_money(Decimal(payload.markup_percent)),
            stock_quantity=payload.stock_quantity,
            business_id=business_id,
        )

        try:
            existing = await self.flower_repository.get_by_name(business_id, flower.name)
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Flower with this name already exists",
                )
            flower = await self.flower_repository.create(flower)
        except IntegrityError as exc:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Flower with this name already exists",
            ) from exc

        return FlowerResponse.model_validate(flower)

    async def update(self, business_id: int, flower_id: int, payload: FlowerUpdate) -> FlowerResponse:
        try:
            flower = await self.flower_repository.get_by_id(business_id, flower_id)
            if not flower:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Flower not found",
                )

            update_data = payload.model_dump(exclude_none=True)
            if "name" in update_data:
                new_name = update_data["name"].strip()
                if not new_name:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="name cannot be empty",
                    )
                existing = await self.flower_repository.get_by_name(business_id, new_name)
                if existing and existing.id != flower_id:
                    raise HTTPException(
                        status_code=status.HTTP_409_CONFLICT,
                        detail="Flower with this name already exists",
                    )
                flower.name = new_name

            if "purchase_price" in update_data:
                flower.purchase_price = to_money(Decimal(update_data["purchase_price"]))
            if "markup_percent" in update_data:
                flower.markup_percent = to_money(Decimal(update_data["markup_percent"]))
            if "stock_quantity" in update_data:
                if update_data["stock_quantity"] < 0:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="stock_quantity cannot be negative",
                    )
                flower.stock_quantity = int(update_data["stock_quantity"])

            flower = await self.flower_repository.update(flower)
        except IntegrityError as exc:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Flower with this name already exists",
            ) from exc

        return FlowerResponse.model_validate(flower)

    async def delete(self, business_id: int, flower_id: int) -> None:
        try:
            flower = await self.flower_repository.get_by_id(business_id, flower_id)
            if not flower:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Flower not found",
                )

            await self.flower_repository.delete(flower)
        except IntegrityError as exc:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Cannot delete flower that is referenced in bouquet history",
            ) from exc
