---
name: mern-stack
displayName: MERN Stack
description: MongoDB, Express, React, Node full-stack application
category: javascript
tags: [javascript, mongodb, express, react, node, fullstack]
variables:
  - name: auth_method
    prompt: "Authentication method?"
    options: [JWT, Passport, Auth0]
    default: JWT
  - name: test_framework
    prompt: "Testing framework?"
    options: [Jest, Vitest]
    default: Jest
detects:
  files: [package.json]
  dependencies: [express, react, mongoose]
priority: 10
---

# Project

MERN stack application (MongoDB, Express, React, Node.js).

## Commands

- `npm run dev` — Start development server (client + API)
- `npm run build` — Build for production
- `npm test` — Run tests with {{test_framework}}
- `npm run lint` — Run ESLint

## Architecture

- `client/` — React frontend (Vite or CRA)
- `server/` — Express API server
- `server/models/` — Mongoose schemas
- `server/routes/` — Express route handlers
- `server/middleware/` — Auth and error middleware

## Auth

Authentication uses {{auth_method}}. Protect routes with the auth middleware.

## Database

MongoDB with Mongoose ODM. Define schemas in `server/models/`. Use `lean()` for read-only queries.

## Code Conventions

- Use async/await for all async operations; avoid raw callbacks
- Validate request bodies with a schema validator (e.g., Zod, Joi)
- Return consistent JSON response shapes: `{ data, error, message }`
- Use HTTP status codes correctly (201 for creation, 404 for not found, etc.)

## Testing

Run `npm test` to execute the {{test_framework}} test suite. Place tests adjacent to source files or in `__tests__/` directories.
