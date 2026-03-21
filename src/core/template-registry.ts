import { join } from "node:path";
import { parseTemplate } from "./template-engine.js";
import type { Template, DetectedStack, FsDeps } from "../types.js";
import { TemplateNotFoundError } from "../utils/errors.js";
import { getTemplatesDir } from "../utils/paths.js";
import { defaultFsDeps } from "../utils/fs.js";

let cachedTemplates: Template[] | null = null;

export function clearCache(): void {
  cachedTemplates = null;
}

export async function listTemplates(
  templatesDir?: string,
  deps: FsDeps = defaultFsDeps,
): Promise<Template[]> {
  if (cachedTemplates) return cachedTemplates;

  const dir = templatesDir ?? getTemplatesDir();
  const templates: Template[] = [];

  const categories = await deps.readDir(dir);
  for (const category of categories) {
    if (category.startsWith(".")) continue;
    const categoryPath = join(dir, category);
    let files: string[];
    try {
      files = await deps.readDir(categoryPath);
    } catch {
      continue; // Skip non-directory entries
    }
    for (const file of files) {
      if (!file.endsWith(".md")) continue;
      try {
        const template = await parseTemplate(join(categoryPath, file), deps);
        templates.push(template);
      } catch {
        // Skip invalid templates
      }
    }
  }

  cachedTemplates = templates;
  return templates;
}

export async function getTemplate(
  name: string,
  templatesDir?: string,
  deps: FsDeps = defaultFsDeps,
): Promise<Template> {
  const templates = await listTemplates(templatesDir, deps);
  const template = templates.find((t) => t.frontmatter.name === name);
  if (!template) {
    throw new TemplateNotFoundError(name);
  }
  return template;
}

export async function filterTemplates(
  options: { category?: string; tags?: string[] } = {},
  templatesDir?: string,
  deps: FsDeps = defaultFsDeps,
): Promise<Template[]> {
  const templates = await listTemplates(templatesDir, deps);
  return templates.filter((t) => {
    if (options.category && t.frontmatter.category !== options.category) {
      return false;
    }
    if (options.tags && options.tags.length > 0) {
      return options.tags.some((tag) => t.frontmatter.tags.includes(tag));
    }
    return true;
  });
}

export async function suggestTemplates(
  stack: DetectedStack,
  templatesDir?: string,
  deps: FsDeps = defaultFsDeps,
): Promise<Template[]> {
  const templates = await listTemplates(templatesDir, deps);

  const scored = templates
    .map((template) => {
      let score = 0;
      const detects = template.frontmatter.detects;
      if (!detects) return { template, score };

      // Check file-based detection
      if (detects.files) {
        // File detection is handled by the project detector
        // Here we just match on deps
      }

      // Check dependency matches
      if (detects.dependencies) {
        for (const dep of detects.dependencies) {
          if (stack.dependencies.includes(dep)) score += 2;
        }
      }

      if (detects.devDependencies) {
        for (const dep of detects.devDependencies) {
          if (stack.devDependencies.includes(dep)) score += 1;
        }
      }

      // Language match
      if (
        template.frontmatter.category === stack.language ||
        template.frontmatter.tags.includes(stack.language)
      ) {
        score += 1;
      }

      // Framework match — normalize both sides (e.g. "Next.js" → "nextjs")
      if (stack.framework) {
        const normalizedFramework = stack.framework
          .toLowerCase()
          .replace(/[.\s]/g, "");
        const matchesTag = template.frontmatter.tags.some(
          (tag) => tag.toLowerCase().replace(/[.\s]/g, "") === normalizedFramework,
        );
        if (matchesTag) score += 3;
      }

      return { template, score };
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => {
      // Sort by score descending, then by priority descending
      if (b.score !== a.score) return b.score - a.score;
      return b.template.frontmatter.priority - a.template.frontmatter.priority;
    });

  return scored.map((s) => s.template);
}
