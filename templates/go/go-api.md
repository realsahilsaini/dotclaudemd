---
name: go-api
displayName: Go API
description: Go REST API application
category: go
tags: [go, api, backend]
variables:
  - name: router
    prompt: "HTTP router?"
    options: [net/http, Chi, Gin, Echo]
    default: net/http
  - name: db_type
    prompt: "Database?"
    options: [PostgreSQL, SQLite, None]
    default: PostgreSQL
detects:
  files: [go.mod]
priority: 5
---

# Project

Go REST API using {{router}}.

## Commands

- `go run ./cmd/server` — Start the server
- `go test ./...` — Run all tests
- `go vet ./...` — Run static analysis
- `golangci-lint run` — Run linter
- `go build -o bin/server ./cmd/server` — Build binary

## Architecture

- `cmd/server/` — Application entry point
- `internal/handler/` — HTTP handlers
- `internal/service/` — Business logic
- `internal/repository/` — Data access layer
- `internal/model/` — Domain types
- `internal/middleware/` — HTTP middleware
- `pkg/` — Reusable packages (if any)

## Conventions

- Accept interfaces, return structs
- Use table-driven tests
- Handle all errors explicitly; prefer `fmt.Errorf("context: %w", err)` for wrapping
- Use `context.Context` as the first parameter for functions that do I/O
- Keep handlers thin: decode request, call service, encode response
- Use dependency injection via struct fields, not globals
- Log with structured logging (slog or zerolog)

## Testing

Table-driven tests with `testing.T`. Use `httptest.NewRequest` and `httptest.NewRecorder` for handler tests. Use testcontainers or an in-memory DB for integration tests.
