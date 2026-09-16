import httpx
from app.core.config import settings
from .base import AIProvider
from .gemini import SYSTEM_PROMPT, _format_schema, _clean_sql


class GroqProvider(AIProvider):
    async def generate_sql(self, question: str, schema: dict) -> str:
        if not settings.groq_api_key:
            raise RuntimeError("GROQ_API_KEY is not configured")

        payload = {
            "model": settings.groq_model,
            "temperature": 0,
            "max_tokens": 1000,
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT},
                {
                    "role": "user",
                    "content": (
                        "DATABASE SCHEMA:\n"
                        + _format_schema(schema)
                        + "\n\nUSER QUESTION:\n"
                        + question
                    ),
                },
            ],
        }

        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {settings.groq_api_key}",
                    "Content-Type": "application/json",
                },
                json=payload,
            )
            response.raise_for_status()
            data = response.json()

        try:
            text = data["choices"][0]["message"]["content"]
        except (KeyError, IndexError) as exc:
            raise RuntimeError("Groq returned no usable SQL") from exc

        return _clean_sql(text)
