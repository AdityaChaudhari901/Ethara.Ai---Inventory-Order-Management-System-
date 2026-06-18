"""Application configuration loaded from environment variables.

No secrets are hardcoded. Every value can be overridden via the environment
(or a local .env file), which is what Docker Compose and the hosting
platforms inject at runtime.
"""
from functools import lru_cache

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    project_name: str = "Inventory & Order Management API"
    api_version: str = "1.0.0"

    # SQLAlchemy URL. Default targets the Compose `db` service; tests and local
    # runs can point this at sqlite. Render/Railway inject their own value.
    database_url: str = "postgresql+psycopg://postgres:postgres@db:5432/inventory"

    # Comma-separated list of allowed CORS origins, or "*" for all.
    cors_origins: str = "*"

    # Products at or below this stock level surface on the dashboard.
    low_stock_threshold: int = 10

    @field_validator("database_url")
    @classmethod
    def _normalize_driver(cls, value: str) -> str:
        # Hosting platforms (Render, Railway, Heroku) hand out URLs like
        # postgres:// or postgresql:// which SQLAlchemy maps to psycopg2.
        # We ship psycopg v3, so pin the driver explicitly.
        if value.startswith("postgres://"):
            return "postgresql+psycopg://" + value[len("postgres://"):]
        if value.startswith("postgresql://"):
            return "postgresql+psycopg://" + value[len("postgresql://"):]
        return value

    @property
    def cors_origins_list(self) -> list[str]:
        if not self.cors_origins or self.cors_origins.strip() == "*":
            return ["*"]
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
