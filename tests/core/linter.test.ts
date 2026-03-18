import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { lint, builtinRules } from "../../src/core/linter.js";

const fixturesDir = join(import.meta.dirname, "..", "fixtures", "claudemd");

describe("linter", () => {
  describe("valid CLAUDE.md", () => {
    it("reports no errors for a well-formed file", () => {
      const content = readFileSync(join(fixturesDir, "valid.md"), "utf-8");
      const report = lint(content, "valid.md");
      expect(report.errorCount).toBe(0);
    });
  });

  describe("no-placeholder-vars", () => {
    it("detects unreplaced {{variable}} placeholders", () => {
      const content = readFileSync(
        join(fixturesDir, "has-placeholders.md"),
        "utf-8",
      );
      const report = lint(content, "has-placeholders.md");
      const placeholderResults = report.results.filter(
        (r) => r.rule === "no-placeholder-vars",
      );
      expect(placeholderResults.length).toBeGreaterThan(0);
      expect(placeholderResults[0].severity).toBe("error");
    });
  });

  describe("no-personality", () => {
    it("detects personality instructions", () => {
      const content = readFileSync(
        join(fixturesDir, "has-antipatterns.md"),
        "utf-8",
      );
      const report = lint(content, "has-antipatterns.md");
      const personalityResults = report.results.filter(
        (r) => r.rule === "no-personality",
      );
      expect(personalityResults.length).toBeGreaterThan(0);
    });
  });

  describe("no-at-file-refs", () => {
    it("detects @file references", () => {
      const content = readFileSync(
        join(fixturesDir, "has-antipatterns.md"),
        "utf-8",
      );
      const report = lint(content, "has-antipatterns.md");
      const atRefResults = report.results.filter(
        (r) => r.rule === "no-at-file-refs",
      );
      expect(atRefResults.length).toBeGreaterThan(0);
    });
  });

  describe("no-negative-only", () => {
    it("detects negative instructions without alternatives", () => {
      const content = readFileSync(
        join(fixturesDir, "has-antipatterns.md"),
        "utf-8",
      );
      const report = lint(content, "has-antipatterns.md");
      const negativeResults = report.results.filter(
        (r) => r.rule === "no-negative-only",
      );
      expect(negativeResults.length).toBeGreaterThan(0);
    });
  });

  describe("no-unicode-bullets", () => {
    it("detects unicode bullet characters", () => {
      const content = readFileSync(
        join(fixturesDir, "has-antipatterns.md"),
        "utf-8",
      );
      const report = lint(content, "has-antipatterns.md");
      const bulletResults = report.results.filter(
        (r) => r.rule === "no-unicode-bullets",
      );
      expect(bulletResults.length).toBeGreaterThan(0);
      expect(bulletResults[0].severity).toBe("info");
    });
  });

  describe("line-count", () => {
    it("warns for files over 80 lines", () => {
      const content = Array(90).fill("Line of content").join("\n");
      const report = lint(content, "long.md");
      const lineResults = report.results.filter(
        (r) => r.rule === "line-count",
      );
      expect(lineResults).toHaveLength(1);
      expect(lineResults[0].severity).toBe("warn");
    });

    it("errors for files over 150 lines", () => {
      const content = Array(160).fill("Line of content").join("\n");
      const report = lint(content, "very-long.md");
      const lineResults = report.results.filter(
        (r) => r.rule === "line-count",
      );
      expect(lineResults).toHaveLength(1);
      expect(lineResults[0].severity).toBe("error");
    });

    it("passes for files under 80 lines", () => {
      const content = Array(50).fill("Line of content").join("\n");
      const report = lint(content, "short.md");
      const lineResults = report.results.filter(
        (r) => r.rule === "line-count",
      );
      expect(lineResults).toHaveLength(0);
    });
  });

  describe("has-commands", () => {
    it("warns when no commands are found", () => {
      const content = "# Project\n\nJust some text without any commands.";
      const report = lint(content, "no-commands.md");
      const cmdResults = report.results.filter(
        (r) => r.rule === "has-commands",
      );
      expect(cmdResults).toHaveLength(1);
    });

    it("passes when commands are present", () => {
      const content = "# Project\n\n```bash\nnpm run build\n```";
      const report = lint(content, "has-commands.md");
      const cmdResults = report.results.filter(
        (r) => r.rule === "has-commands",
      );
      expect(cmdResults).toHaveLength(0);
    });
  });

  describe("report summary", () => {
    it("counts errors, warnings, and info correctly", () => {
      const content = readFileSync(
        join(fixturesDir, "has-antipatterns.md"),
        "utf-8",
      );
      const report = lint(content, "has-antipatterns.md");
      expect(report.errorCount + report.warnCount + report.infoCount).toBe(
        report.results.length,
      );
    });
  });
});
