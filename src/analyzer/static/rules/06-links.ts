import type { JSXElement } from "@babel/types";
import type { RGAAIssue } from "../../../types.js";
import {
  getAttr,
  getAttrStringValue,
  getTagName,
  getTextContent,
  isAttrDynamic,
  walk,
} from "../parser.js";
import { createStaticIssue, defineRule } from "./helpers.js";

const linksNeedLabel = defineRule({ id: "links/label-present", criteria: ["6.2"] }, (context) => {
  const { filePath, ast } = context;
  const issues: RGAAIssue[] = [];

  walk(ast, {
    JSXElement(rawNode) {
      const node = rawNode as unknown as JSXElement;
      const opening = node.openingElement;
      if (getTagName(opening) !== "a") return;

      const ariaLabel = getAttr(opening, "aria-label");
      const ariaLabelledby = getAttr(opening, "aria-labelledby");

      if (ariaLabel) {
        const val = getAttrStringValue(ariaLabel);
        if (val !== null && val.trim() === "") {
          issues.push(
            createStaticIssue({
              node: opening,
              filePath,
              criterionId: "6.2",
              testId: "6.2.1",
              messageKey: "link.empty-label",
              remediationKey: "link.missing-label",
              wcag: "4.1.2",
            }),
          );
        }
        return; // non-empty aria-label is ok
      }

      if (ariaLabelledby || isAttrDynamic(ariaLabel)) return;

      const text = getTextContent(node);
      if (text === null) return; // dynamic content

      if (text.trim() === "") {
        issues.push(
          createStaticIssue({
            node: opening,
            filePath,
            criterionId: "6.2",
            testId: "6.2.1",
            messageKey: "link.missing-label",
            wcag: "4.1.2",
          }),
        );
      }
    },
  });

  return issues;
});

export const linkRules = [linksNeedLabel];
