import { getTranslations, interpolate } from "../i18n/index.js";
import type { OutputConfig, RGAAIssue, RGAAReport } from "../types.js";
import { getRemediationLinkText, resolveIssueMessage, resolveRemediation } from "./issue-format.js";
import { getComplianceLevel } from "./thresholds.js";
import { writeOutputFile } from "./write-output.js";

function badge(rate: number): string {
  const pct = Math.round(rate * 100);
  const level = getComplianceLevel(pct);
  const color = level === "green" ? "brightgreen" : level === "yellow" ? "yellow" : "red";
  return `![Compliance ${pct}%](https://img.shields.io/badge/RGAA%20v4.1.2-${pct}%25-${color})`;
}

function statusIcon(status: string): string {
  switch (status) {
    case "validated":
      return "✅ Validated";
    case "invalidated":
      return "❌ Failed";
    case "not-applicable":
      return "➖ N/A";
    case "needs-review":
      return "⚠️ Review";
    default:
      return "❓ Unknown";
  }
}

function severityIcon(severity: string): string {
  switch (severity) {
    case "error":
      return "🔴";
    case "warning":
      return "🟡";
    default:
      return "🔵";
  }
}

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: markdown report generation with grouped issues and remediation links
export async function writeMarkdownReport(
  report: RGAAReport,
  outputConfig: OutputConfig,
): Promise<void> {
  const t = getTranslations(report.meta.locale);
  const pct = Math.round(report.summary.complianceRate * 100);

  const lines: string[] = [
    `# ${t.report.title}`,
    "",
    badge(report.summary.complianceRate),
    "",
    `> ${t.report.automationDisclaimer}`,
    "",
    `**${t.report.generated}:** ${new Date(report.meta.generatedAt).toLocaleString()}`,
    report.meta.projectName ? `**${t.report.project}:** ${report.meta.projectName}` : "",
    `**${t.report.pages}:** ${report.meta.analyzedPages.join(", ")}`,
    "",
    `## ${t.report.summary}`,
    "",
    "| | |",
    "|---|---|",
    `| ${t.report.complianceRate} | **${pct}%** |`,
    `| ${t.report.totalCriteria} | ${report.summary.totalCriteria} |`,
    `| ${t.report.applicable} | ${report.summary.applicable} |`,
    `| ${t.report.validated} | ${report.summary.validated} |`,
    `| ${t.report.invalidated} | ${report.summary.invalidated} |`,
    `| ${t.report.notApplicable} | ${report.summary.notApplicable} |`,
    `| ${t.report.needsReview} | ${report.summary.needsReview} |`,
    "",
    `## ${t.report.themes}`,
    "",
  ];

  for (const theme of report.themes) {
    const themeName = t.themes[theme.id] ?? `Theme ${theme.id}`;
    const themePct = Math.round(theme.complianceRate * 100);

    lines.push(`### ${theme.id}. ${themeName} — ${themePct}%`);
    lines.push("");
    lines.push(`| ${t.report.criterion} | Status |`);
    lines.push("|---|---|");

    for (const criterion of theme.criteriaResults) {
      const title = t.criteria[criterion.id] ?? criterion.id;
      const icon = statusIcon(criterion.status);
      const status = t.criterionStatus[criterion.status] ?? criterion.status;
      lines.push(`| **${criterion.id}** ${title} | ${icon} ${status} |`);
    }

    lines.push("");
  }

  // Issues section
  if (report.issues.length > 0) {
    lines.push(`## ${t.report.issues}`);
    lines.push("");

    // Use compound key to avoid conflating file-based and page-based issues
    const grouped = new Map<string, RGAAIssue[]>();
    for (const issue of report.issues) {
      const key = issue.file ? `file:${issue.file}` : issue.page ? `page:${issue.page}` : "unknown";
      const existing = grouped.get(key);
      if (existing) {
        existing.push(issue);
      } else {
        grouped.set(key, [issue]);
      }
    }

    for (const [groupKey, locationIssues] of grouped) {
      // Strip the "file:" or "page:" prefix for display
      const location = groupKey.replace(/^(file|page):/, "");
      lines.push(`### \`${location}\``);
      lines.push("");

      for (const issue of locationIssues) {
        const msg = resolveIssueMessage(issue, t);
        const { text: rawFix, isUrl } = resolveRemediation(issue, t);
        const linkText = getRemediationLinkText(rawFix);
        const fix = isUrl
          ? `[${linkText} ↗](${encodeURI(rawFix)})`
          : interpolate(rawFix, issue.messageContext);
        const loc = issue.line ? ` (line ${issue.line})` : "";
        lines.push(`- ${severityIcon(issue.severity)} **[${issue.criterionId}]** ${msg}${loc}`);
        if (issue.element) {
          // Use 4-space indentation instead of fenced code blocks to prevent
          // injection via triple-backtick content in element attributes
          const indented = issue.element.replace(/^/gm, "    ");
          lines.push(indented);
        }
        lines.push(`  > 💡 ${fix}`);
        lines.push("");
      }
    }
  } else {
    lines.push(`## ${t.report.issues}`);
    lines.push("");
    lines.push(`✅ ${t.report.noIssues}`);
  }

  lines.push("---");
  lines.push(
    `*Generated by [@kodalabs-io/eqo](https://github.com/kodalabs-io/eqo) v${report.meta.toolVersion}*`,
  );

  await writeOutputFile(outputConfig.path, lines.filter((l) => l !== undefined).join("\n"));
}
