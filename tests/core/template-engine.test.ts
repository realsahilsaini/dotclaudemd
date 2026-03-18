import { describe, it, expect } from "vitest";
import { join } from "node:path";
import { parseTemplate, renderTemplate } from "../../src/core/template-engine.js";
import type { FsDeps, Template } from "../../src/types.js";

const fixturesDir = join(import.meta.dirname, "..", "fixtures", "templates");

function makeFsDeps(files: Record<string, string>): FsDeps {
  return {
    async readFile(path: string) {
      if (path in files) return files[path];
      throw new Error(`File not found: ${path}`);
    },
    async writeFile() {},
    async fileExists(path: string) {
      return path in files;
    },
    async readDir() {
      return [];
    },
  };
}

describe("parseTemplate", () => {
  it("parses a template with frontmatter and content", async () => {
    const template = await parseTemplate(join(fixturesDir, "test", "test-basic.md"));
    expect(template.frontmatter.name).toBe("test-basic");
    expect(template.frontmatter.displayName).toBe("Test Basic");
    expect(template.frontmatter.category).toBe("test");
    expect(template.frontmatter.tags).toContain("test");
    expect(template.frontmatter.variables).toHaveLength(2);
    expect(template.content).toContain("{{project_name}}");
  });

  it("parses a template with no variables", async () => {
    const template = await parseTemplate(join(fixturesDir, "test", "test-no-vars.md"));
    expect(template.frontmatter.variables).toEqual([]);
    expect(template.content).toContain("Simple Project");
  });

  it("parses a template with detection rules", async () => {
    const template = await parseTemplate(join(fixturesDir, "javascript", "test-detects.md"));
    expect(template.frontmatter.detects).toBeDefined();
    expect(template.frontmatter.detects!.dependencies).toContain("react");
    expect(template.frontmatter.priority).toBe(10);
  });

  it("throws on missing required frontmatter", async () => {
    const deps = makeFsDeps({
      "/bad.md": "---\nname: test\n---\nContent",
    });
    await expect(parseTemplate("/bad.md", deps)).rejects.toThrow(
      "missing required frontmatter",
    );
  });
});

describe("renderTemplate", () => {
  const baseTemplate: Template = {
    filePath: "/test.md",
    frontmatter: {
      name: "test",
      displayName: "Test",
      description: "Test template",
      category: "test",
      tags: [],
      variables: [
        { name: "project_name", prompt: "Name?", default: "default-project" },
        { name: "language", prompt: "Language?", options: ["TS", "JS"], default: "TS" },
      ],
      priority: 0,
    },
    content: "# {{project_name}}\n\nWritten in {{language}}.",
  };

  it("substitutes all variables", () => {
    const result = renderTemplate(baseTemplate, {
      project_name: "my-app",
      language: "TypeScript",
    });
    expect(result).toBe("# my-app\n\nWritten in TypeScript.");
  });

  it("uses default values for missing variables", () => {
    const result = renderTemplate(baseTemplate, {});
    expect(result).toBe("# default-project\n\nWritten in TS.");
  });

  it("throws when required variable has no default", () => {
    const tmpl: Template = {
      ...baseTemplate,
      frontmatter: {
        ...baseTemplate.frontmatter,
        variables: [{ name: "required_var", prompt: "Required?" }],
      },
      content: "{{required_var}}",
    };
    expect(() => renderTemplate(tmpl, {})).toThrow("Missing required variable");
  });

  it("leaves unknown placeholders untouched", () => {
    const tmpl: Template = {
      ...baseTemplate,
      content: "{{known}} and {{unknown}}",
      frontmatter: {
        ...baseTemplate.frontmatter,
        variables: [{ name: "known", prompt: "?", default: "yes" }],
      },
    };
    const result = renderTemplate(tmpl, { known: "replaced" });
    expect(result).toBe("replaced and {{unknown}}");
  });
});
