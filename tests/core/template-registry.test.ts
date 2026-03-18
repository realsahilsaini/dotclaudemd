import { describe, it, expect, beforeEach } from "vitest";
import { join } from "node:path";
import {
  listTemplates,
  getTemplate,
  filterTemplates,
  suggestTemplates,
  clearCache,
} from "../../src/core/template-registry.js";
import type { DetectedStack, FsDeps } from "../../src/types.js";

const fixturesDir = join(import.meta.dirname, "..", "fixtures", "templates");

describe("template-registry", () => {
  beforeEach(() => {
    clearCache();
  });

  describe("listTemplates", () => {
    it("lists all templates from fixture directory", async () => {
      const templates = await listTemplates(fixturesDir);
      expect(templates.length).toBe(3); // test-basic, test-no-vars, test-detects
    });

    it("caches results on subsequent calls", async () => {
      const first = await listTemplates(fixturesDir);
      const second = await listTemplates(fixturesDir);
      expect(first).toBe(second); // Same reference
    });

    it("handles non-directory entries gracefully", async () => {
      const deps: FsDeps = {
        async readFile() {
          return "";
        },
        async writeFile() {},
        async fileExists() {
          return false;
        },
        async readDir(path: string) {
          if (path.endsWith("templates")) return ["category1", "file.txt"];
          if (path.endsWith("category1")) return ["tmpl.md"];
          throw new Error("Not a directory");
        },
      };
      // Should not throw
      const templates = await listTemplates("/fake/templates", deps);
      expect(templates).toEqual([]);
    });
  });

  describe("getTemplate", () => {
    it("returns template by name", async () => {
      const template = await getTemplate("test-basic", fixturesDir);
      expect(template.frontmatter.name).toBe("test-basic");
      expect(template.frontmatter.displayName).toBe("Test Basic");
    });

    it("throws TemplateNotFoundError for unknown name", async () => {
      await expect(getTemplate("nonexistent", fixturesDir)).rejects.toThrow(
        "Template not found",
      );
    });
  });

  describe("filterTemplates", () => {
    it("filters by category", async () => {
      const templates = await filterTemplates({ category: "test" }, fixturesDir);
      expect(templates.length).toBe(2);
      expect(templates.every((t) => t.frontmatter.category === "test")).toBe(true);
    });

    it("filters by tags", async () => {
      const templates = await filterTemplates({ tags: ["javascript"] }, fixturesDir);
      expect(templates.length).toBe(1);
      expect(templates[0].frontmatter.name).toBe("test-detects");
    });

    it("returns all templates when no filter", async () => {
      const templates = await filterTemplates({}, fixturesDir);
      expect(templates.length).toBe(3);
    });

    it("returns empty for non-matching filter", async () => {
      const templates = await filterTemplates({ category: "ruby" }, fixturesDir);
      expect(templates).toEqual([]);
    });
  });

  describe("suggestTemplates", () => {
    it("suggests templates matching detected stack", async () => {
      const stack: DetectedStack = {
        language: "javascript",
        framework: "React",
        dependencies: ["react", "express"],
        devDependencies: [],
      };
      const suggestions = await suggestTemplates(stack, fixturesDir);
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions[0].frontmatter.name).toBe("test-detects");
    });

    it("returns empty for non-matching stack", async () => {
      const stack: DetectedStack = {
        language: "ruby",
        dependencies: ["rails"],
        devDependencies: [],
      };
      const suggestions = await suggestTemplates(stack, fixturesDir);
      expect(suggestions).toEqual([]);
    });

    it("scores language matches", async () => {
      const stack: DetectedStack = {
        language: "javascript",
        dependencies: [],
        devDependencies: [],
      };
      const suggestions = await suggestTemplates(stack, fixturesDir);
      expect(suggestions.length).toBeGreaterThan(0);
    });
  });
});
