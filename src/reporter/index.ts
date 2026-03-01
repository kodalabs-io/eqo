import { loadTranslations } from "../i18n/index.js";
import type { OutputConfig, RGAAReport } from "../types.js";
import { warn } from "../utils/log.js";
import { writeHtmlReport } from "./html.js";
import { writeJsonReport } from "./json.js";
import { writeJunitReport } from "./junit.js";
import { writeMarkdownReport } from "./markdown.js";
import { writeSarifReport } from "./sarif.js";

/**
 * Write all configured output formats for a report.
 * Returns a list of written file paths.
 */
export async function writeReports(report: RGAAReport, outputs: OutputConfig[]): Promise<string[]> {
  // Pre-load translations so reporters can call getTranslations() synchronously
  // without requiring callers of the programmatic API to call loadTranslations() first.
  await loadTranslations(report.meta.locale);

  const results = await Promise.allSettled(
    outputs.map(async (output) => {
      switch (output.format) {
        case "json":
          await writeJsonReport(report, output);
          break;
        case "html":
          await writeHtmlReport(report, output);
          break;
        case "sarif":
          await writeSarifReport(report, output);
          break;
        case "markdown":
          await writeMarkdownReport(report, output);
          break;
        case "junit":
          await writeJunitReport(report, output);
          break;
      }
      return output.path;
    }),
  );

  const written: string[] = [];
  for (const result of results) {
    if (result.status === "fulfilled") {
      written.push(result.value);
    } else {
      warn(
        "core",
        `Failed to write report: ${result.reason instanceof Error ? result.reason.message : String(result.reason)}`,
      );
    }
  }
  return written;
}

export { printError, printInfo, printProgress, printReport, printSuccess } from "./console.js";
export { writeHtmlReport } from "./html.js";
export { writeJsonReport } from "./json.js";
export { writeJunitReport } from "./junit.js";
export { writeMarkdownReport } from "./markdown.js";
export { writeSarifReport } from "./sarif.js";
