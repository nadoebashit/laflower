from decimal import Decimal, ROUND_HALF_UP

MONEY_SCALE = Decimal("0.01")


def to_money(value: Decimal) -> Decimal:
    return value.quantize(MONEY_SCALE, rounding=ROUND_HALF_UP)
