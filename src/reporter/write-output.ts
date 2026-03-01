import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * Ensure the parent directory exists and write content to a file.
 * Shared by all reporters to avoid repeating the mkdir + writeFile pattern.
 */
export async function writeOutputFile(filePath: string, content: string): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, content, "utf-8");
}
