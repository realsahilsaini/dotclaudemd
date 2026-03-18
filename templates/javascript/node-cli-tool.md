---
name: node-cli-tool
displayName: Node.js CLI Tool
description: Node.js command-line tool with TypeScript
category: javascript
tags: [javascript, typescript, node, cli, tool]
variables:
  - name: cli_framework
    prompt: "CLI framework?"
    options: [Commander, yargs, Clipanion]
    default: Commander
  - name: package_manager
    prompt: "Package manager?"
    options: [npm, pnpm, yarn]
    default: npm
detects:
  files: [package.json, tsup.config.ts]
  devDependencies: [tsup]
priority: 5
---

# Project

Node.js CLI tool built with TypeScript and {{cli_framework}}.

## Commands

- `{{package_manager}} run build` — Build with tsup
- `{{package_manager}} run dev` — Watch mode
- `{{package_manager}} test` — Run tests
- `node dist/cli.mjs --help` — Test built CLI

## Architecture

- `src/cli.ts` — Entry point, command registration
- `src/commands/` — Individual command implementations
- `src/core/` — Business logic (framework-agnostic)
- `src/utils/` — Shared helpers
- `src/types.ts` — TypeScript interfaces

## Conventions

- Keep commands thin: parse args, call core logic, format output
- Core logic should be pure functions with dependency injection for testability
- Use `process.exitCode` instead of `process.exit()` to allow cleanup
- Output to stdout for data, stderr for status/errors
- Support `--json` flag for machine-readable output where applicable
- Test core logic with unit tests; test commands with integration tests

## Publishing

- Package uses `"type": "module"` (ESM)
- `bin` field in package.json points to `dist/cli.mjs`
- Shebang (`#!/usr/bin/env node`) is added by tsup banner
- Verify with `npm pack --dry-run` before publishing
