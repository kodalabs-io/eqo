import path from "node:path";
import pc from "picocolors";
import { analyze } from "../../analyzer/index.js";
import { loadConfig } from "../../config/loader.js";
import { loadTranslations } from "../../i18n/index.js";
import {
  printError,
  printInfo,
  printProgress,
  printReport,
  printSuccess,
  writeReports,
} from "../../reporter/index.js";
import type { KodaRGAAConfig, RGAAReport, SupportedLocale } from "../../types.js";

export interface AnalyzeOptions {
  config?: string;
  staticOnly?: boolean;
  runtimeOnly?: boolean;
  threshold?: string;
  locale?: string;
  signal?: AbortSignal;
}

/**
 * Parse and validate a --threshold CLI flag value.
 *
 * @returns `undefined` if the value is undefined (flag not provided)
 * @returns `null` if the value is invalid (NaN or out of range)
 * @returns the parsed number if valid
 */
export function parseThreshold(value: string | undefined): number | null | undefined {
  if (value === undefined) return undefined;
  const num = Number(value);
  if (Number.isNaN(num) || num < 0 || num > 100) {
    return null;
  }
  return num;
}

/** Sanitize a string for use in GitHub Actions annotation parameters. */
function sanitizeAnnotation(str: string): string {
  return str
    .replace(/::/g, ": :")
    .replace(/[\r\n]/g, " ")
    .replace(/,/g, " ");
}

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: CLI entrypoint with config loading, analysis, reporting, and exit code logic
export async function runAnalyze(options: AnalyzeOptions): Promise<{ exitCode: number }> {
  if (options.staticOnly && options.runtimeOnly) {
    printError("Cannot use both --static-only and --runtime-only");
    return { exitCode: 1 };
  }

  const cwd = process.cwd();

  // ── Load config ───────────────────────────────────────────────────────────
  let config: KodaRGAAConfig | undefined;
  try {
    config = await loadConfig(cwd, options.config);
  } catch (err) {
    printError(err instanceof Error ? err.message : String(err));
    return { exitCode: 1 };
  }

  // CLI flags override config values
  const locale = (options.locale ?? config.locale ?? "en-US") as SupportedLocale;
  await loadTranslations(locale);

  const thresholdOverride = parseThreshold(options.threshold);

  if (thresholdOverride === null) {
    printError(`Invalid --threshold "${options.threshold}". Must be a number between 0 and 100.`);
  }

  if (thresholdOverride === null) return { exitCode: 1 };

  const complianceThreshold = thresholdOverride ?? config.thresholds?.complianceRate ?? 0;

  // If --threshold is explicitly passed via CLI, enforce threshold-based failure
  // regardless of failOn: "none" in config.
  const failOn =
    thresholdOverride !== undefined ? "threshold" : (config.thresholds?.failOn ?? "threshold");

  // ── Run analysis ─────────────────────────────────────────────────────────
  console.log("");
  console.log(pc.bold(pc.cyan("  eqo — RGAA v4.1.2 Accessibility Analyzer")));
  console.log(pc.dim(`  ${new Date().toISOString()}`));
  console.log("");

  if (!options.runtimeOnly) {
    printProgress("Static analysis (source files)");
  }

  let report: RGAAReport | undefined;
  try {
    report = await analyze(config, {
      staticOnly: options.staticOnly,
      runtimeOnly: options.runtimeOnly,
      projectRoot: cwd,
      signal: options.signal,
    });
  } catch (err) {
    printError(`Analysis failed: ${err instanceof Error ? err.message : String(err)}`);
    return { exitCode: 1 };
  }

  // Exit cleanly if the run was aborted (e.g. Ctrl+C)
  if (options.signal?.aborted) {
    return { exitCode: 130 };
  }

  printSuccess("Analysis complete");

  // ── Write reports ─────────────────────────────────────────────────────────
  const writtenPaths = await writeReports(report, config.output);
  if (writtenPaths.length === 0 && config.output.length > 0) {
    printError("All report writes failed. Check file permissions and disk space.");
  }
  for (const p of writtenPaths) {
    printInfo(`Report written to ${pc.underline(path.relative(cwd, p))}`);
  }

  // ── Print to console ──────────────────────────────────────────────────────
  printReport(report);

  // ── GitHub Actions annotations ────────────────────────────────────────────
  if (process.env.GITHUB_ACTIONS === "true") {
    for (const issue of report.issues) {
      if (issue.severity !== "error" && issue.severity !== "warning") continue;
      const level = issue.severity === "error" ? "error" : "warning";
      const loc = issue.file
        ? `file=${sanitizeAnnotation(issue.file)},line=${issue.line ?? 1},col=${issue.column ?? 1}`
        : "file=unknown";
      const title = sanitizeAnnotation(`RGAA ${issue.criterionId}`);
      const msg = sanitizeAnnotation(issue.messageKey);
      console.log(`::${level} ${loc},title=${title}::${msg}`);
    }
  }

  // ── Exit code logic ───────────────────────────────────────────────────────
  const pct = Math.round(report.summary.complianceRate * 100);
  const hasErrors = report.issues.some((i) => i.severity === "error");

  let shouldFail = false;

  if (failOn === "none" || complianceThreshold === 0) {
    shouldFail = false;
  } else if (failOn === "error" && hasErrors) {
    shouldFail = true;
    printError(
      `Analysis produced ${report.issues.filter((i) => i.severity === "error").length} error(s).`,
    );
  } else if (failOn === "threshold" && complianceThreshold > 0 && pct < complianceThreshold) {
    shouldFail = true;
    printError(
      `Compliance rate ${pct}% is below the required threshold of ${complianceThreshold}%.`,
    );
  }

  return { exitCode: shouldFail ? 1 : 0 };
}
