import { readFileSync } from "node:fs";
import { defineConfig } from "tsup";

const pkg = JSON.parse(readFileSync("./package.json", "utf-8")) as {
  version: string;
};
const versionDefine = { __TOOL_VERSION__: JSON.stringify(pkg.version) };

// Disable sourcemaps in CI to reduce bundle size
const sourcemap = !process.env.CI;

export default defineConfig([
  // Main library + CLI (merged to share locale chunks instead of duplicating them)
  {
    entry: {
      index: "src/index.ts",
      "cli/index": "src/cli/index.ts",
    },
    format: ["esm"],
    target: "node22",
    dts: { entry: { index: "src/index.ts" } },
    sourcemap,
    clean: true,
    splitting: true,
    shims: false,
    // jiti is an optional runtime dependency — keep it external
    external: ["jiti"],
    define: versionDefine,
    esbuildPlugins: [
      {
        name: "cli-shebang",
        setup(build) {
          build.onEnd((result) => {
            for (const file of result.outputFiles ?? []) {
              if (file.path.endsWith("cli/index.js")) {
                file.contents = new TextEncoder().encode(
                  `#!/usr/bin/env node\n${new TextDecoder().decode(file.contents)}`,
                );
              }
            }
          });
        },
      },
    ],
  },
  // GitHub Action entrypoint (fully self-contained bundle, no external deps)
  {
    entry: {
      action: "src/action.ts",
    },
    format: ["esm"],
    target: "node22",
    noExternal: [/.*/],
    splitting: false,
    define: versionDefine,
    esbuildPlugins: [
      {
        name: "external-playwright",
        setup(build) {
          // playwright and axe-core/playwright can't be statically bundled
          // (binary deps + optional chromium-bidi peer dep)
          build.onResolve(
            {
              filter: /^(playwright(?:-core)?|@playwright\/|@axe-core\/playwright|chromium-bidi)/,
            },
            (args) => ({ path: args.path, external: true }),
          );
          // jiti can't be bundled (dynamic eval-based transpilation)
          build.onResolve({ filter: /^jiti$/ }, (args) => ({
            path: args.path,
            external: true,
          }));
        },
      },
    ],
    sourcemap,
    minify: true,
  },
  // Static analysis worker (dist/worker.js)
  // engine.ts uses _workerPath which resolves to dist/worker.js from both
  // the lib (dist/) and CLI (dist/cli/) contexts.
  {
    entry: {
      worker: "src/analyzer/static/worker.ts",
    },
    format: ["esm"],
    target: "node22",
    noExternal: [/.*/],
    treeshake: true,
    sourcemap,
    minify: true,
  },
]);
