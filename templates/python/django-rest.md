---
name: django-rest
displayName: Django REST Framework
description: Django application with REST Framework
category: python
tags: [python, django, drf, api, backend]
variables:
  - name: db_type
    prompt: "Database?"
    options: [PostgreSQL, SQLite]
    default: PostgreSQL
  - name: auth_method
    prompt: "Authentication?"
    options: [Token, JWT, Session]
    default: Token
detects:
  files: [requirements.txt, pyproject.toml, manage.py]
  dependencies: [django, djangorestframework]
priority: 10
---

# Project

Django application with Django REST Framework and {{db_type}}.

## Commands

- `python manage.py runserver` — Start dev server
- `python manage.py test` — Run tests
- `python manage.py makemigrations` — Create migrations
- `python manage.py migrate` — Apply migrations
- `python manage.py shell_plus` — Enhanced Django shell

## Architecture

- `config/` — Project settings, root URL conf, WSGI/ASGI
- `apps/` — Django applications (one per domain)
- `apps/<name>/models.py` — Database models
- `apps/<name>/serializers.py` — DRF serializers
- `apps/<name>/views.py` — DRF viewsets and views
- `apps/<name>/urls.py` — URL patterns
- `apps/<name>/tests/` — Test modules

## Conventions

- One Django app per domain concern
- Use ModelViewSet for standard CRUD; APIView for custom logic
- Serializers handle all validation; keep views thin
- {{auth_method}} authentication for API endpoints
- Use `select_related()` and `prefetch_related()` to avoid N+1 queries
- Write model methods for business logic; keep views as orchestrators

## Testing

Use Django's TestCase with DRF's APIClient. Use `setUpTestData` for shared test fixtures. Test serializer validation separately from views.
