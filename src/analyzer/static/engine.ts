import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import picomatch from "picomatch";
import Piscina from "piscina";
import type {
  RGAAIssue,
  StaticConfig,
  WorkerInput,
  WorkerOutput,
} from "../../types.js";
import { warn } from "../../utils/log.js";
import { raceWithTimeout } from "../../utils/race-with-timeout.js";
import {
  createEmptyCache,
  fileHash,
  getCachedResult,
  loadCache,
  saveCache,
  setCacheEntry,
} from "./cache.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Worker is always at dist/worker.js. When engine is bundled into dist/cli/index.js
// (__dirname = dist/cli/), the worker is one level up. Otherwise it is in the same dir.
const _workerInSameDir = path.join(__dirname, "worker.js");
const _workerPath = existsSync(_workerInSameDir)
  ? _workerInSameDir
  : path.join(__dirname, "../worker.js");

const SUPPORTED_EXTENSIONS = new Set([".tsx", ".jsx", ".ts", ".js", ".mjs"]);
const SKIP_DIRS = new Set(["node_modules", ".git", "dist", ".next"]);
const WORKER_TIMEOUT_MS = 30_000;

type GlobMatcher = (path: string) => boolean;

/** Compile a glob pattern to a matcher function using picomatch. */
export function compileGlob(pattern: string): GlobMatcher {
  return picomatch(pattern, { dot: false });
}

function shouldInclude(
  relativePath: string,
  includeFns: GlobMatcher[],
  excludeFns: GlobMatcher[]
): boolean {
  return (
    includeFns.some((fn) => fn(relativePath)) &&
    !excludeFns.some((fn) => fn(relativePath))
  );
}

/**
 * Stream file paths matching the include/exclude patterns.
 * Uses an AsyncGenerator to start analysis before the full directory walk completes,
 * reducing peak memory on large repositories.
 */
async function* collectFiles(
  dir: string,
  projectRoot: string,
  includeFns: GlobMatcher[],
  excludeFns: GlobMatcher[]
): AsyncGenerator<string> {
  async function* walkDir(current: string): AsyncGenerator<string> {
    const entries = await readdir(current, { withFileTypes: true });
    // Sequential traversal prevents EMFILE errors on large repositories
    for (const entry of entries) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        if (SKIP_DIRS.has(entry.name)) continue;
        yield* walkDir(full);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name);
        if (!SUPPORTED_EXTENSIONS.has(ext)) continue;
        const rel = path.relative(projectRoot, full);
        if (shouldInclude(rel, includeFns, excludeFns)) {
          yield full;
        }
      }
    }
  }

  yield* walkDir(dir);
}

export interface StaticAnalysisResult {
  issues: RGAAIssue[];
  filesAnalyzed: number;
  durationMs: number;
  /** Number of files served from cache (0 when cache is disabled) */
  cacheHits: number;
}

export interface StaticAnalysisOptions {
  /** Disable the incremental analysis cache */
  noCache?: boolean | undefined;
}

export async function runStaticAnalysis(
  projectRoot: string,
  config: StaticConfig = {},
  options: StaticAnalysisOptions = {}
): Promise<StaticAnalysisResult> {
  const start = performance.now();
  const useCache = !options.noCache;

  const include = config.include ?? ["src/**/*.{tsx,jsx,ts,js}"];
  const exclude = config.exclude ?? [
    "**/*.test.*",
    "**/*.spec.*",
    "**/node_modules/**",
    "**/.next/**",
    "**/dist/**",
  ];

  // Pre-compile glob patterns once to avoid repeated matching per file
  const includeFns = include.map(compileGlob);
  const excludeFns = exclude.map(compileGlob);

  // ── Load incremental cache ──────────────────────────────────────────────
  const cache = useCache
    ? (await loadCache(projectRoot)) ?? createEmptyCache()
    : null;

  const pool = new Piscina({
    filename: _workerPath,
    maxThreads: Math.max(2, os.cpus().length - 1),
    idleTimeout: 5000,
  });

  // Stream files and process in batches
  const BATCH_SIZE = 500;
  const allResults: PromiseSettledResult<WorkerOutput>[] = [];
  const allFilePaths: string[] = [];
  const cachedIssues: RGAAIssue[] = [];
  // track every relative path analyzed in this run for stale-entry pruning
  const analyzedRelPaths = new Set<string>();
  let totalFiles = 0;
  let cacheHits = 0;
  // batch holds WorkerInput (may include pre-read source) instead of plain strings
  let batch: WorkerInput[] = [];

  try {
    for await (const filePath of collectFiles(
      projectRoot,
      projectRoot,
      includeFns,
      excludeFns
    )) {
      totalFiles++;

      // ── Check cache before dispatching to worker ──────────────────────
      if (cache) {
        const relPath = path.relative(projectRoot, filePath);
        analyzedRelPaths.add(relPath); // track regardless of hit/miss
        try {
          const source = await readFile(filePath, "utf-8");
          const hash = fileHash(source);
          const cached = getCachedResult(cache, relPath, hash);
          if (cached) {
            cacheHits++;
            cachedIssues.push(...cached);
            continue;
          }
          // pass already-read source so the worker skips its own readFile
          batch.push({ filePath, source, projectRoot });
        } catch {
          // If we can't read the file for cache check, let the worker handle it
          batch.push({ filePath, projectRoot });
        }
      } else {
        batch.push({ filePath, projectRoot });
      }

      if (batch.length >= BATCH_SIZE) {
        const batchResults = await Promise.allSettled(
          batch.map((workItem) =>
            raceWithTimeout(
              pool.run(workItem) as Promise<WorkerOutput>,
              WORKER_TIMEOUT_MS,
              `Worker timed out after ${WORKER_TIMEOUT_MS}ms`
            )
          )
        );
        allResults.push(...batchResults);
        allFilePaths.push(...batch.map((w) => w.filePath));
        batch = [];
      }
    }

    // Process remaining files
    if (batch.length > 0) {
      const batchResults = await Promise.allSettled(
        batch.map((workItem) =>
          raceWithTimeout(
            pool.run(workItem) as Promise<WorkerOutput>,
            WORKER_TIMEOUT_MS,
            `Worker timed out after ${WORKER_TIMEOUT_MS}ms`
          )
        )
      );
      allResults.push(...batchResults);
      allFilePaths.push(...batch.map((w) => w.filePath));
    }
  } finally {
    await raceWithTimeout(
      pool.destroy(),
      10_000,
      "Worker pool destroy timed out after 10s"
    ).catch((err) => {
      warn(
        "core",
        `Failed to destroy worker pool: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
    });
  }

  if (totalFiles === 0) {
    return {
      issues: [],
      filesAnalyzed: 0,
      durationMs: performance.now() - start,
      cacheHits: 0,
    };
  }

  const issues: RGAAIssue[] = [...cachedIssues];
  let failedCount = 0;
  let parseErrorCount = 0;

  for (const [i, result] of allResults.entries()) {
    if (result.status === "fulfilled") {
      const output = result.value;
      issues.push(...output.issues);
      if (output.parseError) parseErrorCount++;

      // Update cache with new results
      if (cache && output.sourceHash) {
        setCacheEntry(cache, output.filePath, output.sourceHash, output.issues);
      }
    } else {
      failedCount++;
      const fp = allFilePaths[i] ?? "unknown";
      const reason =
        result.reason instanceof Error
          ? result.reason.message
          : String(result.reason);
      warn("static", `Failed: ${path.relative(projectRoot, fp)} — ${reason}`);
    }
  }
  if (failedCount > 0) {
    warn(
      "static",
      `${failedCount}/${allResults.length} file(s) failed to analyze (see above)`
    );
  }
  if (parseErrorCount > 0) {
    warn(
      "static",
      `${parseErrorCount}/${allResults.length} file(s) could not be parsed (syntax errors or binary files)`
    );
  }

  // ── Persist cache for next run ──────────────────────────────────────────
  if (cache) {
    // Prune entries for files no longer present in the analyzed set
    // (deleted or renamed files would otherwise accumulate indefinitely)
    for (const key of Object.keys(cache.entries)) {
      if (!analyzedRelPaths.has(key)) delete cache.entries[key];
    }
    try {
      await saveCache(projectRoot, cache);
    } catch (err) {
      warn(
        "static",
        `Failed to save analysis cache: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
    }
  }

  return {
    issues,
    filesAnalyzed: totalFiles,
    durationMs: performance.now() - start,
    cacheHits,
  };
}
