import { readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
/**
 * Tests for src/reporter/html.ts — TEST-1 (reporter coverage)
 */
import { beforeAll, describe, expect, it } from "vitest";
import { loadTranslations } from "../../src/i18n/index.js";
import { writeHtmlReport } from "../../src/reporter/html.js";
import type { RGAAIssue, RGAAReport } from "../../src/types.js";
import { createMockReport } from "../helpers/mock-report.js";

beforeAll(async () => {
  await loadTranslations("en-US");
});

async function generateHtml(report: RGAAReport): Promise<string> {
  const outPath = path.join(tmpdir(), `koda-test-${Date.now()}.html`);
  await writeHtmlReport(report, { format: "html", path: outPath });
  return readFile(outPath, "utf-8");
}

describe("writeHtmlReport()", () => {
  it("generates a valid HTML document", async () => {
    const html = await generateHtml(createMockReport());
    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("<html lang=");
    expect(html).toContain("</html>");
  });

  it("does not contain undefined or [object Object]", async () => {
    const html = await generateHtml(createMockReport());
    expect(html).not.toContain("undefined");
    expect(html).not.toContain("[object Object]");
  });

  it("includes the compliance score", async () => {
    const html = await generateHtml(createMockReport());
    // summary: 25 validated out of 30 applicable = ~83%
    expect(html).toContain("83%");
  });

  it("includes a skip-to-content link", async () => {
    const html = await generateHtml(createMockReport());
    expect(html).toContain('href="#main-content"');
    expect(html).toContain('id="main-content"');
  });

  it("uses semantic <main> element for the container", async () => {
    const html = await generateHtml(createMockReport());
    expect(html).toContain('<main class="container"');
  });

  it("escapes issue element content properly (no XSS)", async () => {
    const xssIssue: RGAAIssue = {
      id: "xss-1",
      criterionId: "1.1",
      testId: "1.1.1",
      phase: "static",
      severity: "error",
      element: '<img src=x onerror="alert(1)">',
      file: "src/Bad.tsx",
      messageKey: "img.missing-alt",
      remediationKey: "img.missing-alt",
      wcag: "1.1.1",
    };
    const html = await generateHtml(createMockReport({ issues: [xssIssue] }));
    // The raw onerror= must not appear verbatim in output
    expect(html).not.toContain('onerror="alert(1)"');
    // Escaped form should appear
    expect(html).toContain("&lt;img");
  });

  it("escapes issue.phase", async () => {
    // issue.phase is always 'static' | 'runtime' so this tests the escapeHtml path
    const html = await generateHtml(createMockReport());
    // Should not contain unescaped angle brackets from phase values
    expect(html).toMatch(/class="issue-phase">(static|runtime)<\/span>/);
  });

  it("renders 'no issues' message for empty issue list", async () => {
    const html = await generateHtml(createMockReport({ issues: [] }));
    expect(html).toContain("no-issues");
  });

  it("contains :focus-visible styles", async () => {
    const html = await generateHtml(createMockReport());
    expect(html).toContain(":focus-visible");
  });

  it("uses non-color indicators for status (CSS ::before pseudo-elements)", async () => {
    const html = await generateHtml(createMockReport());
    expect(html).toContain(".status-pass::before");
    expect(html).toContain(".status-fail::before");
  });

  it("shows project name in header when provided", async () => {
    const html = await generateHtml(createMockReport());
    expect(html).toContain("test-project");
  });

  it("includes a Content-Security-Policy meta tag (TEST-3)", async () => {
    const html = await generateHtml(createMockReport());
    expect(html).toContain('<meta http-equiv="Content-Security-Policy"');
    expect(html).toContain("default-src 'none'");
    expect(html).toContain("style-src 'unsafe-inline'");
  });

  it("uses <dl> for score stats with <dt>/<dd> pairs", async () => {
    const html = await generateHtml(createMockReport());
    expect(html).toContain('<dl class="score-stats"');
    expect(html).toContain("<dt ");
    expect(html).toContain("<dd ");
  });

  it('uses scope="row" on criterion ID header cells', async () => {
    // Provide a theme with criteria so the table rows are rendered
    const html = await generateHtml(
      createMockReport({
        themes: [
          {
            id: 1,
            complianceRate: 1,
            criteriaResults: [
              {
                id: "1.1",
                status: "validated",
                issueCount: 0,
                testResults: [],
              },
            ],
          },
        ],
      })
    );
    expect(html).toContain('<th scope="row"');
  });
});
