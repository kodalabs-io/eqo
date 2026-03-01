import { existsSync, realpathSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { ConfigError } from "../errors.js";
import type { KodaRGAAConfig } from "../types.js";
import { KodaRGAAConfigSchema } from "./schema.js";

const CONFIG_FILE_NAMES = [
  "rgaa.config.ts",
  "rgaa.config.js",
  "rgaa.config.mjs",
  "rgaa.config.json",
];

/**
 * Resolve the configuration file path.
 * Returns null if no config file is found.
 */
export function resolveConfigPath(cwd: string, explicitPath?: string): string | null {
  if (explicitPath) {
    const resolved = path.resolve(cwd, explicitPath);
    if (!existsSync(resolved)) {
      throw new ConfigError(`Configuration file not found: ${resolved}`);
    }
    // Resolve symlinks to prevent escaping the project root via symlink
    const real = realpathSync(resolved);
    const realCwd = realpathSync(cwd);
    if (!real.startsWith(realCwd + path.sep) && real !== realCwd) {
      throw new ConfigError(`Config path must be within project directory: ${explicitPath}`);
    }
    return real;
  }

  for (const name of CONFIG_FILE_NAMES) {
    const candidate = path.join(cwd, name);
    if (existsSync(candidate)) {
      return candidate;
    }
  }

  return null;
}

/**
 * Load and validate a eqo configuration file.
 *
 * Supports .ts, .js, .mjs (via dynamic import) and .json files.
 */
export async function loadConfig(
  cwd = process.cwd(),
  explicitPath?: string,
): Promise<KodaRGAAConfig> {
  const configPath = resolveConfigPath(cwd, explicitPath);

  if (!configPath) {
    throw new ConfigError(
      "No configuration file found. " +
        "Run `eqo init` to create one, or specify the path with --config.",
    );
  }

  let raw: unknown;

  if (configPath.endsWith(".json")) {
    const { readFileSync } = await import("node:fs");
    raw = JSON.parse(readFileSync(configPath, "utf-8"), (key, value) => {
      // Prevent prototype pollution before Zod validation runs
      if (key === "__proto__" || key === "constructor" || key === "prototype") {
        return undefined;
      }
      return value;
    });
  } else if (configPath.endsWith(".ts")) {
    // Use jiti to transpile TypeScript config files at runtime.
    // jiti is an optional dependency — provide a clear error if not installed.
    let createJiti: typeof import("jiti").createJiti;
    try {
      ({ createJiti } = await import("jiti"));
    } catch {
      throw new ConfigError(
        "Loading .ts config files requires jiti.\n" +
          "Install it: npm install jiti\n" +
          "Or use a .js / .mjs config file instead.",
      );
    }
    const jiti = createJiti(import.meta.url);
    const mod = await jiti.import(configPath);
    raw = (mod as { default?: unknown }).default ?? mod;
  } else {
    // Dynamic import for .js / .mjs
    const fileUrl = pathToFileURL(configPath).href;
    const mod = await import(fileUrl);
    raw = mod.default ?? mod;
  }

  const result = KodaRGAAConfigSchema.safeParse(raw);

  if (!result.success) {
    const messages = result.error.issues
      .map((issue) => `  • ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new ConfigError(`Invalid configuration:\n${messages}`);
  }

  return result.data as KodaRGAAConfig;
}

/**
 * Generate a default configuration file content.
 */
export function generateDefaultConfig(options?: {
  baseUrl?: string;
  projectName?: string;
  locale?: string;
}): string {
  const baseUrl = options?.baseUrl ?? "http://localhost:3000";
  const projectName = options?.projectName ?? "my-project";
  const locale = options?.locale ?? "en-US";

  return `import { defineConfig } from "@kodalabs-io/eqo";

export default defineConfig({
  baseUrl: ${JSON.stringify(baseUrl)},
  projectName: ${JSON.stringify(projectName)},
  locale: ${JSON.stringify(locale)},

  pages: [
    { path: "/", name: "Home" },
  ],

  output: [
    // JSON report — consumed by your /accessibility Next.js page
    { format: "json", path: "./public/rgaa-report.json", minify: false },
    // HTML report — open in a browser for a visual overview
    { format: "html", path: "./reports/rgaa.html" },
    // SARIF — integrates with GitHub Code Scanning to annotate PRs
    { format: "sarif", path: "./reports/rgaa.sarif" },
    // Markdown — suitable for PR comments
    // { format: "markdown", path: "./reports/rgaa.md" },
  ],

  thresholds: {
    // Set complianceRate to 0 to never block CI (report is still generated).
    // Set to 80 to fail CI if fewer than 80% of auto-checkable criteria pass.
    complianceRate: 0,
    failOn: "threshold",
  },

  // Mark criteria that do not apply to your project (with justification).
  exemptions: [
    // { criterion: "4.1", reason: "No video content on this site." },
  ],

  static: {
    include: ["src/**/*.{tsx,jsx,ts,js}"],
    exclude: ["**/*.test.*", "**/*.spec.*"],
  },
});
`;
}
