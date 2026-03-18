import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { lint } from "../../src/core/linter.js";

const fixturesDir = join(import.meta.dirname, "..", "fixtures", "claudemd");

describe("lint command (unit)", () => {
  it("returns clean report for valid file", () => {
    const content = readFileSync(join(fixturesDir, "valid.md"), "utf-8");
    const report = lint(content, "valid.md");
    expect(report.errorCount).toBe(0);
  });

  it("returns errors for file with placeholders", () => {
    const content = readFileSync(
      join(fixturesDir, "has-placeholders.md"),
      "utf-8",
    );
    const report = lint(content, "has-placeholders.md");
    expect(report.errorCount).toBeGreaterThan(0);
    expect(report.results.some((r) => r.rule === "no-placeholder-vars")).toBe(
      true,
    );
  });

  it("returns warnings for file with anti-patterns", () => {
    const content = readFileSync(
      join(fixturesDir, "has-antipatterns.md"),
      "utf-8",
    );
    const report = lint(content, "has-antipatterns.md");
    expect(report.warnCount).toBeGreaterThan(0);
  });

  it("sets correct file path in report", () => {
    const report = lint("# Test", "my-file.md");
    expect(report.file).toBe("my-file.md");
  });
});
