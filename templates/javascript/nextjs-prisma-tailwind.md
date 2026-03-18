---
name: nextjs-prisma-tailwind
displayName: Next.js + Prisma + Tailwind
description: Full-stack Next.js with Prisma ORM and Tailwind CSS
category: javascript
tags: [javascript, typescript, nextjs, prisma, tailwind, fullstack]
variables:
  - name: db_provider
    prompt: "Database provider?"
    options: [PostgreSQL, MySQL, SQLite]
    default: PostgreSQL
  - name: auth_provider
    prompt: "Auth provider?"
    options: [NextAuth.js, Clerk, Auth0]
    default: NextAuth.js
detects:
  files: [package.json, prisma/schema.prisma]
  dependencies: [next, "@prisma/client"]
priority: 15
---

# Project

Next.js full-stack application with Prisma ORM ({{db_provider}}) and Tailwind CSS.

## Commands

- `npm run dev` — Start dev server
- `npm run build` — Production build
- `npx prisma generate` — Regenerate Prisma Client after schema changes
- `npx prisma db push` — Push schema changes to database
- `npx prisma migrate dev` — Create and apply migration
- `npx prisma studio` — Open database browser
- `npm test` — Run tests

## Architecture

- `src/app/` — App Router pages, layouts, API routes
- `src/components/` — React components
- `src/lib/` — Shared utilities, Prisma client singleton
- `prisma/schema.prisma` — Database schema
- `prisma/migrations/` — Migration history

## Database (Prisma)

- Schema lives in `prisma/schema.prisma`
- Always run `npx prisma generate` after editing the schema
- Use a singleton Prisma Client (see `src/lib/prisma.ts`)
- Use `select` or `include` to avoid over-fetching; prefer `select` for performance
- Use transactions for multi-step writes

## Auth

Authentication via {{auth_provider}}. Protect API routes and server actions by checking the session.

## Styling

Tailwind CSS with `cn()` helper for conditional classes. Use `@apply` sparingly — prefer utility classes in JSX.
