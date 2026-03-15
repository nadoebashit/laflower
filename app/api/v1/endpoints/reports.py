from datetime import date
from typing import Annotated

from fastapi import APIRouter, Depends, Query

from app.api.v1.deps import CurrentUserDep, SessionDep
from app.schemas.report import ReportsResponse
from app.services.report_service import ReportService

router = APIRouter(prefix="/reports", tags=["Reports"])


def get_report_service(session: SessionDep) -> ReportService:
    return ReportService(session)


ReportServiceDep = Annotated[ReportService, Depends(get_report_service)]


@router.get("", response_model=ReportsResponse)
async def get_reports(
    _current_user: CurrentUserDep,
    service: ReportServiceDep,
    period: Annotated[str | None, Query()] = None,
    from_date: Annotated[date | None, Query(alias="from")] = None,
    to_date: Annotated[date | None, Query(alias="to")] = None,
) -> ReportsResponse:
    return await service.get_summary(period=period, from_date=from_date, to_date=to_date)
