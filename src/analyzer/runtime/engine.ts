import type { Browser, Page } from "playwright";
import type {
  ExemptionConfig,
  PageConfig,
  PageResult,
  RGAAIssue,
} from "../../types.js";
import { error as logError, warn } from "../../utils/log.js";
import { raceWithTimeout } from "../../utils/race-with-timeout.js";
import { issueId } from "../static/rules/helpers.js";
import { runAxe } from "./axe-runner.js";

async function getChromium(): Promise<typeof import("playwright").chromium> {
  try {
    const pw = await import("playwright");
    return pw.chromium;
  } catch (err) {
    if (
      err instanceof Error &&
      (err.message.includes("Cannot find module") ||
        err.message.includes("ERR_MODULE_NOT_FOUND") ||
        err.message.includes("Cannot find package"))
    ) {
      throw new Error(
        "[eqo] Runtime analysis requires playwright.\n" +
          "Install: npm install playwright @axe-core/playwright && npx playwright install chromium"
      );
    }
    throw err;
  }
}

const BROWSER_POOL_SIZE = 3;
const PAGE_TIMEOUT = 15_000;
const NETWORK_IDLE_TIMEOUT = 5_000;
const URL_PROTOCOL_RE = /^https?:\/\//;

/** Validate and normalize a page path, stripping query/fragment */
function normalizePagePath(p: string): string {
  const decoded = decodeURIComponent(p);
  if (decoded.includes("..") || decoded.includes("\\")) {
    throw new Error(`[eqo:runtime] Page path contains traversal: "${p}"`);
  }
  const normalized = p.startsWith("/") ? p : `/${p}`;
  return normalized.split(/[?#]/)[0] ?? normalized;
}

export interface RuntimeAnalysisResult {
  issues: RGAAIssue[];
  pages: PageResult[];
  durationMs: number;
}

/** Close a Playwright resource with a timeout to prevent indefinite hangs. */
async function closeWithTimeout(
  closeCall: Promise<void> | undefined,
  label: string,
  timeoutMs = 5_000
): Promise<void> {
  if (!closeCall) return;
  await raceWithTimeout(
    closeCall,
    timeoutMs,
    `${label} timed out after ${timeoutMs}ms`
  ).catch((err) => {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("timed out")) {
      warn("runtime", `${msg} (usually harmless)`);
    } else {
      logError("runtime", `Unexpected error during ${label}: ${msg}`);
    }
  });
}

async function analyzePage(
  browser: Browser,
  normalizedBase: string,
  pageConfig: PageConfig,
  exemptedCriteria: Set<string>,
  signal?: AbortSignal
): Promise<{ issues: RGAAIssue[]; page: PageResult }> {
  const pagePath = normalizePagePath(pageConfig.path);
  const url = `${normalizedBase}${pagePath}`;
  const context = await browser.newContext({
    // Force reduced motion to ensure animations don't interfere with checks
    reducedMotion: "reduce",
  });
  let page: Page | null = null;

  try {
    page = await context.newPage();
    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: PAGE_TIMEOUT,
    });

    // Check for cancellation after the potentially-long page load
    if (signal?.aborted) throw new Error("Aborted");

    // Wait for network to settle after initial load, with a shorter timeout
    await page
      .waitForLoadState("networkidle", { timeout: NETWORK_IDLE_TIMEOUT })
      .catch((err) => {
        // Only log non-timeout errors; timeout is expected for SSE / long-poll connections
        if (!(err instanceof Error && err.message.includes("Timeout"))) {
          warn(
            "runtime",
            `networkidle wait failed: ${
              err instanceof Error ? err.message : String(err)
            }`
          );
        }
      });

    const title = await page.title().catch(() => undefined);

    // Run axe-core analysis
    const axeIssues = await runAxe(page, pageConfig.path, exemptedCriteria);

    // Run custom runtime checks
    const customIssues = await runCustomChecks(page, pageConfig.path);

    const allIssues = [...axeIssues, ...customIssues];

    const pageResult: PageResult = {
      url,
      path: pageConfig.path,
      ...(title !== undefined ? { title } : {}),
      issueCount: allIssues.length,
    };

    return { issues: allIssues, page: pageResult };
  } finally {
    // Parallel cleanup — one hang doesn't block the other
    await Promise.all([
      closeWithTimeout(page?.close(), "page.close"),
      closeWithTimeout(context.close(), "context.close"),
    ]).catch(() => {});
  }
}

interface SelectorCheck {
  criterionId: string;
  testId: string;
  wcag: string;
  messageKey: string;
  remediationKey: string;
  selector: string;
}

const SELECTOR_CHECKS: SelectorCheck[] = [
  {
    criterionId: "12.7",
    testId: "12.7.1",
    wcag: "2.4.1",
    messageKey: "a11y.missing-skip-link",
    remediationKey: "a11y.missing-skip-link",
    selector: 'a[href^="#"]:first-of-type',
  },
  {
    criterionId: "12.6",
    testId: "12.6.1",
    wcag: "1.3.1",
    messageKey: "a11y.missing-landmark",
    remediationKey: "a11y.missing-landmark",
    selector: 'main, [role="main"]',
  },
];

/**
 * Custom runtime checks that axe-core does not cover or that need
 * RGAA-specific validation. Each check is individually guarded so one
 * failure does not prevent the remaining checks from running.
 */
async function runCustomChecks(
  page: Page,
  pagePath: string
): Promise<RGAAIssue[]> {
  const issues: RGAAIssue[] = [];

  // ── Selector-based checks (declarative) ───────────────────────────────────
  for (const check of SELECTOR_CHECKS) {
    try {
      const el = await page.$(check.selector);
      if (!el) {
        issues.push({
          id: issueId(),
          criterionId: check.criterionId,
          testId: check.testId,
          phase: "runtime",
          severity: "error",
          page: pagePath,
          messageKey: check.messageKey,
          remediationKey: check.remediationKey,
          wcag: check.wcag,
        });
      }
    } catch (err) {
      warn(
        "runtime",
        `check ${check.criterionId} skipped for ${pagePath}: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
    }
  }

  // ── Criterion 8.2: Duplicate id attributes ────────────────────────────────
  try {
    const duplicateIds = await raceWithTimeout(
      page.evaluate((): string[] => {
        // biome-ignore lint/suspicious/noExplicitAny: runs in browser context via page.evaluate(); document is only available at runtime
        const doc = (globalThis as any).document as {
          querySelectorAll(s: string): ArrayLike<{ id: string }>;
        };
        const ids = Array.from(doc.querySelectorAll("[id]")).map((el) => el.id);
        const seen = new Set<string>();
        const duplicates = new Set<string>();
        for (const id of ids) {
          if (seen.has(id)) duplicates.add(id);
          seen.add(id);
        }
        return Array.from(duplicates);
      }),
      10_000,
      "page.evaluate timed out after 10s"
    );
    for (const dupId of duplicateIds) {
      issues.push({
        id: issueId(),
        criterionId: "8.2",
        testId: "8.2.1",
        phase: "runtime",
        severity: "error",
        page: pagePath,
        messageKey: "html.duplicate-id",
        remediationKey: "html.duplicate-id",
        messageContext: { id: dupId },
        wcag: "4.1.1",
      });
    }
  } catch (err) {
    warn(
      "runtime",
      `check 8.2 skipped for ${pagePath}: ${
        err instanceof Error ? err.message : String(err)
      }`
    );
  }

  return issues;
}

/**
 * Analyze all configured pages using a pool of browser instances.
 */
export async function runRuntimeAnalysis(
  baseUrl: string,
  pages: PageConfig[],
  exemptions: ExemptionConfig[] = [],
  signal?: AbortSignal
): Promise<RuntimeAnalysisResult> {
  const start = performance.now();

  // Validate baseUrl protocol
  if (!URL_PROTOCOL_RE.test(baseUrl)) {
    throw new Error(
      `[eqo:runtime] baseUrl must start with http:// or https://, got: "${baseUrl.slice(
        0,
        50
      )}"`
    );
  }

  // Validate and normalize page paths
  for (const page of pages) {
    if (page.path.includes("://") || page.path.startsWith("//")) {
      throw new Error(
        `[eqo:runtime] Page path must be relative, got: "${page.path}"`
      );
    }
    normalizePagePath(page.path); // throws on traversal attempts
  }

  const normalizedBase = baseUrl.replace(/\/$/, "");
  const exemptedCriteria = new Set(exemptions.map((e) => e.criterion));

  const chromium = await getChromium();
  let browser = await chromium.launch({ headless: true });

  try {
    // Analyze pages in batches of BROWSER_POOL_SIZE to limit memory usage
    const allIssues: RGAAIssue[] = [];
    const allPageResults: PageResult[] = [];

    for (let i = 0; i < pages.length; i += BROWSER_POOL_SIZE) {
      if (signal?.aborted) break;

      // Re-launch browser if it crashed (ERR-1: single-point-of-failure recovery)
      if (!browser.isConnected()) {
        warn("runtime", "Browser disconnected, re-launching...");
        browser = await chromium.launch({ headless: true });
      }

      const batch = pages.slice(i, i + BROWSER_POOL_SIZE);

      const batchResults = await Promise.allSettled(
        batch.map((pageConfig) =>
          analyzePage(
            browser,
            normalizedBase,
            pageConfig,
            exemptedCriteria,
            signal
          )
        )
      );

      for (let j = 0; j < batchResults.length; j++) {
        const result = batchResults[j];
        const pageConfig = batch[j];
        if (!result || !pageConfig) continue;
        const pagePath = pageConfig.path.startsWith("/")
          ? pageConfig.path
          : `/${pageConfig.path}`;
        const url = `${normalizedBase}${pagePath}`;

        if (result.status === "fulfilled") {
          allIssues.push(...result.value.issues);
          allPageResults.push(result.value.page);
        } else {
          const message =
            result.reason instanceof Error
              ? result.reason.message
              : String(result.reason);
          warn("runtime", `could not analyze ${url} — ${message}`);
          allPageResults.push({
            url,
            path: pageConfig.path,
            issueCount: 0,
            error: message,
          });
        }
      }
    }

    return {
      issues: allIssues,
      pages: allPageResults,
      durationMs: performance.now() - start,
    };
  } finally {
    await closeWithTimeout(browser.close(), "browser.close");
  }
}
