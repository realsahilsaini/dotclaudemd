# dotclaudemd

CLAUDE.md Template Registry CLI — scaffold, lint, and health-check your CLAUDE.md files.

Think **"github/gitignore but for CLAUDE.md."**

[![npm version](https://img.shields.io/npm/v/dotclaudemd)](https://www.npmjs.com/package/dotclaudemd)
[![license](https://img.shields.io/npm/l/dotclaudemd)](LICENSE)
[![node](https://img.shields.io/node/v/dotclaudemd)](package.json)

---

## Table of Contents

- [What is CLAUDE.md?](#what-is-claudemd)
- [dotclaudemd vs Claude Code /init](#dotclaudemd-vs-claude-code-init)
- [Why](#why)
- [Quick Start](#quick-start)
- [Installation](#installation)
- [Commands](#commands)
  - [init](#dotclaudemd-init)
  - [lint](#dotclaudemd-lint-file)
  - [doctor](#dotclaudemd-doctor)
  - [browse](#dotclaudemd-browse)
- [Templates](#templates)
- [Use Cases](#use-cases)
- [Contributing](#contributing)
- [License](#license)

---

## What is CLAUDE.md?

CLAUDE.md is a special markdown file that [Claude Code](https://docs.anthropic.com/en/docs/claude-code) reads at the start of every conversation. It tells Claude how your project works — what commands to run, where code lives, and what conventions to follow.

Think of it as a **project brief for your AI pair programmer**. Without it, Claude has to guess your project structure, build system, and coding style every time. With a good CLAUDE.md, Claude already knows:

- How to build, test, and run your project
- Your directory structure and key files
- Framework-specific conventions (Server Components vs Client Components, Composition API vs Options API, etc.)
- Which database, ORM, and package manager you use

### Where does CLAUDE.md go?

| Location | Scope | When Claude reads it |
|----------|-------|----------------------|
| `./CLAUDE.md` | Project-level | When working in this project directory |
| `./.claude/CLAUDE.md` | Project-level (hidden) | Same as above, but keeps your root directory clean |
| `~/.claude/CLAUDE.md` | Global | Every conversation, in every project |

You can use `dotclaudemd init --global` to generate the global one.

---

## dotclaudemd vs Claude Code `/init`

Claude Code has a built-in `/init` command that generates a CLAUDE.md. Here's how it compares to `dotclaudemd init`:

| | Claude Code `/init` | `dotclaudemd init` |
|---|---|---|
| **How it works** | Claude reads your codebase and writes a CLAUDE.md using AI generation | Selects from 19 curated templates based on your detected stack |
| **Output quality** | Varies by conversation — different each time | Consistent, battle-tested templates with framework-specific best practices |
| **Customization** | Freeform — you can ask Claude to adjust | Structured variables (styling, database, framework, etc.) with predefined options |
| **Speed** | Takes 30-60s as Claude analyzes your code | Instant — template selection + variable substitution |
| **Token cost** | Uses Claude API tokens for generation | Zero tokens — runs locally, no AI calls |
| **Offline** | Requires internet connection | Works fully offline |
| **Linting** | None | 8 built-in lint rules catch anti-patterns |
| **Health checks** | None | `doctor` command verifies CLAUDE.md stays in sync with your project |
| **Reproducible** | No — regenerating gives different results | Yes — same template + same variables = same output |

### When to use which?

**Use `dotclaudemd init` when:**
- You want a proven, consistent starting point for your stack
- You're setting up CLAUDE.md for the first time on a well-known framework (Next.js, Rails, Spring Boot, etc.)
- You want to lint and health-check your CLAUDE.md over time
- You're working offline or want to avoid spending tokens on generation
- You need reproducible output across team members' projects

**Use Claude Code `/init` when:**
- Your project has a unique or unconventional structure that no template covers
- You want Claude to analyze your specific codebase and generate a tailored CLAUDE.md
- You're working on a project that doesn't fit standard categories

**Use both together:**
1. Run `npx dotclaudemd init` to get a solid template-based starting point
2. Then ask Claude to refine it based on your specific project's nuances
3. Run `npx dotclaudemd lint` and `npx dotclaudemd doctor` periodically to keep it healthy

---

## Why

There is no standard starting point for writing CLAUDE.md files. Developers write them from scratch, often missing best practices or including anti-patterns that waste context window tokens.

`dotclaudemd` solves this with:

- **19 curated templates** across 8 language/framework categories
- **Auto-detection** of your project stack (reads package.json, Cargo.toml, go.mod, pom.xml, Gemfile, composer.json)
- **Linting** that catches anti-patterns before they cost you tokens
- **Health checks** that verify your CLAUDE.md stays in sync with your actual project

---

## Quick Start

No installation needed — just run:

```bash
npx dotclaudemd init
```

This auto-detects your project stack and generates a CLAUDE.md from the best matching template.

---

## Installation

### Use without installing (recommended)

```bash
npx dotclaudemd <command>
```

### Install globally

```bash
npm install -g dotclaudemd
```

### Install as a dev dependency

```bash
npm install -D dotclaudemd
```

Then add to your `package.json` scripts:

```json
{
  "scripts": {
    "claude:lint": "dotclaudemd lint",
    "claude:doctor": "dotclaudemd doctor"
  }
}
```

> **Requires Node.js >= 20**

---

## Commands

### `dotclaudemd init`

Scaffold a CLAUDE.md from a template. Auto-detects your project stack and prompts you for template variables (styling, database, framework options, etc).

```bash
# Auto-detect stack, interactive prompts
dotclaudemd init

# Use a specific template by name
dotclaudemd init --stack nextjs-typescript

# Write to ~/.claude/CLAUDE.md (global instructions for all projects)
dotclaudemd init --global

# Use all defaults without prompting (great for CI)
dotclaudemd init --no-interactive

# Overwrite an existing CLAUDE.md without confirmation
dotclaudemd init --force

# Combine flags
dotclaudemd init --stack rails --no-interactive --force
```

**How detection works:** The CLI looks at your project root for manifest files (`package.json`, `Cargo.toml`, `go.mod`, `pom.xml`, `Gemfile`, `composer.json`, `pyproject.toml`) and their contents (dependencies, lock files) to suggest the best matching template.

---

### `dotclaudemd lint [file]`

Lint a CLAUDE.md for common anti-patterns that waste context window tokens or confuse Claude.

```bash
# Lint CLAUDE.md in current project
dotclaudemd lint

# Lint a specific file
dotclaudemd lint path/to/CLAUDE.md

# Machine-readable JSON output
dotclaudemd lint --json
```

Returns exit code `1` if errors are found (useful for CI).

**Lint Rules:**

| Rule | Severity | What it catches |
|------|----------|-----------------|
| `line-count` | warn / error | >80 lines (warn), >150 lines (error) — large files eat into Claude's context window |
| `has-commands` | warn | No build, test, or dev commands found — Claude needs these to help you build and test |
| `no-personality` | warn | "Be a senior engineer", "act as an expert" — persona instructions waste tokens and don't improve output |
| `no-at-file-refs` | warn | `@docs/api.md` patterns that embed entire files into context |
| `no-negative-only` | warn | "Never use X" without "prefer Y instead" — Claude works better with positive guidance |
| `stale-file-refs` | warn | File paths like `src/old-module.ts` that no longer exist in your project |
| `no-unicode-bullets` | info | Unicode bullet characters instead of markdown `- ` lists |
| `no-placeholder-vars` | error | Unreplaced `{{variable}}` placeholders from template rendering |

**Example output:**

```
Linting CLAUDE.md

  ⚠  line-count: File is 95 lines. Consider trimming to under 80 lines to save context window.
  ⚠  no-personality: Line 3: Avoid persona instructions like "act as". They waste tokens.
  ⚠  stale-file-refs: Line 12: Referenced path "src/old-module.ts" does not exist.

  1 file linted: 0 errors, 3 warnings, 0 info
```

---

### `dotclaudemd doctor`

Check your CLAUDE.md freshness against your actual project state. Catches drift between what your CLAUDE.md says and what your project actually has.

```bash
# Run all health checks
dotclaudemd doctor

# Machine-readable JSON output (includes freshness score)
dotclaudemd doctor --json
```

**Health Checks:**

| Check | What it verifies |
|-------|------------------|
| `scripts-exist` | Commands like `npm run build` actually exist in package.json scripts |
| `deps-mentioned` | Major production dependencies are mentioned somewhere in CLAUDE.md |
| `file-refs-valid` | File paths like `src/utils/helpers.ts` actually exist on disk |
| `node-version-match` | The Node version stated in CLAUDE.md matches `.nvmrc` / `.node-version` |
| `test-framework-match` | The test framework mentioned (jest, vitest, etc.) matches what's in devDependencies |
| `package-manager-match` | The package manager stated (npm, pnpm, yarn) matches your lockfile |

**Freshness Score:** Doctor computes a 0-100% freshness score based on check results:
- **80-100%** (green) — CLAUDE.md is up to date
- **50-79%** (yellow) — Some things are stale, consider updating
- **0-49%** (red) — CLAUDE.md is significantly out of sync

---

### `dotclaudemd browse`

Browse and preview all available templates before choosing one.

```bash
# Interactive browser — select category, then template, then preview
dotclaudemd browse

# Non-interactive: list all templates
dotclaudemd browse --list

# Filter by language category
dotclaudemd browse --category python
dotclaudemd browse --category javascript
dotclaudemd browse --category java
```

---

## Templates

19 templates across 8 categories. Each template includes project-specific commands, architecture layout, and coding conventions.

### JavaScript / TypeScript

| Template | Description | Key Variables |
|----------|-------------|---------------|
| `nextjs-typescript` | Next.js App Router with TypeScript | `src_dir` (src/app), `styling` (Tailwind/CSS Modules/styled-components) |
| `nextjs-prisma-tailwind` | Full-stack Next.js with Prisma + Tailwind | `src_dir`, `db` (PostgreSQL/MySQL/SQLite) |
| `react-vite` | React SPA with Vite | `styling` (Tailwind/CSS Modules/vanilla), `state` (Zustand/Redux/Context) |
| `express-mongodb` | Express.js REST API with MongoDB | `auth` (JWT/Passport/None) |
| `mern-stack` | Full-stack MERN application | `styling`, `state` |
| `node-cli-tool` | Node.js CLI with TypeScript | `cli_framework` (Commander/yargs/Clipanion), `package_manager` |
| `sveltekit` | SvelteKit with TypeScript | `styling` (Tailwind/vanilla), `adapter` (auto/node/static/vercel) |
| `astro` | Astro content site | `styling`, `ui_framework` (React/Vue/Svelte/None) |
| `vue-nuxt` | Vue 3 SPA or Nuxt 3 | `variant` (Nuxt 3/Vue 3 SPA), `styling`, `state_management` (Pinia/None) |
| `typescript-monorepo` | Turborepo or Nx monorepo | `monorepo_tool` (Turborepo/Nx), `package_manager` (pnpm/npm/yarn) |

### Python

| Template | Description | Key Variables |
|----------|-------------|---------------|
| `fastapi-sqlalchemy` | FastAPI with SQLAlchemy ORM | `db_type` (PostgreSQL/MySQL/SQLite), `package_manager` (pip/poetry/uv) |
| `django-rest` | Django REST Framework | `db_type`, `package_manager` |
| `flask-basic` | Flask web application | `db_type`, `package_manager` |

### Java

| Template | Description | Key Variables |
|----------|-------------|---------------|
| `springboot` | Spring Boot REST API | `build_tool` (Maven/Gradle), `db` (PostgreSQL/MySQL/H2), `java_version` (21/17) |

### Go

| Template | Description | Key Variables |
|----------|-------------|---------------|
| `go-api` | Go REST API | `router` (net/http/Chi/Gin/Echo), `db_type` (PostgreSQL/SQLite/None) |

### Rust

| Template | Description | Key Variables |
|----------|-------------|---------------|
| `cargo-workspace` | Rust Cargo workspace | `project_type` (Binary/Library/Both) |

### Ruby

| Template | Description | Key Variables |
|----------|-------------|---------------|
| `rails` | Ruby on Rails | `api_only` (Yes/No), `db` (PostgreSQL/MySQL/SQLite) |

### PHP

| Template | Description | Key Variables |
|----------|-------------|---------------|
| `laravel` | Laravel PHP application | `db` (MySQL/PostgreSQL/SQLite) |

### Global

| Template | Description | Key Variables |
|----------|-------------|---------------|
| `default` | Generic template for any project | `project_name`, `language` |

---

## Use Cases

### 1. Starting a new project

You just ran `create-next-app` or `rails new` and want to add a CLAUDE.md immediately:

```bash
cd my-new-project
npx dotclaudemd init
```

The CLI auto-detects your stack, suggests the best template, and prompts you for project-specific options (styling, database, etc).

### 2. Adding CLAUDE.md to an existing project

Your team has been working on a project for months but never created a CLAUDE.md:

```bash
cd existing-project
npx dotclaudemd init
```

Same flow — it reads your `package.json` (or `pom.xml`, `Gemfile`, etc.) and generates a CLAUDE.md that already knows your dependencies and project structure.

### 3. Setting up global Claude instructions

Want Claude to follow certain conventions across all your projects:

```bash
npx dotclaudemd init --global
```

This writes to `~/.claude/CLAUDE.md`, which Claude reads for every project you open.

### 4. CI/CD: Linting CLAUDE.md in pull requests

Add a lint check to your CI pipeline to catch CLAUDE.md anti-patterns before they get merged:

```bash
npx dotclaudemd lint --json
```

Returns exit code `1` on errors. Add to your CI config:

```yaml
# GitHub Actions example
- name: Lint CLAUDE.md
  run: npx dotclaudemd lint
```

Or in `package.json`:

```json
{
  "scripts": {
    "lint:claude": "dotclaudemd lint"
  }
}
```

### 5. Catching stale CLAUDE.md after refactoring

You refactored your project — renamed directories, swapped test frameworks, added new dependencies. Your CLAUDE.md is now out of date:

```bash
npx dotclaudemd doctor
```

Doctor checks whether the commands, file paths, and dependencies mentioned in your CLAUDE.md still match your actual project. It reports a freshness score and tells you exactly what's stale.

### 6. Browsing templates before choosing

Not sure which template fits your project? Browse them interactively:

```bash
npx dotclaudemd browse
```

Or list everything non-interactively:

```bash
npx dotclaudemd browse --list
npx dotclaudemd browse --category python
```

### 7. Scaffolding for a specific stack (non-interactive)

You know exactly which template you want and don't need prompts:

```bash
npx dotclaudemd init --stack fastapi-sqlalchemy --no-interactive --force
```

This uses all default variable values and overwrites any existing CLAUDE.md.

### 8. Onboarding new team members

New developer joins the team? The CLAUDE.md already documents:
- How to build, test, and run the project
- Project architecture and key directories
- Coding conventions and patterns to follow

Generate it once, commit it, and every developer (and Claude) benefits.

### 9. Monorepo setup

For Turborepo or Nx monorepos:

```bash
npx dotclaudemd init --stack typescript-monorepo
```

The template covers workspace commands, package boundaries, and shared config conventions.

### 10. Multi-language project

Your project root has both `package.json` and `pom.xml`? The detector picks the primary stack (Node.js in this case). You can override:

```bash
npx dotclaudemd init --stack springboot
```

---

## Auto-Detection

The CLI detects your project stack by examining files in your project root:

| File | Detected Language | Frameworks Detected |
|------|-------------------|---------------------|
| `package.json` | JavaScript/TypeScript | Next.js, SvelteKit, Astro, Nuxt, Vue, Express, React, MERN |
| `turbo.json` / `nx.json` | JavaScript/TypeScript | Turborepo, Nx (monorepo) |
| `pyproject.toml` / `requirements.txt` | Python | FastAPI, Django, Flask |
| `Cargo.toml` | Rust | Actix, Axum, Rocket |
| `go.mod` | Go | Gin, Fiber, Chi, Echo |
| `pom.xml` / `build.gradle` | Java | Spring Boot |
| `Gemfile` | Ruby | Rails |
| `composer.json` | PHP | Laravel |

It also detects:
- **Package managers**: npm, pnpm, yarn, bun, poetry, pipenv, uv, pip, cargo, go, maven, gradle, bundler, composer
- **Test frameworks**: vitest, jest, mocha, pytest
- **Lock files**: package-lock.json, pnpm-lock.yaml, yarn.lock, bun.lockb, poetry.lock, Pipfile.lock, uv.lock

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for how to add templates and contribute.

### Adding a Template

Templates live in `templates/{category}/{name}.md` with YAML frontmatter:

```yaml
---
name: my-template
displayName: My Template
description: Short description
category: javascript
tags: [javascript, typescript, myframework]
variables:
  - name: styling
    prompt: "Styling solution?"
    options: [Tailwind CSS, vanilla CSS]
    default: Tailwind CSS
detects:
  files: [package.json]
  dependencies: [my-framework]
priority: 10
---

# Project

My project using {{styling}}.

## Commands
...
```

Variables use `{{double_braces}}` for substitution. The `detects` field enables auto-suggestion when the CLI finds matching files or dependencies.

---

## License

MIT
