/**
 * TEST-2: E2E CLI tests with fixture project.
 *
 * Tests the CLI analyze flow end-to-end by mocking the analysis engine
 * (which requires a built worker) but exercising config loading, threshold
 * logic, and exit code determination.
 */
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { buildReport } from "../../src/analyzer/index.js";
import type { KodaRGAAConfig, RGAAIssue } from "../../src/types.js";

const FIXTURE_DIR = path.resolve(
  import.meta.dirname ?? path.dirname(new URL(import.meta.url).pathname),
  "../fixtures/mini-project",
);

// Mock the analysis engines so we don't need a built worker or Playwright
// Note: vi.mock factories are hoisted — all data must be inline (no external refs)
vi.mock("../../src/analyzer/static/engine.js", () => ({
  runStaticAnalysis: vi.fn().mockResolvedValue({
    issues: [
      {
        id: "test-1",
        criterionId: "1.1",
        testId: "1.1.1",
        phase: "static",
        severity: "error",
        messageKey: "img.missing-alt",
        remediationKey: "img.missing-alt",
        file: "src/page.tsx",
        line: 5,
      },
    ],
    filesAnalyzed: 1,
    durationMs: 50,
  }),
}));

vi.mock("../../src/analyzer/runtime/engine.js", () => ({
  runRuntimeAnalysis: vi.fn().mockRejectedValue(new Error("playwright not installed")),
}));

// Mock writeReports to avoid writing files during tests
vi.mock("../../src/reporter/index.js", async (importOriginal) => {
  const original = (await importOriginal()) as Record<string, unknown>;
  return {
    ...original,
    writeReports: vi.fn().mockResolvedValue([]),
  };
});

const { runAnalyze } = await import("../../src/cli/commands/analyze.js");

beforeEach(() => {
  vi.spyOn(process, "cwd").mockReturnValue(FIXTURE_DIR);
});

afterEach(async () => {
  // Only clear call counts, not mock implementations (restoreAllMocks would
  // revert vi.mock factories and break subsequent tests).
  vi.clearAllMocks();
  // Re-apply the cwd spy (clearAllMocks removes it)
  vi.spyOn(process, "cwd").mockReturnValue(FIXTURE_DIR);
});

describe("runAnalyze — E2E with fixture project", () => {
  it("performs static-only analysis and returns exitCode 0", async () => {
    const result = await runAnalyze({
      config: "rgaa.config.json",
      staticOnly: true,
    });

    // threshold is 0 in fixture config, so never blocks
    expect(result.exitCode).toBe(0);
  });

  it("enforces threshold and fails when compliance is too low", async () => {
    const result = await runAnalyze({
      config: "rgaa.config.json",
      staticOnly: true,
      threshold: "100",
    });

    expect(result.exitCode).toBe(1);
  });

  it("passes when threshold is 0 regardless of issues", async () => {
    const result = await runAnalyze({
      config: "rgaa.config.json",
      staticOnly: true,
      threshold: "0",
    });

    expect(result.exitCode).toBe(0);
  });

  it("returns exitCode 1 for invalid config path", async () => {
    const result = await runAnalyze({
      config: "nonexistent.json",
      staticOnly: true,
    });

    expect(result.exitCode).toBe(1);
  });
});

describe("runAnalyze — GitHub Actions annotations (TEST-2)", () => {
  it("emits ::error annotations when GITHUB_ACTIONS=true and issues exist", async () => {
    process.env.GITHUB_ACTIONS = "true";
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    try {
      await runAnalyze({ config: "rgaa.config.json", staticOnly: true });
      const output = logSpy.mock.calls.map((c) => c[0] as string).join("\n");
      // The mock provides a severity=error issue for criterionId=1.1 at src/page.tsx:5
      expect(output).toMatch(/^::error /m);
      expect(output).toMatch(/file=src\/page\.tsx/m);
    } finally {
      process.env.GITHUB_ACTIONS = undefined;
      logSpy.mockRestore();
    }
  });

  it("does not emit annotations when GITHUB_ACTIONS is not set", async () => {
    process.env.GITHUB_ACTIONS = undefined;
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    try {
      await runAnalyze({ config: "rgaa.config.json", staticOnly: true });
      const output = logSpy.mock.calls.map((c) => c[0] as string).join("\n");
      expect(output).not.toMatch(/^::error /m);
    } finally {
      logSpy.mockRestore();
    }
  });

  it("annotation matches GitHub Actions ::level params::message format", async () => {
    process.env.GITHUB_ACTIONS = "true";
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    try {
      await runAnalyze({ config: "rgaa.config.json", staticOnly: true });
      const output = logSpy.mock.calls.map((c) => c[0] as string).join("\n");
      const annotationLines = output.split("\n").filter((l) => l.startsWith("::error "));
      for (const line of annotationLines) {
        // Must match: ::error file=...,line=...,col=...,title=...::message
        expect(line).toMatch(/^::error file=.+,line=\d+,col=\d+,title=.+::.+/);
      }
    } finally {
      process.env.GITHUB_ACTIONS = undefined;
      logSpy.mockRestore();
    }
  });
});

describe("buildReport — integration", () => {
  it("produces a valid report from issues", () => {
    const config: KodaRGAAConfig = {
      baseUrl: "http://localhost:3000",
      pages: [{ path: "/", name: "Home" }],
      output: [{ format: "json", path: "./report.json" }],
    };

    const issues: RGAAIssue[] = [
      {
        id: "i1",
        criterionId: "1.1",
        testId: "1.1.1",
        phase: "static",
        severity: "error",
        messageKey: "img.missing-alt",
        remediationKey: "img.missing-alt",
        file: "src/page.tsx",
        line: 5,
      },
    ];

    const report = buildReport(issues, [], config);

    expect(report.summary.totalCriteria).toBe(106);
    expect(report.summary.invalidated).toBeGreaterThan(0);
    expect(report.issues).toHaveLength(1);
    expect(report.themes.length).toBe(13);
  });
});
