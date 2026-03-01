import { getTranslations } from "../i18n/index.js";
import type { OutputConfig, RGAAReport } from "../types.js";
import { escapeXml } from "./escaping.js";
import { resolveIssueMessage } from "./issue-format.js";
import { writeOutputFile } from "./write-output.js";

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: JUnit XML generation with per-criterion status handling
export async function writeJunitReport(
  report: RGAAReport,
  outputConfig: OutputConfig,
): Promise<void> {
  const t = getTranslations(report.meta.locale);
  const totalTests = report.summary.applicable;
  const failures = report.summary.invalidated;
  const errors = report.issues.filter((i) => i.severity === "error").length;
  const timestamp = report.meta.generatedAt;

  // Pre-index issues by criterionId to avoid O(n²) filtering per criterion
  const issuesByCriterion = new Map<string, typeof report.issues>();
  for (const issue of report.issues) {
    const arr = issuesByCriterion.get(issue.criterionId);
    if (arr) arr.push(issue);
    else issuesByCriterion.set(issue.criterionId, [issue]);
  }

  const testCases: string[] = [];

  for (const theme of report.themes) {
    for (const criterion of theme.criteriaResults) {
      const name = escapeXml(`RGAA ${criterion.id}`);
      const classname = escapeXml(`rgaa.theme${theme.id}`);

      if (criterion.status === "not-applicable") continue;

      if (criterion.status === "validated") {
        testCases.push(`    <testcase name="${name}" classname="${classname}" />`);
      } else if (criterion.status === "needs-review") {
        testCases.push(
          `    <testcase name="${name}" classname="${classname}">\n      <skipped message="Requires manual review" />\n    </testcase>`,
        );
      } else {
        const criterionIssues = issuesByCriterion.get(criterion.id) ?? [];
        const messageParts: string[] = [];
        for (const i of criterionIssues) {
          const msg = resolveIssueMessage(i, t);
          const loc = i.file ? ` in ${i.file}${i.line ? `:${i.line}` : ""}` : "";
          messageParts.push(escapeXml(`[${i.severity.toUpperCase()}] ${msg}${loc}`));
        }

        testCases.push(
          `    <testcase name="${name}" classname="${classname}">\n      <failure message="${escapeXml(criterion.id)} violations" type="AccessibilityViolation">\n        ${messageParts.join("\n")}\n      </failure>\n    </testcase>`,
        );
      }
    }
  }

  const xml = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<testsuites name="RGAA 4.1.2" tests="${totalTests}" failures="${failures}" errors="${errors}" timestamp="${timestamp}">`,
    `  <testsuite name="RGAA Accessibility" tests="${totalTests}" failures="${failures}" errors="${errors}" timestamp="${timestamp}">`,
    ...testCases,
    "  </testsuite>",
    "</testsuites>",
  ].join("\n");

  await writeOutputFile(outputConfig.path, xml);
}
