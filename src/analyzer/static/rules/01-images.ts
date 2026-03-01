import type { JSXElement, JSXOpeningElement } from "@babel/types";
import type { RGAAIssue } from "../../../types.js";
import { getAttr, getAttrMap, getAttrStringValue, getTagName, walk } from "../parser.js";
import { createStaticIssue, defineRule } from "./helpers.js";

// ─── Rule: images need text alternatives (Criterion 1.1) ─────────────────────
// Severity: error — WCAG 1.1.1 Level A, images without alt are a hard failure.

const imagesNeedAlt = defineRule({ id: "images/alt-present", criteria: ["1.1"] }, (context) => {
  const { filePath, ast } = context;
  const issues: RGAAIssue[] = [];

  walk(ast, {
    // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: covers img, input[type=image], svg[role=img], and generic role=img elements
    JSXOpeningElement(rawNode) {
      const node = rawNode as unknown as JSXOpeningElement;
      const tag = getTagName(node);

      const attrs = getAttrMap(node);

      // <img> without alt
      if (tag === "img") {
        if (!attrs.has("alt") && !attrs.has("aria-label") && !attrs.has("aria-labelledby")) {
          issues.push(
            createStaticIssue({
              node,
              filePath,
              criterionId: "1.1",
              testId: "1.1.1",
              messageKey: "img.missing-alt",
              wcag: "1.1.1",
            }),
          );
        }
        return;
      }

      // <input type="image"> without alt
      if (tag === "input") {
        const typeVal = getAttrStringValue(attrs.get("type"));
        if (typeVal === "image") {
          if (!attrs.has("alt") && !attrs.has("aria-label") && !attrs.has("aria-labelledby")) {
            issues.push(
              createStaticIssue({
                node,
                filePath,
                criterionId: "1.1",
                testId: "1.1.3",
                messageKey: "img.input-image-missing-alt",
                wcag: "1.1.1",
              }),
            );
          }
        }
        return;
      }

      // <svg role="img"> without accessible name
      if (tag === "svg") {
        const roleVal = getAttrStringValue(attrs.get("role"));
        if (roleVal === "img") {
          if (!attrs.has("aria-label") && !attrs.has("aria-labelledby")) {
            issues.push(
              createStaticIssue({
                node,
                filePath,
                criterionId: "1.1",
                testId: "1.1.5",
                messageKey: "img.svg-missing-accessible-name",
                wcag: "1.1.1",
              }),
            );
          }
        }
        return;
      }

      // Element with role="img" (any tag)
      const roleVal = getAttrStringValue(attrs.get("role"));
      if (roleVal === "img") {
        if (!attrs.has("aria-label") && !attrs.has("aria-labelledby")) {
          issues.push(
            createStaticIssue({
              node,
              filePath,
              criterionId: "1.1",
              testId: "1.1.1",
              messageKey: "img.missing-alt-on-role-img",
              wcag: "1.1.1",
            }),
          );
        }
      }
    },
  });

  return issues;
});

// ─── Rule: decorative SVGs must be hidden (Criterion 1.2) ────────────────────
// Severity: notice — requires human judgment about whether the SVG is decorative
// or meaningful in context (e.g. SVG inside a labeled button is fine)

const decorativeSvgMustBeHidden = defineRule(
  { id: "images/decorative-svg-hidden", criteria: ["1.2"] },
  (context) => {
    const { filePath, ast } = context;
    const issues: RGAAIssue[] = [];

    walk(ast, {
      JSXOpeningElement(rawNode) {
        const node = rawNode as unknown as JSXOpeningElement;
        if (getTagName(node) !== "svg") return;

        const role = getAttrStringValue(getAttr(node, "role"));
        const ariaHidden = getAttrStringValue(getAttr(node, "aria-hidden"));
        const ariaLabel = getAttr(node, "aria-label");
        const ariaLabelledby = getAttr(node, "aria-labelledby");

        if (role !== "img" && ariaHidden !== "true" && !ariaLabel && !ariaLabelledby) {
          issues.push(
            createStaticIssue({
              node,
              filePath,
              criterionId: "1.2",
              testId: "1.2.4",
              severity: "notice",
              messageKey: "img.decorative-svg-not-hidden",
              wcag: "1.1.1",
            }),
          );
        }
      },
    });

    return issues;
  },
);

// ─── Rule: <figcaption> must be inside <figure> (Criterion 1.9) ──────────────
// Severity: warning — structural hint, not necessarily a hard WCAG failure.

const figcaptionInFigure = defineRule(
  { id: "images/figcaption-in-figure", criteria: ["1.9"] },
  (context) => {
    const { filePath, ast } = context;
    const issues: RGAAIssue[] = [];

    walk(ast, {
      JSXElement(rawNode) {
        const node = rawNode as unknown as JSXElement;
        const opening = node.openingElement;
        if (getTagName(opening) !== "figure") return;

        let hasFigcaption = false;
        let hasImage = false;

        for (const child of node.children) {
          if (child.type !== "JSXElement") continue;
          const childTag = getTagName(child.openingElement);
          if (childTag === "figcaption") hasFigcaption = true;
          if (
            childTag === "img" ||
            childTag === "picture" ||
            childTag === "svg" ||
            childTag === "canvas"
          ) {
            hasImage = true;
          }
        }

        if (hasFigcaption && !hasImage) {
          issues.push(
            createStaticIssue({
              node: opening,
              filePath,
              criterionId: "1.9",
              testId: "1.9.1",
              severity: "warning",
              messageKey: "img.figure-missing-img",
              remediationKey: "img.missing-alt",
              wcag: "1.1.1",
            }),
          );
        }
      },
    });

    return issues;
  },
);

export const imageRules = [imagesNeedAlt, decorativeSvgMustBeHidden, figcaptionInFigure];
