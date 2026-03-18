import matter from "gray-matter";
import type { Template, TemplateFrontmatter, FsDeps } from "../types.js";
import { ValidationError } from "../utils/errors.js";
import { defaultFsDeps } from "../utils/fs.js";

export async function parseTemplate(
  filePath: string,
  deps: FsDeps = defaultFsDeps,
): Promise<Template> {
  const raw = await deps.readFile(filePath);
  const { data, content } = matter(raw);

  validateFrontmatter(data, filePath);

  return {
    filePath,
    frontmatter: {
      name: data.name,
      displayName: data.displayName,
      description: data.description,
      category: data.category,
      tags: data.tags ?? [],
      variables: data.variables ?? [],
      detects: data.detects,
      priority: data.priority ?? 0,
    },
    content: content.trim(),
  };
}

function validateFrontmatter(
  data: Record<string, unknown>,
  filePath: string,
): void {
  const required = ["name", "displayName", "description", "category"];
  for (const field of required) {
    if (!data[field]) {
      throw new ValidationError(
        `Template "${filePath}" is missing required frontmatter field: ${field}`,
      );
    }
  }
}

export function renderTemplate(
  template: Template,
  variables: Record<string, string>,
): string {
  let result = template.content;

  // Collect all variable placeholders in the template
  const placeholders = new Set<string>();
  const regex = /\{\{(\w+)\}\}/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(result)) !== null) {
    placeholders.add(match[1]);
  }

  // Check for missing required variables
  for (const varDef of template.frontmatter.variables) {
    if (placeholders.has(varDef.name) && !variables[varDef.name]) {
      if (varDef.default) {
        variables[varDef.name] = varDef.default;
      } else {
        throw new ValidationError(
          `Missing required variable: ${varDef.name}`,
        );
      }
    }
  }

  // Substitute all variables
  result = result.replace(/\{\{(\w+)\}\}/g, (_match, name: string) => {
    return variables[name] ?? _match;
  });

  return result;
}
