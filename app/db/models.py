import enum
from datetime import datetime, timezone
from decimal import Decimal

from sqlalchemy import CheckConstraint, DateTime, Enum, ForeignKey, Integer, Numeric, String, func, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class UserRole(str, enum.Enum):
    ADMIN = "admin"
    EMPLOYEE = "employee"


class Business(Base):
    __tablename__ = "businesses"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    users: Mapped[list["User"]] = relationship(back_populates="business", cascade="all, delete-orphan")
    flowers: Mapped[list["Flower"]] = relationship(back_populates="business", cascade="all, delete-orphan")
    bouquets: Mapped[list["Bouquet"]] = relationship(back_populates="business", cascade="all, delete-orphan")


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    business_id: Mapped[int] = mapped_column(ForeignKey("businesses.id", ondelete="CASCADE"), nullable=False, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(Enum(UserRole, name="user_role", values_callable=lambda obj: [e.value for e in obj]), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    business: Mapped["Business"] = relationship(back_populates="users")


class Flower(Base):
    __tablename__ = "flowers"
    __table_args__ = (
        CheckConstraint("purchase_price > 0", name="flowers_purchase_price_positive"),
        CheckConstraint("markup_percent >= 0", name="flowers_markup_percent_non_negative"),
        CheckConstraint("stock_quantity >= 0", name="flowers_stock_quantity_non_negative"),
        UniqueConstraint("name", "business_id", name="flowers_name_business_id_unique"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    business_id: Mapped[int] = mapped_column(ForeignKey("businesses.id", ondelete="CASCADE"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    purchase_price: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    markup_percent: Mapped[Decimal] = mapped_column(Numeric(5, 2), nullable=False)
    stock_quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    business: Mapped["Business"] = relationship(back_populates="flowers")
    bouquet_items: Mapped[list["BouquetItem"]] = relationship(back_populates="flower")


class Bouquet(Base):
    __tablename__ = "bouquets"

    id: Mapped[int] = mapped_column(primary_key=True)
    business_id: Mapped[int] = mapped_column(ForeignKey("businesses.id", ondelete="CASCADE"), nullable=False, index=True)
    total_cost: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False)
    total_price: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False)
    total_profit: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False, index=True
    )

    business: Mapped["Business"] = relationship(back_populates="bouquets")
    items: Mapped[list["BouquetItem"]] = relationship(
        back_populates="bouquet", cascade="all, delete-orphan", lazy="selectin"
    )


class BouquetItem(Base):
    __tablename__ = "bouquet_items"
    __table_args__ = (
        CheckConstraint("quantity > 0", name="bouquet_items_quantity_positive"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    bouquet_id: Mapped[int] = mapped_column(
        ForeignKey("bouquets.id", ondelete="CASCADE"), nullable=False, index=True
    )
    flower_id: Mapped[int] = mapped_column(
        ForeignKey("flowers.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    quantity: Mapped[int] = mapped_column(Integer, nullable=False)

    cost_per_unit: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    sale_price_per_unit: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)

    total_cost: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False)
    total_price: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False)
    total_profit: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False)

    bouquet: Mapped[Bouquet] = relationship(back_populates="items")
    flower: Mapped[Flower] = relationship(back_populates="bouquet_items")

