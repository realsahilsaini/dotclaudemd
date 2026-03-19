---
name: typescript-monorepo
displayName: TypeScript Monorepo
description: TypeScript monorepo with Turborepo or Nx
category: javascript
tags: [javascript, typescript, monorepo, turborepo, nx]
variables:
  - name: monorepo_tool
    prompt: "Monorepo tool?"
    options: [Turborepo, Nx]
    default: Turborepo
  - name: package_manager
    prompt: "Package manager?"
    options: [pnpm, npm, yarn]
    default: pnpm
detects:
  files: [turbo.json, nx.json, pnpm-workspace.yaml, package.json]
  devDependencies: [turbo, nx]
priority: 15
---

# Project

TypeScript monorepo managed with {{monorepo_tool}} and {{package_manager}}.

## Commands

- `{{package_manager}} run build` — Build all packages
- `{{package_manager}} run dev` — Start dev servers
- `{{package_manager}} run test` — Run tests across all packages
- `{{package_manager}} run lint` — Lint all packages
- `{{package_manager}} run typecheck` — Type-check all packages

## Architecture

- `apps/` — Deployable applications
- `packages/` — Shared libraries and internal packages
- `packages/ui/` — Shared UI component library
- `packages/config/` — Shared configuration (ESLint, TypeScript, etc.)
- `turbo.json` / `nx.json` — Task pipeline configuration

## Conventions

- Each package has its own `package.json` and `tsconfig.json`
- Use workspace protocol for internal dependencies (`"@repo/ui": "workspace:*"`)
- Shared TypeScript config extends from `packages/config/`
- Keep package boundaries strict; no circular dependencies between packages
- Run tasks through {{monorepo_tool}} to leverage caching and task orchestration
- Use `--filter` to target specific packages during development
- Shared types go in a dedicated `packages/types/` or `packages/shared/` package
