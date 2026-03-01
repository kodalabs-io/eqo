import { describe, expect, it } from "vitest";
import { parseFile } from "../../src/analyzer/static/parser.js";
import { structureRules } from "../../src/analyzer/static/rules/09-structure.js";

const headingRule = structureRules.find((r) => r.id === "structure/heading-hierarchy")!;
const listRule = structureRules.find((r) => r.id === "structure/lists-structure")!;
const c = (source: string, filePath = "test.tsx") => ({
  filePath,
  ast: parseFile(source, filePath),
});

describe("structure/heading-hierarchy (Criterion 9.1)", () => {
  it("flags skipped heading level h1 → h3", () => {
    const issues = headingRule.check(
      c(`
        export const C = () => (
          <div><h1>Title</h1><h3>Skipped</h3></div>
        );`),
    );
    expect(issues.some((i) => i.messageKey === "heading.skipped-level")).toBe(true);
  });

  it("does not flag consecutive heading levels", () => {
    const issues = headingRule.check(
      c(`
        export const C = () => (
          <div><h1>Title</h1><h2>Section</h2><h3>Subsection</h3></div>
        );`),
    );
    expect(issues.filter((i) => i.messageKey === "heading.skipped-level")).toHaveLength(0);
  });

  it("flags multiple h1 elements", () => {
    const issues = headingRule.check(
      c(`
        export const C = () => (
          <div><h1>First</h1><h1>Second</h1></div>
        );`),
    );
    expect(issues.some((i) => i.messageKey === "heading.multiple-h1")).toBe(true);
  });

  it("does not flag a single h1", () => {
    const issues = headingRule.check(c("export const C = () => <h1>Page title</h1>;"));
    expect(issues.filter((i) => i.messageKey === "heading.multiple-h1")).toHaveLength(0);
  });
});

describe("structure/lists-structure (Criterion 9.3)", () => {
  it("flags <div> as direct child of <ul>", () => {
    const issues = listRule.check(
      c(`
        export const C = () => (
          <ul>
            <li>Valid</li>
            <div>Invalid</div>
          </ul>
        );`),
    );
    expect(issues).toHaveLength(1);
    expect(issues[0]?.messageKey).toBe("list.invalid-child");
  });

  it("does not flag <li> as direct child of <ul>", () => {
    const issues = listRule.check(
      c(`
        export const C = () => (
          <ul><li>Item 1</li><li>Item 2</li></ul>
        );`),
    );
    expect(issues).toHaveLength(0);
  });
});
