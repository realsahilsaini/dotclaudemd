import { describe, it, expect } from "vitest";
import { join } from "node:path";
import {
  getTemplatesDir,
  findProjectRoot,
  findClaudeMd,
} from "../../src/utils/paths.js";

describe("paths", () => {
  describe("getTemplatesDir", () => {
    it("returns a path ending with 'templates'", () => {
      const dir = getTemplatesDir();
      expect(dir).toMatch(/templates$/);
    });
  });

  describe("findProjectRoot", () => {
    it("finds project root from current directory", () => {
      const root = findProjectRoot();
      // Should find the dotclaudemd project root (has package.json)
      expect(root).toBeTruthy();
    });

    it("returns startDir when no root indicators found", () => {
      const root = findProjectRoot("/tmp");
      expect(root).toBe("/tmp");
    });

    it("finds root from nested directory", () => {
      const root = findProjectRoot(
        join(import.meta.dirname, "..", "..", "src"),
      );
      expect(root).toMatch(/dotclaudemd$/);
    });
  });

  describe("findClaudeMd", () => {
    it("finds CLAUDE.md in project root", () => {
      const projectRoot = join(import.meta.dirname, "..", "..");
      const result = findClaudeMd(projectRoot);
      expect(result).toContain("CLAUDE.md");
    });

    it("returns null when no CLAUDE.md exists", () => {
      const result = findClaudeMd("/tmp");
      expect(result).toBeNull();
    });
  });
});
