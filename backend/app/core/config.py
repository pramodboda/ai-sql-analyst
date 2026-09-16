from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str
    ai_provider: str = "gemini"

    gemini_api_key: str = ""
    gemini_model: str = "gemini-2.5-flash"

    groq_api_key: str = ""
    groq_model: str = "llama-3.3-70b-versatile"

    cors_origins: str = "http://localhost:5173"
    max_result_rows: int = 100
    query_timeout_seconds: int = 5

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=False)


settings = Settings()
