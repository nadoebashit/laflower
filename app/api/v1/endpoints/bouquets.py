from typing import Annotated

from fastapi import APIRouter, Depends, status

from app.api.v1.deps import CurrentUserDep, PaginationDep, SessionDep, require_roles
from app.db.models import UserRole
from app.schemas.bouquet import BouquetCreateRequest, BouquetListResponse, BouquetResponse
from app.services.bouquet_service import BouquetService

router = APIRouter(prefix="/bouquets", tags=["Bouquets"])


def get_bouquet_service(session: SessionDep) -> BouquetService:
    return BouquetService(session)


BouquetServiceDep = Annotated[BouquetService, Depends(get_bouquet_service)]


@router.post("", response_model=BouquetResponse, status_code=status.HTTP_201_CREATED)
async def create_bouquet(
    payload: BouquetCreateRequest,
    _current_user: Annotated[object, Depends(require_roles(UserRole.ADMIN, UserRole.EMPLOYEE))],
    service: BouquetServiceDep,
) -> BouquetResponse:
    return await service.create(payload)


@router.get("", response_model=BouquetListResponse)
async def list_bouquets(
    _current_user: CurrentUserDep,
    pagination: PaginationDep,
    service: BouquetServiceDep,
) -> BouquetListResponse:
    offset, limit = pagination
    return await service.list(offset=offset, limit=limit)
