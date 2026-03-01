import { describe, expect, it } from "vitest";
import { parseFile } from "../../src/analyzer/static/parser.js";
import { frameRules } from "../../src/analyzer/static/rules/02-frames.js";

const rule = frameRules.find((r) => r.id === "frames/title-present")!;
const c = (source: string, filePath = "test.tsx") => ({
  filePath,
  ast: parseFile(source, filePath),
});

describe("frames/title-present (Criteria 2.1 / 2.2)", () => {
  it("flags <iframe> without title", () => {
    const issues = rule.check(c(`export const C = () => <iframe src="/embed" />;`));
    expect(issues).toHaveLength(1);
    expect(issues[0]?.criterionId).toBe("2.1");
    expect(issues[0]?.testId).toBe("2.1.1");
    expect(issues[0]?.severity).toBe("error");
    expect(issues[0]?.messageKey).toBe("frame.missing-title");
  });

  it("does not flag <iframe> with a non-empty title", () => {
    const issues = rule.check(
      c(`export const C = () => <iframe src="/embed" title="Video player" />;`),
    );
    expect(issues).toHaveLength(0);
  });

  it("flags <iframe> with an empty title string (criterion 2.2)", () => {
    const issues = rule.check(c(`export const C = () => <iframe src="/embed" title="" />;`));
    expect(issues).toHaveLength(1);
    expect(issues[0]?.criterionId).toBe("2.2");
    expect(issues[0]?.testId).toBe("2.2.1");
    expect(issues[0]?.messageKey).toBe("frame.empty-title");
  });

  it("does not flag <iframe> with dynamic title", () => {
    const issues = rule.check(c(`export const C = ({t}) => <iframe src="/embed" title={t} />;`));
    expect(issues).toHaveLength(0);
  });

  it("ignores non-iframe elements", () => {
    const issues = rule.check(c("export const C = () => <div><p>No iframes here</p></div>;"));
    expect(issues).toHaveLength(0);
  });

  it("flags multiple iframes with missing titles", () => {
    const issues = rule.check(
      c(`export const C = () => (
        <div>
          <iframe src="/a" />
          <iframe src="/b" title="" />
        </div>
      );`),
    );
    expect(issues).toHaveLength(2);
    expect(issues[0]?.criterionId).toBe("2.1");
    expect(issues[1]?.criterionId).toBe("2.2");
  });
});
