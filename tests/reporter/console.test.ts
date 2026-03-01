/**
 * Tests for src/reporter/console.ts — TEST-1 (reporter coverage)
 * Tests CQ-7 (magic number constants) behavior
 */
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { loadTranslations } from "../../src/i18n/index.js";
import {
  printError,
  printInfo,
  printProgress,
  printReport,
  printSuccess,
} from "../../src/reporter/console.js";
import type { RGAAIssue } from "../../src/types.js";
import { createMockReport } from "../helpers/mock-report.js";

beforeAll(async () => {
  await loadTranslations("en-US");
});

afterEach(() => {
  vi.restoreAllMocks();
});

function captureConsole(): { lines: string[]; restore: () => void } {
  const lines: string[] = [];
  const origLog = console.log;
  const origError = console.error;
  console.log = (...args: unknown[]) => lines.push(args.join(" "));
  console.error = (...args: unknown[]) => lines.push(args.join(" "));
  return {
    lines,
    restore: () => {
      console.log = origLog;
      console.error = origError;
    },
  };
}

describe("printReport()", () => {
  it("prints without throwing", () => {
    const { restore } = captureConsole();
    try {
      expect(() => printReport(createMockReport())).not.toThrow();
    } finally {
      restore();
    }
  });

  it("outputs the RGAA title", () => {
    const { lines, restore } = captureConsole();
    try {
      printReport(createMockReport());
      const output = lines.join("\n");
      expect(output).toContain("RGAA");
    } finally {
      restore();
    }
  });

  it("shows compliance percentage", () => {
    const { lines, restore } = captureConsole();
    try {
      printReport(createMockReport());
      const output = lines.join("\n");
      // 25/30 ≈ 83%
      expect(output).toContain("83%");
    } finally {
      restore();
    }
  });

  it("shows project name when provided", () => {
    const { lines, restore } = captureConsole();
    try {
      printReport(createMockReport());
      const output = lines.join("\n");
      expect(output).toContain("test-project");
    } finally {
      restore();
    }
  });

  it("CQ-7: limits displayed errors to 10 and shows overflow count", () => {
    // Create 15 errors — only 10 should be shown with "and 5 more"
    const errors: RGAAIssue[] = Array.from({ length: 15 }, (_, i) => ({
      id: `err-${i}`,
      criterionId: "1.1",
      testId: "1.1.1",
      phase: "static" as const,
      severity: "error" as const,
      messageKey: "img.missing-alt",
      remediationKey: "img.missing-alt",
      wcag: "1.1.1",
    }));

    const { lines, restore } = captureConsole();
    try {
      printReport(createMockReport({ issues: errors }));
      const output = lines.join("\n");
      expect(output).toContain("and 5 more errors");
    } finally {
      restore();
    }
  });

  it("CQ-7: limits displayed warnings to 5 and shows overflow count", () => {
    // Create 8 warnings — only 5 should be shown with "and 3 more"
    const warnings: RGAAIssue[] = Array.from({ length: 8 }, (_, i) => ({
      id: `warn-${i}`,
      criterionId: "1.1",
      testId: "1.1.1",
      phase: "static" as const,
      severity: "warning" as const,
      messageKey: "img.missing-alt",
      remediationKey: "img.missing-alt",
      wcag: "1.1.1",
    }));

    const { lines, restore } = captureConsole();
    try {
      printReport(createMockReport({ issues: warnings }));
      const output = lines.join("\n");
      expect(output).toContain("and 3 more warnings");
    } finally {
      restore();
    }
  });

  it("does not show overflow message when errors are within limit", () => {
    const errors: RGAAIssue[] = Array.from({ length: 5 }, (_, i) => ({
      id: `err-${i}`,
      criterionId: "1.1",
      testId: "1.1.1",
      phase: "static" as const,
      severity: "error" as const,
      messageKey: "img.missing-alt",
      remediationKey: "img.missing-alt",
      wcag: "1.1.1",
    }));

    const { lines, restore } = captureConsole();
    try {
      printReport(createMockReport({ issues: errors }));
      const output = lines.join("\n");
      expect(output).not.toContain("more errors");
    } finally {
      restore();
    }
  });

  it("shows pages section when pages are present", () => {
    const { lines, restore } = captureConsole();
    try {
      printReport(createMockReport());
      const output = lines.join("\n");
      // Mock report has a page at "/"
      expect(output).toContain("/");
    } finally {
      restore();
    }
  });
});

describe("printProgress()", () => {
  it("writes to stdout only in TTY mode", () => {
    const writeSpy = vi.spyOn(process.stdout, "write").mockReturnValue(true);

    // Simulate TTY environment
    const original = process.stdout.isTTY;
    Object.defineProperty(process.stdout, "isTTY", { value: true, configurable: true });
    printProgress("Analyzing files");
    expect(writeSpy).toHaveBeenCalled();

    // Restore and verify no write in non-TTY
    writeSpy.mockClear();
    Object.defineProperty(process.stdout, "isTTY", { value: false, configurable: true });
    printProgress("Analyzing files");
    expect(writeSpy).not.toHaveBeenCalled();

    // Restore original
    Object.defineProperty(process.stdout, "isTTY", { value: original, configurable: true });
  });
});

describe("printSuccess()", () => {
  it("clears the line before printing (\\x1b[2K\\r)", () => {
    const writeSpy = vi.spyOn(process.stdout, "write").mockReturnValue(true);
    printSuccess("Done");
    const written = writeSpy.mock.calls[0]?.[0] as string;
    expect(written).toContain("\x1b[2K\r");
  });
});

describe("printError()", () => {
  it("writes to stderr via console.error", () => {
    const { lines, restore } = captureConsole();
    try {
      printError("Something went wrong");
      expect(lines.join("")).toContain("Something went wrong");
    } finally {
      restore();
    }
  });
});

describe("printInfo()", () => {
  it("outputs an info message without throwing", () => {
    const { lines, restore } = captureConsole();
    try {
      expect(() => printInfo("Info message")).not.toThrow();
      expect(lines.join("")).toContain("Info message");
    } finally {
      restore();
    }
  });
});
