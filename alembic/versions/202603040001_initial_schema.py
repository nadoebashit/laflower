"""initial schema

Revision ID: 202603040001
Revises:
Create Date: 2026-03-04 00:00:01.000000

"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "202603040001"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

user_role = postgresql.ENUM("admin", "employee", name="user_role", create_type=False)


def upgrade() -> None:
    user_role.create(op.get_bind(), checkfirst=True)

    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("hashed_password", sa.String(length=255), nullable=False),
        sa.Column("role", user_role, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_users")),
        sa.UniqueConstraint("email", name=op.f("uq_users_email")),
    )

    op.create_table(
        "flowers",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("purchase_price", sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column("markup_percent", sa.Numeric(precision=5, scale=2), nullable=False),
        sa.Column("stock_quantity", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.CheckConstraint("purchase_price > 0", name="flowers_purchase_price_positive"),
        sa.CheckConstraint("markup_percent >= 0", name="flowers_markup_percent_non_negative"),
        sa.CheckConstraint("stock_quantity >= 0", name="flowers_stock_quantity_non_negative"),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_flowers")),
        sa.UniqueConstraint("name", name=op.f("uq_flowers_name")),
    )

    op.create_table(
        "bouquets",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("total_cost", sa.Numeric(precision=14, scale=2), nullable=False),
        sa.Column("total_price", sa.Numeric(precision=14, scale=2), nullable=False),
        sa.Column("total_profit", sa.Numeric(precision=14, scale=2), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_bouquets")),
    )
    op.create_index(op.f("ix_bouquets_created_at"), "bouquets", ["created_at"], unique=False)

    op.create_table(
        "bouquet_items",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("bouquet_id", sa.Integer(), nullable=False),
        sa.Column("flower_id", sa.Integer(), nullable=False),
        sa.Column("quantity", sa.Integer(), nullable=False),
        sa.Column("cost_per_unit", sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column("sale_price_per_unit", sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column("total_cost", sa.Numeric(precision=14, scale=2), nullable=False),
        sa.Column("total_price", sa.Numeric(precision=14, scale=2), nullable=False),
        sa.Column("total_profit", sa.Numeric(precision=14, scale=2), nullable=False),
        sa.CheckConstraint("quantity > 0", name="bouquet_items_quantity_positive"),
        sa.ForeignKeyConstraint(["bouquet_id"], ["bouquets.id"], name=op.f("fk_bouquet_items_bouquet_id_bouquets"), ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["flower_id"], ["flowers.id"], name=op.f("fk_bouquet_items_flower_id_flowers"), ondelete="RESTRICT"),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_bouquet_items")),
    )
    op.create_index(op.f("ix_bouquet_items_bouquet_id"), "bouquet_items", ["bouquet_id"], unique=False)
    op.create_index(op.f("ix_bouquet_items_flower_id"), "bouquet_items", ["flower_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_bouquet_items_flower_id"), table_name="bouquet_items")
    op.drop_index(op.f("ix_bouquet_items_bouquet_id"), table_name="bouquet_items")
    op.drop_table("bouquet_items")
    op.drop_index(op.f("ix_bouquets_created_at"), table_name="bouquets")
    op.drop_table("bouquets")
    op.drop_table("flowers")
    op.drop_table("users")
    user_role.drop(op.get_bind(), checkfirst=True)
