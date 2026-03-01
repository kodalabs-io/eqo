import AxeBuilder from "@axe-core/playwright";
import type { Page } from "playwright";
import type { RGAAIssue } from "../../types.js";
import { raceWithTimeout } from "../../utils/race-with-timeout.js";
import { AXE_TEST_ID_PREFIX, getRGAACriteria } from "../mapper/axe-to-rgaa.js";
import { issueId } from "../static/rules/helpers.js";

export type ImpactLevel = "critical" | "serious" | "moderate" | "minor";

const IMPACT_TO_SEVERITY: Record<ImpactLevel, RGAAIssue["severity"]> = {
  critical: "error",
  serious: "error",
  moderate: "warning",
  minor: "notice",
};

/**
 * Run axe-core on a Playwright page and return RGAA-mapped issues.
 */
export async function runAxe(
  page: Page,
  pagePath: string,
  exemptedCriteria: Set<string> = new Set(),
): Promise<RGAAIssue[]> {
  const builder = new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"])
    // Exclude criteria that are fully handled by static analysis to avoid duplicates
    .disableRules([
      // Handled statically
      "image-alt",
      "area-alt",
      "input-image-alt",
      "frame-title",
      "label",
      "heading-order",
    ]);

  const results = await raceWithTimeout(builder.analyze(), 30_000, "axe-core timed out after 30s");
  const issues: RGAAIssue[] = [];

  for (const violation of results.violations) {
    const rgaaCriteria = getRGAACriteria(violation.id);

    // Skip if all mapped criteria are exempted
    if (rgaaCriteria.length > 0 && rgaaCriteria.every((c) => exemptedCriteria.has(c))) {
      continue;
    }

    const primaryCriterion = rgaaCriteria[0];
    // Skip violations with no RGAA mapping rather than creating "unknown" issues
    if (!primaryCriterion) continue;
    const severity = IMPACT_TO_SEVERITY[(violation.impact as ImpactLevel) ?? "minor"] ?? "warning";

    for (const node of violation.nodes) {
      issues.push({
        id: issueId(),
        criterionId: primaryCriterion,
        testId: `${AXE_TEST_ID_PREFIX}${violation.id}`,
        phase: "runtime",
        severity,
        element: node.html,
        page: pagePath,
        messageKey: violation.id,
        remediationKey: violation.id,
        messageContext: {
          axeRuleId: violation.id,
          description: violation.description,
          help: violation.help,
          helpUrl: violation.helpUrl,
        },
        ...(violation.tags.some((t) => t.startsWith("wcag"))
          ? {
              wcag: violation.tags.filter((t) => t.startsWith("wcag")).join(", "),
            }
          : {}),
      });
    }
  }

  return issues;
}
