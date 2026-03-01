/**
 * Prefix used for axe-originated test IDs (e.g. "axe/image-alt").
 * Used to distinguish axe issues from static-analysis issues in reports.
 */
export const AXE_TEST_ID_PREFIX = "axe/";

/**
 * Maps axe-core rule IDs to RGAA 4.1.2 criterion IDs.
 *
 * This mapping is the bridge between the WCAG-based axe-core results
 * and the RGAA reference framework.
 *
 * Reference: https://www.w3.org/WAI/WCAG21/Techniques/
 */
export const AXE_TO_RGAA: Readonly<Record<string, string[]>> = {
  // ── Theme 1: Images ──────────────────────────────────────────────────────
  "image-alt": ["1.1"],
  "area-alt": ["1.1"],
  "input-image-alt": ["1.1"],
  "role-img-alt": ["1.1"],
  "image-redundant-alt": ["1.3"],
  "object-alt": ["1.1"],

  // ── Theme 2: Frames ───────────────────────────────────────────────────────
  "frame-title": ["2.1", "2.2"],
  "frame-focusable-content": ["2.1"],

  // ── Theme 3: Colors ───────────────────────────────────────────────────────
  "color-contrast": ["3.2"],
  "color-contrast-enhanced": ["3.2"],
  "link-in-text-block": ["3.2", "10.6"],

  // ── Theme 4: Multimedia ───────────────────────────────────────────────────
  "video-caption": ["4.3"],
  "audio-caption": ["4.3"],
  "video-description": ["4.5"],
  blink: ["13.8"],
  marquee: ["13.8"],

  // ── Theme 5: Tables ───────────────────────────────────────────────────────
  "td-headers-attr": ["5.6", "5.7"],
  "th-has-data-cells": ["5.6"],
  "table-duplicate-name": ["5.4", "5.5"],
  "table-fake-caption": ["5.1"],
  "layout-table": ["5.8"],
  "scope-attr-valid": ["5.6"],

  // ── Theme 6: Links ────────────────────────────────────────────────────────
  "link-name": ["6.1", "6.2"],

  // ── Theme 7: Scripts ──────────────────────────────────────────────────────
  "aria-allowed-attr": ["7.1"],
  "aria-required-attr": ["7.1"],
  "aria-required-children": ["7.1"],
  "aria-required-parent": ["7.1"],
  "aria-roledescription": ["7.1"],
  "aria-roles": ["7.1"],
  "aria-valid-attr": ["7.1"],
  "aria-valid-attr-value": ["7.1"],
  "aria-hidden-body": ["7.1"],
  "aria-hidden-focus": ["7.1"],
  "status-messages-role": ["7.5"],

  // ── Theme 8: Mandatory Elements ───────────────────────────────────────────
  "duplicate-id": ["8.2"],
  "duplicate-id-aria": ["8.2"],
  "duplicate-id-active": ["8.2"],
  "html-has-lang": ["8.3"],
  "html-lang-valid": ["8.4"],
  "html-xml-lang-mismatch": ["8.3"],
  "valid-lang": ["8.7", "8.8"],
  "document-title": ["8.5", "8.6"],

  // ── Theme 9: Structure ────────────────────────────────────────────────────
  "heading-order": ["9.1"],
  "page-has-heading-one": ["9.1"],
  listitem: ["9.3"],
  list: ["9.3"],
  "definition-list": ["9.3"],

  // ── Theme 10: Presentation ────────────────────────────────────────────────
  "meta-viewport": ["10.4"],
  "meta-viewport-large": ["10.4"],
  "focus-order-semantics": ["10.7", "12.8"],
  "scrollable-region-focusable": ["10.7"],
  "css-orientation-lock": ["13.9"],

  // ── Theme 11: Forms ───────────────────────────────────────────────────────
  label: ["11.1"],
  "label-content-name-mismatch": ["11.2"],
  "label-title-only": ["11.2"],
  "select-name": ["11.1"],
  "button-name": ["11.9"],
  "form-field-multiple-labels": ["11.1"],
  radiogroup: ["11.5", "11.6"],
  "autocomplete-valid": ["11.13"],

  // ── Theme 12: Navigation ──────────────────────────────────────────────────
  "landmark-one-main": ["12.6"],
  region: ["12.6"],
  "landmark-banner-is-top-level": ["12.6"],
  "landmark-complementary-is-top-level": ["12.6"],
  "landmark-contentinfo-is-top-level": ["12.6"],
  "landmark-main-is-top-level": ["12.6"],
  "landmark-no-duplicate-banner": ["12.6"],
  "landmark-no-duplicate-contentinfo": ["12.6"],
  "landmark-no-duplicate-main": ["12.6"],
  "landmark-unique": ["12.6"],
  bypass: ["12.7"],
  "skip-link": ["12.7"],
  tabindex: ["12.8"],
  "focus-trap": ["12.9"],

  // ── Theme 13: Consultation ────────────────────────────────────────────────
  "meta-refresh": ["13.1"],
  "meta-refresh-no-exceptions": ["13.1"],
  "animation-from-interactions": ["13.8"],
};

/**
 * Returns the RGAA criterion IDs for a given axe-core rule ID.
 * Returns an empty array if the rule has no direct RGAA mapping.
 */
export function getRGAACriteria(axeRuleId: string): string[] {
  return AXE_TO_RGAA[axeRuleId] ?? [];
}

/** Pre-built reverse index: RGAA criterion ID → axe-core rule IDs */
const RGAA_TO_AXE: Readonly<Record<string, string[]>> = (() => {
  const map: Record<string, string[]> = {};
  for (const [axeId, criteria] of Object.entries(AXE_TO_RGAA)) {
    for (const c of criteria) {
      if (!map[c]) map[c] = [];
      map[c].push(axeId);
    }
  }
  return map;
})();

/**
 * Returns the axe-core rule IDs that map to a given RGAA criterion.
 */
export function getAxeRulesForCriterion(criterionId: string): string[] {
  return RGAA_TO_AXE[criterionId] ?? [];
}
