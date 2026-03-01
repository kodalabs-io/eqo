import { describe, expect, it } from "vitest";
import { parseFile } from "../../src/analyzer/static/parser.js";
import { linkRules } from "../../src/analyzer/static/rules/06-links.js";

const rule = linkRules.find((r) => r.id === "links/label-present")!;
const c = (source: string, filePath = "test.tsx") => ({
  filePath,
  ast: parseFile(source, filePath),
});

describe("links/label-present (Criterion 6.2)", () => {
  it("flags <a> with no text content and no aria label", () => {
    const issues = rule.check(c(`export const C = () => <a href="/page"></a>;`));
    expect(issues).toHaveLength(1);
    expect(issues[0]?.criterionId).toBe("6.2");
    expect(issues[0]?.testId).toBe("6.2.1");
    expect(issues[0]?.severity).toBe("error");
    expect(issues[0]?.messageKey).toBe("link.missing-label");
  });

  it("does not flag <a> with text content", () => {
    const issues = rule.check(c(`export const C = () => <a href="/page">Click here</a>;`));
    expect(issues).toHaveLength(0);
  });

  it("flags <a> with empty aria-label", () => {
    const issues = rule.check(c(`export const C = () => <a href="/page" aria-label=""></a>;`));
    expect(issues).toHaveLength(1);
    expect(issues[0]?.messageKey).toBe("link.empty-label");
  });

  it("does not flag <a> with valid aria-label", () => {
    const issues = rule.check(
      c(
        `export const C = () => <a href="/page" aria-label="Go to home"><span aria-hidden="true">→</span></a>;`,
      ),
    );
    expect(issues).toHaveLength(0);
  });

  it("does not flag <a> with aria-labelledby", () => {
    const issues = rule.check(
      c(`export const C = () => <a href="/page" aria-labelledby="heading-id"></a>;`),
    );
    expect(issues).toHaveLength(0);
  });

  it("does not flag <a> with dynamic content", () => {
    const issues = rule.check(c(`export const C = ({label}) => <a href="/page">{label}</a>;`));
    expect(issues).toHaveLength(0);
  });

  it("does not flag non-anchor elements", () => {
    const issues = rule.check(c("export const C = () => <button></button>;"));
    expect(issues).toHaveLength(0);
  });
});
