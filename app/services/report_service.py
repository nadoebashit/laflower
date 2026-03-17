from datetime import date, datetime, time, timedelta, timezone

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.report_repository import ReportRepository
from app.schemas.report import ReportsResponse
from app.utils.money import to_money


class ReportService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.report_repository = ReportRepository(session)

    async def get_summary(
        self,
        business_id: int,
        period: str | None,
        from_date: date | None,
        to_date: date | None,
    ) -> ReportsResponse:
        period_start, period_end = self._resolve_period(period=period, from_date=from_date, to_date=to_date)

        dt_from = datetime.combine(period_start, time.min, tzinfo=timezone.utc)
        dt_to_exclusive = datetime.combine(period_end + timedelta(days=1), time.min, tzinfo=timezone.utc)

        summary = await self.report_repository.get_summary(business_id=business_id, dt_from=dt_from, dt_to_exclusive=dt_to_exclusive)
        return ReportsResponse(
            period_start=period_start,
            period_end=period_end,
            total_bouquets=summary["total_bouquets"],
            total_income=to_money(summary["total_income"]),
            total_cost=to_money(summary["total_cost"]),
            total_profit=to_money(summary["total_profit"]),
        )

    def _resolve_period(
        self,
        period: str | None,
        from_date: date | None,
        to_date: date | None,
    ) -> tuple[date, date]:
        if period and (from_date or to_date):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Use either period or from/to, not both",
            )

        if (from_date and not to_date) or (to_date and not from_date):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Both from and to must be provided together",
            )

        if from_date and to_date:
            if from_date > to_date:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="from must be less than or equal to to",
                )
            return from_date, to_date

        today = datetime.now(timezone.utc).date()
        selected_period = period or "today"

        if selected_period == "today":
            return today, today

        if selected_period == "this_week":
            start = today - timedelta(days=today.weekday())
            end = start + timedelta(days=6)
            return start, end

        if selected_period == "last_week":
            this_week_start = today - timedelta(days=today.weekday())
            start = this_week_start - timedelta(days=7)
            end = start + timedelta(days=6)
            return start, end

        if selected_period == "this_month":
            start = date(today.year, today.month, 1)
            if today.month == 12:
                next_month = date(today.year + 1, 1, 1)
            else:
                next_month = date(today.year, today.month + 1, 1)
            end = next_month - timedelta(days=1)
            return start, end

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid period. Allowed values: today, this_week, last_week, this_month",
        )
