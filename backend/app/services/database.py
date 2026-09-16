from sqlalchemy import create_engine, inspect, text
from sqlalchemy.engine import Engine
from app.core.config import settings

engine: Engine = create_engine(
    settings.database_url,
    pool_pre_ping=True,
    pool_size=2,
    max_overflow=0,
)


def get_schema() -> dict:
    inspector = inspect(engine)
    tables = []

    for table_name in inspector.get_table_names(schema="public"):
        columns = [
            {
                "name": column["name"],
                "type": str(column["type"]),
            }
            for column in inspector.get_columns(table_name, schema="public")
        ]
        tables.append({"name": table_name, "columns": columns})

    return {"schema": "public", "tables": tables}


def execute_readonly(sql: str) -> tuple[list[str], list[dict]]:
    with engine.connect() as connection:
        # Defense in depth: ask PostgreSQL to keep the statement short.
        connection.execute(
            text(f"SET LOCAL statement_timeout = {int(settings.query_timeout_seconds * 1000)}")
        )
        result = connection.execute(text(sql))
        rows = [dict(row._mapping) for row in result]
        return list(result.keys()), rows
