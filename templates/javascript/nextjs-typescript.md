---
name: nextjs-typescript
displayName: Next.js + TypeScript
description: Next.js App Router with TypeScript
category: javascript
tags: [javascript, typescript, nextjs, react, ssr]
variables:
  - name: src_dir
    prompt: "Source directory?"
    options: [src, app]
    default: src
  - name: styling
    prompt: "Styling solution?"
    options: [Tailwind CSS, CSS Modules, styled-components]
    default: Tailwind CSS
detects:
  files: [package.json, next.config.mjs, next.config.js, next.config.ts]
  dependencies: [next, react]
priority: 20
---

# Project

Next.js application with TypeScript and App Router.

## Commands

- `npm run dev` — Start dev server on localhost:3000
- `npm run build` — Production build
- `npm run start` — Start production server
- `npm test` — Run tests
- `npm run lint` — Run ESLint + Next.js lint rules

## Architecture

- `{{src_dir}}/app/` — App Router pages and layouts
- `{{src_dir}}/app/api/` — API route handlers
- `{{src_dir}}/components/` — Reusable React components
- `{{src_dir}}/lib/` — Shared utilities and helpers
- `public/` — Static assets

## Conventions

- Use Server Components by default; add `'use client'` only when needed (state, effects, browser APIs)
- Colocate loading.tsx, error.tsx, and not-found.tsx in route segments
- Use `{{styling}}` for styling
- Fetch data in Server Components using `fetch` with Next.js caching
- Use Server Actions for mutations instead of API routes when possible
- Type all props, API responses, and function signatures
- Prefer named exports from components

## Data Fetching

- Server Components: fetch directly in the component
- Client Components: use SWR or React Query
- Mutations: prefer Server Actions (`'use server'`)
- Always handle loading and error states
