from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings


PROJECT_ROOT = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    app_env: str = Field(default="local", alias="APP_ENV")
    api_host: str = Field(default="0.0.0.0", alias="API_HOST")
    api_port: int = Field(default=8000, alias="API_PORT")
    jwt_access_secret: str = Field(
        default="change-me-access", alias="JWT_ACCESS_SECRET"
    )
    jwt_refresh_secret: str = Field(
        default="change-me-refresh", alias="JWT_REFRESH_SECRET"
    )
    access_token_ttl_min: int = Field(default=15, alias="ACCESS_TOKEN_TTL_MIN")
    refresh_token_ttl_days: int = Field(default=7, alias="REFRESH_TOKEN_TTL_DAYS")
    cors_origins: str = Field(
        default="http://localhost:5173,http://127.0.0.1:5173", alias="CORS_ORIGINS"
    )
    db_url: str = Field(default="", alias="DATABASE_URL")
    artifact_dir: str = Field(default="", alias="MODEL_ARTIFACT_DIR")

    class Config:
        env_file = (PROJECT_ROOT / ".env",)
        extra = "ignore"


settings = Settings()
