---
name: react-vite
displayName: React + Vite
description: React SPA with Vite build tool
category: javascript
tags: [javascript, typescript, react, vite, spa]
variables:
  - name: state_management
    prompt: "State management?"
    options: [Zustand, Redux Toolkit, Jotai, React Context]
    default: Zustand
  - name: styling
    prompt: "Styling solution?"
    options: [Tailwind CSS, CSS Modules, styled-components]
    default: Tailwind CSS
detects:
  files: [package.json, vite.config.ts, vite.config.js]
  dependencies: [react, vite]
  devDependencies: [vite]
priority: 12
---

# Project

React single-page application built with Vite.

## Commands

- `npm run dev` — Start Vite dev server
- `npm run build` — Production build to `dist/`
- `npm run preview` — Preview production build locally
- `npm test` — Run tests
- `npm run lint` — Run ESLint

## Architecture

- `src/components/` — Reusable UI components
- `src/pages/` — Route-level page components
- `src/hooks/` — Custom React hooks
- `src/stores/` — {{state_management}} stores
- `src/services/` — API client and external service wrappers
- `src/types/` — TypeScript type definitions

## Conventions

- Functional components with hooks only; no class components
- Use {{styling}} for styling
- Manage global state with {{state_management}}; prefer local state when possible
- Colocate component, styles, and tests in the same directory
- Use barrel exports (`index.ts`) for public APIs of directories
- Type all props and API responses

## Testing

Tests live next to source files (`Component.test.tsx`). Use React Testing Library for component tests. Test behavior, not implementation.
