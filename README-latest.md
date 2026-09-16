# AI SQL Analyst

An AI-powered analytics application that converts natural-language questions into safe PostgreSQL queries, validates the generated SQL, executes it with a read-only database role, and displays the results.

## Architecture

```text
React + TypeScript + MUI
          |
          | REST
          v
       FastAPI
   +------+------+----------------+
   |             |                |
 AI Service   SQL Safety      Database
   |             |                |
Gemini/Groq   SQLGlot       Neon PostgreSQL
```

The LLM never directly accesses PostgreSQL. Generated SQL is treated as untrusted input and must pass the SQL safety layer before execution.

## Features

- Natural language -> PostgreSQL SQL
- Gemini and Groq provider abstraction
- SQLGlot validation
- SELECT-only enforcement
- Single-statement enforcement
- Allowed-table validation
- Automatic LIMIT
- Read-only PostgreSQL connection
- Query timeout
- MUI DataGrid results
- Recharts visualization
- Generated SQL and safety checks
- Query history in the browser
- FastAPI Swagger/OpenAPI

## Tech Stack

### Frontend
React, TypeScript, Vite, MUI, MUI X DataGrid, TanStack Query, Zustand, Recharts

### Backend
Python, FastAPI, Pydantic, SQLAlchemy, SQLGlot, httpx, PostgreSQL

### AI
Gemini API or Groq API. The provider can be changed with environment variables.

### Deployment
GitHub Codespaces for browser-based development, Neon PostgreSQL for the database, Render for frontend/backend deployment.

## Project Structure

```text
ai-sql-analyst/
├── frontend/
├── backend/
├── database/
├── docs/
└── README.md
```

## Quick Start

### 1. Database

Create a Neon PostgreSQL database and run:

```bash
database/schema.sql
database/seed.sql
```

For the demo, use a dedicated PostgreSQL role with only SELECT privileges.

### 2. Backend

```bash
cd backend
python -m venv .venv
# activate the virtual environment
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Open the Vite URL shown in the terminal.

## Environment Variables

Backend:

```env
DATABASE_URL=postgresql+psycopg://readonly_user:password@host/dbname?sslmode=require
AI_PROVIDER=gemini
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.5-flash
GROQ_API_KEY=
GROQ_MODEL=llama-3.3-70b-versatile
CORS_ORIGINS=http://localhost:5173
MAX_RESULT_ROWS=100
QUERY_TIMEOUT_SECONDS=5
```

Frontend:

```env
VITE_API_URL=http://localhost:8000
```

Never commit `.env` files or API keys.

## AI Provider

Set:

```env
AI_PROVIDER=gemini
```

or:

```env
AI_PROVIDER=groq
```

The application uses the same SQL safety layer regardless of provider.

## Security Model

```text
User question
     |
     v
LLM generates SQL
     |
     v
SQLGlot parser
     |
     +--> reject INSERT/UPDATE/DELETE/DROP/ALTER/etc.
     |
     +--> reject multiple statements
     |
     +--> reject unknown tables
     |
     +--> enforce LIMIT
     |
     v
Read-only PostgreSQL
     |
     v
Results
```

This is defense in depth. The application validates SQL, and the database credentials independently prevent data modification.

## API

### Health

`GET /health`

### Schema

`GET /api/schema`

### Analyze

`POST /api/analyze`

```json
{
  "question": "Show the top 10 customers by revenue this year."
}
```

The response contains the generated SQL, safety information, columns, rows, execution time, and row count.

## Development Order

1. Create the Neon database.
2. Run schema and seed scripts.
3. Start FastAPI.
4. Test `/health` and `/api/schema`.
5. Test SQL safety with harmless and malicious SQL.
6. Configure Gemini or Groq.
7. Test natural-language SQL generation.
8. Start the React application.
9. Deploy backend.
10. Deploy frontend.
11. Add the live demo to the portfolio.

## Important Portfolio Talking Points

- LLM output is treated as untrusted input.
- SQL is parsed before execution rather than checked with simple string matching.
- Database credentials are read-only.
- AI providers are abstracted behind a common interface.
- Backend and frontend are separated.
- Result limits and query timeouts reduce resource abuse.
- Synthetic business data is used for the public demo.
