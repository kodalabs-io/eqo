import { Command } from "commander";
import { error } from "../utils/log.js";
import { runAnalyze } from "./commands/analyze.js";
import { runInit } from "./commands/init.js";

process.on("unhandledRejection", (err) => {
  error("core", `Fatal: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});

const abortController = new AbortController();

process.on("SIGINT", () => {
  console.log("\n[eqo] Interrupted. Cleaning up...");
  abortController.abort();
  // Force-exit after 3s if cleanup hangs; unref() so it doesn't keep the process alive
  setTimeout(() => process.exit(130), 3_000).unref();
});

declare const __TOOL_VERSION__: string | undefined;
const VERSION = (typeof __TOOL_VERSION__ !== "undefined" ? __TOOL_VERSION__ : null) ?? "0.1.0";

const program = new Command();

program
  .name("eqo")
  .description("RGAA v4.1.2 accessibility compliance analyzer for NextJS projects")
  .version(VERSION);

// ── analyze command ───────────────────────────────────────────────────────────
program
  .command("analyze")
  .alias("check")
  .description("Run a full RGAA v4.1.2 accessibility audit")
  .option("-c, --config <path>", "Path to the configuration file (default: rgaa.config.ts)")
  .option("--static-only", "Run static source analysis only (skip browser)")
  .option("--runtime-only", "Run browser analysis only (skip static)")
  .option(
    "-t, --threshold <number>",
    "Override minimum compliance rate (0–100). 0 disables CI blocking.",
  )
  .option("-l, --locale <locale>", "Override report locale (e.g., en-US, fr-FR)")
  .action(async (options) => {
    const result = await runAnalyze({
      config: options.config,
      staticOnly: options.staticOnly,
      runtimeOnly: options.runtimeOnly,
      threshold: options.threshold,
      locale: options.locale,
      signal: abortController.signal,
    });
    process.exit(result.exitCode);
  });

// ── init command ──────────────────────────────────────────────────────────────
program
  .command("init")
  .description("Create a default rgaa.config.ts in the current directory")
  .option("--base-url <url>", "Base URL of your app (default: http://localhost:3000)")
  .option("--project-name <name>", "Project name shown in reports")
  .option("-l, --locale <locale>", "Default report locale (default: en-US)")
  .option("-f, --force", "Overwrite existing configuration file")
  .action(async (options) => {
    await runInit({
      baseUrl: options.baseUrl,
      projectName: options.projectName,
      locale: options.locale,
      force: options.force,
    });
  });

program.parse(process.argv);
