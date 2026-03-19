---
name: vue-nuxt
displayName: Vue / Nuxt
description: Vue 3 SPA or Nuxt 3 full-stack application
category: javascript
tags: [javascript, typescript, vue, nuxt, ssr]
variables:
  - name: variant
    prompt: "Project type?"
    options: [Nuxt 3, Vue 3 SPA]
    default: Nuxt 3
  - name: styling
    prompt: "Styling solution?"
    options: [Tailwind CSS, UnoCSS, vanilla CSS]
    default: Tailwind CSS
  - name: state_management
    prompt: "State management?"
    options: [Pinia, None]
    default: Pinia
detects:
  files: [nuxt.config.ts, nuxt.config.js, package.json]
  dependencies: [vue, nuxt]
priority: 15
---

# Project

{{variant}} application with TypeScript and {{styling}}.

## Commands

- `npm run dev` — Start dev server with HMR
- `npm run build` — Production build
- `npm run preview` — Preview production build
- `npm run lint` — Run ESLint
- `npm run typecheck` — Run vue-tsc type checking
- `npm test` — Run Vitest

## Architecture

- `pages/` — File-based routing (Nuxt) or `src/views/` (Vue SPA)
- `components/` — Reusable Vue components (auto-imported in Nuxt)
- `composables/` — Shared composition functions (auto-imported in Nuxt)
- `server/` — Server API routes and middleware (Nuxt only)
- `stores/` — Pinia state stores
- `layouts/` — Page layout wrappers
- `plugins/` — Vue/Nuxt plugins

## Conventions

- Use Composition API with `<script setup lang="ts">` exclusively
- Use `{{state_management}}` for shared state management
- Type all props with `defineProps<T>()` and emits with `defineEmits<T>()`
- Use `useFetch` / `useAsyncData` for data fetching in Nuxt (not raw `fetch`)
- Leverage Nuxt auto-imports for components, composables, and utils
- Use `definePageMeta` for route-level metadata and middleware
- Prefer `v-model` and computed properties over manual watchers
