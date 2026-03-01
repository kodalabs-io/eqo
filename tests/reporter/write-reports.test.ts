/**
 * TEST-5: Tests for writeReports orchestration (src/reporter/index.ts).
 *
 * Verifies that writeReports:
 * - Calls all format writers
 * - Uses Promise.allSettled (partial failure does not abort others)
 * - Pre-loads translations before calling reporters
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import type { OutputConfig } from "../../src/types.js";
import { createMockReport } from "../helpers/mock-report.js";

// ── Mock individual reporters ───────────────────────────────────────────────

const mockWriteJson = vi.fn().mockResolvedValue(undefined);
const mockWriteHtml = vi.fn().mockResolvedValue(undefined);
const mockWriteSarif = vi.fn().mockResolvedValue(undefined);
const mockWriteMarkdown = vi.fn().mockResolvedValue(undefined);
const mockWriteJunit = vi.fn().mockResolvedValue(undefined);
const mockLoadTranslations = vi.fn().mockResolvedValue(undefined);

vi.mock("../../src/reporter/json.js", () => ({
  writeJsonReport: (...args: unknown[]) => mockWriteJson(...args),
}));
vi.mock("../../src/reporter/html.js", () => ({
  writeHtmlReport: (...args: unknown[]) => mockWriteHtml(...args),
}));
vi.mock("../../src/reporter/sarif.js", () => ({
  writeSarifReport: (...args: unknown[]) => mockWriteSarif(...args),
}));
vi.mock("../../src/reporter/markdown.js", () => ({
  writeMarkdownReport: (...args: unknown[]) => mockWriteMarkdown(...args),
}));
vi.mock("../../src/reporter/junit.js", () => ({
  writeJunitReport: (...args: unknown[]) => mockWriteJunit(...args),
}));
vi.mock("../../src/i18n/index.js", () => ({
  loadTranslations: (...args: unknown[]) => mockLoadTranslations(...args),
}));

const { writeReports } = await import("../../src/reporter/index.js");

afterEach(() => {
  vi.clearAllMocks();
});

describe("writeReports()", () => {
  it("calls the correct writer for each configured format", async () => {
    const report = createMockReport();
    const outputs: OutputConfig[] = [
      { format: "json", path: "./report.json" },
      { format: "html", path: "./report.html" },
      { format: "sarif", path: "./report.sarif" },
      { format: "markdown", path: "./report.md" },
      { format: "junit", path: "./report.xml" },
    ];

    const written = await writeReports(report, outputs);

    expect(mockWriteJson).toHaveBeenCalledOnce();
    expect(mockWriteJson).toHaveBeenCalledWith(report, outputs[0]);
    expect(mockWriteHtml).toHaveBeenCalledOnce();
    expect(mockWriteHtml).toHaveBeenCalledWith(report, outputs[1]);
    expect(mockWriteSarif).toHaveBeenCalledOnce();
    expect(mockWriteSarif).toHaveBeenCalledWith(report, outputs[2]);
    expect(mockWriteMarkdown).toHaveBeenCalledOnce();
    expect(mockWriteMarkdown).toHaveBeenCalledWith(report, outputs[3]);
    expect(mockWriteJunit).toHaveBeenCalledOnce();
    expect(mockWriteJunit).toHaveBeenCalledWith(report, outputs[4]);

    expect(written).toHaveLength(5);
    expect(written).toContain("./report.json");
    expect(written).toContain("./report.html");
  });

  it("continues writing other reports when one fails (Promise.allSettled)", async () => {
    const report = createMockReport();
    const outputs: OutputConfig[] = [
      { format: "json", path: "./report.json" },
      { format: "html", path: "./report.html" },
      { format: "sarif", path: "./report.sarif" },
    ];

    // HTML writer fails
    mockWriteHtml.mockRejectedValueOnce(new Error("ENOENT: disk full"));

    const written = await writeReports(report, outputs);

    // JSON and SARIF should still succeed
    expect(written).toHaveLength(2);
    expect(written).toContain("./report.json");
    expect(written).toContain("./report.sarif");
    expect(written).not.toContain("./report.html");
  });

  it("pre-loads translations before calling any reporter", async () => {
    const report = createMockReport();
    const outputs: OutputConfig[] = [{ format: "json", path: "./report.json" }];

    await writeReports(report, outputs);

    // loadTranslations should have been called with the report's locale
    expect(mockLoadTranslations).toHaveBeenCalledWith("en-US");

    // It should have been called before the writer
    const translationCallOrder = mockLoadTranslations.mock.invocationCallOrder[0];
    const jsonCallOrder = mockWriteJson.mock.invocationCallOrder[0];
    expect(translationCallOrder).toBeLessThan(jsonCallOrder!);
  });

  it("returns empty array when no outputs are configured", async () => {
    const report = createMockReport();
    const written = await writeReports(report, []);

    expect(written).toHaveLength(0);
    expect(mockWriteJson).not.toHaveBeenCalled();
  });

  it("returns empty array when all writers fail", async () => {
    const report = createMockReport();
    const outputs: OutputConfig[] = [
      { format: "json", path: "./report.json" },
      { format: "html", path: "./report.html" },
    ];

    mockWriteJson.mockRejectedValueOnce(new Error("write failed"));
    mockWriteHtml.mockRejectedValueOnce(new Error("write failed"));

    const written = await writeReports(report, outputs);

    expect(written).toHaveLength(0);
  });
});
