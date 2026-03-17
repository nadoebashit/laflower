from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import User, UserRole


class UserRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_email(self, email: str) -> User | None:
        from sqlalchemy.orm import selectinload
        stmt = select(User).options(selectinload(User.business)).where(User.email == email)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_id(self, user_id: int) -> User | None:
        from sqlalchemy.orm import selectinload
        stmt = select(User).options(selectinload(User.business)).where(User.id == user_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def create(self, email: str, hashed_password: str, role: UserRole, business_id: int) -> User:
        user = User(email=email, hashed_password=hashed_password, role=role, business_id=business_id)
        self.session.add(user)
        await self.session.flush()
        await self.session.refresh(user, ['business'])
        return user
