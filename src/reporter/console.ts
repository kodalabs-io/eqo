import pc from "picocolors";
import { getTranslations } from "../i18n/index.js";
import type { Translations } from "../i18n/types.js";
import type { RGAAIssue, RGAAReport } from "../types.js";
import { resolveIssueMessage } from "./issue-format.js";
import { getComplianceLevel } from "./thresholds.js";

const MAX_DISPLAYED_ERRORS = 10;
const MAX_DISPLAYED_WARNINGS = 5;
const COMPLIANCE_BAR_WIDTH = 30;

function complianceBar(rate: number, width = COMPLIANCE_BAR_WIDTH): string {
  const filled = Math.round(rate * width);
  const empty = width - filled;
  const level = getComplianceLevel(Math.round(rate * 100));
  const color = level === "green" ? pc.green : level === "yellow" ? pc.yellow : pc.red;
  return color("█".repeat(filled)) + pc.dim("░".repeat(empty));
}

function printThemeSummary(report: RGAAReport, t: Translations): void {
  console.log(pc.bold(`  ${t.report.themes}`));
  for (const theme of report.themes) {
    const themeName = t.themes[theme.id] ?? `Theme ${theme.id}`;
    const themePct = Math.round(theme.complianceRate * 100);
    const themeLevel = getComplianceLevel(themePct);
    const themeColor =
      themeLevel === "green" ? pc.green : themeLevel === "yellow" ? pc.yellow : pc.red;
    const invalidated = theme.criteriaResults.filter((c) => c.status === "invalidated").length;
    const badge = invalidated > 0 ? pc.red(` (${invalidated} failed)`) : "";
    console.log(
      `  ${pc.dim(`${theme.id}.`)} ${themeName.padEnd(35)} ${themeColor(`${themePct}%`)}${badge}`,
    );
  }
  console.log("");
}

function printIssues(report: RGAAReport, t: Translations): void {
  // Single pass to avoid scanning the array twice
  const errors: RGAAIssue[] = [];
  const warnings: RGAAIssue[] = [];
  for (const issue of report.issues) {
    if (issue.severity === "error") errors.push(issue);
    else if (issue.severity === "warning") warnings.push(issue);
  }

  if (errors.length > 0) {
    console.log(pc.bold(pc.red(`  ✗ ${errors.length} errors`)));
    for (const issue of errors.slice(0, MAX_DISPLAYED_ERRORS)) {
      const msg = resolveIssueMessage(issue, t);
      const loc = issue.file
        ? pc.dim(` ${issue.file}${issue.line ? `:${issue.line}` : ""}`)
        : issue.page
          ? pc.dim(` page: ${issue.page}`)
          : "";
      console.log(`  ${pc.red("●")} ${pc.bold(`[${issue.criterionId}]`)} ${msg}${loc}`);
    }
    if (errors.length > MAX_DISPLAYED_ERRORS) {
      console.log(pc.dim(`  … and ${errors.length - MAX_DISPLAYED_ERRORS} more errors`));
    }
    console.log("");
  }

  if (warnings.length > 0) {
    console.log(pc.bold(pc.yellow(`  ⚠ ${warnings.length} warnings`)));
    for (const issue of warnings.slice(0, MAX_DISPLAYED_WARNINGS)) {
      const msg = resolveIssueMessage(issue, t);
      const loc = issue.file ? pc.dim(` ${issue.file}${issue.line ? `:${issue.line}` : ""}`) : "";
      console.log(`  ${pc.yellow("●")} ${pc.bold(`[${issue.criterionId}]`)} ${msg}${loc}`);
    }
    if (warnings.length > MAX_DISPLAYED_WARNINGS) {
      console.log(pc.dim(`  … and ${warnings.length - MAX_DISPLAYED_WARNINGS} more warnings`));
    }
    console.log("");
  }
}

function printPages(report: RGAAReport, t: Translations): void {
  if (report.pages.length > 0) {
    console.log(pc.bold(`  ${t.report.pages}`));
    for (const page of report.pages) {
      const badge = page.error
        ? pc.yellow(` ⚠ skipped (${page.error.split("\n")[0]})`)
        : page.issueCount > 0
          ? pc.red(` ${page.issueCount} issues`)
          : pc.green(" ✓");
      console.log(`  ${pc.dim("→")} ${page.path}${badge}`);
    }
    console.log("");
  }
}

export function printReport(report: RGAAReport): void {
  const t = getTranslations(report.meta.locale);
  const pct = Math.round(report.summary.complianceRate * 100);
  const level = getComplianceLevel(pct);
  const rateColor = level === "green" ? pc.green : level === "yellow" ? pc.yellow : pc.red;

  console.log("");
  console.log(pc.bold(pc.cyan("  RGAA v4.1.2 — Accessibility Report")));
  if (report.meta.projectName) {
    console.log(pc.dim(`  ${report.meta.projectName}`));
  }
  console.log("");

  // Score bar
  console.log(
    `  ${complianceBar(report.summary.complianceRate)} ${rateColor(pc.bold(`${pct}%`))} ${pc.dim(t.report.complianceRate)}`,
  );
  console.log("");

  // Summary table
  const statsLine = [
    `${pc.green("✓")} ${report.summary.validated} ${pc.dim(t.report.validated)}`,
    `${pc.red("✗")} ${report.summary.invalidated} ${pc.dim(t.report.invalidated)}`,
    `${pc.dim("─")} ${report.summary.notApplicable} ${pc.dim(t.report.notApplicable)}`,
    `${pc.yellow("?")} ${report.summary.needsReview} ${pc.dim(t.report.needsReview)}`,
  ].join("   ");
  console.log(`  ${statsLine}`);
  console.log("");

  printThemeSummary(report, t);
  printIssues(report, t);
  printPages(report, t);

  console.log(pc.dim(`  ${t.report.automationDisclaimer}`));
  console.log("");
}

export function printProgress(message: string): void {
  if (process.stdout.isTTY) {
    process.stdout.write(`  ${pc.cyan("⠿")} ${message}…\r`);
  }
}

export function printSuccess(message: string): void {
  process.stdout.write("\x1b[2K\r");
  console.log(`  ${pc.green("✓")} ${message}`);
}

export function printError(message: string): void {
  console.error(`  ${pc.red("✗")} ${message}`);
}

export function printInfo(message: string): void {
  console.log(`  ${pc.blue("ℹ")} ${message}`);
}
