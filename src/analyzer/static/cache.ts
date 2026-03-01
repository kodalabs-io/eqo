import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { RGAAIssue } from "../../types.js";

interface CacheEntry {
  hash: string;
  issues: RGAAIssue[];
}

interface AnalysisCache {
  version: string;
  entries: Record<string, CacheEntry>;
}

const CACHE_DIR = "node_modules/.cache/@kodalabs-io/eqo";
const CACHE_FILE = "analysis-cache.json";

declare const __TOOL_VERSION__: string | undefined;
const TOOL_VERSION = (typeof __TOOL_VERSION__ !== "undefined" ? __TOOL_VERSION__ : null) ?? "0.1.0";

export function fileHash(source: string): string {
  return createHash("sha256").update(source).digest("hex").slice(0, 16);
}

export async function loadCache(projectRoot: string): Promise<AnalysisCache | null> {
  try {
    const data = await readFile(path.join(projectRoot, CACHE_DIR, CACHE_FILE), "utf-8");
    const cache = JSON.parse(data) as AnalysisCache;
    // Invalidate entire cache if tool version changed
    if (cache.version !== TOOL_VERSION) return null;
    return cache;
  } catch {
    return null;
  }
}

export async function saveCache(projectRoot: string, cache: AnalysisCache): Promise<void> {
  const dir = path.join(projectRoot, CACHE_DIR);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, CACHE_FILE), JSON.stringify(cache), "utf-8");
}

export function createEmptyCache(): AnalysisCache {
  return { version: TOOL_VERSION, entries: {} };
}

export function getCachedResult(
  cache: AnalysisCache,
  filePath: string,
  sourceHash: string,
): RGAAIssue[] | null {
  const entry = cache.entries[filePath];
  if (!entry) return null;
  if (entry.hash !== sourceHash) return null;
  return entry.issues;
}

export function setCacheEntry(
  cache: AnalysisCache,
  filePath: string,
  sourceHash: string,
  issues: RGAAIssue[],
): void {
  cache.entries[filePath] = { hash: sourceHash, issues };
}
