from .base import AIProvider
from .gemini import GeminiProvider
from .groq import GroqProvider
from app.core.config import settings


def get_provider() -> AIProvider:
    provider = settings.ai_provider.lower()

    if provider == "gemini":
        return GeminiProvider()
    if provider == "groq":
        return GroqProvider()

    raise RuntimeError(f"Unsupported AI_PROVIDER: {settings.ai_provider}")


async def generate_sql(question: str, schema: dict) -> str:
    return await get_provider().generate_sql(question, schema)
