from typing import Any
from pydantic import BaseModel, Field


class AnalyzeRequest(BaseModel):
    question: str = Field(min_length=3, max_length=1000)


class SafetyInfo(BaseModel):
    valid: bool
    checks: list[str]
    reason: str | None = None


class AnalyzeResponse(BaseModel):
    question: str
    sql: str
    safety: SafetyInfo
    columns: list[str]
    rows: list[dict[str, Any]]
    row_count: int
    execution_time_ms: float
