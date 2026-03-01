import { describe, expect, it } from "vitest";
import { parseFile } from "../../src/analyzer/static/parser.js";
import { mandatoryRules } from "../../src/analyzer/static/rules/08-mandatory.js";

const langRule = mandatoryRules.find((r) => r.id === "mandatory/html-lang")!;
const titleRule = mandatoryRules.find((r) => r.id === "mandatory/page-title")!;
const presentationalRule = mandatoryRules.find((r) => r.id === "mandatory/no-presentational-tags")!;
const c = (source: string, filePath = "test.tsx") => ({
  filePath,
  ast: parseFile(source, filePath),
});

describe("mandatory/html-lang (Criteria 8.3 / 8.4)", () => {
  it("flags <html> without lang in a layout file", () => {
    const issues = langRule.check(
      c(
        "export default function Layout() { return <html><body>...</body></html>; }",
        "src/app/layout.tsx",
      ),
    );
    expect(issues).toHaveLength(1);
    expect(issues[0]?.criterionId).toBe("8.3");
    expect(issues[0]?.messageKey).toBe("html.missing-lang");
  });

  it("flags <html> with empty lang", () => {
    const issues = langRule.check(
      c(
        `export default function Layout() { return <html lang=""><body>...</body></html>; }`,
        "src/app/layout.tsx",
      ),
    );
    expect(issues).toHaveLength(1);
    expect(issues[0]?.criterionId).toBe("8.3");
    expect(issues[0]?.messageKey).toBe("html.empty-lang");
  });

  it("flags <html> with invalid lang code (criterion 8.4)", () => {
    const issues = langRule.check(
      c(
        `export default function Layout() { return <html lang="invalid-lang-tag-that-is-way-too-long"><body>...</body></html>; }`,
        "src/app/layout.tsx",
      ),
    );
    expect(issues).toHaveLength(1);
    expect(issues[0]?.criterionId).toBe("8.4");
    expect(issues[0]?.messageKey).toBe("html.invalid-lang");
  });

  it("does not flag <html> with valid lang", () => {
    const issues = langRule.check(
      c(
        `export default function Layout() { return <html lang="en"><body>...</body></html>; }`,
        "src/app/layout.tsx",
      ),
    );
    expect(issues).toHaveLength(0);
  });

  it("does not flag <html> with valid lang-region code", () => {
    const issues = langRule.check(
      c(
        `export default function Layout() { return <html lang="fr-FR"><body>...</body></html>; }`,
        "src/app/layout.tsx",
      ),
    );
    expect(issues).toHaveLength(0);
  });

  it("does not flag <html> with dynamic lang", () => {
    const issues = langRule.check(
      c(
        "export default function Layout({locale}) { return <html lang={locale}><body>...</body></html>; }",
        "src/app/layout.tsx",
      ),
    );
    expect(issues).toHaveLength(0);
  });

  it("ignores non-layout files", () => {
    const issues = langRule.check(
      c(
        `export default function Hero() { return <html lang=""><body>...</body></html>; }`,
        "src/components/Hero.tsx",
      ),
    );
    expect(issues).toHaveLength(0);
  });
});

describe("mandatory/page-title (Criteria 8.5 / 8.6)", () => {
  it("flags layout file without <title>", () => {
    const issues = titleRule.check(
      c(
        `export default function Layout() { return <html><head><meta charSet="utf-8" /></head><body>...</body></html>; }`,
        "src/app/layout.tsx",
      ),
    );
    expect(issues).toHaveLength(1);
    expect(issues[0]?.criterionId).toBe("8.5");
    expect(issues[0]?.messageKey).toBe("html.missing-title");
  });

  it("does not flag layout file with <title>", () => {
    const issues = titleRule.check(
      c(
        "export default function Layout() { return <html><head><title>My App</title></head><body>...</body></html>; }",
        "src/app/layout.tsx",
      ),
    );
    expect(issues).toHaveLength(0);
  });

  it("ignores non-layout files", () => {
    const issues = titleRule.check(
      c("export const Card = () => <div>No title needed</div>;", "src/components/Card.tsx"),
    );
    expect(issues).toHaveLength(0);
  });
});

describe("mandatory/no-presentational-tags (Criterion 8.9)", () => {
  it("flags <font> tag with error severity", () => {
    const issues = presentationalRule.check(
      c(`export const C = () => <font color="red">Old school</font>;`),
    );
    expect(issues).toHaveLength(1);
    expect(issues[0]?.criterionId).toBe("8.9");
    expect(issues[0]?.severity).toBe("error");
    expect(issues[0]?.messageKey).toBe("html.presentational-tag");
    expect(issues[0]?.messageContext?.tag).toBe("font");
  });

  it("flags <center> tag with error severity", () => {
    const issues = presentationalRule.check(c("export const C = () => <center>Centered</center>;"));
    expect(issues).toHaveLength(1);
    expect(issues[0]?.severity).toBe("error");
  });

  it("flags <b> tag with warning severity (has semantic meaning)", () => {
    const issues = presentationalRule.check(c("export const C = () => <b>Bold text</b>;"));
    expect(issues).toHaveLength(1);
    expect(issues[0]?.severity).toBe("warning");
  });

  it("flags <i> tag with warning severity (has semantic meaning)", () => {
    const issues = presentationalRule.check(c("export const C = () => <i>Italic text</i>;"));
    expect(issues).toHaveLength(1);
    expect(issues[0]?.severity).toBe("warning");
  });

  it("does not flag semantic HTML tags", () => {
    const issues = presentationalRule.check(
      c("export const C = () => <div><strong>Bold</strong><em>Italic</em></div>;"),
    );
    expect(issues).toHaveLength(0);
  });

  it("flags multiple presentational tags", () => {
    const issues = presentationalRule.check(
      c("export const C = () => <div><blink>Blink</blink><marquee>Scroll</marquee></div>;"),
    );
    expect(issues).toHaveLength(2);
    expect(issues.every((i) => i.severity === "error")).toBe(true);
  });
});
