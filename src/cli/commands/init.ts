import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import pc from "picocolors";
import { generateDefaultConfig } from "../../config/loader.js";
import { printError, printInfo, printSuccess } from "../../reporter/console.js";

export interface InitOptions {
  baseUrl?: string;
  projectName?: string;
  locale?: string;
  force?: boolean;
}

export async function runInit(options: InitOptions): Promise<void> {
  const cwd = process.cwd();
  const configPath = path.join(cwd, "rgaa.config.ts");

  // Auto-detect project name from package.json
  let projectName = options.projectName;
  if (!projectName) {
    try {
      const pkg = JSON.parse(
        await readFile(path.join(cwd, "package.json"), "utf-8"),
        (key, value) => {
          if (key === "__proto__" || key === "constructor" || key === "prototype") {
            return undefined;
          }
          return value;
        },
      );
      projectName = pkg.name ?? undefined;
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err;
    }
  }

  const content = generateDefaultConfig({
    baseUrl: options.baseUrl ?? "http://localhost:3000",
    ...(projectName !== undefined ? { projectName } : {}),
    locale: options.locale ?? "en-US",
  });

  if (!options.force) {
    // Atomic create-or-fail — eliminates TOCTOU race between existence check and write
    try {
      await writeFile(configPath, content, { flag: "wx", encoding: "utf-8" });
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === "EEXIST") {
        printError(
          `Configuration file already exists at ${pc.underline(
            "rgaa.config.ts",
          )}. Use --force to overwrite.`,
        );
        return;
      }
      throw err;
    }
  } else {
    await writeFile(configPath, content, "utf-8");
  }

  printSuccess(`Configuration file created at ${pc.underline("rgaa.config.ts")}`);
  console.log("");
  printInfo("Next steps:");
  console.log(`  1. Edit ${pc.bold("rgaa.config.ts")} to configure your pages and output formats`);
  console.log(`  2. Run ${pc.bold("npx eqo analyze")} to start your first audit`);
  console.log(
    `  3. Add the report to your ${pc.bold("/accessibility")} page using the generated JSON`,
  );
  console.log("");
}
