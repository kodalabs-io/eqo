import type { RGAAReport } from "../../src/types.js";

export function createMockReport(overrides?: Partial<RGAAReport>): RGAAReport {
  return {
    meta: {
      rgaaVersion: "4.1.2",
      toolVersion: "0.1.0",
      generatedAt: "2026-01-01T00:00:00.000Z",
      projectName: "test-project",
      analyzedPages: ["/"],
      locale: "en-US",
    },
    summary: {
      totalCriteria: 106,
      applicable: 30,
      validated: 25,
      invalidated: 5,
      notApplicable: 70,
      needsReview: 6,
      complianceRate: 25 / 30,
    },
    themes: [],
    pages: [
      {
        url: "http://localhost:3000/",
        path: "/",
        title: "Home",
        issueCount: 3,
      },
    ],
    issues: [
      {
        id: "test-issue-1",
        criterionId: "1.1",
        testId: "1.1.1",
        phase: "static",
        severity: "error",
        element: '<img src="/hero.jpg">',
        file: "src/components/Hero.tsx",
        line: 10,
        column: 2,
        messageKey: "img.missing-alt",
        remediationKey: "img.missing-alt",
        wcag: "1.1.1",
      },
    ],
    ...overrides,
  };
}
