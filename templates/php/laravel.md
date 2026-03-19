---
name: laravel
displayName: Laravel
description: Laravel PHP web application
category: php
tags: [php, laravel, web, api, backend]
variables:
  - name: db
    prompt: "Database?"
    options: [MySQL, PostgreSQL, SQLite]
    default: MySQL
detects:
  files: [composer.json, artisan]
priority: 10
---

# Project

Laravel application with {{db}}.

## Commands

- `php artisan serve` — Start dev server on localhost:8000
- `php artisan test` or `./vendor/bin/pest` — Run tests
- `php artisan migrate` — Run pending migrations
- `php artisan db:seed` — Seed the database
- `php artisan make:model ModelName -mfc` — Generate model with migration, factory, controller
- `php artisan route:list` — List all routes
- `composer install` — Install dependencies
- `./vendor/bin/pint` — Run code style fixer (Laravel Pint)

## Architecture

- `app/Models/` — Eloquent models
- `app/Http/Controllers/` — Request handlers
- `app/Http/Requests/` — Form request validation classes
- `app/Http/Middleware/` — HTTP middleware
- `app/Services/` — Business logic service classes
- `routes/web.php` — Web routes (session, CSRF)
- `routes/api.php` — API routes (stateless, token auth)
- `database/migrations/` — Schema migrations (timestamped)
- `database/factories/` — Model factories for testing
- `resources/views/` — Blade templates
- `tests/` — Feature and unit tests

## Conventions

- Use Eloquent ORM for database operations; avoid raw queries unless performance-critical
- Use Form Request classes for validation instead of inline controller validation
- Keep controllers thin: validate via Form Request, delegate to service classes, return response
- Use Resource classes (`JsonResource`) for API response transformation
- Use Eloquent relationships (`hasMany`, `belongsTo`) and eager loading (`with()`) to avoid N+1
- Use `config()` helper for environment-specific values; never read `env()` outside config files
- Use Laravel queues for long-running tasks (email, notifications, file processing)
- Write Feature tests for HTTP endpoints and Unit tests for isolated logic
