import chalk from "chalk";
import { runDoctorChecks, computeFreshness } from "../core/doctor-checks.js";
import { findClaudeMd, findProjectRoot } from "../utils/paths.js";
import { defaultFsDeps } from "../utils/fs.js";
import * as logger from "../utils/logger.js";
import { createSpinner } from "../utils/ui.js";
import type { FsDeps, DoctorResult } from "../types.js";

export interface DoctorOptions {
  json?: boolean;
}

export async function doctorCommand(
  options: DoctorOptions = {},
  deps: FsDeps = defaultFsDeps,
): Promise<DoctorResult[]> {
  const projectRoot = findProjectRoot();
  const claudeMdPath = findClaudeMd(projectRoot);

  if (!claudeMdPath) {
    logger.error(
      "No CLAUDE.md found. Run `dotclaudemd init` to create one.",
    );
    process.exitCode = 1;
    return [];
  }

  const content = await deps.readFile(claudeMdPath);

  const spinner = createSpinner("Running health checks...");
  spinner.start();
  const results = await runDoctorChecks(content, projectRoot, undefined, deps);
  spinner.stop();

  if (options.json) {
    console.log(JSON.stringify({ results, freshness: computeFreshness(results) }, null, 2));
    return results;
  }

  console.log();
  console.log(chalk.bold("CLAUDE.md Health Check"));
  console.log();

  for (const result of results) {
    const icon =
      result.status === "pass"
        ? chalk.green("✓")
        : result.status === "warn"
          ? chalk.yellow("⚠")
          : chalk.red("✗");

    console.log(`  ${icon} ${result.check}: ${result.message}`);
    if (result.details && result.details.length > 0) {
      for (const detail of result.details.slice(0, 5)) {
        console.log(chalk.dim(`      → ${detail}`));
      }
    }
  }

  const freshness = computeFreshness(results);
  console.log();
  const freshnessColor =
    freshness >= 80
      ? chalk.green
      : freshness >= 50
        ? chalk.yellow
        : chalk.red;
  console.log(
    `  Your CLAUDE.md is ${freshnessColor(`${freshness}% fresh`)}`,
  );
  console.log();

  return results;
}
