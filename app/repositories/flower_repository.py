from collections.abc import Sequence

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import Flower


class FlowerRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_list(self, business_id: int, offset: int, limit: int) -> tuple[list[Flower], int]:
        total_stmt = select(func.count(Flower.id)).where(Flower.business_id == business_id)
        total = (await self.session.execute(total_stmt)).scalar_one()

        stmt = select(Flower).where(Flower.business_id == business_id).order_by(Flower.id).offset(offset).limit(limit)
        flowers = (await self.session.execute(stmt)).scalars().all()
        return list(flowers), int(total)

    async def get_by_id(self, business_id: int, flower_id: int) -> Flower | None:
        stmt = select(Flower).where(Flower.id == flower_id, Flower.business_id == business_id)
        return (await self.session.execute(stmt)).scalar_one_or_none()

    async def get_by_name(self, business_id: int, name: str) -> Flower | None:
        stmt = select(Flower).where(Flower.name == name, Flower.business_id == business_id)
        return (await self.session.execute(stmt)).scalar_one_or_none()

    async def get_by_ids_for_update(self, business_id: int, flower_ids: Sequence[int]) -> list[Flower]:
        if not flower_ids:
            return []
        stmt = select(Flower).where(Flower.business_id == business_id, Flower.id.in_(flower_ids)).order_by(Flower.id).with_for_update()
        return list((await self.session.execute(stmt)).scalars().all())

    async def create(self, flower: Flower) -> Flower:
        self.session.add(flower)
        await self.session.flush()
        await self.session.refresh(flower)
        return flower

    async def update(self, flower: Flower) -> Flower:
        await self.session.flush()
        await self.session.refresh(flower)
        return flower

    async def delete(self, flower: Flower) -> None:
        await self.session.delete(flower)
        await self.session.flush()
