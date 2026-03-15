from datetime import date
from decimal import Decimal

from pydantic import BaseModel


class ReportsResponse(BaseModel):
    period_start: date
    period_end: date
    total_bouquets: int
    total_income: Decimal
    total_cost: Decimal
    total_profit: Decimal
