export interface Translations {
  themes: Record<number, string>;
  criteria: Record<string, string>;
  tests: Record<string, string>;
  issues: Record<string, string>;
  remediation: Record<string, string>;
  automationLevel: Record<string, string>;
  criterionStatus: Record<string, string>;
  severity: Record<string, string>;
  report: {
    title: string;
    generated: string;
    project: string;
    pages: string;
    summary: string;
    totalCriteria: string;
    applicable: string;
    validated: string;
    invalidated: string;
    notApplicable: string;
    needsReview: string;
    complianceRate: string;
    themes: string;
    issues: string;
    noIssues: string;
    file: string;
    line: string;
    element: string;
    page: string;
    criterion: string;
    test: string;
    severity: string;
    remediation: string;
    automationDisclaimer: string;
  };
  cli: {
    analyzing: string;
    staticPhase: string;
    runtimePhase: string;
    reportWritten: string;
    done: string;
    failed: string;
    thresholdExceeded: string;
    noConfig: string;
    configCreated: string;
  };
}
