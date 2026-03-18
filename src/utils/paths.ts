import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";

export function getTemplatesDir(): string {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  // From dist/cli.mjs or src/utils/paths.ts, go up to package root
  let dir = __dirname;
  for (let i = 0; i < 5; i++) {
    const candidate = join(dir, "templates");
    if (existsSync(candidate)) {
      return candidate;
    }
    dir = dirname(dir);
  }
  // Fallback: relative to package root
  return join(dirname(dirname(__dirname)), "templates");
}

export function findProjectRoot(startDir?: string): string {
  let dir = startDir ? resolve(startDir) : process.cwd();
  while (true) {
    // Check for common project root indicators
    const indicators = [
      "package.json",
      "pyproject.toml",
      "Cargo.toml",
      "go.mod",
      ".git",
    ];
    for (const indicator of indicators) {
      if (existsSync(join(dir, indicator))) {
        return dir;
      }
    }
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return startDir ? resolve(startDir) : process.cwd();
}

export function findClaudeMd(projectRoot: string): string | null {
  // Check common CLAUDE.md locations
  const candidates = [
    join(projectRoot, "CLAUDE.md"),
    join(projectRoot, ".claude", "CLAUDE.md"),
  ];
  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      return candidate;
    }
  }
  return null;
}
