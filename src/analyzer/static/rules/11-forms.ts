import type { JSXElement, JSXOpeningElement } from "@babel/types";
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

// ─── Rule: form fields must have a label (Criterion 11.1) ────────────────────

const LABELABLE_INPUT_TYPES = new Set([
  "text",
  "email",
  "password",
  "number",
  "tel",
  "url",
  "search",
  "date",
  "time",
  "datetime-local",
  "month",
  "week",
  "color",
  "range",
  "file",
  "checkbox",
  "radio",
]);

// Plain Set — the AUTOCOMPLETE_MAP identity mapping (each key = its own value) was redundant.
const PERSONAL_DATA_FIELD_NAMES = new Set([
  "email",
  "tel",
  "name",
  "given-name",
  "family-name",
  "additional-name",
  "organization",
  "organization-title",
  "street-address",
  "address-line1",
  "address-line2",
  "postal-code",
  "country-name",
  "bday",
  "sex",
  "url",
  "username",
  "new-password",
  "current-password",
  "one-time-code",
  "cc-name",
  "cc-number",
]);

function isLabelableInput(node: JSXOpeningElement): boolean {
  const typeAttr = getAttr(node, "type");
  if (!typeAttr) return true; // default type is text
  const typeVal = getAttrStringValue(typeAttr);
  if (!typeVal) return true; // dynamic type — flag as warning
  return LABELABLE_INPUT_TYPES.has(typeVal);
}

// Severity: error when no label at all; warning when only placeholder
// (placeholder alone is not a WCAG-compliant label, but indicates developer intent).
const formFieldsNeedLabel = defineRule(
  { id: "forms/label-present", criteria: ["11.1"] },
  (context) => {
    const { filePath, ast } = context;
    const issues: RGAAIssue[] = [];

    walk(ast, {
      JSXOpeningElement(rawNode) {
        const node = rawNode as unknown as JSXOpeningElement;
        const tag = getTagName(node);
        if (!tag) return;

        const isLabelable =
          tag === "textarea" || tag === "select" || (tag === "input" && isLabelableInput(node));

        if (!isLabelable) return;

        // Has id → could have an associated <label for="id"> elsewhere
        const idAttr = getAttr(node, "id");
        if (idAttr) return; // we trust id-based association at static level

        const ariaLabel = getAttr(node, "aria-label");
        const ariaLabelledby = getAttr(node, "aria-labelledby");
        const placeholder = getAttr(node, "placeholder");

        // Dynamic aria attributes are acceptable
        if (isAttrDynamic(ariaLabel) || isAttrDynamic(ariaLabelledby)) return;

        const hasStaticAriaLabel = ariaLabel && getAttrStringValue(ariaLabel)?.trim() !== "";
        const hasAriaLabelledby = !!ariaLabelledby;

        if (hasStaticAriaLabel || hasAriaLabelledby) return;

        // placeholder is NOT a valid label substitute (flag as warning)
        const severity = placeholder ? "warning" : "error";
        const testId = tag === "textarea" ? "11.1.2" : tag === "select" ? "11.1.3" : "11.1.1";

        issues.push(
          createStaticIssue({
            node,
            filePath,
            criterionId: "11.1",
            testId,
            severity,
            messageKey: "form.missing-label",
            remediationKey: "form.missing-label",
            wcag: "1.3.1",
            messageContext: { tag },
          }),
        );
      },
    });

    return issues;
  },
);

// ─── Rule: <fieldset> must have <legend> (Criterion 11.6) ────────────────────

const fieldsetNeedsLegend = defineRule(
  { id: "forms/fieldset-legend", criteria: ["11.6"] },
  (context) => {
    const { filePath, ast } = context;
    const issues: RGAAIssue[] = [];

    walk(ast, {
      JSXElement(rawNode) {
        const node = rawNode as unknown as JSXElement;
        const opening = node.openingElement;
        const tag = getTagName(opening);

        if (tag === "fieldset") {
          const hasLegend = node.children.some(
            (child) => child.type === "JSXElement" && getTagName(child.openingElement) === "legend",
          );
          if (!hasLegend) {
            issues.push(
              createStaticIssue({
                node: opening,
                filePath,
                criterionId: "11.6",
                testId: "11.6.1",
                messageKey: "form.fieldset-missing-legend",
                wcag: "1.3.1",
              }),
            );
          }
          return;
        }

        // role="group" or role="radiogroup" must have aria-labelledby or aria-label
        const role = getAttrStringValue(getAttr(opening, "role"));
        if (role === "group" || role === "radiogroup") {
          // getAttr() returns the attribute node whether static or dynamic,
          // so presence alone is sufficient — isAttrDynamic(null) was always false.
          const hasLabel = getAttr(opening, "aria-labelledby") || getAttr(opening, "aria-label");

          if (!hasLabel) {
            issues.push(
              createStaticIssue({
                node: opening,
                filePath,
                criterionId: "11.6",
                testId: "11.6.2",
                messageKey: "form.group-missing-label",
                remediationKey: "form.fieldset-missing-legend",
                wcag: "1.3.1",
                messageContext: { role },
              }),
            );
          }
        }
      },
    });

    return issues;
  },
);

// ─── Rule: buttons must have accessible names (Criterion 11.9) ───────────────

const buttonsNeedLabel = defineRule({ id: "forms/button-label", criteria: ["11.9"] }, (context) => {
  const { filePath, ast } = context;
  const issues: RGAAIssue[] = [];

  walk(ast, {
    // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: button/input label detection spans multiple element types
    JSXElement(rawNode) {
      const node = rawNode as unknown as JSXElement;
      const opening = node.openingElement;
      const tag = getTagName(opening);

      if (tag === "button") {
        const ariaLabel = getAttr(opening, "aria-label");
        const ariaLabelledby = getAttr(opening, "aria-labelledby");

        if (isAttrDynamic(ariaLabel) || isAttrDynamic(ariaLabelledby)) return;

        const hasAriaLabel = ariaLabel && getAttrStringValue(ariaLabel)?.trim() !== "";
        if (hasAriaLabel || ariaLabelledby) return;

        const text = getTextContent(node);
        if (text === null) return; // dynamic content

        if (text.trim() === "") {
          issues.push(
            createStaticIssue({
              node: opening,
              filePath,
              criterionId: "11.9",
              testId: "11.9.1",
              messageKey: "form.button-missing-label",
              wcag: "1.3.1",
            }),
          );
        }
        return;
      }

      // <input type="submit"> / <input type="button"> / <input type="reset">
      if (tag === "input") {
        const typeVal = getAttrStringValue(getAttr(opening, "type"));
        if (typeVal !== "submit" && typeVal !== "button" && typeVal !== "reset") return;

        const valueAttr = getAttr(opening, "value");
        const ariaLabel = getAttr(opening, "aria-label");
        if (ariaLabel || isAttrDynamic(valueAttr)) return;

        const value = getAttrStringValue(valueAttr);
        if (value === null || value.trim() !== "") return; // has a value

        issues.push(
          createStaticIssue({
            node: opening,
            filePath,
            criterionId: "11.9",
            testId: "11.9.2",
            messageKey: "form.submit-empty-value",
            remediationKey: "form.button-missing-label",
            wcag: "1.3.1",
            messageContext: { type: typeVal ?? "submit" },
          }),
        );
      }
    },
  });

  return issues;
});

// ─── Rule: personal data fields need autocomplete (Criterion 11.13) ──────────
// Severity: warning — autocomplete is a WCAG 1.3.5 (AA) recommendation,
// not a hard failure. Fields may be intentionally excluded.

const PERSONAL_DATA_TYPES = new Map([
  ["email", "email"],
  ["tel", "tel"],
]);

// CQ-5: Pre-compile word-boundary patterns to avoid false positives like
// "email_verified" matching "email". Each pattern matches only when surrounded
// by word boundaries (start/end of string, or underscore/hyphen).
const PERSONAL_DATA_NAME_PATTERNS: Array<[RegExp, string]> = Array.from(
  PERSONAL_DATA_FIELD_NAMES,
).map((name) => {
  // Escape regex special chars FIRST, then replace hyphens (order matters to avoid double-escaping)
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/-/g, "[-_]");
  return [new RegExp(`(?:^|[-_])${escaped}(?:$|[-_])`), name];
});

const autocompleteForPersonalData = defineRule(
  { id: "forms/autocomplete-personal-data", criteria: ["11.13"] },
  (context) => {
    const { filePath, ast } = context;
    const issues: RGAAIssue[] = [];

    walk(ast, {
      JSXOpeningElement(rawNode) {
        const node = rawNode as unknown as JSXOpeningElement;
        if (getTagName(node) !== "input") return;

        const typeAttr = getAttr(node, "type");
        const nameAttr = getAttr(node, "name");
        const autocompleteAttr = getAttr(node, "autocomplete");

        if (autocompleteAttr) return;

        const typeVal = getAttrStringValue(typeAttr);
        const nameVal = getAttrStringValue(nameAttr)?.toLowerCase() ?? "";

        let purpose: string | undefined;

        if (typeVal && PERSONAL_DATA_TYPES.has(typeVal)) {
          purpose = PERSONAL_DATA_TYPES.get(typeVal);
        } else {
          // Use word-boundary matching to avoid false positives (e.g. "email_verified")
          for (const [re, token] of PERSONAL_DATA_NAME_PATTERNS) {
            if (re.test(nameVal)) {
              purpose = token;
              break;
            }
          }
        }

        if (!purpose) return;

        issues.push(
          createStaticIssue({
            node,
            filePath,
            criterionId: "11.13",
            testId: "11.13.1",
            severity: "warning",
            messageKey: "form.missing-autocomplete",
            wcag: "1.3.5",
            messageContext: { purpose },
          }),
        );
      },
    });

    return issues;
  },
);

export const formRules = [
  formFieldsNeedLabel,
  fieldsetNeedsLegend,
  buttonsNeedLabel,
  autocompleteForPersonalData,
];
