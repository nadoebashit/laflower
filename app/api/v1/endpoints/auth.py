from typing import Annotated

from fastapi import APIRouter, Depends

from app.api.v1.deps import SessionDep
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Auth"])


def get_auth_service(session: SessionDep) -> AuthService:
    return AuthService(session)


AuthServiceDep = Annotated[AuthService, Depends(get_auth_service)]


@router.post("/register", response_model=TokenResponse)
async def register(payload: RegisterRequest, service: AuthServiceDep) -> TokenResponse:
    return await service.register(payload)


@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest, service: AuthServiceDep) -> TokenResponse:
    return await service.login(payload)


from app.api.v1.deps import CurrentUserDep, require_roles
from app.db.models import UserRole
from app.schemas.auth import EmployeeCreateRequest, UserResponse

@router.post("/create-employee", response_model=UserResponse, dependencies=[Depends(require_roles(UserRole.ADMIN))])
async def create_employee(
    payload: EmployeeCreateRequest,
    current_user: CurrentUserDep,
    service: AuthServiceDep,
) -> UserResponse:
    return await service.create_employee(current_user, payload)
