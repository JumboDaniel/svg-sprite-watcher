import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { runCoreGenerator } from "../index";
import path from "path";
import fs from "fs";

const TEST_DIR = path.resolve(process.cwd(), ".vitest_run");
const ICONS_DIR = path.resolve(TEST_DIR, "icons");
const OUTPUT_SPRITE = path.resolve(TEST_DIR, "sprite.svg");
const TEMP_TYPES = path.resolve(TEST_DIR, "sprite.d.ts");

describe("Core Generator Pipeline Integration", () => {
  beforeEach(() => {
    // Scaffold isolated test directory
    if (fs.existsSync(TEST_DIR)) {
      fs.rmSync(TEST_DIR, { recursive: true, force: true });
    }
    fs.mkdirSync(ICONS_DIR, { recursive: true });

    // Inject fake raw SVG
    fs.writeFileSync(
      path.resolve(ICONS_DIR, "vitest-icon.svg"),
      '<svg viewBox="0 0 24 24"><path d="M12 2L2 22h20L12 2z"/></svg>',
    );
  });

  afterEach(() => {
    // Teardown
    if (fs.existsSync(TEST_DIR)) {
      fs.rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  it("end-to-end processing generates valid sprite and typings", async () => {
    await runCoreGenerator({
      input: ICONS_DIR,
      output: OUTPUT_SPRITE,
      typesOutput: TEMP_TYPES,
      generateTypes: true,
    });

    // Check disk outputs
    expect(fs.existsSync(OUTPUT_SPRITE)).toBe(true);
    expect(fs.existsSync(TEMP_TYPES)).toBe(true);

    // Validate SVG Symbol parsing execution
    const spriteContent = fs.readFileSync(OUTPUT_SPRITE, "utf-8");
    expect(spriteContent).toContain('id="vitest-icon"');
    expect(spriteContent).toContain("viewBox");

    // Validate correct piping to type definitions
    const typesContent = fs.readFileSync(TEMP_TYPES, "utf-8");
    expect(typesContent).toContain('"vitest-icon"');
  });

  it("respects generateTypes: false disabling logic", async () => {
    await runCoreGenerator({
      input: ICONS_DIR,
      output: OUTPUT_SPRITE,
      typesOutput: TEMP_TYPES,
      generateTypes: false, // Turned off
    });

    // Sprite still compiles
    expect(fs.existsSync(OUTPUT_SPRITE)).toBe(true);
    // TS Definitions do not
    expect(fs.existsSync(TEMP_TYPES)).toBe(false);
  });
});
