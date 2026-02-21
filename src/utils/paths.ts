import fs from "fs";
import path from "path";

/**
 * Ensures a directory exists, creating it if necessary
 * @param dirPath The path to ensure the directory exists
 * @returns The path to the directory
 */
export function ensureDir(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Resolves a file path relative to the current working directory
 * @param filePath The path to resolve
 * @returns The resolved path
 */
export function resolvePath(filePath: string) {
  return path.resolve(process.cwd(), filePath);
}
