---
name: flask-basic
displayName: Flask Basic
description: Flask web application
category: python
tags: [python, flask, web, backend]
variables:
  - name: db_type
    prompt: "Database?"
    options: [SQLite, PostgreSQL, None]
    default: SQLite
  - name: template_engine
    prompt: "Template engine?"
    options: [Jinja2, None (API only)]
    default: Jinja2
detects:
  files: [requirements.txt, pyproject.toml]
  dependencies: [flask]
priority: 5
---

# Project

Flask web application.

## Commands

- `flask run --debug` — Start dev server with hot reload
- `pytest` — Run tests
- `flask db upgrade` — Apply migrations (if using Flask-Migrate)

## Architecture

- `app/__init__.py` — Application factory (`create_app`)
- `app/routes/` — Blueprint route modules
- `app/models/` — Database models
- `app/templates/` — Jinja2 templates
- `app/static/` — Static assets
- `tests/` — Test suite

## Conventions

- Use the application factory pattern (`create_app()`)
- Organize routes with Blueprints
- Use Flask-SQLAlchemy for database operations with {{db_type}}
- Configure via environment variables and `config.py`
- Use `flask.g` for per-request state; use sessions for user state

## Testing

Use pytest with the Flask test client. Create an app fixture with test config. Test routes return expected status codes and data.
