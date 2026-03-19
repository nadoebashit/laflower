from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field, model_validator


class BouquetSaleItemRequest(BaseModel):
    flower_id: int = Field(gt=0)
    quantity: int = Field(gt=0)


class BouquetCreateRequest(BaseModel):
    items: list[BouquetSaleItemRequest] = Field(min_length=1)
    custom_total_price: Decimal | None = Field(default=None, ge=0)

    @model_validator(mode="after")
    def validate_unique_flowers(self) -> "BouquetCreateRequest":
        ids = [item.flower_id for item in self.items]
        if len(ids) != len(set(ids)):
            raise ValueError("Each flower_id must be unique in items")
        return self


class BouquetItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    bouquet_id: int
    flower_id: int
    quantity: int
    cost_per_unit: Decimal
    sale_price_per_unit: Decimal
    total_cost: Decimal
    total_price: Decimal
    total_profit: Decimal


class BouquetResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    total_cost: Decimal
    total_price: Decimal
    total_profit: Decimal
    created_at: datetime
    items: list[BouquetItemResponse]


class BouquetListResponse(BaseModel):
    total: int
    offset: int
    limit: int
    items: list[BouquetResponse]
