import { Command } from "commander";
import { formatError } from "./utils/errors.js";
import * as logger from "./utils/logger.js";

const program = new Command();

program
  .name("dotclaudemd")
  .description(
    "CLAUDE.md Template Registry CLI — scaffold, lint, and health-check your CLAUDE.md files",
  )
  .version("0.1.1");

program
  .command("init")
  .description("Scaffold a CLAUDE.md from a template")
  .option("--stack <name>", "Use a specific template by name (skip detection)")
  .option("--global", "Write to ~/.claude/CLAUDE.md")
  .option("--no-interactive", "Use defaults without prompting")
  .option("--force", "Overwrite existing CLAUDE.md without prompting")
  .action(async (options) => {
    const { initCommand } = await import("./commands/init.js");
    await initCommand({
      stack: options.stack,
      global: options.global,
      noInteractive: !options.interactive,
      force: options.force,
    });
  });

program
  .command("lint [file]")
  .description("Lint a CLAUDE.md for anti-patterns")
  .option("--json", "Output results as JSON")
  .action(async (file, options) => {
    const { lintCommand } = await import("./commands/lint.js");
    await lintCommand(file, { json: options.json });
  });

program
  .command("doctor")
  .description("Check CLAUDE.md freshness against project state")
  .option("--json", "Output results as JSON")
  .action(async (options) => {
    const { doctorCommand } = await import("./commands/doctor.js");
    await doctorCommand({ json: options.json });
  });

program
  .command("browse")
  .description("Browse and preview available templates")
  .option("--category <cat>", "Filter by category")
  .option("--list", "Non-interactive list mode")
  .action(async (options) => {
    const { browseCommand } = await import("./commands/browse.js");
    await browseCommand({ category: options.category, list: options.list });
  });

program.parseAsync(process.argv).catch((err) => {
  logger.error(formatError(err));
  process.exitCode = 1;
});
