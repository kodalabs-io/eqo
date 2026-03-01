import type { OutputConfig, RGAAReport } from "../types.js";
import { writeOutputFile } from "./write-output.js";

export async function writeJsonReport(
  report: RGAAReport,
  outputConfig: OutputConfig,
): Promise<void> {
  let json: string;
  try {
    json = outputConfig.minify ? JSON.stringify(report) : JSON.stringify(report, null, 2);
  } catch (err) {
    throw new Error(
      `[eqo] Failed to serialize report to JSON: ${
        err instanceof Error ? err.message : String(err)
      }`,
    );
  }

  await writeOutputFile(outputConfig.path, json);
}
