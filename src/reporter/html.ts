import { getTranslations, interpolate } from "../i18n/index.js";
import type { OutputConfig, RGAAReport } from "../types.js";
import { escapeHtml } from "./escaping.js";
import {
  getRemediationLinkText,
  resolveIssueMessage,
  resolveRemediation,
} from "./issue-format.js";
import { getComplianceLevel } from "./thresholds.js";
import { writeOutputFile } from "./write-output.js";

function statusClass(status: string): string {
  switch (status) {
    case "validated":
      return "status-pass";
    case "invalidated":
      return "status-fail";
    case "not-applicable":
      return "status-na";
    default:
      return "status-review";
  }
}

function statusLabel(
  status: string,
  t: ReturnType<typeof getTranslations>
): string {
  return t.criterionStatus[status] ?? status;
}

function complianceColor(pctValue: number): string {
  const level = getComplianceLevel(pctValue);
  return level === "green"
    ? "#22c55e"
    : level === "yellow"
    ? "#f59e0b"
    : "#ef4444";
}

export async function writeHtmlReport(
  report: RGAAReport,
  outputConfig: OutputConfig
): Promise<void> {
  const t = getTranslations(report.meta.locale);
  const compliancePct = Math.round(report.summary.complianceRate * 100);
  const rateColor = complianceColor(compliancePct);

  const themeRows = report.themes
    .map((theme) => {
      const themePct = Math.round(theme.complianceRate * 100);
      const themeName = t.themes[theme.id] ?? `Theme ${theme.id}`;

      const criteriaRows = theme.criteriaResults.map((c) => {
        const title = escapeHtml(t.criteria[c.id] ?? c.id);
        const st = statusClass(c.status);
        const label = statusLabel(c.status, t);
        const issuesBadge =
          c.issueCount > 0
            ? `<span class="badge badge-error">${c.issueCount}</span>`
            : "";
        // criterion ID cell is a row header (scope="row") for correct AT table navigation
        return `<tr><th scope="row"><code>${c.id}</code></th><td>${title}</td><td><span class="${st}">${label}</span>${issuesBadge}</td></tr>`;
      });

      return `
      <details class="theme-block">
        <summary>
          <span class="theme-name">${theme.id}. ${escapeHtml(themeName)}</span>
          <span class="theme-rate" style="color:${complianceColor(
            themePct
          )}">${themePct}%</span>
        </summary>
        <table class="criteria-table">
          <thead><tr><th scope="col">ID</th><th scope="col">${escapeHtml(
            t.report.criterion
          )}</th><th scope="col">Status</th></tr></thead>
          <tbody>${criteriaRows.join("")}</tbody>
        </table>
      </details>`;
    })
    .join("");

  const MAX_HTML_ISSUES = 500;
  const displayedIssues = report.issues.slice(0, MAX_HTML_ISSUES);
  const truncatedNotice =
    report.issues.length > MAX_HTML_ISSUES
      ? `<p class="truncated" style="padding:1rem;text-align:center;color:#64748b;font-style:italic">${
          report.issues.length - MAX_HTML_ISSUES
        } more issues omitted. See JSON report for the full list.</p>`
      : "";
  const issuesSection =
    report.issues.length === 0
      ? `<p class="no-issues">✅ ${escapeHtml(t.report.noIssues)}</p>`
      : displayedIssues
          .map((issue) => {
            const msg = escapeHtml(resolveIssueMessage(issue, t));
            const { text: rawFix, isUrl } = resolveRemediation(issue, t);
            const linkText = getRemediationLinkText(rawFix);
            const fix = isUrl
              ? `<a href="${escapeHtml(
                  rawFix
                )}" target="_blank" rel="noopener noreferrer">${linkText} ↗</a>`
              : escapeHtml(interpolate(rawFix, issue.messageContext));
            const location = [
              issue.file &&
                `<code>${escapeHtml(issue.file)}${
                  issue.line ? `:${issue.line}` : ""
                }</code>`,
              issue.page && `Page: <code>${escapeHtml(issue.page)}</code>`,
            ]
              .filter(Boolean)
              .join(" ");
            const element = issue.element
              ? `<pre class="element-preview">${escapeHtml(
                  issue.element
                )}</pre>`
              : "";
            return `
          <div class="issue issue-${issue.severity}">
            <div class="issue-header">
              <span class="issue-criterion">RGAA ${escapeHtml(
                issue.criterionId
              )}</span>
              <span class="issue-severity severity-${
                issue.severity
              }">${escapeHtml(
              t.severity[issue.severity] ?? issue.severity
            )}</span>
              <span class="issue-phase">${escapeHtml(issue.phase)}</span>
            </div>
            <p class="issue-message">${msg}</p>
            ${element}
            <p class="issue-location">${location}</p>
            <p class="issue-fix">💡 ${fix}</p>
          </div>`;
          })
          .join("") + truncatedNotice;

  const html = `<!DOCTYPE html>
<html lang="${escapeHtml(report.meta.locale.split("-")[0] ?? "en")}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src data: https:">
  <title>${escapeHtml(t.report.title)}${
    report.meta.projectName ? ` — ${escapeHtml(report.meta.projectName)}` : ""
  }</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, -apple-system, sans-serif; background: #f8fafc; color: #1e293b; line-height: 1.6; }
    .container { max-width: 1100px; margin: 0 auto; padding: 2rem 1rem; }
    header { background: #1e293b; color: #f8fafc; padding: 2rem; border-radius: 12px; margin-bottom: 2rem; }
    header h1 { font-size: 1.5rem; margin-bottom: 0.5rem; }
    header .meta { font-size: 0.875rem; opacity: 0.8; }
    .score-card { background: #fff; border-radius: 12px; padding: 2rem; margin-bottom: 2rem; box-shadow: 0 1px 3px rgba(0,0,0,.1); display: grid; grid-template-columns: auto 1fr; gap: 2rem; align-items: center; }
    .score-ring { width: 120px; height: 120px; border-radius: 50%; background: conic-gradient(${rateColor} ${compliancePct}%, #e2e8f0 0); display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: 700; color: ${rateColor}; }
    .score-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 1rem; }
    .stat { text-align: center; }
    .stat .val { font-size: 1.5rem; font-weight: 700; }
    .stat .lbl { font-size: 0.75rem; color: #64748b; text-transform: uppercase; }
    .section-title { font-size: 1.25rem; font-weight: 600; margin: 2rem 0 1rem; }
    .theme-block { background: #fff; border-radius: 8px; margin-bottom: 0.5rem; box-shadow: 0 1px 2px rgba(0,0,0,.05); overflow: hidden; }
    .theme-block summary { cursor: pointer; padding: 1rem 1.25rem; display: flex; justify-content: space-between; align-items: center; user-select: none; }
    .theme-block summary:hover { background: #f1f5f9; }
    .theme-name { font-weight: 600; }
    .theme-rate { font-weight: 700; font-size: 1rem; }
    .criteria-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
    .criteria-table th { background: #f8fafc; padding: 0.5rem 1rem; text-align: left; font-weight: 600; border-bottom: 1px solid #e2e8f0; }
    .criteria-table td { padding: 0.5rem 1rem; border-bottom: 1px solid #f1f5f9; vertical-align: top; }
    :focus { outline: 3px solid #3b82f6; outline-offset: 2px; }
    :focus:not(:focus-visible) { outline: none; }
    :focus-visible { outline: 3px solid #3b82f6; outline-offset: 2px; }
    .skip-link { position: absolute; left: -9999px; top: 0; z-index: 999; padding: 0.5rem 1rem; background: #1e293b; color: #f8fafc; text-decoration: none; border-radius: 0 0 4px 0; }
    .skip-link:focus { left: 0; }
    .status-pass { color: #16a34a; font-weight: 500; }
    .status-pass::before { content: "✓ "; }
    .status-fail { color: #dc2626; font-weight: 500; }
    .status-fail::before { content: "✗ "; }
    .status-na { color: #94a3b8; }
    .status-na::before { content: "— "; }
    .status-review { color: #d97706; font-weight: 500; }
    .status-review::before { content: "? "; }
    .badge { display: inline-block; padding: 0.125rem 0.5rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 700; margin-left: 0.5rem; }
    .badge-error { background: #fee2e2; color: #dc2626; }
    .issue { background: #fff; border-radius: 8px; margin-bottom: 1rem; border-left: 4px solid #e2e8f0; box-shadow: 0 1px 2px rgba(0,0,0,.05); overflow: hidden; }
    .issue-error { border-left-color: #dc2626; }
    .issue-warning { border-left-color: #f59e0b; }
    .issue-notice { border-left-color: #3b82f6; }
    .issue-header { display: flex; gap: 0.75rem; align-items: center; padding: 0.75rem 1rem; background: #f8fafc; border-bottom: 1px solid #f1f5f9; }
    .issue-criterion { font-weight: 700; font-size: 0.875rem; }
    .issue-severity { font-size: 0.75rem; padding: 0.125rem 0.5rem; border-radius: 9999px; font-weight: 600; }
    .severity-error { background: #fee2e2; color: #dc2626; }
    .severity-warning { background: #fef3c7; color: #d97706; }
    .severity-notice { background: #dbeafe; color: #2563eb; }
    .issue-phase { font-size: 0.75rem; color: #94a3b8; margin-left: auto; }
    .issue-message { padding: 0.75rem 1rem; font-weight: 500; }
    .element-preview { padding: 0.5rem 1rem; background: #f1f5f9; font-size: 0.8rem; overflow-x: auto; }
    .issue-location { padding: 0.25rem 1rem; font-size: 0.8rem; color: #64748b; }
    .issue-fix { padding: 0.5rem 1rem 0.75rem; font-size: 0.875rem; color: #166534; background: #f0fdf4; }
    .no-issues { padding: 2rem; text-align: center; color: #16a34a; font-size: 1.125rem; background: #fff; border-radius: 8px; }
    .disclaimer { font-size: 0.8rem; color: #64748b; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem; margin-top: 2rem; }
    footer { text-align: center; padding: 2rem; color: #94a3b8; font-size: 0.8rem; }
    @media print {
      .skip-link { display: none; }
      body { background: #fff; color: #000; }
      .score-ring { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
      .issue { break-inside: avoid; }
      .theme-block { break-inside: avoid; }
      header { background: #1e293b; print-color-adjust: exact; -webkit-print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <a href="#main-content" class="skip-link">Skip to main content</a>
  <main class="container" id="main-content">
    <header>
      <h1>${escapeHtml(t.report.title)}</h1>
      <div class="meta">
        ${
          report.meta.projectName
            ? `<strong>${escapeHtml(report.meta.projectName)}</strong> — `
            : ""
        }
        ${escapeHtml(t.report.generated)}: ${new Date(
    report.meta.generatedAt
  ).toLocaleString()} —
        @kodalabs-io/eqo v${escapeHtml(report.meta.toolVersion)}
      </div>
    </header>

    <div class="score-card">
      <div class="score-ring" role="img" aria-label="Compliance: ${compliancePct}%">${compliancePct}%</div>
      <!-- <dl> pairs each value with its label for correct screen reader announcement -->
      <dl class="score-stats">
        <div class="stat"><dd class="val">${
          report.summary.totalCriteria
        }</dd><dt class="lbl">${escapeHtml(t.report.totalCriteria)}</dt></div>
        <div class="stat"><dd class="val" style="color:#16a34a">${
          report.summary.validated
        }</dd><dt class="lbl">${escapeHtml(t.report.validated)}</dt></div>
        <div class="stat"><dd class="val" style="color:#dc2626">${
          report.summary.invalidated
        }</dd><dt class="lbl">${escapeHtml(t.report.invalidated)}</dt></div>
        <div class="stat"><dd class="val" style="color:#94a3b8">${
          report.summary.notApplicable
        }</dd><dt class="lbl">${escapeHtml(t.report.notApplicable)}</dt></div>
        <div class="stat"><dd class="val" style="color:#d97706">${
          report.summary.needsReview
        }</dd><dt class="lbl">${escapeHtml(t.report.needsReview)}</dt></div>
      </dl>
    </div>

    <h2 class="section-title" id="themes">${escapeHtml(t.report.themes)}</h2>
    ${themeRows}

    <h2 class="section-title" id="issues">${escapeHtml(t.report.issues)} (${
    report.issues.length
  })</h2>
    ${issuesSection}

    <div class="disclaimer">${escapeHtml(t.report.automationDisclaimer)}</div>

    <footer>
      Generated by <a href="https://github.com/kodalabs-io/eqo">@kodalabs-io/eqo</a> v${escapeHtml(
        report.meta.toolVersion
      )}
    </footer>
  </main>
</body>
</html>`;

  await writeOutputFile(outputConfig.path, html);
}
