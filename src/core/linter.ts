import { existsSync } from "node:fs";
import { join } from "node:path";
import type { LintRule, LintResult, LintReport } from "../types.js";

export const builtinRules: LintRule[] = [
  {
    name: "line-count",
    description: "CLAUDE.md should be concise",
    severity: "warn",
    check(content: string): LintResult[] {
      const lines = content.split("\n").length;
      if (lines > 150) {
        return [
          {
            rule: "line-count",
            severity: "error",
            message: `CLAUDE.md is ${lines} lines (max recommended: 150). Very long files waste context window.`,
          },
        ];
      }
      if (lines > 80) {
        return [
          {
            rule: "line-count",
            severity: "warn",
            message: `CLAUDE.md is ${lines} lines (recommended: <80). Consider trimming to essential instructions.`,
          },
        ];
      }
      return [];
    },
  },
  {
    name: "has-commands",
    description: "Should include build/test/dev commands",
    severity: "warn",
    check(content: string): LintResult[] {
      const lower = content.toLowerCase();
      const hasCommands =
        lower.includes("npm run") ||
        lower.includes("pnpm ") ||
        lower.includes("yarn ") ||
        lower.includes("make ") ||
        lower.includes("cargo ") ||
        lower.includes("go ") ||
        lower.includes("python ") ||
        lower.includes("pytest") ||
        lower.includes("mvn ") ||
        lower.includes("gradle ") ||
        lower.includes("./gradlew ") ||
        lower.includes("rails ") ||
        lower.includes("bundle ") ||
        lower.includes("php artisan") ||
        lower.includes("composer ") ||
        lower.includes("```sh") ||
        lower.includes("```bash") ||
        lower.includes("```shell");
      if (!hasCommands) {
        return [
          {
            rule: "has-commands",
            severity: "warn",
            message:
              "No build/test/dev commands found. Include commands so Claude can build and test.",
          },
        ];
      }
      return [];
    },
  },
  {
    name: "no-personality",
    description: "Avoid personality instructions",
    severity: "warn",
    check(content: string): LintResult[] {
      const patterns = [
        /be a senior engineer/i,
        /think step by step/i,
        /you are an? (?:expert|senior|experienced)/i,
        /act as an? /i,
        /pretend you are/i,
        /take a deep breath/i,
      ];
      const results: LintResult[] = [];
      const lines = content.split("\n");
      for (let i = 0; i < lines.length; i++) {
        for (const pattern of patterns) {
          if (pattern.test(lines[i])) {
            results.push({
              rule: "no-personality",
              severity: "warn",
              message: `Line ${i + 1}: Personality instruction detected ("${lines[i].trim().slice(0, 60)}..."). CLAUDE.md should focus on project facts, not persona.`,
              line: i + 1,
            });
            break; // One match per line
          }
        }
      }
      return results;
    },
  },
  {
    name: "no-at-file-refs",
    description: "Avoid @file references that embed entire files",
    severity: "warn",
    check(content: string): LintResult[] {
      const results: LintResult[] = [];
      const lines = content.split("\n");
      for (let i = 0; i < lines.length; i++) {
        if (/@\w+\/[^\s]+/.test(lines[i]) && !lines[i].includes("@types")) {
          results.push({
            rule: "no-at-file-refs",
            severity: "warn",
            message: `Line ${i + 1}: @file reference detected. These embed entire file contents into context, wasting tokens.`,
            line: i + 1,
          });
        }
      }
      return results;
    },
  },
  {
    name: "no-negative-only",
    description: 'Avoid "never X" without "prefer Y"',
    severity: "warn",
    check(content: string): LintResult[] {
      const results: LintResult[] = [];
      const lines = content.split("\n");
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (/\b(?:never|don't|do not|avoid)\b/i.test(line)) {
          const hasAlternative =
            /\b(?:instead|prefer|use|rather)\b/i.test(line) ||
            (i + 1 < lines.length &&
              /\b(?:instead|prefer|use|rather)\b/i.test(lines[i + 1]));
          if (!hasAlternative) {
            results.push({
              rule: "no-negative-only",
              severity: "warn",
              message: `Line ${i + 1}: Negative-only instruction without alternative. Add "instead, prefer X" for better results.`,
              line: i + 1,
            });
          }
        }
      }
      return results;
    },
  },
  {
    name: "stale-file-refs",
    description: "Referenced file paths should exist",
    severity: "warn",
    check(content: string, projectRoot?: string): LintResult[] {
      if (!projectRoot) return [];
      const results: LintResult[] = [];
      const lines = content.split("\n");
      // Match paths like src/foo.ts, ./config/bar.json, etc.
      const pathRegex =
        /(?:^|\s)(?:\.\/)?([a-zA-Z][\w\-./]*\.\w{1,10})(?:\s|$|`|"|\))/;
      for (let i = 0; i < lines.length; i++) {
        const match = pathRegex.exec(lines[i]);
        if (match) {
          const filePath = match[1];
          // Skip common false positives
          if (
            filePath.includes("example") ||
            filePath.startsWith("http") ||
            filePath.includes("*")
          )
            continue;
          const fullPath = join(projectRoot, filePath);
          if (!existsSync(fullPath)) {
            results.push({
              rule: "stale-file-refs",
              severity: "warn",
              message: `Line ${i + 1}: Referenced file "${filePath}" does not exist.`,
              line: i + 1,
            });
          }
        }
      }
      return results;
    },
  },
  {
    name: "no-unicode-bullets",
    description: "Use markdown list syntax instead of unicode bullets",
    severity: "info",
    check(content: string): LintResult[] {
      const results: LintResult[] = [];
      const lines = content.split("\n");
      for (let i = 0; i < lines.length; i++) {
        if (/^\s*[•‣⁃◦▪▸►]/.test(lines[i])) {
          results.push({
            rule: "no-unicode-bullets",
            severity: "info",
            message: `Line ${i + 1}: Unicode bullet character detected. Use markdown "- " or "* " instead.`,
            line: i + 1,
          });
        }
      }
      return results;
    },
  },
  {
    name: "no-placeholder-vars",
    description: "No unreplaced {{variable}} placeholders",
    severity: "error",
    check(content: string): LintResult[] {
      const results: LintResult[] = [];
      const lines = content.split("\n");
      for (let i = 0; i < lines.length; i++) {
        const matches = lines[i].match(/\{\{\w+\}\}/g);
        if (matches) {
          results.push({
            rule: "no-placeholder-vars",
            severity: "error",
            message: `Line ${i + 1}: Unreplaced placeholder(s): ${matches.join(", ")}`,
            line: i + 1,
          });
        }
      }
      return results;
    },
  },
];

export function lint(
  content: string,
  filePath: string,
  projectRoot?: string,
  rules: LintRule[] = builtinRules,
): LintReport {
  const results: LintResult[] = [];

  for (const rule of rules) {
    results.push(...rule.check(content, projectRoot));
  }

  return {
    file: filePath,
    results,
    errorCount: results.filter((r) => r.severity === "error").length,
    warnCount: results.filter((r) => r.severity === "warn").length,
    infoCount: results.filter((r) => r.severity === "info").length,
  };
}
