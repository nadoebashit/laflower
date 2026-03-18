from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, ConfigDict, Field


class ExpenseCreate(BaseModel):
    flower_id: int | None = None
    quantity: int | None = Field(default=None, ge=1)
    amount: Decimal | None = Field(default=None, ge=0)
    description: str | None = None


class ExpenseResponse(BaseModel):
    id: int
    business_id: int
    flower_id: int | None
    quantity: int | None
    amount: Decimal
    description: str | None
    photo_url: str | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ExpenseListResponse(BaseModel):
    total: int
    offset: int
    limit: int
    items: list[ExpenseResponse]
