# dotclaudemd

CLAUDE.md Template Registry CLI. Node.js + TypeScript, ESM-only.

## Commands

```bash
npm run build        # Build with tsup -> dist/cli.mjs
npm test             # Run vitest
npm run test:watch   # Watch mode
npm run lint         # Type-check with tsc
```

## Architecture

- `src/cli.ts` — Entry point, commander setup
- `src/commands/` — CLI commands (init, lint, doctor, browse)
- `src/core/` — Business logic (template-engine, template-registry, project-detector, linter, doctor-checks)
- `src/utils/` — Helpers (paths, fs, logger, errors, ui)
- `src/types.ts` — All TypeScript interfaces
- `templates/` — CLAUDE.md templates with YAML frontmatter

## Conventions

- ESM throughout; use `.js` extension in imports
- Core logic uses dependency injection (FsDeps, prompt functions as params) for testability
- Templates use double-brace variable substitution with gray-matter frontmatter
- Keep lint rules self-contained in `src/core/linter.ts`
- Tests in `tests/` mirror `src/` structure; fixtures in `tests/fixtures/`
