import { join, dirname } from "node:path";
import { mkdirSync } from "node:fs";
import { select, input, confirm } from "@inquirer/prompts";
import { renderTemplate } from "../core/template-engine.js";
import {
  listTemplates,
  suggestTemplates,
} from "../core/template-registry.js";
import { detectStack } from "../core/project-detector.js";
import type { Template, DetectedStack, FsDeps } from "../types.js";
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
  promptFn?: (template: Template, variables: Record<string, string>, detected?: DetectedStack | null, inferred?: Record<string, string>) => Promise<void>,
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

  // Infer variables from detected project state
  const inferred = await inferVariables(template, detected, projectRoot, deps);

  // Prompt for variables (skipping inferred ones)
  const variables: Record<string, string> = {};
  const doPrompt = promptFn ?? promptForVariables;

  if (template.frontmatter.variables.length > 0 && !options.noInteractive) {
    await doPrompt(template, variables, detected, inferred);
  } else {
    // Use inferred values first, then defaults
    for (const v of template.frontmatter.variables) {
      if (inferred[v.name]) variables[v.name] = inferred[v.name];
      else if (v.default) variables[v.name] = v.default;
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

/**
 * Infer variable values from detected project state.
 * Returns a map of variable name → inferred value.
 * Only returns values that match one of the variable's options (if options exist).
 */
export async function inferVariables(
  template: Template,
  detected: DetectedStack | null,
  projectRoot: string,
  deps: FsDeps = defaultFsDeps,
): Promise<Record<string, string>> {
  const inferred: Record<string, string> = {};
  if (!detected) return inferred;

  const allDeps = [...detected.dependencies, ...detected.devDependencies];

  for (const v of template.frontmatter.variables) {
    let value: string | undefined;

    switch (v.name) {
      // --- Styling ---
      case "styling":
        if (allDeps.includes("tailwindcss")) value = "Tailwind CSS";
        else if (allDeps.includes("styled-components")) value = "styled-components";
        else if (allDeps.includes("unocss") || allDeps.includes("@unocss/preset-wind")) value = "UnoCSS";
        break;

      // --- Source directory ---
      case "src_dir":
        if (await deps.fileExists(join(projectRoot, "src"))) value = "src";
        else value = "app";
        break;

      // --- State management ---
      case "state_management":
        if (allDeps.includes("zustand")) value = "Zustand";
        else if (allDeps.includes("@reduxjs/toolkit")) value = "Redux Toolkit";
        else if (allDeps.includes("jotai")) value = "Jotai";
        else if (allDeps.includes("pinia")) value = "Pinia";
        else if (allDeps.includes("react")) value = "React Context";
        break;

      // --- Database ---
      case "db":
      case "db_type":
      case "db_provider":
        if (allDeps.some((d) => ["pg", "psycopg2", "psycopg2-binary", "psycopg", "@prisma/client"].includes(d))) value = "PostgreSQL";
        else if (allDeps.some((d) => ["mysql2", "mysqlclient", "pymysql"].includes(d))) value = "MySQL";
        else if (allDeps.some((d) => ["better-sqlite3", "sqlite3"].includes(d))) value = "SQLite";
        break;

      // --- Auth ---
      case "auth_method":
        if (allDeps.includes("passport")) value = "Passport";
        else if (allDeps.includes("jsonwebtoken") || allDeps.includes("jose")) value = "JWT";
        break;

      case "auth_provider":
        if (allDeps.includes("next-auth")) value = "NextAuth.js";
        else if (allDeps.includes("@clerk/nextjs")) value = "Clerk";
        else if (allDeps.includes("@auth0/nextjs-auth0")) value = "Auth0";
        break;

      // --- Package manager ---
      case "package_manager":
        if (detected.packageManager) value = detected.packageManager;
        break;

      // --- Test framework ---
      case "test_framework":
        if (detected.testFramework) {
          // Capitalize first letter to match option format
          value = detected.testFramework.charAt(0).toUpperCase() + detected.testFramework.slice(1);
        }
        break;

      // --- CLI framework ---
      case "cli_framework":
        if (allDeps.includes("commander")) value = "Commander";
        else if (allDeps.includes("yargs")) value = "yargs";
        else if (allDeps.includes("clipanion")) value = "Clipanion";
        break;

      // --- Build tool (Java) ---
      case "build_tool":
        if (detected.packageManager === "maven") value = "Maven";
        else if (detected.packageManager === "gradle") value = "Gradle";
        break;

      // --- Monorepo tool ---
      case "monorepo_tool":
        if (detected.framework === "Turborepo") value = "Turborepo";
        else if (detected.framework === "Nx") value = "Nx";
        break;

      // --- Go router ---
      case "router":
        if (detected.framework === "Chi") value = "Chi";
        else if (detected.framework === "Gin") value = "Gin";
        else if (detected.framework === "Echo") value = "Echo";
        break;

      // --- SvelteKit adapter ---
      case "adapter":
        if (allDeps.includes("@sveltejs/adapter-node")) value = "node";
        else if (allDeps.includes("@sveltejs/adapter-static")) value = "static";
        else if (allDeps.includes("@sveltejs/adapter-vercel")) value = "vercel";
        else value = "auto";
        break;

      // --- Astro UI framework ---
      case "ui_framework":
        if (allDeps.includes("@astrojs/react")) value = "React";
        else if (allDeps.includes("@astrojs/vue")) value = "Vue";
        else if (allDeps.includes("@astrojs/svelte")) value = "Svelte";
        else value = "None";
        break;

      // --- Vue/Nuxt variant ---
      case "variant":
        if (allDeps.includes("nuxt")) value = "Nuxt 3";
        else value = "Vue 3 SPA";
        break;

      // --- Validation library ---
      case "validation":
        if (allDeps.includes("zod")) value = "Zod";
        else if (allDeps.includes("joi")) value = "Joi";
        else if (allDeps.includes("express-validator")) value = "express-validator";
        break;

      // --- Flask template engine ---
      case "template_engine":
        if (allDeps.includes("flask")) value = "Jinja2";
        break;

      // --- Rails API-only ---
      case "api_only": {
        try {
          const gemfile = await deps.readFile(join(projectRoot, "Gemfile"));
          if (gemfile.includes("api_only") || !gemfile.includes("sprockets")) value = "Yes";
          else value = "No";
        } catch {
          // ignore
        }
        break;
      }

      // --- Rust project type ---
      case "project_type": {
        try {
          const cargo = await deps.readFile(join(projectRoot, "Cargo.toml"));
          const hasLib = cargo.includes("[lib]");
          const hasBin = cargo.includes("[[bin]]") || cargo.includes("[package]");
          if (hasLib && hasBin) value = "Both";
          else if (hasLib) value = "Library";
          else value = "Binary";
        } catch {
          // ignore
        }
        break;
      }

      // --- Java version ---
      case "java_version": {
        try {
          if (await deps.fileExists(join(projectRoot, "pom.xml"))) {
            const pom = await deps.readFile(join(projectRoot, "pom.xml"));
            const match = pom.match(/<java\.version>(\d+)<\/java\.version>/);
            if (match) value = match[1];
          } else {
            const gradleFile = (await deps.fileExists(join(projectRoot, "build.gradle.kts")))
              ? "build.gradle.kts"
              : "build.gradle";
            const gradle = await deps.readFile(join(projectRoot, gradleFile));
            const match = gradle.match(/(?:sourceCompatibility|jvmTarget)\s*=\s*['"]?(\d+)/);
            if (match) value = match[1];
          }
        } catch {
          // ignore
        }
        break;
      }
    }

    // Only accept inferred value if it matches one of the variable's options
    if (value && v.options && v.options.length > 0) {
      const matched = v.options.find((o) => o.toLowerCase() === value!.toLowerCase());
      if (matched) inferred[v.name] = matched;
    } else if (value && !v.options) {
      inferred[v.name] = value;
    }
  }

  return inferred;
}

async function promptForVariables(
  template: Template,
  variables: Record<string, string>,
  detected?: DetectedStack | null,
  inferred?: Record<string, string>,
): Promise<void> {
  for (const v of template.frontmatter.variables) {
    // If we have an inferred value, use it and skip the prompt
    if (inferred && inferred[v.name]) {
      variables[v.name] = inferred[v.name];
      logger.dim(`  ${v.name}: ${inferred[v.name]} (auto-detected)`);
      continue;
    }

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
