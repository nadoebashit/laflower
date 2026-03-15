from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = Field(default="Flower Shop Backend", alias="APP_NAME")
    app_debug: bool = Field(default=False, alias="APP_DEBUG")

    database_url: str = Field(alias="DATABASE_URL")

    jwt_secret_key: str = Field(alias="JWT_SECRET_KEY")
    jwt_algorithm: str = Field(default="HS256", alias="JWT_ALGORITHM")
    access_token_expire_minutes: int = Field(default=60, alias="ACCESS_TOKEN_EXPIRE_MINUTES")

    default_page_limit: int = Field(default=20, alias="DEFAULT_PAGE_LIMIT")
    max_page_limit: int = Field(default=1000, alias="MAX_PAGE_LIMIT")

    seed_admin_email: str = Field(default="admin@flowers.com", alias="SEED_ADMIN_EMAIL")
    seed_admin_password: str = Field(default="Admin12345!", alias="SEED_ADMIN_PASSWORD")


@lru_cache
def get_settings() -> Settings:
    return Settings()
