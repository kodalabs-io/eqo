import { describe, expect, it } from "vitest";
import { parseFile } from "../../src/analyzer/static/parser.js";
import { formRules } from "../../src/analyzer/static/rules/11-forms.js";

const labelRule = formRules.find((r) => r.id === "forms/label-present")!;
const fieldsetRule = formRules.find((r) => r.id === "forms/fieldset-legend")!;
const buttonRule = formRules.find((r) => r.id === "forms/button-label")!;
const autocompleteRule = formRules.find((r) => r.id === "forms/autocomplete-personal-data")!;
const c = (source: string, filePath = "test.tsx") => ({
  filePath,
  ast: parseFile(source, filePath),
});

describe("forms/label-present (Criterion 11.1)", () => {
  it("flags <input> without id and without aria-label", () => {
    const issues = labelRule.check(
      c(`export const C = () => <input type="text" name="username" />;`),
    );
    expect(issues.length).toBeGreaterThan(0);
    expect(issues[0]?.criterionId).toBe("11.1");
    expect(issues[0]?.severity).toBe("error");
  });

  it("does not flag <input> with id (external label possible)", () => {
    const issues = labelRule.check(
      c(`export const C = () => <input id="username" type="text" />;`),
    );
    expect(issues).toHaveLength(0);
  });

  it("does not flag <input> with aria-label", () => {
    const issues = labelRule.check(
      c(`export const C = () => <input type="text" aria-label="Username" />;`),
    );
    expect(issues).toHaveLength(0);
  });

  it("flags placeholder-only as warning (not error)", () => {
    const issues = labelRule.check(
      c(`export const C = () => <input type="text" placeholder="Enter name" />;`),
    );
    expect(issues.length).toBeGreaterThan(0);
    expect(issues[0]?.severity).toBe("warning");
  });

  it("does not flag <input type='hidden'>", () => {
    const issues = labelRule.check(
      c(`export const C = () => <input type="hidden" name="csrf" />;`),
    );
    expect(issues).toHaveLength(0);
  });

  it("does not flag <input type='submit'>", () => {
    const issues = labelRule.check(
      c(`export const C = () => <input type="submit" value="Send" />;`),
    );
    expect(issues).toHaveLength(0);
  });
});

describe("forms/fieldset-legend (Criterion 11.6)", () => {
  it("flags <fieldset> without <legend>", () => {
    const issues = fieldsetRule.check(
      c(`
        export const C = () => (
          <fieldset>
            <input type="radio" name="a" />
          </fieldset>
        );`),
    );
    expect(issues).toHaveLength(1);
    expect(issues[0]?.criterionId).toBe("11.6");
    expect(issues[0]?.testId).toBe("11.6.1");
  });

  it("does not flag <fieldset> with <legend>", () => {
    const issues = fieldsetRule.check(
      c(`
        export const C = () => (
          <fieldset>
            <legend>Contact method</legend>
            <input type="radio" name="contact" />
          </fieldset>
        );`),
    );
    expect(issues).toHaveLength(0);
  });

  it("flags role='group' without accessible name", () => {
    const issues = fieldsetRule.check(
      c(`export const C = () => <div role="group"><input type="checkbox" /></div>;`),
    );
    expect(issues).toHaveLength(1);
    expect(issues[0]?.testId).toBe("11.6.2");
  });
});

describe("forms/button-label (Criterion 11.9)", () => {
  it("flags empty <button>", () => {
    const issues = buttonRule.check(c("export const C = () => <button></button>;"));
    expect(issues).toHaveLength(1);
    expect(issues[0]?.criterionId).toBe("11.9");
  });

  it("does not flag <button> with text content", () => {
    const issues = buttonRule.check(c("export const C = () => <button>Submit</button>;"));
    expect(issues).toHaveLength(0);
  });

  it("does not flag <button> with aria-label", () => {
    const issues = buttonRule.check(
      c(
        `export const C = () => <button aria-label="Close modal"><span aria-hidden="true">×</span></button>;`,
      ),
    );
    expect(issues).toHaveLength(0);
  });
});

describe("forms/autocomplete-personal-data (Criterion 11.13)", () => {
  it("flags email input without autocomplete", () => {
    const issues = autocompleteRule.check(
      c(`export const C = () => <input type="email" name="email" />;`),
    );
    expect(issues).toHaveLength(1);
    expect(issues[0]?.criterionId).toBe("11.13");
    expect(issues[0]?.severity).toBe("warning");
  });

  it("does not flag email input with autocomplete", () => {
    const issues = autocompleteRule.check(
      c(`export const C = () => <input type="email" name="email" autocomplete="email" />;`),
    );
    expect(issues).toHaveLength(0);
  });

  it("does not flag generic text inputs", () => {
    const issues = autocompleteRule.check(
      c(`export const C = () => <input type="text" name="search" />;`),
    );
    expect(issues).toHaveLength(0);
  });
});
