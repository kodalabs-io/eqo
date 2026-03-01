import { readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
/**
 * Tests for src/reporter/junit.ts — TEST-1 (reporter coverage)
 */
import { beforeAll, describe, expect, it } from "vitest";
import { loadTranslations } from "../../src/i18n/index.js";
import { writeJunitReport } from "../../src/reporter/junit.js";
import type { RGAAReport } from "../../src/types.js";
import { createMockReport } from "../helpers/mock-report.js";

beforeAll(async () => {
  await loadTranslations("en-US");
});

async function generateJunit(report: RGAAReport): Promise<string> {
  const outPath = path.join(tmpdir(), `koda-test-${Date.now()}.xml`);
  await writeJunitReport(report, { format: "junit", path: outPath });
  return readFile(outPath, "utf-8");
}

describe("writeJunitReport()", () => {
  it("generates valid XML with declaration", async () => {
    const xml = await generateJunit(createMockReport());
    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain("<testsuites");
    expect(xml).toContain("</testsuites>");
  });

  it("does not contain undefined or [object Object]", async () => {
    const xml = await generateJunit(createMockReport());
    expect(xml).not.toContain("undefined");
    expect(xml).not.toContain("[object Object]");
  });

  it("has name attribute set to RGAA version", async () => {
    const xml = await generateJunit(createMockReport());
    expect(xml).toContain('name="RGAA 4.1.2"');
  });

  it("contains testcase elements", async () => {
    const xml = await generateJunit(
      createMockReport({
        themes: [
          {
            id: 1,
            complianceRate: 0,
            criteriaResults: [{ id: "1.1", status: "validated", issueCount: 0, testResults: [] }],
          },
        ],
      }),
    );
    expect(xml).toContain("<testcase");
  });

  it("uses <failure> for invalidated criteria", async () => {
    const xml = await generateJunit(
      createMockReport({
        themes: [
          {
            id: 1,
            complianceRate: 0,
            criteriaResults: [{ id: "1.1", status: "invalidated", issueCount: 1, testResults: [] }],
          },
        ],
      }),
    );
    expect(xml).toContain("<failure");
  });

  it("uses <skipped> for needs-review criteria", async () => {
    const xml = await generateJunit(
      createMockReport({
        themes: [
          {
            id: 1,
            complianceRate: 0,
            criteriaResults: [
              { id: "1.1", status: "needs-review", issueCount: 0, testResults: [] },
            ],
          },
        ],
      }),
    );
    expect(xml).toContain("<skipped");
  });

  it("escapes XML special characters in messages", async () => {
    const xml = await generateJunit(
      createMockReport({
        themes: [
          {
            id: 1,
            complianceRate: 0,
            criteriaResults: [{ id: "1.1", status: "invalidated", issueCount: 1, testResults: [] }],
          },
        ],
        issues: [
          {
            id: "xml-test",
            criterionId: "1.1",
            testId: "1.1.1",
            phase: "static",
            severity: "error",
            file: "src/a&b<c>.tsx",
            messageKey: "img.missing-alt",
            remediationKey: "img.missing-alt",
            wcag: "1.1.1",
          },
        ],
      }),
    );
    // Raw & and < must be escaped in XML
    // (the file appears in the issue message string)
    expect(xml).not.toMatch(/in src\/a&b</);
    // Valid XML escaping: & → &amp; or similar
  });

  it("skips not-applicable criteria", async () => {
    const xml = await generateJunit(
      createMockReport({
        themes: [
          {
            id: 1,
            complianceRate: 0,
            criteriaResults: [
              { id: "1.1", status: "not-applicable", issueCount: 0, testResults: [] },
            ],
          },
        ],
      }),
    );
    // not-applicable criteria should not produce a testcase
    expect(xml).not.toContain('name="RGAA 1.1"');
  });
});
