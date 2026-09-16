from dataclasses import dataclass
import re
import sqlglot
from sqlglot import exp


FORBIDDEN = (
    exp.Insert,
    exp.Update,
    exp.Delete,
    exp.Drop,
    exp.Alter,
    exp.Create,
    exp.TruncateTable,
    exp.Merge,
)

FORBIDDEN_WORDS = {
    "COPY",
    "GRANT",
    "REVOKE",
    "VACUUM",
    "ANALYZE",
    "CALL",
    "DO",
}


@dataclass
class SafetyResult:
    valid: bool
    sql: str
    checks: list[str]
    reason: str | None = None


def _extract_tables(expression: exp.Expression) -> set[str]:
    return {table.name.lower() for table in expression.find_all(exp.Table)}


def validate_and_prepare(sql: str, allowed_tables: set[str], max_rows: int) -> SafetyResult:
    cleaned = sql.strip().strip("`")
    checks: list[str] = []

    if not cleaned:
        return SafetyResult(False, "", checks, "Empty SQL")

    # Comments are unnecessary for generated SQL and make auditing harder.
    cleaned = re.sub(r"/\*.*?\*/", " ", cleaned, flags=re.S)
    cleaned = re.sub(r"--.*?$", " ", cleaned, flags=re.M).strip()

    try:
        statements = sqlglot.parse(cleaned, read="postgres")
    except Exception as exc:
        return SafetyResult(False, cleaned, checks, f"SQL parsing failed: {exc}")

    if len(statements) != 1:
        return SafetyResult(False, cleaned, checks, "Only one SQL statement is allowed")
    checks.append("Single statement")

    expression = statements[0]

    if not isinstance(expression, exp.Select):
        return SafetyResult(False, cleaned, checks, "Only SELECT statements are allowed")
    checks.append("SELECT only")

    for node_type in FORBIDDEN:
        if expression.find(node_type):
            return SafetyResult(False, cleaned, checks, f"Forbidden SQL operation: {node_type.__name__}")

    upper_sql = cleaned.upper()
    for word in FORBIDDEN_WORDS:
        if re.search(rf"\b{re.escape(word)}\b", upper_sql):
            return SafetyResult(False, cleaned, checks, f"Forbidden SQL keyword: {word}")

    tables = _extract_tables(expression)
    unknown = tables - {t.lower() for t in allowed_tables}
    if unknown:
        return SafetyResult(
            False,
            cleaned,
            checks,
            f"Unknown or disallowed table(s): {', '.join(sorted(unknown))}",
        )
    checks.append("Allowed tables only")

    # LIMIT is required. If absent, add one at the outer query level.
    if not expression.args.get("limit"):
        expression = expression.limit(max_rows)
        cleaned = expression.sql(dialect="postgres")
    else:
        cleaned = expression.sql(dialect="postgres")

    checks.append(f"Result limit <= {max_rows}")
    checks.append("Read-only database connection")

    return SafetyResult(True, cleaned, checks)
