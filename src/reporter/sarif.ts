import { getTranslations } from "../i18n/index.js";
import type { OutputConfig, RGAAIssue, RGAAReport } from "../types.js";
import { resolveIssueMessage } from "./issue-format.js";
import { writeOutputFile } from "./write-output.js";

// SARIF 2.1.0 — https://docs.oasis-open.org/sarif/sarif/v2.1.0/sarif-v2.1.0.html

interface SarifLog {
  $schema: string;
  version: "2.1.0";
  runs: SarifRun[];
}

interface SarifRun {
  tool: {
    driver: {
      name: string;
      version: string;
      informationUri: string;
      rules: SarifRule[];
    };
  };
  results: SarifResult[];
  artifacts: SarifArtifact[];
}

interface SarifRule {
  id: string;
  name: string;
  shortDescription: { text: string };
  fullDescription?: { text: string };
  helpUri?: string;
  properties?: { tags: string[] };
}

interface SarifResult {
  ruleId: string;
  level: "error" | "warning" | "note";
  message: { text: string };
  locations?: SarifLocation[];
}

interface SarifLocation {
  physicalLocation?: {
    artifactLocation: { uri: string; uriBaseId: string };
    region?: { startLine: number; startColumn?: number };
  };
  logicalLocations?: Array<{ name: string; kind: string }>;
}

interface SarifArtifact {
  location: { uri: string; uriBaseId: string };
}

/**
 * Strip HTML tags from an element string and truncate for use in plain-text SARIF messages.
 * SARIF message.text must be plain text; raw DOM HTML can contain control chars and quotes.
 */
function sanitizeElement(el: string, maxLen = 200): string {
  const stripped = el
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return stripped.length > maxLen ? `${stripped.slice(0, maxLen)}…` : stripped;
}

function issueToLevel(issue: RGAAIssue): SarifResult["level"] {
  switch (issue.severity) {
    case "error":
      return "error";
    case "warning":
      return "warning";
    default:
      return "note";
  }
}

export async function writeSarifReport(
  report: RGAAReport,
  outputConfig: OutputConfig,
): Promise<void> {
  // Build unique rules from criteria
  const rulesMap = new Map<string, SarifRule>();

  for (const theme of report.themes) {
    for (const criterion of theme.criteriaResults) {
      const ruleId = `RGAA-${criterion.id}`;
      if (!rulesMap.has(ruleId)) {
        rulesMap.set(ruleId, {
          id: ruleId,
          name: `Criterion${criterion.id.replace(".", "_")}`,
          shortDescription: { text: `RGAA 4.1.2 — Criterion ${criterion.id}` },
          helpUri: `https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#${criterion.id}`,
          properties: { tags: ["accessibility", "rgaa", "wcag"] },
        });
      }
    }
  }

  const t = getTranslations(report.meta.locale);
  const artifactsMap = new Map<string, SarifArtifact>();

  const results: SarifResult[] = report.issues
    .filter((issue) => issue.criterionId !== "unknown")
    .map((issue) => {
      const locations: SarifLocation[] = [];

      if (issue.file) {
        const uri = issue.file.replace(/\\/g, "/").replace(/^\.\//, "");
        // Skip paths that escape project root
        if (!uri.startsWith("../")) {
          if (!artifactsMap.has(uri)) {
            artifactsMap.set(uri, {
              location: { uri, uriBaseId: "%SRCROOT%" },
            });
          }
          locations.push({
            physicalLocation: {
              artifactLocation: { uri, uriBaseId: "%SRCROOT%" },
              ...(issue.line
                ? {
                    region: {
                      startLine: issue.line,
                      ...(issue.column !== undefined ? { startColumn: issue.column } : {}),
                    },
                  }
                : {}),
            },
          });
        }
      }

      if (issue.page) {
        locations.push({
          logicalLocations: [{ name: issue.page, kind: "page" }],
        });
      }

      const messageText = [
        resolveIssueMessage(issue, t),
        issue.element ? `Element: ${sanitizeElement(issue.element)}` : null,
      ]
        .filter(Boolean)
        .join(" — ");

      return {
        ruleId: `RGAA-${issue.criterionId}`,
        level: issueToLevel(issue),
        message: { text: messageText },
        ...(locations.length > 0 ? { locations } : {}),
      };
    });

  const sarifLog: SarifLog = {
    $schema:
      "https://raw.githubusercontent.com/oasis-tcs/sarif-spec/main/Schemata/sarif-schema-2.1.0.json",
    version: "2.1.0",
    runs: [
      {
        tool: {
          driver: {
            name: "@kodalabs-io/eqo",
            version: report.meta.toolVersion,
            informationUri: "https://github.com/kodalabs-io/eqo",
            rules: Array.from(rulesMap.values()),
          },
        },
        results,
        artifacts: Array.from(artifactsMap.values()),
      },
    ],
  };

  await writeOutputFile(outputConfig.path, JSON.stringify(sarifLog, null, 2));
}
