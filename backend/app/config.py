"""
Application Configuration Module for RailBlock AI.
Configured via environment variables and pydantic-settings.
"""

from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Application Settings for RailBlock AI backend services.
    Supports development, testing, and production environments.
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Core Application Info
    PROJECT_NAME: str = "RailBlock AI — Multi-Agent Corridor Operating System"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    API_V1_STR: str = "/api/v1"

    # CORS Configuration
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
    ]
    CORS_ORIGIN_REGEX: Optional[str] = r"^https:\/\/.*\.trycloudflare\.com$"

    # Database Configuration (PostgreSQL + TimescaleDB)
    POSTGRES_USER: str = "railblock"
    POSTGRES_PASSWORD: str = "railblock_secure_pass_2026"
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_DB: str = "railblock_db"
    DATABASE_URL: Optional[str] = None

    # Redis Cache & Message Broker
    REDIS_URL: str = "redis://localhost:6379/0"

    # Security & Authentication
    SECRET_KEY: str = "super_secret_railblock_jwt_key_development_only_change_in_production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 Hours
    ALGORITHM: str = "HS256"

    # Optimization Engine Parameters
    OPTIMIZATION_TIMEOUT_SECONDS: int = 5
    DEFAULT_BLOCK_WINDOW_HOURS: int = 5

    @property
    def sync_database_url(self) -> str:
        """
        Derives synchronous database URL if not explicitly configured.
        """
        if self.DATABASE_URL:
            return self.DATABASE_URL
        return (
            f"postgresql+psycopg2://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
            f"@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        )


settings = Settings()
