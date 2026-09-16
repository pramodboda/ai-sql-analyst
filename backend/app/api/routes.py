from time import perf_counter
from fastapi import APIRouter, HTTPException
from app.schemas import AnalyzeRequest, AnalyzeResponse, SafetyInfo
from app.services.database import get_schema, execute_readonly
from app.services.ai.service import generate_sql
from app.services.sql.safety import validate_and_prepare
from app.core.config import settings

router = APIRouter(prefix="/api")


@router.get("/schema")
def schema():
    return get_schema()


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze(request: AnalyzeRequest):
    database_schema = get_schema()
    allowed_tables = {t["name"] for t in database_schema["tables"]}

    try:
        generated_sql = await generate_sql(request.question, database_schema)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"AI provider error: {exc}") from exc

    safety = validate_and_prepare(
        generated_sql,
        allowed_tables=allowed_tables,
        max_rows=settings.max_result_rows,
    )

    if not safety.valid:
        raise HTTPException(
            status_code=422,
            detail={
                "message": "Generated SQL was rejected by the SQL safety layer",
                "reason": safety.reason,
                "checks": safety.checks,
            },
        )

    started = perf_counter()
    try:
        columns, rows = execute_readonly(safety.sql)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Database query failed: {exc}") from exc

    elapsed = round((perf_counter() - started) * 1000, 2)

    return AnalyzeResponse(
        question=request.question,
        sql=safety.sql,
        safety=SafetyInfo(
            valid=True,
            checks=safety.checks,
        ),
        columns=columns,
        rows=rows,
        row_count=len(rows),
        execution_time_ms=elapsed,
    )
