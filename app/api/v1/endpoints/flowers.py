from typing import Annotated

from fastapi import APIRouter, Depends, Response, status

from app.api.v1.deps import CurrentUserDep, PaginationDep, SessionDep, require_roles
from app.db.models import UserRole
from app.schemas.flower import FlowerCreate, FlowerListResponse, FlowerResponse, FlowerUpdate
from app.services.flower_service import FlowerService

router = APIRouter(prefix="/flowers", tags=["Flowers"])


def get_flower_service(session: SessionDep) -> FlowerService:
    return FlowerService(session)


FlowerServiceDep = Annotated[FlowerService, Depends(get_flower_service)]


@router.get("", response_model=FlowerListResponse)
async def list_flowers(
    _current_user: CurrentUserDep,
    pagination: PaginationDep,
    service: FlowerServiceDep,
) -> FlowerListResponse:
    offset, limit = pagination
    return await service.list(offset=offset, limit=limit)


@router.post(
    "",
    response_model=FlowerResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_flower(
    payload: FlowerCreate,
    _current_user: Annotated[object, Depends(require_roles(UserRole.ADMIN, UserRole.EMPLOYEE))],
    service: FlowerServiceDep,
) -> FlowerResponse:
    return await service.create(payload)


@router.put("/{flower_id}", response_model=FlowerResponse)
async def update_flower(
    flower_id: int,
    payload: FlowerUpdate,
    _current_user: Annotated[object, Depends(require_roles(UserRole.ADMIN, UserRole.EMPLOYEE))],
    service: FlowerServiceDep,
) -> FlowerResponse:
    return await service.update(flower_id=flower_id, payload=payload)


@router.delete("/{flower_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_flower(
    flower_id: int,
    _current_user: Annotated[object, Depends(require_roles(UserRole.ADMIN))],
    service: FlowerServiceDep,
) -> Response:
    await service.delete(flower_id=flower_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
