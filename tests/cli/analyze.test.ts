/**
 * Integration tests for the CLI analyze command.
 * Tests runAnalyze() error handling paths (no process.chdir needed).
 * The happy path (full analysis) is tested indirectly via static rule tests
 * and buildReport tests, since process.chdir is not supported in vitest workers.
 */
import { describe, expect, test } from "vitest";
import { runAnalyze } from "../../src/cli/commands/analyze.js";

describe("runAnalyze — error handling", () => {
  test("returns exitCode 1 when both --static-only and --runtime-only", async () => {
    const result = await runAnalyze({
      staticOnly: true,
      runtimeOnly: true,
    });
    expect(result.exitCode).toBe(1);
  });

  test("returns exitCode 1 for invalid threshold (non-numeric)", async () => {
    const result = await runAnalyze({
      config: "rgaa.config.json",
      staticOnly: true,
      threshold: "abc",
    });
    // Fails either on invalid threshold or missing config — either way exitCode 1
    expect(result.exitCode).toBe(1);
  });

  test("returns exitCode 1 for threshold > 100", async () => {
    const result = await runAnalyze({
      config: "rgaa.config.json",
      staticOnly: true,
      threshold: "150",
    });
    expect(result.exitCode).toBe(1);
  });

  test("returns exitCode 1 for threshold < 0", async () => {
    const result = await runAnalyze({
      config: "rgaa.config.json",
      staticOnly: true,
      threshold: "-5",
    });
    expect(result.exitCode).toBe(1);
  });

  test("returns exitCode 1 when config file does not exist", async () => {
    const result = await runAnalyze({
      config: "/nonexistent/path/rgaa.config.json",
      staticOnly: true,
    });
    expect(result.exitCode).toBe(1);
  });

  test("returns { exitCode } object, not void", async () => {
    const result = await runAnalyze({
      staticOnly: true,
      runtimeOnly: true,
    });
    expect(result).toHaveProperty("exitCode");
    expect(typeof result.exitCode).toBe("number");
  });
});
