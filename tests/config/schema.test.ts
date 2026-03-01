import { describe, expect, it } from "vitest";
import {
  ExemptionConfigSchema,
  KodaRGAAConfigSchema,
  OutputConfigSchema,
  PageConfigSchema,
} from "../../src/config/schema.js";

describe("PageConfigSchema", () => {
  it("accepts valid page with path starting with /", () => {
    expect(PageConfigSchema.safeParse({ path: "/" }).success).toBe(true);
    expect(PageConfigSchema.safeParse({ path: "/about", name: "About" }).success).toBe(true);
  });

  it("rejects page path not starting with /", () => {
    expect(PageConfigSchema.safeParse({ path: "about" }).success).toBe(false);
  });
});

describe("OutputConfigSchema", () => {
  it("accepts all valid formats", () => {
    for (const format of ["json", "html", "sarif", "markdown", "junit"]) {
      expect(OutputConfigSchema.safeParse({ format, path: `./out.${format}` }).success).toBe(true);
    }
  });

  it("rejects empty path", () => {
    expect(OutputConfigSchema.safeParse({ format: "json", path: "" }).success).toBe(false);
  });

  it("rejects unknown format", () => {
    expect(OutputConfigSchema.safeParse({ format: "csv", path: "./out.csv" }).success).toBe(false);
  });

  it("defaults minify to false", () => {
    const result = OutputConfigSchema.parse({ format: "json", path: "./out.json" });
    expect(result.minify).toBe(false);
  });
});

describe("ExemptionConfigSchema", () => {
  it("accepts valid exemption", () => {
    expect(
      ExemptionConfigSchema.safeParse({ criterion: "4.1", reason: "No video content on this site" })
        .success,
    ).toBe(true);
  });

  it("rejects invalid criterion format", () => {
    expect(
      ExemptionConfigSchema.safeParse({ criterion: "4", reason: "No video content on this site" })
        .success,
    ).toBe(false);
    expect(
      ExemptionConfigSchema.safeParse({
        criterion: "4.1.1",
        reason: "No video content on this site",
      }).success,
    ).toBe(false);
  });

  it("rejects reason shorter than 10 characters", () => {
    expect(ExemptionConfigSchema.safeParse({ criterion: "4.1", reason: "short" }).success).toBe(
      false,
    );
  });
});

describe("KodaRGAAConfigSchema", () => {
  const validConfig = {
    baseUrl: "http://localhost:3000",
    pages: [{ path: "/" }],
    output: [{ format: "json", path: "./report.json" }],
  };

  it("accepts minimal valid config", () => {
    expect(KodaRGAAConfigSchema.safeParse(validConfig).success).toBe(true);
  });

  it("applies defaults for optional fields", () => {
    const result = KodaRGAAConfigSchema.parse(validConfig);
    expect(result.locale).toBe("en-US");
    expect(result.exemptions).toEqual([]);
  });

  it("rejects baseUrl with non-http protocol", () => {
    const result = KodaRGAAConfigSchema.safeParse({
      ...validConfig,
      baseUrl: "file:///etc/passwd",
    });
    expect(result.success).toBe(false);
  });

  it("rejects ftp protocol", () => {
    const result = KodaRGAAConfigSchema.safeParse({ ...validConfig, baseUrl: "ftp://server/path" });
    expect(result.success).toBe(false);
  });

  it("accepts https", () => {
    const result = KodaRGAAConfigSchema.safeParse({
      ...validConfig,
      baseUrl: "https://example.com",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty pages array", () => {
    expect(KodaRGAAConfigSchema.safeParse({ ...validConfig, pages: [] }).success).toBe(false);
  });

  it("rejects empty output array", () => {
    expect(KodaRGAAConfigSchema.safeParse({ ...validConfig, output: [] }).success).toBe(false);
  });

  it("validates threshold range", () => {
    const withThreshold = { ...validConfig, thresholds: { complianceRate: 150 } };
    expect(KodaRGAAConfigSchema.safeParse(withThreshold).success).toBe(false);

    const valid = { ...validConfig, thresholds: { complianceRate: 80 } };
    expect(KodaRGAAConfigSchema.safeParse(valid).success).toBe(true);
  });
});
