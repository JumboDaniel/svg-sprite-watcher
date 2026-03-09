import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { generateTypes } from "../codegen/types";
import fs from "fs";
import path from "path";

describe("codegen/types", () => {
  const tempOutput = path.resolve(process.cwd(), ".vitest_sprite.svg");
  const tempTypes = path.resolve(process.cwd(), ".vitest_sprite.d.ts");

  beforeEach(() => {
    // Write a mock SVG sprite simulating typical core generator output
    fs.writeFileSync(
      tempOutput,
      `
      <svg>
        <symbol id="arrow-left"></symbol>
        <symbol id="check-circle"></symbol>
        <symbol id="close-icon"></symbol>
      </svg>
    `,
    );
  });

  afterEach(() => {
    // Cleanup fake files
    if (fs.existsSync(tempOutput)) fs.unlinkSync(tempOutput);
    if (fs.existsSync(tempTypes)) fs.unlinkSync(tempTypes);
  });

  it("generates correct type definitions parsing icon IDs from the sprite", async () => {
    await generateTypes({
      input: "src/icons",
      output: ".vitest_sprite.svg",
      typesOutput: ".vitest_sprite.d.ts",
      generateTypes: true,
    });

    expect(fs.existsSync(tempTypes)).toBe(true);

    const dtsContent = fs.readFileSync(tempTypes, "utf-8");
    expect(dtsContent).toContain('declare module "svg-sprite-watcher"');
    expect(dtsContent).toContain("export type IconName =");
    expect(dtsContent).toContain(' | "arrow-left"');
    expect(dtsContent).toContain(' | "check-circle"');
    expect(dtsContent).toContain(' | "close-icon"');
  });

  it("skips generation completely if typesOutput is undefined or falsy", async () => {
    await generateTypes({
      input: "src/icons",
      output: ".vitest_sprite.svg",
      typesOutput: "",
    });

    expect(fs.existsSync(tempTypes)).toBe(false);
  });
});
