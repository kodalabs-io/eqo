/**
 * Tests for buildReport() — covers issue indexing and 0% default
 */
import { describe, expect, it } from "vitest";
import { buildReport } from "../../src/analyzer/index.js";
import { ALL_CRITERIA } from "../../src/criteria/rgaa-4.1.2.js";
import type { KodaRGAAConfig, RGAAIssue } from "../../src/types.js";

const baseConfig: KodaRGAAConfig = {
  baseUrl: "http://localhost:3000",
  pages: [{ path: "/" }],
  output: [{ format: "json", path: "./report.json" }],
};

describe("buildReport()", () => {
  it("returns a valid report structure with no issues", () => {
    const report = buildReport([], [], baseConfig);
    expect(report.meta.rgaaVersion).toBe("4.1.2");
    expect(report.summary.totalCriteria).toBe(106);
    expect(report.issues).toHaveLength(0);
    expect(report.themes).toHaveLength(13);
  });

  it("invalidates a criterion when an error issue is present", () => {
    const issues: RGAAIssue[] = [
      {
        id: "test-1",
        criterionId: "1.1",
        testId: "1.1.1",
        phase: "static",
        severity: "error",
        messageKey: "img.missing-alt",
        remediationKey: "img.missing-alt",
        wcag: "1.1.1",
      },
    ];
    const report = buildReport(issues, [], baseConfig);
    const theme1 = report.themes.find((t) => t.id === 1);
    const criterion11 = theme1?.criteriaResults.find((c) => c.id === "1.1");
    expect(criterion11?.status).toBe("invalidated");
    expect(criterion11?.issueCount).toBe(1);
  });

  it("validates a criterion when no error issues are present", () => {
    const report = buildReport([], [], baseConfig);
    const theme1 = report.themes.find((t) => t.id === 1);
    const criterion11 = theme1?.criteriaResults.find((c) => c.id === "1.1");
    // Criterion 1.1 has automationLevel "full" — no errors → validated
    expect(criterion11?.status).toBe("validated");
  });

  it("marks exempted criteria as not-applicable", () => {
    const config: KodaRGAAConfig = {
      ...baseConfig,
      exemptions: [{ criterion: "1.1", reason: "No images on this site." }],
    };
    const report = buildReport([], [], config);
    const theme1 = report.themes.find((t) => t.id === 1);
    const criterion11 = theme1?.criteriaResults.find((c) => c.id === "1.1");
    expect(criterion11?.status).toBe("not-applicable");
    expect(criterion11?.issueCount).toBe(0);
  });

  it("correctly counts multiple issues on the same criterion", () => {
    const issues: RGAAIssue[] = [
      {
        id: "a",
        criterionId: "1.1",
        testId: "1.1.1",
        phase: "static",
        severity: "error",
        messageKey: "k",
        remediationKey: "k",
        wcag: "1.1.1",
      },
      {
        id: "b",
        criterionId: "1.1",
        testId: "1.1.2",
        phase: "static",
        severity: "error",
        messageKey: "k",
        remediationKey: "k",
        wcag: "1.1.1",
      },
      {
        id: "c",
        criterionId: "1.1",
        testId: "1.1.3",
        phase: "static",
        severity: "warning",
        messageKey: "k",
        remediationKey: "k",
        wcag: "1.1.1",
      },
    ];
    const report = buildReport(issues, [], baseConfig);
    const c11 = report.themes
      .find((t) => t.id === 1)
      ?.criteriaResults.find((c) => c.id === "1.1");
    expect(c11?.issueCount).toBe(3);
    expect(c11?.status).toBe("invalidated");
  });

  it("ROB-6: complianceRate is 0 when all criteria are exempted", () => {
    // Exempt every criterion to force applicable = 0
    const exemptions = ALL_CRITERIA.map((c) => ({
      criterion: c.id,
      reason: "test",
    }));
    const config: KodaRGAAConfig = { ...baseConfig, exemptions };
    const report = buildReport([], [], config);
    // All criteria exempted → applicable = 0 → complianceRate must be 0, not 1
    expect(report.summary.applicable).toBe(0);
    expect(report.summary.complianceRate).toBe(0);
  });

  it("ROB-6: per-theme complianceRate is 0 when all theme criteria are exempted", () => {
    // Exempt all criteria in theme 1 (images)
    const theme1Criteria = ALL_CRITERIA.filter((c) => c.theme === 1);
    const exemptions = theme1Criteria.map((c) => ({
      criterion: c.id,
      reason: "test",
    }));
    const config: KodaRGAAConfig = { ...baseConfig, exemptions };
    const report = buildReport([], [], config);
    const theme1 = report.themes.find((t) => t.id === 1);
    // All theme 1 criteria exempted → complianceRate must be 0, not 1
    expect(theme1?.complianceRate).toBe(0);
  });

  it("summary compliance rate matches validated / applicable", () => {
    const issues: RGAAIssue[] = [
      {
        id: "1",
        criterionId: "1.1",
        testId: "1.1.1",
        phase: "static",
        severity: "error",
        messageKey: "k",
        remediationKey: "k",
        wcag: "1.1.1",
      },
    ];
    const report = buildReport(issues, [], baseConfig);
    const { applicable, validated, complianceRate } = report.summary;
    expect(applicable).toBeGreaterThan(0);
    expect(complianceRate).toBeCloseTo(validated / applicable, 10);
  });
});
