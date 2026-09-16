# Architecture Notes

## Layer Responsibilities

### Frontend
Responsible for user interaction, presentation, API calls, tabular data, charts, and local query history.

### API Layer
FastAPI routes validate request shape and orchestrate the analysis workflow.

### AI Layer
Provider abstraction allows Gemini or Groq to generate SQL without coupling the rest of the application to one vendor.

### SQL Safety Layer
SQLGlot parses generated SQL. The application rejects non-SELECT operations, multiple statements, unknown tables, and other forbidden operations, then applies a result limit.

### Database Layer
SQLAlchemy executes approved SQL using a dedicated read-only PostgreSQL connection.

## Trust Boundaries

The LLM output is untrusted.

```text
LLM output
   ↓
Parser
   ↓
Policy validation
   ↓
Read-only database credentials
```

No AI provider receives database credentials.

## Production Improvements

For a larger production system, add authentication, per-user rate limits, audit logs, a strict SQL AST policy, column-level access control, database statement timeouts at the server level, and a separate analytics database/replica.
