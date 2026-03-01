import type { JSXOpeningElement } from "@babel/types";
import type { RGAAIssue } from "../../../types.js";
import { getAttr, getAttrStringValue, getTagName, isAttrDynamic, walk } from "../parser.js";
import { createStaticIssue, defineRule } from "./helpers.js";

// Severity: error — WCAG 4.1.2 Level A, iframes must be identifiable.
const framesNeedTitle = defineRule(
  { id: "frames/title-present", criteria: ["2.1", "2.2"] },
  (context) => {
    const { filePath, ast } = context;
    const issues: RGAAIssue[] = [];

    walk(ast, {
      JSXOpeningElement(rawNode) {
        const node = rawNode as unknown as JSXOpeningElement;
        if (getTagName(node) !== "iframe") return;

        const titleAttr = getAttr(node, "title");

        // Criterion 2.1 — title must be present
        if (!titleAttr) {
          issues.push(
            createStaticIssue({
              node,
              filePath,
              criterionId: "2.1",
              testId: "2.1.1",
              messageKey: "frame.missing-title",
              wcag: "4.1.2",
            }),
          );
          return;
        }

        // Skip dynamic values — we cannot verify relevance at static time
        if (isAttrDynamic(titleAttr)) return;

        const titleValue = getAttrStringValue(titleAttr);

        // Criterion 2.2 — title must not be empty
        if (titleValue !== null && titleValue.trim() === "") {
          issues.push(
            createStaticIssue({
              node,
              filePath,
              criterionId: "2.2",
              testId: "2.2.1",
              messageKey: "frame.empty-title",
              wcag: "4.1.2",
            }),
          );
        }
      },
    });

    return issues;
  },
);

export const frameRules = [framesNeedTitle];
