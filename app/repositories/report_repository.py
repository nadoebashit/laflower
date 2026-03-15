from datetime import datetime
from decimal import Decimal

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import Bouquet


class ReportRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_summary(self, dt_from: datetime, dt_to_exclusive: datetime) -> dict:
        stmt = (
            select(
                func.count(Bouquet.id),
                func.coalesce(func.sum(Bouquet.total_price), 0),
                func.coalesce(func.sum(Bouquet.total_cost), 0),
                func.coalesce(func.sum(Bouquet.total_profit), 0),
            )
            .where(Bouquet.created_at >= dt_from)
            .where(Bouquet.created_at < dt_to_exclusive)
        )
        count, income, cost, profit = (await self.session.execute(stmt)).one()
        return {
            "total_bouquets": int(count or 0),
            "total_income": Decimal(income),
            "total_cost": Decimal(cost),
            "total_profit": Decimal(profit),
        }
