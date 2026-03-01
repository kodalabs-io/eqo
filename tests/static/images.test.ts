import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { parseFile } from "../../src/analyzer/static/parser.js";
import { imageRules } from "../../src/analyzer/static/rules/01-images.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturePath = path.join(__dirname, "../fixtures/sample.tsx");
const fixtureSource = readFileSync(fixturePath, "utf-8");

const context = {
  filePath: "tests/fixtures/sample.tsx",
  ast: parseFile(fixtureSource, "tests/fixtures/sample.tsx"),
};

const altRule = imageRules.find((r) => r.id === "images/alt-present")!;
const c = (source: string, filePath = "test.tsx") => ({
  filePath,
  ast: parseFile(source, filePath),
});

describe("images/alt-present (Criterion 1.1)", () => {
  it("flags <img> without alt attribute", () => {
    const issues = altRule.check(c(`export const C = () => <img src="/foo.jpg" />;`));
    expect(issues).toHaveLength(1);
    expect(issues[0]?.criterionId).toBe("1.1");
    expect(issues[0]?.testId).toBe("1.1.1");
    expect(issues[0]?.severity).toBe("error");
  });

  it("does not flag <img> with alt attribute", () => {
    const issues = altRule.check(c(`export const C = () => <img src="/foo.jpg" alt="A cat" />;`));
    expect(issues).toHaveLength(0);
  });

  it("does not flag <img> with empty alt (decorative)", () => {
    const issues = altRule.check(c(`export const C = () => <img src="/deco.svg" alt="" />;`));
    expect(issues).toHaveLength(0);
  });

  it("flags <input type='image'> without alt", () => {
    const issues = altRule.check(
      c(`export const C = () => <input type="image" src="/btn.png" />;`),
    );
    expect(issues).toHaveLength(1);
    expect(issues[0]?.testId).toBe("1.1.3");
  });

  it("flags role='img' element without aria-label", () => {
    const issues = altRule.check(c(`export const C = () => <div role="img" />;`));
    expect(issues).toHaveLength(1);
    expect(issues[0]?.messageKey).toBe("img.missing-alt-on-role-img");
  });

  it("does not flag role='img' with aria-label", () => {
    const issues = altRule.check(
      c(`export const C = () => <div role="img" aria-label="Decorative chart" />;`),
    );
    expect(issues).toHaveLength(0);
  });

  it("does not flag <svg role='img'> with dynamic aria-label", () => {
    const issues = altRule.check(
      c(`export const C = ({label}) => <svg role="img" aria-label={label} />;`),
    );
    expect(issues).toHaveLength(0);
  });

  it("detects multiple violations in fixture file", () => {
    const issues = altRule.check(context);
    // MissingAlt, RoleImgNoLabel, InputImageNoAlt
    expect(issues.length).toBeGreaterThanOrEqual(3);
  });
});

const decorativeSvgRule = imageRules.find((r) => r.id === "images/decorative-svg-hidden")!;

describe("images/decorative-svg-hidden (Criterion 1.2)", () => {
  it("flags SVG without role or aria-hidden", () => {
    const issues = decorativeSvgRule.check(
      c(`export const C = () => <svg width="24" height="24"><path /></svg>;`),
    );
    expect(issues).toHaveLength(1);
    expect(issues[0]?.criterionId).toBe("1.2");
    expect(issues[0]?.severity).toBe("notice");
  });

  it("does not flag SVG with aria-hidden='true'", () => {
    const issues = decorativeSvgRule.check(
      c(`export const C = () => <svg aria-hidden="true" width="24"><path /></svg>;`),
    );
    expect(issues).toHaveLength(0);
  });

  it("does not flag SVG with role='img'", () => {
    const issues = decorativeSvgRule.check(
      c(`export const C = () => <svg role="img" aria-label="Icon"><path /></svg>;`),
    );
    expect(issues).toHaveLength(0);
  });
});
