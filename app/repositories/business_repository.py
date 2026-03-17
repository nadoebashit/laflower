from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import Business


class BusinessRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_id(self, business_id: int) -> Business | None:
        stmt = select(Business).where(Business.id == business_id)
        return (await self.session.execute(stmt)).scalar_one_or_none()

    async def create(self, name: str) -> Business:
        business = Business(name=name)
        self.session.add(business)
        await self.session.flush()
        await self.session.refresh(business)
        return business
