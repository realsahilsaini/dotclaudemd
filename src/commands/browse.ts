import chalk from "chalk";
import { select, confirm } from "@inquirer/prompts";
import {
  listTemplates,
  filterTemplates,
} from "../core/template-registry.js";
import { renderTemplate } from "../core/template-engine.js";
import type { Template, FsDeps } from "../types.js";
import { defaultFsDeps } from "../utils/fs.js";
import * as logger from "../utils/logger.js";

export interface BrowseOptions {
  category?: string;
  list?: boolean;
}

export async function browseCommand(
  options: BrowseOptions = {},
  deps: FsDeps = defaultFsDeps,
): Promise<void> {
  const allTemplates = await listTemplates();

  if (options.list) {
    printTemplateList(allTemplates, options.category);
    return;
  }

  // Category selection
  let category = options.category;
  if (!category) {
    const categories = [
      ...new Set(allTemplates.map((t) => t.frontmatter.category)),
    ];
    category = await select({
      message: "Choose a category:",
      choices: [
        { name: "All", value: "" },
        ...categories.map((c) => ({ name: c, value: c })),
      ],
    });
  }

  // Filter templates
  const filtered = category
    ? await filterTemplates({ category })
    : allTemplates;

  if (filtered.length === 0) {
    logger.warn("No templates found for this category.");
    return;
  }

  // Template selection
  const templateName = await select({
    message: "Choose a template to preview:",
    choices: filtered.map((t) => ({
      name: `${t.frontmatter.displayName} — ${t.frontmatter.description}`,
      value: t.frontmatter.name,
    })),
  });

  const template = filtered.find(
    (t) => t.frontmatter.name === templateName,
  )!;

  // Preview with defaults
  const defaults: Record<string, string> = {};
  for (const v of template.frontmatter.variables) {
    if (v.default) defaults[v.name] = v.default;
  }

  console.log();
  console.log(chalk.bold(`Preview: ${template.frontmatter.displayName}`));
  console.log(chalk.dim("─".repeat(60)));
  console.log(renderTemplate(template, defaults));
  console.log(chalk.dim("─".repeat(60)));
  console.log();

  // Offer to use
  const useIt = await confirm({
    message: "Use this template?",
    default: true,
  });

  if (useIt) {
    // Dynamically import to avoid circular deps
    const { initCommand } = await import("./init.js");
    await initCommand({ stack: template.frontmatter.name }, deps);
  }
}

function printTemplateList(
  templates: Template[],
  categoryFilter?: string,
): void {
  const filtered = categoryFilter
    ? templates.filter((t) => t.frontmatter.category === categoryFilter)
    : templates;

  console.log();
  console.log(chalk.bold("Available Templates"));
  console.log();

  // Group by category
  const byCategory = new Map<string, Template[]>();
  for (const t of filtered) {
    const cat = t.frontmatter.category;
    if (!byCategory.has(cat)) byCategory.set(cat, []);
    byCategory.get(cat)!.push(t);
  }

  for (const [category, templates] of byCategory) {
    console.log(chalk.bold.underline(category));
    for (const t of templates) {
      console.log(
        `  ${chalk.cyan(t.frontmatter.name.padEnd(30))} ${t.frontmatter.description}`,
      );
    }
    console.log();
  }

  console.log(chalk.dim(`${filtered.length} template(s) available`));
}
