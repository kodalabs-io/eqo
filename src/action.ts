/**
 * GitHub Action entrypoint.
 * Reads inputs from environment variables set by the action runner.
 */
import { runAnalyze } from "./cli/commands/analyze.js";

const config = process.env.INPUT_CONFIG || undefined;
const threshold = process.env.INPUT_THRESHOLD ?? "0";
const locale = process.env.INPUT_LOCALE ?? "en-US";
const staticOnly = process.env.INPUT_STATIC_ONLY === "true";
const runtimeOnly = process.env.INPUT_RUNTIME_ONLY === "true";

try {
  const result = await runAnalyze({
    ...(config !== undefined ? { config } : {}),
    threshold,
    locale,
    staticOnly,
    runtimeOnly,
  });
  process.exitCode = result.exitCode;
} catch (err) {
  console.error(`::error::${err instanceof Error ? err.message : String(err)}`);
  process.exitCode = 1;
}
