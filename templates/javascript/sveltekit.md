---
name: sveltekit
displayName: SvelteKit
description: SvelteKit application with TypeScript
category: javascript
tags: [javascript, typescript, svelte, sveltekit, ssr]
variables:
  - name: styling
    prompt: "Styling solution?"
    options: [Tailwind CSS, vanilla CSS]
    default: Tailwind CSS
  - name: adapter
    prompt: "SvelteKit adapter?"
    options: [auto, node, static, vercel]
    default: auto
detects:
  files: [svelte.config.js, svelte.config.ts, package.json]
  dependencies: ["@sveltejs/kit"]
priority: 15
---

# Project

SvelteKit application with TypeScript using the {{adapter}} adapter.

## Commands

- `npm run dev` — Start dev server with HMR
- `npm run build` — Production build
- `npm run preview` — Preview production build locally
- `npm run check` — Run svelte-check for type errors
- `npm test` — Run tests
- `npm run lint` — Run ESLint + Prettier

## Architecture

- `src/routes/` — File-based routing (+page.svelte, +layout.svelte, +server.ts)
- `src/lib/` — Shared library code (importable via `$lib`)
- `src/lib/components/` — Reusable Svelte components
- `src/lib/server/` — Server-only modules (never sent to client)
- `src/params/` — Param matchers for dynamic routes
- `static/` — Static assets served as-is

## Conventions

- Use `+page.ts` / `+page.server.ts` load functions for data fetching
- Use `+server.ts` for API endpoints (GET, POST, etc.)
- Use form actions (`+page.server.ts` actions) for mutations instead of API routes
- Use `{{styling}}` for styling
- Import shared code with `$lib/` alias
- Keep server-only logic in `$lib/server/` or `+page.server.ts` to prevent client leaks
- Use Svelte stores or `$state` runes for reactive state management
- Prefer `{#each}`, `{#if}` template syntax over JS-heavy components
