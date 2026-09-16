# AI SQL Analyst

An AI-powered analytics application that converts natural-language questions into safe PostgreSQL queries, executes them against a read-only database, and presents the results as tables and visualizations.

### Example

> "Show the top 10 customers by revenue this year."

The system generates SQL, validates it through a SQL safety layer, executes the approved read-only query, and displays the results.

---

## ✨ Key Features

- Natural language → PostgreSQL SQL
- SQL validation and safety layer
- Read-only database access
- Allowed-table/column validation
- Single-statement enforcement
- Query `LIMIT` and timeout protection
- Generated SQL visibility
- Tabular results with MUI DataGrid
- Automatic result visualization
- Query execution metrics
- Query history
- API documentation with FastAPI/Swagger
- Responsive modern dashboard

---

## 🏗️ Architecture

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

The LLM never directly accesses the database.

```text
User Question
     ↓
LLM generates SQL
     ↓
SQL Safety Layer
     ↓
Validation
     ↓
Read-only PostgreSQL
     ↓
Result
     ↓
React UI
```

---

## 🛠️ Tech Stack

### Frontend

- React
- TypeScript
- Vite
- MUI
- MUI DataGrid
- TanStack Query
- Zustand
- Zod
- Recharts

### Backend

- Python
- FastAPI
- Pydantic
- SQLAlchemy
- SQLGlot
- PostgreSQL

### AI

- Gemini API
- Prompt-based SQL generation
- Schema-aware SQL generation

### Infrastructure

- GitHub
- GitHub Codespaces
- Neon PostgreSQL
- Render
- GitHub-based deployment

---

## 🔐 SQL Safety Layer

Generated SQL is treated as untrusted input.

Before execution, the backend verifies:

```text
✓ Valid PostgreSQL syntax
✓ SELECT-only statement
✓ Single SQL statement
✓ Allowed tables
✓ Allowed columns
✓ No INSERT/UPDATE/DELETE
✓ No DROP/ALTER/TRUNCATE
✓ LIMIT enforcement
✓ Query timeout
✓ Maximum result size
```

The database connection also uses a PostgreSQL read-only user.

This provides multiple layers of protection:

```text
AI Safety
    +
Application Validation
    +
Database Permissions
```

---

## 📁 Project Structure

```text
ai-sql-analyst/
├── frontend/
├── backend/
├── database/
│   ├── schema.sql
│   └── seed.sql
├── docs/
├── .gitignore
└── README.md
```

Backend layers:

```text
api/
services/
security/
database/
schemas/
models/
core/
```

---

## 🚀 Development Flow

### 1. Database

Create synthetic business data in Neon PostgreSQL.

Example tables:

```text
customers
orders
order_items
products
regions
```

### 2. Backend

Develop FastAPI endpoints:

```text
GET  /health
GET  /schema
POST /query
```

Initially test manually supplied SQL.

### 3. SQL Safety

Implement SQL parsing and validation before adding AI.

### 4. AI Integration

Send the user question and relevant database schema to the LLM.

The LLM generates a PostgreSQL `SELECT` query.

### 5. Query Execution

```text
Generated SQL
     ↓
Safety Validation
     ↓
Read-only PostgreSQL
     ↓
Results
```

### 6. Frontend

Build the analyst dashboard using React, TypeScript and MUI.

### 7. Deployment

```text
Frontend → Render Static Site
Backend  → Render Web Service
Database → Neon PostgreSQL
AI       → Gemini API
```

---

## 🔑 Environment Variables

Backend:

```env
DATABASE_URL=
GEMINI_API_KEY=
CORS_ORIGINS=
```

Frontend:

```env
VITE_API_URL=
```

Never commit `.env` files or API keys.

---

## 🧪 Example Query

User:

```text
Show the top 10 customers by revenue this year.
```

AI generates a PostgreSQL `SELECT` query.

The backend then:

```text
1. Parses SQL
2. Checks statement type
3. Checks allowed tables/columns
4. Applies safety rules
5. Executes using read-only credentials
6. Returns structured results
```

---

## 🌐 Free Development & Deployment

The project is designed to be developed and deployed without requiring a local development machine.

Development:

```text
Browser
  ↓
GitHub Codespaces
  ↓
GitHub Repository
  ↓
Neon PostgreSQL
```

Deployment:

```text
Render Static Site
       ↓
React Application

Render Web Service
       ↓
FastAPI

Neon PostgreSQL
       ↓
Database

Gemini API
       ↓
AI SQL Generation
```

Free-tier limits of third-party services may change.

---

## 🎯 Learning Goals

This project demonstrates practical experience with:

- React + TypeScript architecture
- Modern component-based UI development
- REST API design
- Python/FastAPI
- PostgreSQL
- SQL parsing and validation
- AI/LLM integration
- Prompt engineering
- Application security
- Read-only database architecture
- Data visualization
- Cloud deployment
- Environment/secrets management

---

## 📌 Future Enhancements

- Authentication and RBAC
- Multiple database connections
- More chart types
- Query explanations
- AI-generated insights
- Saved dashboards
- Query performance analysis
- Streaming AI responses
- Database schema explorer

---

## ⚠️ Disclaimer

This project uses synthetic/demo business data and is intended for learning and portfolio demonstration.
