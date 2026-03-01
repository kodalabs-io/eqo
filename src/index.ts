/**
 * kodalabs-io/eqo — RGAA v4.1.2 accessibility compliance analyzer
 *
 * Programmatic API for use as a library in your own scripts or tools.
 *
 * @example
 * ```typescript
 * import { analyze, loadConfig } from "@kodalabs-io/eqo";
 *
 * const config = await loadConfig();
 * const report = await analyze(config);
 * console.log(`Compliance: ${Math.round(report.summary.complianceRate * 100)}%`);
 * ```
 */

// ── Public API ────────────────────────────────────────────────────────────────

export { analyze, buildReport } from "./analyzer/index.js";
export {
  AXE_TEST_ID_PREFIX,
  AXE_TO_RGAA,
  getAxeRulesForCriterion,
  getRGAACriteria,
} from "./analyzer/mapper/axe-to-rgaa.js";
export { runRuntimeAnalysis } from "./analyzer/runtime/engine.js";
export { runStaticAnalysis } from "./analyzer/static/engine.js";
export { ALL_STATIC_RULES } from "./analyzer/static/rules/index.js";

export {
  generateDefaultConfig,
  loadConfig,
  resolveConfigPath,
} from "./config/loader.js";
export type { ValidatedConfig } from "./config/schema.js";
export { KodaRGAAConfigSchema } from "./config/schema.js";
export {
  ALL_CRITERIA,
  CRITERIA_BY_ID,
  THEMES,
  TOTAL_CRITERIA,
} from "./criteria/rgaa-4.1.2.js";
export { AnalysisError, ConfigError, TimeoutError } from "./errors.js";

export {
  getSupportedLocales,
  getTranslations,
  interpolate,
  loadTranslations,
} from "./i18n/index.js";

export {
  printReport,
  writeHtmlReport,
  writeJsonReport,
  writeJunitReport,
  writeMarkdownReport,
  writeReports,
  writeSarifReport,
} from "./reporter/index.js";

// ── Type exports ──────────────────────────────────────────────────────────────

export type {
  AnalysisPhase,
  AutomationLevel,
  CriterionDefinition,
  CriterionResult,
  CriterionStatus,
  ExemptionConfig,
  IssueSeverity,
  KodaRGAAConfig,
  OutputConfig,
  OutputFormat,
  PageConfig,
  PageResult,
  ReportSummary,
  RGAAIssue,
  RGAAReport,
  RuleResult,
  RuntimeRule,
  RuntimeRuleContext,
  StaticConfig,
  StaticRule,
  StaticRuleContext,
  SupportedLocale,
  TestDefinition,
  ThemeDefinition,
  ThemeResult,
  ThresholdConfig,
  WCAGLevel,
} from "./types.js";

import type { KodaRGAAConfig } from "./types.js";

/**
 * Config helper for type-safe configuration files.
 *
 * @example
 * ```typescript
 * // rgaa.config.ts
 * import { defineConfig } from "@kodalabs-io/eqo";
 * export default defineConfig({ ... });
 * ```
 */
export function defineConfig(config: KodaRGAAConfig): KodaRGAAConfig {
  return config;
}
