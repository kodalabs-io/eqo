import { describe, expect, it } from "vitest";
import { parseFile } from "../../src/analyzer/static/parser.js";
import { tableRules } from "../../src/analyzer/static/rules/05-tables.js";

const captionRule = tableRules.find((r) => r.id === "tables/caption-present")!;
const scopeRule = tableRules.find((r) => r.id === "tables/th-scope")!;
const layoutRule = tableRules.find((r) => r.id === "tables/layout-no-structural-elements")!;
const c = (source: string, filePath = "test.tsx") => ({
  filePath,
  ast: parseFile(source, filePath),
});

describe("tables/caption-present (Criterion 5.4)", () => {
  it("flags data table without caption", () => {
    const issues = captionRule.check(
      c(`export const C = () => (
        <table>
          <tbody><tr><td>Cell</td></tr></tbody>
        </table>
      );`),
    );
    expect(issues).toHaveLength(1);
    expect(issues[0]?.criterionId).toBe("5.4");
    expect(issues[0]?.severity).toBe("warning");
    expect(issues[0]?.messageKey).toBe("table.missing-caption");
  });

  it("does not flag table with caption", () => {
    const issues = captionRule.check(
      c(`export const C = () => (
        <table>
          <caption>User list</caption>
          <tbody><tr><td>Cell</td></tr></tbody>
        </table>
      );`),
    );
    expect(issues).toHaveLength(0);
  });

  it("does not flag table with aria-label", () => {
    const issues = captionRule.check(
      c(
        `export const C = () => <table aria-label="Pricing"><tbody><tr><td>x</td></tr></tbody></table>;`,
      ),
    );
    expect(issues).toHaveLength(0);
  });

  it("does not flag layout table (role=presentation)", () => {
    const issues = captionRule.check(
      c(
        `export const C = () => <table role="presentation"><tbody><tr><td>Layout</td></tr></tbody></table>;`,
      ),
    );
    expect(issues).toHaveLength(0);
  });
});

describe("tables/th-scope (Criterion 5.6)", () => {
  it("flags <th> without scope", () => {
    const issues = scopeRule.check(
      c("export const C = () => <table><thead><tr><th>Name</th></tr></thead></table>;"),
    );
    expect(issues).toHaveLength(1);
    expect(issues[0]?.criterionId).toBe("5.6");
    expect(issues[0]?.severity).toBe("warning");
  });

  it("does not flag <th> with scope", () => {
    const issues = scopeRule.check(
      c(`export const C = () => <table><thead><tr><th scope="col">Name</th></tr></thead></table>;`),
    );
    expect(issues).toHaveLength(0);
  });

  it("does not flag <th> with id (for headers association)", () => {
    const issues = scopeRule.check(
      c(
        `export const C = () => <table><thead><tr><th id="col-name">Name</th></tr></thead></table>;`,
      ),
    );
    expect(issues).toHaveLength(0);
  });
});

describe("tables/layout-no-structural-elements (Criterion 5.8)", () => {
  it("flags <th> inside layout table", () => {
    const issues = layoutRule.check(
      c(`export const C = () => (
        <table role="presentation">
          <th>Not allowed</th>
        </table>
      );`),
    );
    expect(issues).toHaveLength(1);
    expect(issues[0]?.criterionId).toBe("5.8");
    expect(issues[0]?.messageKey).toBe("table.layout-has-th");
  });

  it("flags <caption> inside layout table", () => {
    const issues = layoutRule.check(
      c(`export const C = () => (
        <table role="none">
          <caption>Not allowed</caption>
          <tbody><tr><td>Cell</td></tr></tbody>
        </table>
      );`),
    );
    expect(issues).toHaveLength(1);
    expect(issues[0]?.messageKey).toBe("table.layout-has-caption");
  });

  it("does not flag data table with structural elements", () => {
    const issues = layoutRule.check(
      c(`export const C = () => (
        <table>
          <caption>Data</caption>
          <thead><tr><th scope="col">Col</th></tr></thead>
        </table>
      );`),
    );
    expect(issues).toHaveLength(0);
  });
});
