---
name: fastapi-sqlalchemy
displayName: FastAPI + SQLAlchemy
description: FastAPI application with SQLAlchemy ORM
category: python
tags: [python, fastapi, sqlalchemy, api, backend]
variables:
  - name: db_type
    prompt: "Database?"
    options: [PostgreSQL, MySQL, SQLite]
    default: PostgreSQL
  - name: package_manager
    prompt: "Package manager?"
    options: [pip, poetry, uv]
    default: pip
detects:
  files: [requirements.txt, pyproject.toml]
  dependencies: [fastapi, sqlalchemy]
priority: 10
---

# Project

FastAPI application with SQLAlchemy ORM and {{db_type}}.

## Commands

- `uvicorn app.main:app --reload` — Start dev server
- `pytest` — Run tests
- `alembic upgrade head` — Apply database migrations
- `alembic revision --autogenerate -m "description"` — Create new migration

## Architecture

- `app/main.py` — FastAPI application factory
- `app/routers/` — API route modules
- `app/models/` — SQLAlchemy models
- `app/schemas/` — Pydantic request/response schemas
- `app/services/` — Business logic layer
- `app/core/` — Config, security, dependencies
- `alembic/` — Database migrations

## Conventions

- Use Pydantic v2 models for all request/response validation
- Dependency injection via FastAPI `Depends()` for DB sessions and auth
- Async endpoints where possible (`async def`)
- Use SQLAlchemy 2.0 style queries (select statements, not legacy Query API)
- Return proper HTTP status codes (201 for creation, 204 for deletion)
- All models need `created_at` and `updated_at` timestamps

## Testing

Use pytest with httpx AsyncClient for API tests. Use factory fixtures for test data. Test against a real test database, not mocks.
