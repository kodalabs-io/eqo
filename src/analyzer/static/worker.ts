/**
 * Piscina worker — runs static rules on a single file.
 * This module is bundled separately by tsup (noExternal) to be self-contained.
 */
import { createHash } from "node:crypto";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import type { WorkerInput, WorkerOutput } from "../../types.js";
import { warn } from "../../utils/log.js";
import { parseFile } from "./parser.js";
import { ALL_STATIC_RULES } from "./rules/index.js";

const MAX_FILE_SIZE = 1_000_000; // 1 MB — skip oversized generated files

export default async function analyzeFile(input: WorkerInput): Promise<WorkerOutput> {
  const start = performance.now();
  const { filePath, projectRoot } = input;

  let source: string;
  try {
    // Guard against huge generated files (e.g. accidentally included bundles)
    if (!input.source) {
      const fileStat = await stat(filePath);
      if (fileStat.size > MAX_FILE_SIZE) {
        warn(
          "static",
          `Skipped oversized file ${filePath} (${fileStat.size} bytes > ${MAX_FILE_SIZE})`,
        );
        const relativePath = path.relative(projectRoot, filePath);
        return {
          filePath: relativePath,
          issues: [],
          durationMs: performance.now() - start,
          parseError: true,
        };
      }
    }
    // Async read avoids blocking the worker thread
    source = input.source || (await readFile(filePath, "utf-8"));
  } catch (err) {
    warn(
      "static",
      `Skipped unreadable file ${filePath}: ${err instanceof Error ? err.message : String(err)}`,
    );
    return { filePath, issues: [], durationMs: 0 };
  }

  const relativePath = path.relative(projectRoot, filePath);
  const sourceHash = createHash("sha256").update(source).digest("hex").slice(0, 16);

  // Parse AST once and share across all rules to avoid redundant parsing
  const ast = parseFile(source, relativePath);
  if (!ast) {
    // Track parse failures so the engine can report the count
    return {
      filePath: relativePath,
      issues: [],
      durationMs: performance.now() - start,
      parseError: true,
      sourceHash,
    };
  }

  const context = { filePath: relativePath, ast };

  const issues = ALL_STATIC_RULES.flatMap((rule) => {
    try {
      return rule.check(context) ?? [];
    } catch (err) {
      // Individual rule failures must not crash the worker
      warn(
        "static",
        `Rule "${rule.id}" failed on ${context.filePath}: ${err instanceof Error ? err.message : String(err)}`,
      );
      return [];
    }
  });

  return {
    filePath: relativePath,
    issues,
    durationMs: performance.now() - start,
    sourceHash,
  };
}
