import json
from decimal import Decimal
from typing import Annotated

from fastapi import APIRouter, Depends, Form, File, UploadFile, status, HTTPException

from app.api.v1.deps import CurrentUserDep, PaginationDep, SessionDep, require_roles
from app.db.models import UserRole
from app.schemas.expense import ExpenseCreate, ExpenseListResponse, ExpenseResponse
from app.services.expense_service import ExpenseService

router = APIRouter(prefix="/expenses", tags=["Expenses"])


def get_expense_service(session: SessionDep) -> ExpenseService:
    return ExpenseService(session)


ExpenseServiceDep = Annotated[ExpenseService, Depends(get_expense_service)]


@router.get("", response_model=ExpenseListResponse)
async def list_expenses(
    current_user: CurrentUserDep,
    pagination: PaginationDep,
    service: ExpenseServiceDep,
) -> ExpenseListResponse:
    offset, limit = pagination
    return await service.list(business_id=current_user.business_id, offset=offset, limit=limit)


@router.post(
    "",
    response_model=ExpenseResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_expense(
    current_user: CurrentUserDep,
    service: ExpenseServiceDep,
    payload_json: str = Form(...),
    file: UploadFile | None = File(None),
) -> ExpenseResponse:
    try:
        data = json.loads(payload_json)
        expense_create = ExpenseCreate(**data)
    except Exception as e:
        raise HTTPException(status_code=400, detail="Invalid payload_json payload") from e

    return await service.create(
        business_id=current_user.business_id, 
        payload=expense_create,
        file=file
    )
