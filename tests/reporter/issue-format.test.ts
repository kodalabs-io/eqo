/**
 * Tests for src/reporter/issue-format.ts
 * Covers URL injection via helpUrl
 */
import { beforeAll, describe, expect, it } from "vitest";
import { loadTranslations } from "../../src/i18n/index.js";
import {
  resolveIssueMessage,
  resolveRemediation,
  SAFE_URL,
} from "../../src/reporter/issue-format.js";
import type { RGAAIssue } from "../../src/types.js";

const MOCK_ISSUE: RGAAIssue = {
  id: "test-1",
  criterionId: "1.1",
  testId: "1.1.1",
  phase: "static",
  severity: "error",
  messageKey: "img.missing-alt",
  remediationKey: "img.missing-alt",
  wcag: "1.1.1",
};

beforeAll(async () => {
  await loadTranslations("en-US");
});

describe("SAFE_URL regex", () => {
  it("accepts valid https URLs", () => {
    expect(SAFE_URL.test("https://dequeuniversity.com/rules/axe/4.9/image-alt")).toBe(true);
    expect(SAFE_URL.test("https://www.w3.org/TR/WCAG21/")).toBe(true);
    expect(SAFE_URL.test("http://example.com/docs")).toBe(true);
  });

  it("accepts valid URLs with subdomains", () => {
    expect(SAFE_URL.test("https://docs.deque.com/axe/4.0/api-ref")).toBe(true);
    expect(SAFE_URL.test("https://sub.domain.co.uk/path")).toBe(true);
  });

  it("rejects javascript: scheme", () => {
    expect(SAFE_URL.test("javascript:alert(1)")).toBe(false);
    expect(SAFE_URL.test("javascript://evil")).toBe(false);
  });

  it("rejects data: scheme", () => {
    expect(SAFE_URL.test("data:text/html,<h1>evil</h1>")).toBe(false);
  });

  it("rejects bare http:// without a hostname", () => {
    expect(SAFE_URL.test("http://")).toBe(false);
    expect(SAFE_URL.test("http:///path")).toBe(false);
  });

  it("rejects strings that only start with 'http' (old .startsWith bug)", () => {
    expect(SAFE_URL.test("http-equiv")).toBe(false);
    expect(SAFE_URL.test("httpevil://attacker.com")).toBe(false);
  });

  it("rejects empty string", () => {
    expect(SAFE_URL.test("")).toBe(false);
  });

  it("rejects IP-only URLs (no domain extension)", () => {
    expect(SAFE_URL.test("http://192.168.1.1")).toBe(false);
  });
});

describe("resolveIssueMessage()", () => {
  it("resolves a known messageKey from translations", async () => {
    const { getTranslations } = await import("../../src/i18n/index.js");
    const t = getTranslations("en-US");
    const msg = resolveIssueMessage(MOCK_ISSUE, t);
    // Should return a non-empty translated string (or fall back to the key)
    expect(typeof msg).toBe("string");
    expect(msg.length).toBeGreaterThan(0);
  });

  it("falls back to messageContext.help when messageKey is unknown", async () => {
    const { getTranslations } = await import("../../src/i18n/index.js");
    const t = getTranslations("en-US");
    const issue: RGAAIssue = {
      ...MOCK_ISSUE,
      messageKey: "axe.unknown-rule-key",
      messageContext: { help: "Axe fallback help text" },
    };
    const msg = resolveIssueMessage(issue, t);
    expect(msg).toBe("Axe fallback help text");
  });

  it("falls back to raw messageKey when no translation or context", async () => {
    const { getTranslations } = await import("../../src/i18n/index.js");
    const t = getTranslations("en-US");
    const issue: RGAAIssue = {
      ...MOCK_ISSUE,
      messageKey: "completely.unknown.key",
    };
    const msg = resolveIssueMessage(issue, t);
    expect(msg).toBe("completely.unknown.key");
  });

  it("interpolates messageContext placeholders", async () => {
    const { getTranslations } = await import("../../src/i18n/index.js");
    const t = getTranslations("en-US");
    const issue: RGAAIssue = {
      ...MOCK_ISSUE,
      messageKey: "axe.placeholder-test",
      messageContext: {
        help: "Element {id} is missing required attribute",
        id: "btn-42",
      },
    };
    const msg = resolveIssueMessage(issue, t);
    expect(msg).toBe("Element btn-42 is missing required attribute");
  });
});

describe("resolveRemediation()", () => {
  it("marks a valid https URL as isUrl: true", async () => {
    const { getTranslations } = await import("../../src/i18n/index.js");
    const t = getTranslations("en-US");
    const issue: RGAAIssue = {
      ...MOCK_ISSUE,
      remediationKey: "axe.unknown",
      messageContext: {
        helpUrl: "https://dequeuniversity.com/rules/axe/4.9/image-alt",
      },
    };
    const { isUrl, text } = resolveRemediation(issue, t);
    expect(isUrl).toBe(true);
    expect(text).toBe("https://dequeuniversity.com/rules/axe/4.9/image-alt");
  });

  it("marks a javascript: URL as isUrl: false", async () => {
    const { getTranslations } = await import("../../src/i18n/index.js");
    const t = getTranslations("en-US");
    const issue: RGAAIssue = {
      ...MOCK_ISSUE,
      remediationKey: "axe.evil",
      messageContext: { helpUrl: "javascript:alert('xss')" },
    };
    const { isUrl } = resolveRemediation(issue, t);
    expect(isUrl).toBe(false);
  });

  it("falls back to raw remediationKey when no translation or context", async () => {
    const { getTranslations } = await import("../../src/i18n/index.js");
    const t = getTranslations("en-US");
    const issue: RGAAIssue = {
      ...MOCK_ISSUE,
      remediationKey: "img.missing-alt",
    };
    const { text } = resolveRemediation(issue, t);
    // Either the translation value or the raw key
    expect(typeof text).toBe("string");
    expect(text.length).toBeGreaterThan(0);
  });
});
