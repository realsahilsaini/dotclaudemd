import { describe, it, expect, beforeEach } from "vitest";
import { join } from "node:path";
import {
  listTemplates,
  filterTemplates,
  clearCache,
} from "../../src/core/template-registry.js";

const fixturesDir = join(import.meta.dirname, "..", "fixtures", "templates");

describe("browse command (unit)", () => {
  beforeEach(() => {
    clearCache();
  });

  it("lists all templates from fixtures directory", async () => {
    const templates = await listTemplates(fixturesDir);
    expect(templates.length).toBeGreaterThan(0);
  });

  it("filters templates by category", async () => {
    const templates = await filterTemplates(
      { category: "test" },
      fixturesDir,
    );
    expect(templates.every((t) => t.frontmatter.category === "test")).toBe(
      true,
    );
  });

  it("filters templates by tags", async () => {
    const templates = await filterTemplates(
      { tags: ["javascript"] },
      fixturesDir,
    );
    expect(
      templates.every((t) => t.frontmatter.tags.includes("javascript")),
    ).toBe(true);
  });

  it("returns empty array for non-matching filter", async () => {
    const templates = await filterTemplates(
      { category: "nonexistent" },
      fixturesDir,
    );
    expect(templates).toEqual([]);
  });
});
