---
name: rails
displayName: Ruby on Rails
description: Ruby on Rails web application
category: ruby
tags: [ruby, rails, web, api, backend]
variables:
  - name: api_only
    prompt: "API-only mode?"
    options: ["No", "Yes"]
    default: "No"
  - name: db
    prompt: "Database?"
    options: [PostgreSQL, MySQL, SQLite]
    default: PostgreSQL
detects:
  files: [Gemfile, Rakefile, config.ru]
priority: 10
---

# Project

Ruby on Rails application with {{db}}.

## Commands

- `bin/rails server` — Start dev server on localhost:3000
- `bin/rails console` — Open Rails console (IRB with app context)
- `bin/rails test` or `bundle exec rspec` — Run tests
- `bin/rails db:migrate` — Run pending migrations
- `bin/rails db:seed` — Seed the database
- `bin/rails routes` — List all routes
- `bundle exec rubocop` — Run linter

## Architecture

- `app/models/` — ActiveRecord models and business logic
- `app/controllers/` — Request handling and response rendering
- `app/views/` — ERB/Haml templates (full-stack) or Jbuilder (API)
- `app/services/` — Service objects for complex business operations
- `app/jobs/` — Background jobs (ActiveJob / Sidekiq)
- `db/migrate/` — Database migrations (timestamped, sequential)
- `config/routes.rb` — Route definitions
- `spec/` or `test/` — Test files

## Conventions

- Follow Rails conventions: pluralized table names, RESTful routes, convention over configuration
- Use ActiveRecord callbacks sparingly; prefer service objects for complex logic
- Keep controllers thin: one action = find resource, perform operation, render response
- Use strong parameters (`params.require(:model).permit(...)`) for mass assignment protection
- Write model validations for all user-facing input
- Use concerns (`app/models/concerns/`, `app/controllers/concerns/`) to share behavior
- Use `has_many`, `belongs_to`, `has_one` for associations; avoid N+1 queries with `includes`
- Prefer scopes on models over complex controller queries
