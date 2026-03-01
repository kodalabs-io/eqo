import type { Translations } from "../i18n/index.js";
import { interpolate } from "../i18n/index.js";
import type { RGAAIssue } from "../types.js";

/** Maximum URL length accepted for remediation links. */
const MAX_URL_LENGTH = 2048;

/** Strict URL validator — allows only http/https with a valid hostname and safe URL characters */
export const SAFE_URL = /^https?:\/\/[\w][\w.-]*\.[a-z]{2,}[^\s"'<>]*$/;

/**
 * Resolve the display message for an issue, falling back to axe-core's
 * `help` string and finally to the raw messageKey.
 */
export function resolveIssueMessage(issue: RGAAIssue, t: Translations): string {
  return interpolate(
    t.issues[issue.messageKey] ?? issue.messageContext?.help ?? issue.messageKey,
    issue.messageContext,
  );
}

/**
 * Resolve the remediation text for an issue.
 * Returns the resolved text and whether it is a safe URL.
 * The caller is responsible for interpolating the text if `isUrl` is false.
 */
export function resolveRemediation(
  issue: RGAAIssue,
  t: Translations,
): { text: string; isUrl: boolean } {
  const text =
    t.remediation[issue.remediationKey] ?? issue.messageContext?.helpUrl ?? issue.remediationKey;
  return { text, isUrl: text.length <= MAX_URL_LENGTH && SAFE_URL.test(text) };
}

export function getRemediationLinkText(url: string): string {
  return url.includes("dequeuniversity") ? "Documentation axe-core" : "Documentation";
}
