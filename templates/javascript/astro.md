---
name: astro
displayName: Astro
description: Astro content site with optional UI framework
category: javascript
tags: [javascript, typescript, astro, static, ssr]
variables:
  - name: styling
    prompt: "Styling solution?"
    options: [Tailwind CSS, vanilla CSS]
    default: Tailwind CSS
  - name: ui_framework
    prompt: "UI framework integration?"
    options: [React, Vue, Svelte, None]
    default: None
detects:
  files: [astro.config.mjs, astro.config.ts, package.json]
  dependencies: [astro]
priority: 15
---

# Project

Astro site with {{styling}} and {{ui_framework}} integration.

## Commands

- `npm run dev` — Start dev server
- `npm run build` — Production build to `dist/`
- `npm run preview` — Preview production build locally
- `npm run astro check` — Run type checking
- `npm run lint` — Run ESLint

## Architecture

- `src/pages/` — File-based routing (.astro, .md, .mdx files)
- `src/layouts/` — Page layout templates
- `src/components/` — Reusable components (.astro and framework components)
- `src/content/` — Content collections (Markdown/MDX with schema validation)
- `src/styles/` — Global stylesheets
- `public/` — Static assets served as-is

## Conventions

- Use `.astro` components by default; they render to zero client-side JS
- Use islands architecture: add `client:load`, `client:visible`, or `client:idle` only when interactivity is needed
- Define content collections in `src/content/config.ts` with Zod schemas
- Use `getCollection()` and `getEntry()` to query content
- Prefer `.astro` components over framework components when no client-side state is needed
- Use `Astro.props` for component props; type with TypeScript interfaces
- Frontmatter in `.astro` files runs at build time on the server
