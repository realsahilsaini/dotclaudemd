---
name: express-mongodb
displayName: Express + MongoDB
description: Express.js REST API with MongoDB
category: javascript
tags: [javascript, express, mongodb, api, backend]
variables:
  - name: auth_method
    prompt: "Authentication method?"
    options: [JWT, Session, API Key]
    default: JWT
  - name: validation
    prompt: "Validation library?"
    options: [Zod, Joi, express-validator]
    default: Zod
detects:
  files: [package.json]
  dependencies: [express, mongoose]
priority: 8
---

# Project

Express.js REST API with MongoDB.

## Commands

- `npm run dev` — Start with hot reload (nodemon)
- `npm start` — Start production server
- `npm test` — Run tests
- `npm run lint` — Run ESLint

## Architecture

- `src/routes/` — Route definitions (thin: validate + call controller)
- `src/controllers/` — Request handlers
- `src/models/` — Mongoose models and schemas
- `src/middleware/` — Auth, error handling, validation
- `src/services/` — Business logic
- `src/config/` — Environment and DB config

## API Conventions

- RESTful resource naming: `/api/v1/users`, `/api/v1/posts/:id`
- Validate all input with {{validation}}
- Consistent error responses: `{ error: { code, message, details } }`
- Use proper HTTP status codes
- Paginate list endpoints: `?page=1&limit=20`

## Auth

{{auth_method}} authentication. Apply auth middleware to protected routes.

## Database

MongoDB with Mongoose. Define schemas with validation. Use `.lean()` for read queries. Index frequently queried fields.
