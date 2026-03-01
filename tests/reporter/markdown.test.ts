import { readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
/**
 * Tests for src/reporter/markdown.ts — TEST-1 (reporter coverage)
 * Key focus: code fence injection prevention
 */
import { beforeAll, describe, expect, it } from "vitest";
import { loadTranslations } from "../../src/i18n/index.js";
import { writeMarkdownReport } from "../../src/reporter/markdown.js";
import type { RGAAIssue, RGAAReport } from "../../src/types.js";
import { createMockReport } from "../helpers/mock-report.js";

beforeAll(async () => {
  await loadTranslations("en-US");
});

async function generateMd(report: RGAAReport): Promise<string> {
  const outPath = path.join(tmpdir(), `koda-test-${Date.now()}.md`);
  await writeMarkdownReport(report, { format: "markdown", path: outPath });
  return readFile(outPath, "utf-8");
}

describe("writeMarkdownReport()", () => {
  it("generates a markdown document with headings", async () => {
    const md = await generateMd(createMockReport());
    expect(md).toContain("# ");
    expect(md).toContain("## ");
  });

  it("does not contain undefined or [object Object]", async () => {
    const md = await generateMd(createMockReport());
    expect(md).not.toContain("undefined");
    expect(md).not.toContain("[object Object]");
  });

  it("includes a compliance badge", async () => {
    const md = await generateMd(createMockReport());
    expect(md).toContain("![Compliance");
    expect(md).toContain("shields.io");
  });

  it("shows 'no issues' when issue list is empty", async () => {
    const md = await generateMd(createMockReport({ issues: [] }));
    expect(md).toContain("✅");
  });

  it("element with triple backticks does NOT break code fence", async () => {
    // An attacker could inject ``` to escape the fenced block
    const maliciousIssue: RGAAIssue = {
      id: "sec-1",
      criterionId: "1.1",
      testId: "1.1.1",
      phase: "static",
      severity: "error",
      element: "```\n**INJECTED MARKDOWN**\n```\n<img src=x>",
      file: "src/Evil.tsx",
      messageKey: "img.missing-alt",
      remediationKey: "img.missing-alt",
      wcag: "1.1.1",
    };
    const md = await generateMd(createMockReport({ issues: [maliciousIssue] }));

    // Must NOT contain a raw fenced code block opening followed by the injected content
    // The element should be rendered as 4-space indented code, not fenced
    const lines = md.split("\n");
    // Code fences require ``` at the START of a line (no indentation).
    // With 4-space indentation, backticks are safe — renderers won't treat them as fences.
    const rawFenceLines = lines.filter((l) => l.startsWith("```"));
    expect(rawFenceLines.length).toBe(0);
    // The injected content should be indented (4-space prefix)
    expect(md).toContain("    ```");
  });

  it("element rendered as 4-space indented code block", async () => {
    const issue: RGAAIssue = {
      id: "test-elem",
      criterionId: "1.1",
      testId: "1.1.1",
      phase: "runtime",
      severity: "error",
      element: '<img src="/hero.jpg" alt="">',
      page: "/",
      messageKey: "img.missing-alt",
      remediationKey: "img.missing-alt",
      wcag: "1.1.1",
    };
    const md = await generateMd(createMockReport({ issues: [issue] }));
    // Element should appear with 4-space indentation
    expect(md).toContain('    <img src="/hero.jpg" alt="">');
  });

  it("includes criterion IDs in the issues section", async () => {
    const md = await generateMd(createMockReport());
    expect(md).toContain("[1.1]");
  });

  it("shows grouped issues by file", async () => {
    const md = await generateMd(createMockReport());
    expect(md).toContain("src/components/Hero.tsx");
  });
});
