from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import Expense


class ExpenseRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, expense: Expense) -> Expense:
        self.session.add(expense)
        await self.session.flush()
        await self.session.refresh(expense)
        return expense

    async def get_list(self, business_id: int, offset: int, limit: int) -> tuple[list[Expense], int]:
        total_stmt = select(func.count(Expense.id)).where(Expense.business_id == business_id)
        total = (await self.session.execute(total_stmt)).scalar_one()

        stmt = select(Expense).where(Expense.business_id == business_id).order_by(Expense.id.desc()).offset(offset).limit(limit)
        expenses = (await self.session.execute(stmt)).scalars().all()
        return list(expenses), int(total)
