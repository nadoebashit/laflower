from decimal import Decimal

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db.models import Bouquet, BouquetItem


class BouquetRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(
        self,
        business_id: int,
        total_cost: Decimal,
        total_price: Decimal,
        total_profit: Decimal,
        items: list[dict],
    ) -> Bouquet:
        bouquet = Bouquet(business_id=business_id, total_cost=total_cost, total_price=total_price, total_profit=total_profit)
        self.session.add(bouquet)
        await self.session.flush()

        for item in items:
            bouquet_item = BouquetItem(
                bouquet_id=bouquet.id,
                flower_id=item["flower_id"],
                quantity=item["quantity"],
                cost_per_unit=item["cost_per_unit"],
                sale_price_per_unit=item["sale_price_per_unit"],
                total_cost=item["total_cost"],
                total_price=item["total_price"],
                total_profit=item["total_profit"],
            )
            self.session.add(bouquet_item)

        await self.session.flush()
        return bouquet

    async def get_by_id(self, business_id: int, bouquet_id: int) -> Bouquet | None:
        stmt = (
            select(Bouquet)
            .where(Bouquet.id == bouquet_id, Bouquet.business_id == business_id)
            .options(selectinload(Bouquet.items))
        )
        return (await self.session.execute(stmt)).scalar_one_or_none()

    async def get_list(self, business_id: int, offset: int, limit: int) -> tuple[list[Bouquet], int]:
        total_stmt = select(func.count(Bouquet.id)).where(Bouquet.business_id == business_id)
        total = (await self.session.execute(total_stmt)).scalar_one()

        stmt = (
            select(Bouquet)
            .where(Bouquet.business_id == business_id)
            .order_by(Bouquet.created_at.desc())
            .offset(offset)
            .limit(limit)
            .options(selectinload(Bouquet.items))
        )
        bouquets = (await self.session.execute(stmt)).scalars().all()
        return list(bouquets), int(total)
