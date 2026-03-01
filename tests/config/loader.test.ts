import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
/**
 * Tests for src/config/loader.ts
 * Covers prototype pollution and basic config loading.
 */
import { describe, expect, it } from "vitest";
import {
  generateDefaultConfig,
  loadConfig,
  resolveConfigPath,
} from "../../src/config/loader.js";

function makeTmpDir(): string {
  const dir = join(
    tmpdir(),
    `eqo-test-${Date.now()}-${Math.random().toString(36).slice(2)}`
  );
  mkdirSync(dir, { recursive: true });
  return dir;
}

describe("resolveConfigPath()", () => {
  it("returns null when no config file exists in directory", () => {
    const dir = makeTmpDir();
    try {
      const result = resolveConfigPath(dir);
      expect(result).toBeNull();
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("finds rgaa.config.json in directory", () => {
    const dir = makeTmpDir();
    try {
      const configPath = join(dir, "rgaa.config.json");
      writeFileSync(
        configPath,
        JSON.stringify({
          baseUrl: "http://localhost:3000",
          pages: [{ path: "/" }],
          output: [{ format: "json", path: "./report.json" }],
        })
      );
      const result = resolveConfigPath(dir);
      expect(result).toBe(configPath);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("throws when an explicit path does not exist", () => {
    const dir = makeTmpDir();
    try {
      expect(() => resolveConfigPath(dir, "nonexistent.json")).toThrow(
        /Configuration file not found/
      );
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe("loadConfig() — JSON", () => {
  it("loads a valid JSON config", async () => {
    const dir = makeTmpDir();
    try {
      writeFileSync(
        join(dir, "rgaa.config.json"),
        JSON.stringify({
          baseUrl: "http://localhost:3000",
          pages: [{ path: "/" }],
          output: [{ format: "json", path: "./report.json" }],
        })
      );
      const config = await loadConfig(dir);
      expect(config.baseUrl).toBe("http://localhost:3000");
      expect(config.pages).toHaveLength(1);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("throws on invalid config (missing required fields)", async () => {
    const dir = makeTmpDir();
    try {
      writeFileSync(
        join(dir, "rgaa.config.json"),
        JSON.stringify({ baseUrl: "http://x" })
      );
      await expect(loadConfig(dir)).rejects.toThrow(/Invalid configuration/);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("strips __proto__ key from JSON config (prototype pollution)", async () => {
    const dir = makeTmpDir();
    try {
      // Craft a JSON with __proto__ that would pollute Object.prototype
      const malicious = `{
        "__proto__": { "polluted": true },
        "baseUrl": "http://localhost:3000",
        "pages": [{ "path": "/" }],
        "output": [{ "format": "json", "path": "./report.json" }]
      }`;
      writeFileSync(join(dir, "rgaa.config.json"), malicious);
      const config = await loadConfig(dir);
      // The config loads without error (Zod strips unknown keys)
      expect(config.baseUrl).toBe("http://localhost:3000");
      // Object.prototype must NOT be polluted
      expect(
        (Object.prototype as Record<string, unknown>).polluted
      ).toBeUndefined();
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("strips constructor key from JSON config", async () => {
    const dir = makeTmpDir();
    try {
      const malicious = `{
        "constructor": { "prototype": { "polluted": "yes" } },
        "baseUrl": "http://localhost:3000",
        "pages": [{ "path": "/" }],
        "output": [{ "format": "json", "path": "./report.json" }]
      }`;
      writeFileSync(join(dir, "rgaa.config.json"), malicious);
      const config = await loadConfig(dir);
      expect(config.baseUrl).toBe("http://localhost:3000");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("throws when no config file is found", async () => {
    const dir = makeTmpDir();
    try {
      await expect(loadConfig(dir)).rejects.toThrow(
        /No configuration file found/
      );
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe("generateDefaultConfig()", () => {
  it("generates valid TypeScript config with default options", () => {
    const config = generateDefaultConfig();
    expect(config).toContain('baseUrl: "http://localhost:3000"');
    expect(config).toContain('locale: "en-US"');
    expect(config).toContain("defineConfig");
    expect(config).toContain("pages:");
    expect(config).toContain("output:");
  });

  it("accepts a custom baseUrl", () => {
    const config = generateDefaultConfig({ baseUrl: "http://localhost:4000" });
    expect(config).toContain('"http://localhost:4000"');
    expect(config).not.toContain('"http://localhost:3000"');
  });

  it("accepts a custom projectName", () => {
    const config = generateDefaultConfig({ projectName: "my-app" });
    expect(config).toContain('"my-app"');
  });

  it("accepts a custom locale", () => {
    const config = generateDefaultConfig({ locale: "fr-FR" });
    expect(config).toContain('"fr-FR"');
  });

  it("JSON.stringify-escapes special characters in projectName", () => {
    const config = generateDefaultConfig({ projectName: 'Say "hello"' });
    // JSON.stringify produces \"hello\" inside a double-quoted string
    expect(config).toContain('\\"hello\\"');
  });

  it("returns a non-empty string", () => {
    expect(generateDefaultConfig().length).toBeGreaterThan(0);
  });
});

describe("loadConfig() — JS/MJS formats", () => {
  it("loads a valid .js config (ESM default export)", async () => {
    const dir = makeTmpDir();
    try {
      writeFileSync(
        join(dir, "rgaa.config.js"),
        `export default ${JSON.stringify({
          baseUrl: "http://localhost:3000",
          pages: [{ path: "/" }],
          output: [{ format: "json", path: "./report.json" }],
        })};`
      );
      const config = await loadConfig(dir);
      expect(config.baseUrl).toBe("http://localhost:3000");
      expect(config.pages).toHaveLength(1);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("loads a valid .mjs config", async () => {
    const dir = makeTmpDir();
    try {
      writeFileSync(
        join(dir, "rgaa.config.mjs"),
        `export default ${JSON.stringify({
          baseUrl: "http://localhost:4000",
          pages: [{ path: "/home" }],
          output: [{ format: "html", path: "./report.html" }],
        })};`
      );
      const config = await loadConfig(dir);
      expect(config.baseUrl).toBe("http://localhost:4000");
      expect(config.pages[0]?.path).toBe("/home");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("throws ConfigError for invalid .js config", async () => {
    const dir = makeTmpDir();
    try {
      writeFileSync(
        join(dir, "rgaa.config.js"),
        `export default { baseUrl: "http://x" };` // missing pages and output
      );
      await expect(loadConfig(dir)).rejects.toThrow(/Invalid configuration/);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
