import { CRITERIA_BY_ID, THEMES, TOTAL_CRITERIA } from "../criteria/rgaa-4.1.2.js";
import type {
  CriterionResult,
  KodaRGAAConfig,
  RGAAIssue,
  RGAAReport,
  TestResult,
  ThemeResult,
} from "../types.js";
import { warn } from "../utils/log.js";
import { AXE_TEST_ID_PREFIX } from "./mapper/axe-to-rgaa.js";
import { runRuntimeAnalysis } from "./runtime/engine.js";
import { runStaticAnalysis } from "./static/engine.js";

declare const __TOOL_VERSION__: string | undefined;
const TOOL_VERSION = (typeof __TOOL_VERSION__ !== "undefined" ? __TOOL_VERSION__ : null) ?? "0.1.0";

/**
 * Determine the status of a criterion based on its issues and automation level.
 */
function resolveCriterionStatus(
  criterionId: string,
  issuesByCriterion: Map<string, RGAAIssue[]>,
  exemptedCriteria: Set<string>,
): CriterionResult {
  const criterion = CRITERIA_BY_ID[criterionId];
  if (!criterion) {
    warn("core", `Unknown criterion ID: ${criterionId}`);
    return {
      id: criterionId,
      status: "not-applicable",
      issueCount: 0,
      testResults: [],
    };
  }

  if (exemptedCriteria.has(criterionId)) {
    return {
      id: criterionId,
      status: "not-applicable",
      issueCount: 0,
      testResults: [],
    };
  }

  // lookup via pre-built index
  const criterionIssues = issuesByCriterion.get(criterionId) ?? [];

  if (criterion.automationLevel === "manual") {
    const manualStatus: TestResult["status"] = "needs-review";
    return {
      id: criterionId,
      status: "needs-review",
      issueCount: 0,
      testResults: criterion.tests.map((t) => ({
        id: t.id,
        status: manualStatus,
      })),
    };
  }

  const hasErrors = criterionIssues.some((i) => i.severity === "error");
  const status: CriterionResult["status"] = hasErrors ? "invalidated" : "validated";

  // Single-pass classification: split issues into axe (criterion-level) and per-test buckets
  const axeIssues: RGAAIssue[] = [];
  const issuesByTest = new Map<string, RGAAIssue[]>();
  for (const issue of criterionIssues) {
    if (issue.testId.startsWith(AXE_TEST_ID_PREFIX)) {
      axeIssues.push(issue);
    } else {
      const arr = issuesByTest.get(issue.testId);
      if (arr) arr.push(issue);
      else issuesByTest.set(issue.testId, [issue]);
    }
  }

  const hasAxeError = axeIssues.some((i) => i.severity === "error");

  const testResults: TestResult[] = criterion.tests.map((t) => {
    const reviewStatus: TestResult["status"] = "needs-review";
    if (!t.automated) return { id: t.id, status: reviewStatus };
    const testIssues = issuesByTest.get(t.id);
    // A test fails if it has direct issues, or if any axe issue exists for this criterion
    const hasFail = (testIssues?.some((i) => i.severity === "error") ?? false) || hasAxeError;
    const testStatus: TestResult["status"] = hasFail ? "fail" : "pass";
    return { id: t.id, status: testStatus };
  });

  return {
    id: criterionId,
    status,
    issueCount: criterionIssues.length,
    testResults,
  };
}

/**
 * Build a full RGAA report from collected issues.
 */
export function buildReport(
  issues: RGAAIssue[],
  pages: RGAAReport["pages"],
  config: KodaRGAAConfig,
): RGAAReport {
  const exemptedCriteria = new Set((config.exemptions ?? []).map((e) => e.criterion));

  // Pre-index issues by criterionId for O(1) lookups instead of O(n) per criterion
  const issuesByCriterion = new Map<string, RGAAIssue[]>();
  for (const issue of issues) {
    const arr = issuesByCriterion.get(issue.criterionId);
    if (arr) arr.push(issue);
    else issuesByCriterion.set(issue.criterionId, [issue]);
  }

  const themeResults: ThemeResult[] = THEMES.map((theme) => {
    const criteriaResults = theme.criteria.map((c) =>
      resolveCriterionStatus(c.id, issuesByCriterion, exemptedCriteria),
    );

    const applicableCriteria = criteriaResults.filter(
      (c) => c.status !== "not-applicable" && c.status !== "needs-review",
    );
    const validatedCount = applicableCriteria.filter((c) => c.status === "validated").length;

    // Default to 0 when nothing was measurable (not 1/100%) to avoid false positives
    const complianceRate =
      applicableCriteria.length > 0
        ? Math.max(0, Math.min(1, validatedCount / applicableCriteria.length))
        : 0;

    return { id: theme.id, complianceRate, criteriaResults };
  });

  // Summary calculation
  let applicable = 0;
  let validated = 0;
  let invalidated = 0;
  let notApplicable = 0;
  let needsReview = 0;

  for (const theme of themeResults) {
    for (const criterion of theme.criteriaResults) {
      switch (criterion.status) {
        case "validated":
          applicable++;
          validated++;
          break;
        case "invalidated":
          applicable++;
          invalidated++;
          break;
        case "not-applicable":
          notApplicable++;
          break;
        case "needs-review":
          needsReview++;
          break;
      }
    }
  }

  // Default to 0 when nothing was measurable to avoid misleading 100% compliance
  const complianceRate = applicable > 0 ? Math.max(0, Math.min(1, validated / applicable)) : 0;

  return {
    meta: {
      rgaaVersion: "4.1.2",
      toolVersion: TOOL_VERSION,
      generatedAt: new Date().toISOString(),
      ...(config.projectName !== undefined ? { projectName: config.projectName } : {}),
      analyzedPages: config.pages.map((p) => p.path),
      locale: config.locale ?? "en-US",
    },
    summary: {
      totalCriteria: TOTAL_CRITERIA,
      applicable,
      validated,
      invalidated,
      notApplicable,
      needsReview,
      complianceRate,
    },
    themes: themeResults,
    pages,
    issues,
  };
}

export interface AnalysisOptions {
  /** Skip the runtime (Playwright) analysis phase */
  staticOnly?: boolean | undefined;
  /** Skip the static (AST) analysis phase */
  runtimeOnly?: boolean | undefined;
  /** Project root directory */
  projectRoot?: string | undefined;
  /** AbortSignal to cancel in-progress runtime analysis (e.g. on SIGINT) */
  signal?: AbortSignal | undefined;
}

/**
 * Run the full RGAA analysis and return a report.
 */
export async function analyze(
  config: KodaRGAAConfig,
  options: AnalysisOptions = {},
): Promise<RGAAReport> {
  const projectRoot = options.projectRoot ?? process.cwd();
  const issueArrays: RGAAIssue[][] = [];
  let pageResults: RGAAReport["pages"] = [];

  // ── Phase 1: Static analysis ──────────────────────────────────────────────
  if (!options.runtimeOnly) {
    const staticResult = await runStaticAnalysis(projectRoot, config.static);
    issueArrays.push(staticResult.issues);
  }

  // ── Phase 2: Runtime analysis ─────────────────────────────────────────────
  if (!options.staticOnly) {
    try {
      const runtimeResult = await runRuntimeAnalysis(
        config.baseUrl,
        config.pages,
        config.exemptions,
        options.signal,
      );
      issueArrays.push(runtimeResult.issues);
      pageResults = runtimeResult.pages;
    } catch (err) {
      // Runtime failure is non-fatal: return static results with a warning
      warn(
        "core",
        `Runtime analysis failed: ${
          err instanceof Error ? err.message : String(err)
        }. Continuing with static-only results.`,
      );
    }
  }

  // Single concatenation instead of repeated push+spread
  const allIssues = ([] as RGAAIssue[]).concat(...issueArrays);
  return buildReport(allIssues, pageResults, config);
}
