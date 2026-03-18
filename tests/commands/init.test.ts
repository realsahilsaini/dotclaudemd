import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderTemplate } from "../../src/core/template-engine.js";
import type { Template, FsDeps } from "../../src/types.js";

describe("init command (unit)", () => {
  const mockTemplate: Template = {
    filePath: "/templates/test.md",
    frontmatter: {
      name: "test-template",
      displayName: "Test Template",
      description: "A test template",
      category: "test",
      tags: ["test"],
      variables: [
        { name: "project_name", prompt: "Name?", default: "my-project" },
        {
          name: "language",
          prompt: "Language?",
          options: ["TS", "JS"],
          default: "TS",
        },
      ],
      priority: 0,
    },
    content: "# {{project_name}}\n\nLanguage: {{language}}",
  };

  it("renders template with provided variables", () => {
    const result = renderTemplate(mockTemplate, {
      project_name: "awesome-app",
      language: "TypeScript",
    });
    expect(result).toContain("# awesome-app");
    expect(result).toContain("Language: TypeScript");
  });

  it("renders template with default variables", () => {
    const result = renderTemplate(mockTemplate, {});
    expect(result).toContain("# my-project");
    expect(result).toContain("Language: TS");
  });

  it("can write rendered content to filesystem", async () => {
    const written: Record<string, string> = {};
    const deps: FsDeps = {
      async readFile() {
        return "";
      },
      async writeFile(path: string, content: string) {
        written[path] = content;
      },
      async fileExists() {
        return false;
      },
      async readDir() {
        return [];
      },
    };

    const rendered = renderTemplate(mockTemplate, {
      project_name: "test",
      language: "JS",
    });
    await deps.writeFile("/output/CLAUDE.md", rendered);

    expect(written["/output/CLAUDE.md"]).toContain("# test");
    expect(written["/output/CLAUDE.md"]).toContain("Language: JS");
  });
});
