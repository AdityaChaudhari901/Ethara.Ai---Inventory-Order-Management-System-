"""Application configuration loaded from environment variables.

No secrets are hardcoded. Every value can be overridden via the environment
(or a local .env file), which is what Docker Compose and the hosting
platforms inject at runtime.

Database connection: two supported modes.
  1. A full ``DATABASE_URL`` (what Render/Railway provide) — used as-is.
  2. Individual ``POSTGRES_*`` parts — assembled into a URL with proper
     escaping, so passwords containing ``@ : / ?`` etc. work correctly.
"""
from functools import lru_cache

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
from sqlalchemy import URL


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    project_name: str = "Inventory & Order Management API"
    api_version: str = "1.0.0"

    # Mode 1: a complete SQLAlchemy/DB URL. Leave empty to build from the
    # POSTGRES_* parts below. Hosting platforms inject this directly.
    database_url: str = ""

    # Mode 2: individual PostgreSQL connection parts (used when database_url is
    # empty). These are the same vars Docker Compose passes to the db service.
    postgres_user: str = "postgres"
    postgres_password: str = "postgres"
    postgres_db: str = "inventory"
    postgres_host: str = "db"
    postgres_port: int = 5432

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
    def sqlalchemy_url(self) -> str:
        """The connection URL the app and Alembic actually use."""
        if self.database_url:
            return self.database_url
        # URL.create percent-encodes special characters in the password.
        return URL.create(
            "postgresql+psycopg",
            username=self.postgres_user,
            password=self.postgres_password,
            host=self.postgres_host,
            port=self.postgres_port,
            database=self.postgres_db,
        ).render_as_string(hide_password=False)

    @property
    def cors_origins_list(self) -> list[str]:
        if not self.cors_origins or self.cors_origins.strip() == "*":
            return ["*"]
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
