# dotclaudemd

CLAUDE.md Template Registry CLI — scaffold, lint, and health-check your CLAUDE.md files.

Think "github/gitignore but for CLAUDE.md."

## Quick Start

```bash
npx dotclaudemd init
```

This auto-detects your project stack and generates a CLAUDE.md from the best matching template.

## Why

There is no standard starting point for writing CLAUDE.md files. Developers write them from scratch, often missing best practices or including anti-patterns. `dotclaudemd` provides a searchable, community-driven registry of templates with a CLI for scaffolding, linting, and health-checking.

## Commands

### `dotclaudemd init`

Scaffold a CLAUDE.md from a template with auto-detection.

```bash
dotclaudemd init                    # Auto-detect stack, interactive prompts
dotclaudemd init --stack mern-stack # Use a specific template
dotclaudemd init --global           # Write to ~/.claude/CLAUDE.md
dotclaudemd init --no-interactive   # Use defaults without prompting
```

### `dotclaudemd lint [file]`

Lint a CLAUDE.md for common anti-patterns.

```bash
dotclaudemd lint                    # Lint CLAUDE.md in current project
dotclaudemd lint path/to/CLAUDE.md  # Lint a specific file
dotclaudemd lint --json             # Output as JSON
```

**Lint Rules:**

| Rule | Severity | Trigger |
|------|----------|---------|
| `line-count` | warn/error | >80 lines (warn), >150 lines (error) |
| `has-commands` | warn | Missing build/test/dev commands |
| `no-personality` | warn | "Be a senior engineer", persona instructions |
| `no-at-file-refs` | warn | `@docs/...` patterns that embed entire files |
| `no-negative-only` | warn | "Never use X" without "prefer Y instead" |
| `stale-file-refs` | warn | Referenced paths that don't exist |
| `no-unicode-bullets` | info | Unicode bullets instead of markdown lists |
| `no-placeholder-vars` | error | Unreplaced `{{variable}}` placeholders |

### `dotclaudemd doctor`

Check CLAUDE.md freshness against actual project state.

```bash
dotclaudemd doctor                  # Run health checks
dotclaudemd doctor --json           # Output as JSON
```

**Health Checks:**

| Check | Description |
|-------|-------------|
| `scripts-exist` | Commands in CLAUDE.md exist in package.json scripts |
| `deps-mentioned` | Major dependencies are mentioned |
| `file-refs-valid` | File paths mentioned actually exist |
| `node-version-match` | Stated Node version matches .nvmrc |
| `test-framework-match` | Mentioned test framework matches devDeps |
| `package-manager-match` | Stated package manager matches lockfile |

### `dotclaudemd browse`

Browse and preview available templates.

```bash
dotclaudemd browse                  # Interactive template browser
dotclaudemd browse --list           # Non-interactive list
dotclaudemd browse --category python # Filter by category
```

## Available Templates

| Template | Description |
|----------|-------------|
| `default` | Generic template for any project |
| `nextjs-typescript` | Next.js App Router with TypeScript |
| `nextjs-prisma-tailwind` | Full-stack Next.js with Prisma + Tailwind |
| `express-mongodb` | Express.js REST API with MongoDB |
| `mern-stack` | MERN full-stack application |
| `react-vite` | React SPA with Vite |
| `node-cli-tool` | Node.js CLI tool with TypeScript |
| `fastapi-sqlalchemy` | FastAPI with SQLAlchemy ORM |
| `django-rest` | Django REST Framework |
| `flask-basic` | Flask web application |
| `cargo-workspace` | Rust Cargo workspace |
| `go-api` | Go REST API |

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for how to add templates and contribute.

## License

MIT
