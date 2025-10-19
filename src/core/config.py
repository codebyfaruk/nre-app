from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # App config
    APP_NAME: str = "Electronics Shop API"
    APP_ENV: str = "development"
    SECRET_KEY: str
    JWT_SECRET_KEY: str

    # Docker / production
    DATABASE_URL: str
    REDIS_URL: str

    # Local / development
    LOCAL_DATABASE_URL: str
    LOCAL_REDIS_URL: str

    # Optional flag to detect Docker environment
    DOCKER_ENV: bool = True

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


settings = Settings()

# Helper: choose correct DB / Redis URL depending on environment
if settings.DOCKER_ENV:
    DATABASE = settings.DATABASE_URL
    REDIS = settings.REDIS_URL
else:
    DATABASE = settings.LOCAL_DATABASE_URL
    REDIS = settings.LOCAL_REDIS_URL
