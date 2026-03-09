import { describe, it, expect } from "vitest";
import { resolvePath, ensureDir } from "../utils/paths";
import path from "path";
import fs from "fs";

describe("utils/paths", () => {
  it("resolvePath should resolve a path relative to process.cwd()", () => {
    const relativePath = "src/icons";
    const expected = path.resolve(process.cwd(), relativePath);
    expect(resolvePath(relativePath)).toBe(expected);
  });

  it("ensureDir should create a directory if it does not exist", () => {
    const testDir = path.resolve(process.cwd(), ".vitest_temp_dir");

    // Clean up if it already exists from a previous failed run
    if (fs.existsSync(testDir)) {
      fs.rmdirSync(testDir);
    }

    expect(fs.existsSync(testDir)).toBe(false);

    ensureDir(testDir);

    expect(fs.existsSync(testDir)).toBe(true);

    // Cleanup after test
    fs.rmdirSync(testDir);
  });
});
