import chalk from "chalk";
import { lint as runLint } from "../core/linter.js";
import { findClaudeMd, findProjectRoot } from "../utils/paths.js";
import { defaultFsDeps } from "../utils/fs.js";
import * as logger from "../utils/logger.js";
import type { LintReport, FsDeps } from "../types.js";

export interface LintOptions {
  json?: boolean;
}

export async function lintCommand(
  filePath?: string,
  options: LintOptions = {},
  deps: FsDeps = defaultFsDeps,
): Promise<LintReport> {
  const projectRoot = findProjectRoot();
  const target =
    filePath ?? findClaudeMd(projectRoot);

  if (!target) {
    logger.error(
      "No CLAUDE.md found. Run `dotclaudemd init` to create one.",
    );
    process.exitCode = 1;
    return {
      file: "",
      results: [],
      errorCount: 0,
      warnCount: 0,
      infoCount: 0,
    };
  }

  const content = await deps.readFile(target);
  const report = runLint(content, target, projectRoot);

  if (options.json) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    printReport(report);
  }

  if (report.errorCount > 0) {
    process.exitCode = 1;
  }

  return report;
}

function printReport(report: LintReport): void {
  console.log();
  console.log(chalk.bold(`Linting ${report.file}`));
  console.log();

  if (report.results.length === 0) {
    logger.success("No issues found!");
    return;
  }

  for (const result of report.results) {
    const icon =
      result.severity === "error"
        ? chalk.red("✗")
        : result.severity === "warn"
          ? chalk.yellow("⚠")
          : chalk.blue("ℹ");
    const severity =
      result.severity === "error"
        ? chalk.red(result.severity)
        : result.severity === "warn"
          ? chalk.yellow(result.severity)
          : chalk.blue(result.severity);

    console.log(`  ${icon} ${severity}  ${chalk.dim(result.rule)}  ${result.message}`);
  }

  console.log();
  const summary: string[] = [];
  if (report.errorCount > 0)
    summary.push(chalk.red(`${report.errorCount} error(s)`));
  if (report.warnCount > 0)
    summary.push(chalk.yellow(`${report.warnCount} warning(s)`));
  if (report.infoCount > 0)
    summary.push(chalk.blue(`${report.infoCount} info`));
  console.log(`  ${summary.join(", ")}`);
  console.log();
}
