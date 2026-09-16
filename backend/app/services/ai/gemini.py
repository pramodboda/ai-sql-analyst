import httpx
from app.core.config import settings
from .base import AIProvider


SYSTEM_PROMPT = """You are a PostgreSQL SQL generation assistant.
Return exactly one SQL SELECT statement and nothing else.

Rules:
- Use only tables and columns from the supplied schema.
- Never use INSERT, UPDATE, DELETE, DROP, ALTER, CREATE, TRUNCATE, GRANT, REVOKE, COPY, CALL, or DO.
- Do not use multiple statements.
- Prefer explicit joins.
- Use PostgreSQL syntax.
- Always include a reasonable LIMIT, with a maximum of 100.
- If the request cannot be answered from the schema, return: SELECT 1 WHERE FALSE;
"""


class GeminiProvider(AIProvider):
    async def generate_sql(self, question: str, schema: dict) -> str:
        if not settings.gemini_api_key:
            raise RuntimeError("GEMINI_API_KEY is not configured")

        prompt = (
            SYSTEM_PROMPT
            + "\n\nDATABASE SCHEMA:\n"
            + _format_schema(schema)
            + "\n\nUSER QUESTION:\n"
            + question
        )

        url = (
            f"https://generativelanguage.googleapis.com/v1beta/models/"
            f"{settings.gemini_model}:generateContent"
        )

        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {
                "temperature": 0,
                "maxOutputTokens": 1000,
            },
        }

        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.post(
                url,
                params={"key": settings.gemini_api_key},
                json=payload,
            )
            response.raise_for_status()
            data = response.json()

        try:
            text = data["candidates"][0]["content"]["parts"][0]["text"]
        except (KeyError, IndexError) as exc:
            raise RuntimeError("Gemini returned no usable SQL") from exc

        return _clean_sql(text)


def _format_schema(schema: dict) -> str:
    lines = []
    for table in schema.get("tables", []):
        columns = ", ".join(
            f'{c["name"]} ({c["type"]})' for c in table.get("columns", [])
        )
        lines.append(f'{table["name"]}: {columns}')
    return "\n".join(lines)


def _clean_sql(value: str) -> str:
    value = value.strip()
    if value.startswith("```"):
        value = value.replace("```sql", "", 1).replace("```", "")
    return value.strip()
