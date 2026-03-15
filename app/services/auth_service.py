from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import create_access_token, get_password_hash, verify_password
from app.db.models import UserRole
from app.repositories.user_repository import UserRepository
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse, UserResponse


class AuthService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.user_repository = UserRepository(session)

    async def register(self, payload: RegisterRequest) -> TokenResponse:
        normalized_email = payload.email.lower().strip()

        existing_user = await self.user_repository.get_by_email(normalized_email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="User with this email already exists",
            )

        user = await self.user_repository.create(
            email=normalized_email,
            hashed_password=get_password_hash(payload.password),
            role=UserRole.EMPLOYEE,
        )

        token = create_access_token(str(user.id))
        return TokenResponse(access_token=token, user=UserResponse.model_validate(user))

    async def login(self, payload: LoginRequest) -> TokenResponse:
        normalized_email = payload.email.lower().strip()
        user = await self.user_repository.get_by_email(normalized_email)
        if not user or not verify_password(payload.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )

        token = create_access_token(str(user.id))
        return TokenResponse(access_token=token, user=UserResponse.model_validate(user))
