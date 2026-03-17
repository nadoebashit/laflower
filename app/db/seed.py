import asyncio
from decimal import Decimal

from sqlalchemy import select

from app.core.config import get_settings
from app.core.security import get_password_hash
from app.db.models import Flower, User, Business, UserRole
from app.db.session import AsyncSessionLocal
from app.utils.money import to_money


async def seed() -> None:
    settings = get_settings()

    async with AsyncSessionLocal() as session:
        async with session.begin():
            business_stmt = select(Business).where(Business.name == "My Flower Shop")
            business = (await session.execute(business_stmt)).scalar_one_or_none()
            if not business:
                business = Business(name="My Flower Shop")
                session.add(business)
                await session.flush()

            admin_stmt = select(User).where(User.email == settings.seed_admin_email.lower().strip())
            admin_user = (await session.execute(admin_stmt)).scalar_one_or_none()
            if not admin_user:
                session.add(
                    User(
                        email=settings.seed_admin_email.lower().strip(),
                        hashed_password=get_password_hash(settings.seed_admin_password),
                        role=UserRole.ADMIN,
                        business_id=business.id,
                    )
                )

            flowers_count = (await session.execute(select(Flower.id).limit(1))).scalar_one_or_none()
            if flowers_count is None:
                session.add_all(
                    [
                        Flower(
                            name="Rose",
                            purchase_price=to_money(Decimal("300.00")),
                            markup_percent=to_money(Decimal("45.00")),
                            stock_quantity=200,
                            business_id=business.id,
                        ),
                        Flower(
                            name="Tulip",
                            purchase_price=to_money(Decimal("180.00")),
                            markup_percent=to_money(Decimal("35.00")),
                            stock_quantity=250,
                            business_id=business.id,
                        ),
                        Flower(
                            name="Peony",
                            purchase_price=to_money(Decimal("420.00")),
                            markup_percent=to_money(Decimal("40.00")),
                            stock_quantity=120,
                            business_id=business.id,
                        ),
                    ]
                )


if __name__ == "__main__":
    asyncio.run(seed())
