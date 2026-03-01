import type { JSXElement, JSXOpeningElement } from "@babel/types";
import type { RGAAIssue } from "../../../types.js";
import { getAttr, getAttrStringValue, getTagName, walk } from "../parser.js";
import { createStaticIssue, defineRule } from "./helpers.js";

// ─── Rule: heading hierarchy must not skip levels (Criterion 9.1) ─────────────

const HEADING_TAGS = new Set(["h1", "h2", "h3", "h4", "h5", "h6"]);

const HEADING_LEVEL: Record<string, number> = {
  h1: 1,
  h2: 2,
  h3: 3,
  h4: 4,
  h5: 5,
  h6: 6,
};

function headingLevel(tag: string): number {
  return HEADING_LEVEL[tag] ?? 0;
}

const headingHierarchy = defineRule(
  { id: "structure/heading-hierarchy", criteria: ["9.1"] },
  (context) => {
    const { filePath, ast } = context;
    const issues: RGAAIssue[] = [];
    const headings: Array<{ tag: string; node: JSXOpeningElement }> = [];

    walk(ast, {
      JSXOpeningElement(rawNode) {
        const node = rawNode as unknown as JSXOpeningElement;
        const tag = getTagName(node);
        if (tag && HEADING_TAGS.has(tag)) {
          headings.push({ tag, node });
        }
      },
    });

    if (headings.length === 0) return issues;

    // Check for multiple h1 — single pass without intermediate arrays
    let h1Count = 0;
    for (const { tag, node } of headings) {
      if (tag === "h1" && ++h1Count > 1) {
        issues.push(
          createStaticIssue({
            node,
            filePath,
            criterionId: "9.1",
            testId: "9.1.3",
            messageKey: "heading.multiple-h1",
            wcag: "1.3.1",
          }),
        );
      }
    }

    // Check for level skips
    for (let i = 1; i < headings.length; i++) {
      const prev = headings[i - 1];
      const curr = headings[i];
      if (!prev || !curr) continue;

      const prevLevel = headingLevel(prev.tag);
      const currLevel = headingLevel(curr.tag);

      if (currLevel > prevLevel + 1) {
        issues.push(
          createStaticIssue({
            node: curr.node,
            filePath,
            criterionId: "9.1",
            testId: "9.1.2",
            messageKey: "heading.skipped-level",
            wcag: "1.3.1",
            messageContext: { from: String(prevLevel), to: String(currLevel) },
          }),
        );
      }
    }

    return issues;
  },
);

// ─── Rule: lists must be properly structured (Criterion 9.3) ─────────────────

const ORDERED_LIST_TAGS = new Set(["ul", "ol"]);

const listsProperlyStructured = defineRule(
  { id: "structure/lists-structure", criteria: ["9.3"] },
  (context) => {
    const { filePath, ast } = context;
    const issues: RGAAIssue[] = [];

    walk(ast, {
      JSXElement(rawNode) {
        const node = rawNode as unknown as JSXElement;
        const opening = node.openingElement;
        const tag = getTagName(opening);

        if (!tag || !ORDERED_LIST_TAGS.has(tag)) return;

        // Skip if role="none" or role="presentation" (intentional override)
        const role = getAttrStringValue(getAttr(opening, "role"));
        if (role === "none" || role === "presentation") return;

        for (const child of node.children) {
          if (child.type === "JSXText" && child.value.trim() === "") continue;
          if (child.type !== "JSXElement") continue;

          const childTag = getTagName(child.openingElement);
          // Allow <li>, PascalCase components, and hyphenated custom elements (e.g. <my-list-item>)
          if (
            childTag !== null &&
            childTag !== "li" &&
            !/^[A-Z]/.test(childTag) &&
            !childTag.includes("-")
          ) {
            issues.push(
              createStaticIssue({
                node: child.openingElement,
                filePath,
                criterionId: "9.3",
                testId: "9.3.1",
                messageKey: "list.invalid-child",
                wcag: "1.3.1",
                messageContext: { parent: tag, child: childTag },
              }),
            );
          }
        }
      },
    });

    return issues;
  },
);

export const structureRules = [headingHierarchy, listsProperlyStructured];
