import path from "node:path";
import type { JSXOpeningElement } from "@babel/types";
import type { RGAAIssue } from "../../../types.js";
import { getAttr, getAttrStringValue, getTagName, isAttrDynamic, walk } from "../parser.js";
import { createStaticIssue, defineRule, issueId } from "./helpers.js";

// ─── Rule: <html> must have a lang attribute (Criterion 8.3 / 8.4) ───────────

const VALID_LANG_RE = /^[a-zA-Z]{2,3}(-[a-zA-Z0-9]{2,8})*$/;

/** Layout/root file names that should be checked for page-level elements. */
const LAYOUT_FILE_NAMES = new Set(["layout", "_document", "RootLayout", "Head"]);

function isLayoutFile(filePath: string): boolean {
  return LAYOUT_FILE_NAMES.has(path.basename(filePath, path.extname(filePath)));
}

const htmlNeedsLang = defineRule(
  { id: "mandatory/html-lang", criteria: ["8.3", "8.4"] },
  (context) => {
    const { filePath, ast } = context;
    if (!isLayoutFile(filePath) || path.basename(filePath, path.extname(filePath)) === "Head")
      return [];

    const issues: RGAAIssue[] = [];

    walk(ast, {
      JSXOpeningElement(rawNode) {
        const node = rawNode as unknown as JSXOpeningElement;
        if (getTagName(node) !== "html") return;

        const langAttr = getAttr(node, "lang");

        if (!langAttr) {
          issues.push(
            createStaticIssue({
              node,
              filePath,
              criterionId: "8.3",
              testId: "8.3.1",
              messageKey: "html.missing-lang",
              wcag: "3.1.1",
            }),
          );
          return;
        }

        if (isAttrDynamic(langAttr)) return;

        const langValue = getAttrStringValue(langAttr);

        if (langValue !== null && langValue.trim() === "") {
          issues.push(
            createStaticIssue({
              node,
              filePath,
              criterionId: "8.3",
              testId: "8.3.1",
              messageKey: "html.empty-lang",
              remediationKey: "html.missing-lang",
              wcag: "3.1.1",
            }),
          );
          return;
        }

        if (langValue !== null && !VALID_LANG_RE.test(langValue)) {
          issues.push(
            createStaticIssue({
              node,
              filePath,
              criterionId: "8.4",
              testId: "8.4.1",
              messageKey: "html.invalid-lang",
              wcag: "3.1.1",
              messageContext: { lang: langValue },
            }),
          );
        }
      },
    });

    return issues;
  },
);

// ─── Rule: page must have a <title> (Criterion 8.5 / 8.6) ───────────────────

const pageNeedsTitle = defineRule(
  { id: "mandatory/page-title", criteria: ["8.5", "8.6"] },
  (context) => {
    const { filePath, ast } = context;
    if (!isLayoutFile(filePath)) return [];

    const issues: RGAAIssue[] = [];
    let foundTitle = false;

    walk(ast, {
      JSXOpeningElement(rawNode) {
        const node = rawNode as unknown as JSXOpeningElement;
        if (getTagName(node) !== "title") return;
        foundTitle = true;
      },
    });

    if (!foundTitle) {
      // No element to attach to — create a file-level issue
      issues.push({
        id: issueId(),
        criterionId: "8.5",
        testId: "8.5.1",
        phase: "static",
        severity: "error",
        file: filePath,
        messageKey: "html.missing-title",
        remediationKey: "html.missing-title",
        wcag: "2.4.2",
      });
    }

    return issues;
  },
);

// ─── Rule: presentational tags must not be used for styling (Criterion 8.9) ──
// Severity: error for deprecated presentational tags (blink, marquee, font, center).
// Severity: warning for <b>, <i>, <s> which can have semantic meaning.

const PRESENTATIONAL_TAGS = new Set(["b", "i", "u", "s", "blink", "marquee", "font", "center"]);

const noPresentationalTags = defineRule(
  { id: "mandatory/no-presentational-tags", criteria: ["8.9"] },
  (context) => {
    const { filePath, ast } = context;
    const issues: RGAAIssue[] = [];

    walk(ast, {
      JSXOpeningElement(rawNode) {
        const node = rawNode as unknown as JSXOpeningElement;
        const tag = getTagName(node);
        if (!tag || !PRESENTATIONAL_TAGS.has(tag)) return;

        // <b>, <i>, <s> can have semantic meaning — flag as warning
        const severity = tag === "b" || tag === "i" || tag === "s" ? "warning" : "error";

        issues.push(
          createStaticIssue({
            node,
            filePath,
            criterionId: "8.9",
            testId: "8.9.1",
            severity,
            messageKey: "html.presentational-tag",
            wcag: "1.3.1",
            messageContext: { tag },
          }),
        );
      },
    });

    return issues;
  },
);

export const mandatoryRules = [htmlNeedsLang, pageNeedsTitle, noPresentationalTags];
