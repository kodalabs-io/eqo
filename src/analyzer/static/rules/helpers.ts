import type { File, JSXOpeningElement } from "@babel/types";
import { escapeHtml } from "../../../reporter/escaping.js";
import type {
  IssueSeverity,
  RGAAIssue,
  StaticRule,
  StaticRuleContext,
} from "../../../types.js";
import { nodeLoc, serializeElement } from "../parser.js";

/** Maximum character length for sanitized context values. */
export const MAX_CONTEXT_VALUE_LENGTH = 200;

/**
 * Generate a unique issue ID. Uses a per-isolate prefix + sequential counter
 * for fast, collision-free IDs across worker threads.
 */
const _prefix = Math.random().toString(36).slice(2, 8);
let _seq = 0;
export function issueId(): string {
  return `${_prefix}-${(++_seq).toString(36)}`;
}

/** Sanitize a string value for safe embedding in reporter output (HTML, XML, Markdown). */
function sanitizeContextValue(value: string): string {
  return escapeHtml(value).slice(0, MAX_CONTEXT_VALUE_LENGTH);
}

/**
 * Define a static rule with automatic AST null-check.
 * The inner `check` receives a context with a guaranteed non-null `ast`.
 */
export function defineRule(
  meta: { id: string; criteria: string[] },
  check: (ctx: StaticRuleContext & { ast: File }) => RGAAIssue[]
): StaticRule {
  return {
    ...meta,
    check(context) {
      if (!context.ast) return [];
      return check(context as StaticRuleContext & { ast: File });
    },
  };
}

/**
 * Shared helper for creating static analysis issues.
 * Eliminates repeated boilerplate across rule files.
 */
export function createStaticIssue(opts: {
  node: JSXOpeningElement;
  filePath: string;
  criterionId: string;
  testId: string;
  severity?: IssueSeverity;
  messageKey: string;
  remediationKey?: string;
  wcag?: string;
  messageContext?: Record<string, string>;
}): RGAAIssue {
  const { node, filePath, remediationKey, severity = "error", ...rest } = opts;
  // Sanitize messageContext values at the boundary to prevent XSS in reporters
  const sanitizedContext = rest.messageContext
    ? Object.fromEntries(
        Object.entries(rest.messageContext).map(([k, v]) => [
          k,
          sanitizeContextValue(v),
        ])
      )
    : undefined;
  return {
    id: issueId(),
    phase: "static",
    element: serializeElement(node),
    file: filePath,
    ...nodeLoc(node),
    severity,
    remediationKey: remediationKey ?? rest.messageKey,
    ...rest,
    ...(sanitizedContext ? { messageContext: sanitizedContext } : {}),
  };
}
