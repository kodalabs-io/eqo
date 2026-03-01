// ─── Enumerations ────────────────────────────────────────────────────────────

export type AutomationLevel = "full" | "partial" | "manual";
export type CriterionStatus =
  | "validated"
  | "invalidated"
  | "not-applicable"
  | "needs-review";
export type IssueSeverity = "error" | "warning" | "notice";
export type AnalysisPhase = "static" | "runtime";
export type WCAGLevel = "A" | "AA";
export type OutputFormat = "json" | "html" | "sarif" | "markdown" | "junit";
export type SupportedLocale = "en-US" | "fr-FR";

// ─── Criteria definitions (static catalog) ───────────────────────────────────

export interface TestDefinition {
  id: string;
  automated: boolean;
}

export interface CriterionDefinition {
  id: string;
  theme: number;
  level: WCAGLevel;
  wcag: string[];
  automationLevel: AutomationLevel;
  tests: TestDefinition[];
}

export interface ThemeDefinition {
  id: number;
  criteria: CriterionDefinition[];
}

// ─── Analysis results ─────────────────────────────────────────────────────────

export interface RGAAIssue {
  id: string;
  criterionId: string;
  testId: string;
  phase: AnalysisPhase;
  severity: IssueSeverity;
  /** Serialized HTML snippet of the offending element */
  element?: string;
  /** Source file path (relative to project root) */
  file?: string;
  line?: number;
  column?: number;
  /** Page path where the issue was found (runtime phase) */
  page?: string;
  /** i18n message key */
  messageKey: string;
  /** i18n remediation key */
  remediationKey: string;
  /** Additional context for message interpolation */
  messageContext?: Record<string, string>;
  wcag?: string;
}

export interface TestResult {
  id: string;
  status: "pass" | "fail" | "not-applicable" | "needs-review";
}

export interface CriterionResult {
  id: string;
  status: CriterionStatus;
  issueCount: number;
  testResults: TestResult[];
}

export interface ThemeResult {
  id: number;
  complianceRate: number;
  criteriaResults: CriterionResult[];
}

export interface PageResult {
  url: string;
  path: string;
  title?: string;
  issueCount: number;
  /** Set when the page could not be analyzed (e.g. 404, timeout, network error) */
  error?: string;
}

export interface ReportSummary {
  /** Total criteria in the RGAA (106) */
  totalCriteria: number;
  /** Criteria applicable on at least one page */
  applicable: number;
  /** Criteria validated on all pages */
  validated: number;
  /** Criteria invalidated on at least one page */
  invalidated: number;
  /** Criteria not applicable on any page */
  notApplicable: number;
  /** Criteria that could not be checked automatically */
  needsReview: number;
  /**
   * validated / applicable
   * Represents the fraction of auto-checkable criteria that passed.
   */
  complianceRate: number;
}

export interface RGAAReport {
  meta: {
    rgaaVersion: "4.1.2";
    toolVersion: string;
    generatedAt: string;
    projectName?: string;
    analyzedPages: string[];
    locale: SupportedLocale;
  };
  summary: ReportSummary;
  themes: ThemeResult[];
  pages: PageResult[];
  issues: RGAAIssue[];
}

// ─── Configuration ────────────────────────────────────────────────────────────

export interface PageConfig {
  path: string;
  name?: string;
}

export interface OutputConfig {
  format: OutputFormat;
  /** Output file path (relative to project root) */
  path: string;
  /** Minify output where applicable (JSON) */
  minify?: boolean;
}

export interface ThresholdConfig {
  /**
   * Minimum compliance rate (0–100).
   * Set to 0 to disable CI blocking — the report is still generated.
   */
  complianceRate?: number;
  /**
   * Exit with code 1 on any issue of this severity or above.
   * Defaults to "none" when complianceRate is 0.
   */
  failOn?: "error" | "threshold" | "none";
}

export interface StaticConfig {
  /** Glob patterns to include (default: src/**\/*.{tsx,jsx,ts,js}) */
  include?: string[];
  /** Glob patterns to exclude */
  exclude?: string[];
}

export interface ExemptionConfig {
  /** RGAA criterion ID, e.g. "4.1" */
  criterion: string;
  /** Human-readable justification (required for traceability) */
  reason: string;
}

export interface KodaRGAAConfig {
  /** Base URL of the NextJS app to analyze (runtime phase) */
  baseUrl: string;
  /** Pages to audit */
  pages: PageConfig[];
  /** One or more output formats */
  output: OutputConfig[];
  /** CI/CD blocking thresholds */
  thresholds?: ThresholdConfig;
  /** Criteria exempted from analysis */
  exemptions?: ExemptionConfig[];
  /** Report locale — defaults to "en-US" */
  locale?: SupportedLocale;
  /** Project name shown in reports */
  projectName?: string;
  /** Static analysis options */
  static?: StaticConfig;
}

// ─── Internal analyzer types ──────────────────────────────────────────────────

export interface StaticRuleContext {
  filePath: string;
  /** Pre-parsed AST — populated by the worker to avoid re-parsing per rule */
  ast?: import("@babel/types").File | null;
}

/** Result from a static rule check: issues found, or null if the rule could not run. */
export type RuleResult = RGAAIssue[] | null;

export interface StaticRule {
  /** RGAA criterion IDs this rule maps to */
  criteria: string[];
  id: string;
  check(context: StaticRuleContext): RuleResult;
}

export interface RuntimeRuleContext {
  page: import("playwright").Page;
  pageUrl: string;
  pagePath: string;
}

export interface RuntimeRule {
  criteria: string[];
  id: string;
  check(context: RuntimeRuleContext): Promise<RGAAIssue[]>;
}

// ─── Worker message types (piscina) ──────────────────────────────────────────

export interface WorkerInput {
  filePath: string;
  /** Optional — worker reads from disk when absent. Avoids serializing empty strings. */
  source?: string;
  projectRoot: string;
}

export interface WorkerOutput {
  filePath: string;
  issues: RGAAIssue[];
  durationMs: number;
  /** True when the file could not be parsed (syntax error, binary file, etc.) */
  parseError?: boolean;
  /** SHA-256 hash prefix of the source content, used for incremental cache */
  sourceHash?: string;
}
