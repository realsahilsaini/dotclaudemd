import { join, dirname } from "node:path";
import { mkdirSync } from "node:fs";
import { select, input, confirm } from "@inquirer/prompts";
import { renderTemplate } from "../core/template-engine.js";
import {
  listTemplates,
  suggestTemplates,
} from "../core/template-registry.js";
import { detectStack } from "../core/project-detector.js";
import type { Template, FsDeps } from "../types.js";
import { defaultFsDeps } from "../utils/fs.js";
import { findProjectRoot, findClaudeMd } from "../utils/paths.js";
import * as logger from "../utils/logger.js";
import { createSpinner } from "../utils/ui.js";

export interface InitOptions {
  stack?: string;
  global?: boolean;
  noInteractive?: boolean;
  force?: boolean;
}

export async function initCommand(
  options: InitOptions = {},
  deps: FsDeps = defaultFsDeps,
  promptFn?: typeof promptForVariables,
): Promise<void> {
  const projectRoot = options.global
    ? join(process.env.HOME ?? "~", ".claude")
    : findProjectRoot();

  const outputPath = options.global
    ? join(process.env.HOME ?? "~", ".claude", "CLAUDE.md")
    : join(projectRoot, "CLAUDE.md");

  // Check for existing file
  const existing = findClaudeMd(projectRoot);
  if (existing && !options.force) {
    if (options.noInteractive) {
      logger.error(
        `CLAUDE.md already exists at ${existing}. Use --force to overwrite.`,
      );
      return;
    }
    const overwrite = await confirm({
      message: `CLAUDE.md already exists at ${existing}. Overwrite?`,
      default: false,
    });
    if (!overwrite) {
      logger.info("Cancelled.");
      return;
    }
  }

  // Detect stack
  const spinner = createSpinner("Detecting project stack...");
  spinner.start();
  const detected = options.stack
    ? null
    : await detectStack(projectRoot, deps);
  spinner.stop();

  if (detected) {
    logger.info(
      `Detected: ${detected.language}${detected.framework ? ` / ${detected.framework}` : ""}${detected.packageManager ? ` (${detected.packageManager})` : ""}`,
    );
  }

  // Find matching templates
  let template: Template;
  const allTemplates = await listTemplates();

  if (options.stack) {
    // Use specified stack name directly
    const match = allTemplates.find(
      (t) => t.frontmatter.name === options.stack,
    );
    if (!match) {
      logger.error(`No template found for stack: ${options.stack}`);
      logger.info(
        `Available: ${allTemplates.map((t) => t.frontmatter.name).join(", ")}`,
      );
      return;
    }
    template = match;
  } else if (detected) {
    const suggestions = await suggestTemplates(detected);
    if (suggestions.length >= 1 && (suggestions.length === 1 || options.noInteractive)) {
      template = suggestions[0];
    } else if (suggestions.length > 1 && detected.framework) {
      // Strong detection (language + framework) — auto-select top match
      template = suggestions[0];
    } else if (suggestions.length > 1) {
      template = await selectTemplate(suggestions);
    } else {
      template = await selectTemplate(allTemplates);
    }
  } else {
    if (options.noInteractive) {
      template = allTemplates.find((t) => t.frontmatter.name === "default") ?? allTemplates[0];
    } else {
      template = await selectTemplate(allTemplates);
    }
  }

  logger.info(`Using template: ${template.frontmatter.displayName}`);

  // Prompt for variables
  const variables: Record<string, string> = {};
  const doPrompt = promptFn ?? promptForVariables;

  if (template.frontmatter.variables.length > 0 && !options.noInteractive) {
    await doPrompt(template, variables, detected);
  } else {
    // Use defaults
    for (const v of template.frontmatter.variables) {
      if (v.default) variables[v.name] = v.default;
    }
  }

  // Render and write
  const rendered = renderTemplate(template, variables);

  // Ensure directory exists
  mkdirSync(dirname(outputPath), { recursive: true });
  await deps.writeFile(outputPath, rendered);

  logger.success(`Created ${outputPath}`);
  logger.info("Next steps:");
  logger.dim("  1. Review and customize your CLAUDE.md");
  logger.dim("  2. Run `dotclaudemd lint` to check for issues");
  logger.dim("  3. Run `dotclaudemd doctor` to verify accuracy");
}

async function selectTemplate(templates: Template[]): Promise<Template> {
  const answer = await select({
    message: "Choose a template:",
    choices: templates.map((t) => ({
      name: `${t.frontmatter.displayName} — ${t.frontmatter.description}`,
      value: t.frontmatter.name,
    })),
  });

  return templates.find((t) => t.frontmatter.name === answer)!;
}

async function promptForVariables(
  template: Template,
  variables: Record<string, string>,
  detected?: { packageManager?: string; testFramework?: string } | null,
): Promise<void> {
  for (const v of template.frontmatter.variables) {
    const defaultValue =
      v.default ??
      (v.name === "package_manager" && detected?.packageManager
        ? detected.packageManager
        : undefined) ??
      (v.name === "test_framework" && detected?.testFramework
        ? detected.testFramework
        : undefined);

    if (v.options && v.options.length > 0) {
      const answer = await select({
        message: v.prompt,
        choices: v.options.map((o) => ({ name: o, value: o })),
        default: defaultValue,
      });
      variables[v.name] = answer;
    } else {
      const answer = await input({
        message: v.prompt,
        default: defaultValue,
      });
      variables[v.name] = answer;
    }
  }
}
