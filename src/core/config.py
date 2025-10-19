from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "Electronics Shop API"
    APP_ENV: str = "development"
    SECRET_KEY: str
    DATABASE_URL: str
    REDIS_URL: str

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()
