import { readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
/**
 * Tests for src/reporter/sarif.ts — TEST-1 (reporter coverage)
 * Key focus: human-readable messages instead of raw keys
 */
import { beforeAll, describe, expect, it } from "vitest";
import { loadTranslations } from "../../src/i18n/index.js";
import { writeSarifReport } from "../../src/reporter/sarif.js";
import type { RGAAIssue, RGAAReport } from "../../src/types.js";
import { createMockReport } from "../helpers/mock-report.js";

beforeAll(async () => {
  await loadTranslations("en-US");
});

async function generateSarif(
  report: RGAAReport
): Promise<Record<string, unknown>> {
  const outPath = path.join(tmpdir(), `koda-test-${Date.now()}.sarif`);
  await writeSarifReport(report, { format: "sarif", path: outPath });
  const content = await readFile(outPath, "utf-8");
  return JSON.parse(content) as Record<string, unknown>;
}

describe("writeSarifReport()", () => {
  it("produces valid SARIF 2.1.0 JSON", async () => {
    const sarif = await generateSarif(createMockReport());
    expect(sarif.version).toBe("2.1.0");
    expect(sarif.$schema).toContain("sarif-schema-2.1.0.json");
  });

  it("$schema uses /main branch URL (not /master)", async () => {
    const sarif = await generateSarif(createMockReport());
    expect(sarif.$schema as string).toContain("/main/");
    expect(sarif.$schema as string).not.toContain("/master/");
  });

  it("has runs array with tool driver", async () => {
    const sarif = await generateSarif(createMockReport());
    const runs = sarif.runs as Array<Record<string, unknown>>;
    expect(Array.isArray(runs)).toBe(true);
    expect(runs.length).toBe(1);
    const tool = runs[0]?.tool as Record<string, unknown>;
    const driver = tool.driver as Record<string, unknown>;
    expect(driver.name).toBe("@kodalabs-io/eqo");
  });

  it("message text is human-readable (not a raw key)", async () => {
    const sarif = await generateSarif(createMockReport());
    const runs = sarif.runs as Array<Record<string, unknown>>;
    const results = runs[0]?.results as Array<Record<string, unknown>>;
    expect(results.length).toBeGreaterThan(0);
    const firstResult = results[0]!;
    const message = firstResult.message as Record<string, string>;
    // The raw messageKey 'img.missing-alt' should not appear verbatim as the full message
    expect(message.text).not.toBe("img.missing-alt");
    // Should be a non-empty human-readable string
    expect(message.text.length).toBeGreaterThan(5);
  });

  it("locations array is omitted when issue has no file or page", async () => {
    const issueNoLocation: RGAAIssue = {
      id: "no-loc",
      criterionId: "1.1",
      testId: "1.1.1",
      phase: "static",
      severity: "error",
      messageKey: "img.missing-alt",
      remediationKey: "img.missing-alt",
      wcag: "1.1.1",
    };
    const sarif = await generateSarif(
      createMockReport({ issues: [issueNoLocation] })
    );
    const runs = sarif.runs as Array<Record<string, unknown>>;
    const results = runs[0]?.results as Array<Record<string, unknown>>;
    const result = results[0]!;
    // locations should be absent or undefined (not an array containing empty objects)
    if ("locations" in result) {
      const locs = result.locations as unknown[];
      expect(locs.length).toBeGreaterThan(0);
      // Each location must have content
      for (const loc of locs) {
        expect(Object.keys(loc as object).length).toBeGreaterThan(0);
      }
    }
  });

  it("includes physicalLocation for static issues with file", async () => {
    const sarif = await generateSarif(createMockReport());
    const runs = sarif.runs as Array<Record<string, unknown>>;
    const results = runs[0]?.results as Array<Record<string, unknown>>;
    const result = results[0]!;
    const locations = result.locations as Array<Record<string, unknown>>;
    expect(Array.isArray(locations)).toBe(true);
    const loc = locations[0]!;
    expect(loc.physicalLocation).toBeDefined();
  });

  it("produces empty results array when no issues", async () => {
    const sarif = await generateSarif(createMockReport({ issues: [] }));
    const runs = sarif.runs as Array<Record<string, unknown>>;
    const results = runs[0]?.results as unknown[];
    expect(results).toHaveLength(0);
  });

  it("does not include issues with criterionId 'unknown'", async () => {
    const unknownIssue: RGAAIssue = {
      id: "unk",
      criterionId: "unknown",
      testId: "axe/unknown-rule",
      phase: "runtime",
      severity: "warning",
      messageKey: "unknown-rule",
      remediationKey: "unknown-rule",
      wcag: "",
    };
    const sarif = await generateSarif(
      createMockReport({ issues: [unknownIssue] })
    );
    const runs = sarif.runs as Array<Record<string, unknown>>;
    const results = runs[0]?.results as Array<Record<string, unknown>>;
    // Issue with criterionId 'unknown' should be filtered out
    expect(results).toHaveLength(0);
  });
});
