import type { JSXElement, JSXOpeningElement } from "@babel/types";
import type { RGAAIssue } from "../../../types.js";
import { getAttr, getAttrStringValue, getTagName, walk } from "../parser.js";
import { createStaticIssue, defineRule } from "./helpers.js";

// ─── Rule: data tables must have a caption (Criterion 5.4) ───────────────────
// Severity: warning — a caption is recommended but tables may use aria-label
// or aria-labelledby as alternatives. Not a hard WCAG failure if labeled.

const tablesNeedCaption = defineRule(
  { id: "tables/caption-present", criteria: ["5.4"] },
  (context) => {
    const { filePath, ast } = context;
    const issues: RGAAIssue[] = [];

    walk(ast, {
      JSXElement(rawNode) {
        const node = rawNode as unknown as JSXElement;
        const opening = node.openingElement;
        if (getTagName(opening) !== "table") return;

        const role = getAttrStringValue(getAttr(opening, "role"));
        if (role === "presentation" || role === "none") return;
        if (getAttr(opening, "aria-label") || getAttr(opening, "aria-labelledby")) return;

        const hasCaption = node.children.some(
          (child) => child.type === "JSXElement" && getTagName(child.openingElement) === "caption",
        );

        if (!hasCaption) {
          issues.push(
            createStaticIssue({
              node: opening,
              filePath,
              criterionId: "5.4",
              testId: "5.4.1",
              severity: "warning",
              messageKey: "table.missing-caption",
              wcag: "1.3.1",
            }),
          );
        }
      },
    });

    return issues;
  },
);

// ─── Rule: <th> must have scope attribute (Criterion 5.6) ────────────────────
// Severity: warning — scope improves screen reader experience but tables
// can also use id/headers association. Best-practice, not a hard failure.

const thNeedsScope = defineRule({ id: "tables/th-scope", criteria: ["5.6"] }, (context) => {
  const { filePath, ast } = context;
  const issues: RGAAIssue[] = [];

  walk(ast, {
    JSXOpeningElement(rawNode) {
      const node = rawNode as unknown as JSXOpeningElement;
      if (getTagName(node) !== "th") return;

      const scope = getAttr(node, "scope");
      const id = getAttr(node, "id");
      if (!scope && !id) {
        issues.push(
          createStaticIssue({
            node,
            filePath,
            criterionId: "5.6",
            testId: "5.6.1",
            severity: "warning",
            messageKey: "table.th-missing-scope",
            wcag: "1.3.1",
          }),
        );
      }
    },
  });

  return issues;
});

// ─── Rule: layout tables must not use structural elements (Criterion 5.8) ────

const layoutTableNoStructure = defineRule(
  { id: "tables/layout-no-structural-elements", criteria: ["5.8"] },
  (context) => {
    const { filePath, ast } = context;
    const issues: RGAAIssue[] = [];

    walk(ast, {
      JSXElement(rawNode) {
        const node = rawNode as unknown as JSXElement;
        const opening = node.openingElement;
        if (getTagName(opening) !== "table") return;

        const role = getAttrStringValue(getAttr(opening, "role"));
        if (role !== "presentation" && role !== "none") return;

        // Check for structural elements inside layout table — direct children only (avoids O(n²))
        for (const child of node.children) {
          if (child.type !== "JSXElement") continue;
          const childTag = getTagName(child.openingElement);
          if (childTag === "th") {
            issues.push(
              createStaticIssue({
                node: child.openingElement,
                filePath,
                criterionId: "5.8",
                testId: "5.8.1",
                messageKey: "table.layout-has-th",
                wcag: "1.3.1",
              }),
            );
          }
          if (childTag === "caption") {
            issues.push(
              createStaticIssue({
                node: child.openingElement,
                filePath,
                criterionId: "5.8",
                testId: "5.8.1",
                messageKey: "table.layout-has-caption",
                remediationKey: "table.missing-caption",
                wcag: "1.3.1",
              }),
            );
          }
        }
      },
    });

    return issues;
  },
);

export const tableRules = [tablesNeedCaption, thNeedsScope, layoutTableNoStructure];
