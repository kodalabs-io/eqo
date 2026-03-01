import { describe, expect, it } from "vitest";
import { getRemediationLinkText } from "../../src/reporter/issue-format.js";

describe("getRemediationLinkText", () => {
  it("returns axe-core text for dequeuniversity URLs", () => {
    expect(getRemediationLinkText("https://dequeuniversity.com/rules/axe/4.9/button-name")).toBe(
      "Documentation axe-core",
    );
  });

  it("returns generic text for other URLs", () => {
    expect(getRemediationLinkText("https://example.com/docs")).toBe("Documentation");
  });

  it("returns generic text for empty string", () => {
    expect(getRemediationLinkText("")).toBe("Documentation");
  });
});
