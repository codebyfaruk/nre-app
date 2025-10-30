from sqlalchemy.ext.asyncio import AsyncEngine, create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy import create_engine
from src.core.config import settings
from urllib.parse import urlparse, urlunparse

# Shared Base for all models
Base = declarative_base()

# -------------------------
# Async engine & session (for FastAPI)
# -------------------------
async_engine: AsyncEngine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    future=True
)

AsyncSessionLocal = sessionmaker(
    bind=async_engine,
    class_=AsyncSession,
    expire_on_commit=False
)

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

# -------------------------
# Synchronous engine & session (for scripts like create_superuser)
# -------------------------
# Convert async URL to sync URL for psycopg2
parsed = urlparse(settings.DATABASE_URL)
sync_url = urlunparse(parsed._replace(scheme="postgresql+psycopg2"))

sync_engine = create_engine(
    sync_url,
    echo=False,
    future=True
)

SessionLocal = sessionmaker(
    bind=sync_engine,
    expire_on_commit=False
)
