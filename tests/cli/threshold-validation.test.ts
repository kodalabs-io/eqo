/**
 * Tests for ROB-1: --threshold validation
 * Verifies that non-numeric or out-of-range threshold values are rejected.
 *
 * TEST-4: Tests the actual exported parseThreshold() from analyze.ts
 * instead of duplicating the logic.
 */
import { describe, expect, it } from "vitest";
import { parseThreshold } from "../../src/cli/commands/analyze.js";

describe("parseThreshold() — ROB-1", () => {
  it("returns undefined when no threshold is provided", () => {
    expect(parseThreshold(undefined)).toBeUndefined();
  });

  it("parses valid integer threshold", () => {
    expect(parseThreshold("80")).toBe(80);
    expect(parseThreshold("0")).toBe(0);
    expect(parseThreshold("100")).toBe(100);
  });

  it("parses valid decimal threshold", () => {
    expect(parseThreshold("75.5")).toBe(75.5);
  });

  it("returns null for non-numeric input (NaN)", () => {
    expect(parseThreshold("abc")).toBeNull();
    expect(parseThreshold("not-a-number")).toBeNull();
  });

  it("treats empty string as 0 (Number('') === 0)", () => {
    // Number("") === 0, which is valid
    expect(parseThreshold("")).toBe(0);
  });

  it("returns null for value above 100", () => {
    expect(parseThreshold("101")).toBeNull();
    expect(parseThreshold("999")).toBeNull();
  });

  it("returns null for negative value", () => {
    expect(parseThreshold("-1")).toBeNull();
    expect(parseThreshold("-0.1")).toBeNull();
  });

  it("NaN never satisfies complianceThreshold > 0 (original bug regression)", () => {
    // This documents the old bug: Number("abc") = NaN, NaN > 0 = false
    // which silently disabled CI blocking. The new code returns null.
    const num = Number("abc");
    expect(Number.isNaN(num)).toBe(true);
    // The old buggy behaviour:
    expect(num > 0).toBe(false); // NaN comparison returns false
    // The fix: parseThreshold("abc") returns null instead of NaN
    expect(parseThreshold("abc")).toBeNull();
  });
});
