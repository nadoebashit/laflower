from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field, model_validator


class FlowerCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    purchase_price: Decimal = Field(gt=0)
    markup_percent: Decimal = Field(ge=0)
    stock_quantity: int = Field(ge=0)


class FlowerUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    purchase_price: Decimal | None = Field(default=None, gt=0)
    markup_percent: Decimal | None = Field(default=None, ge=0)
    stock_quantity: int | None = Field(default=None, ge=0)

    @model_validator(mode="after")
    def validate_not_empty(self) -> "FlowerUpdate":
        if not any(value is not None for value in self.model_dump().values()):
            raise ValueError("At least one field must be provided")
        return self


class FlowerResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    purchase_price: Decimal
    markup_percent: Decimal
    stock_quantity: int
    created_at: datetime
    updated_at: datetime


class FlowerListResponse(BaseModel):
    total: int
    offset: int
    limit: int
    items: list[FlowerResponse]
