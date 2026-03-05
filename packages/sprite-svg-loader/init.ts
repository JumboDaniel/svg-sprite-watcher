#!/usr/bin/env node
import prompts from "prompts";
import fs from "fs";
import path from "path";
import { logger } from "./logger";

export async function initCommand() {
  const responses = await prompts([
    {
      type: "text",
      name: "input",
      message: "Where are your SVG icons?",
      initial: "src/icons",
    },
    {
      type: "text",
      name: "output",
      message: "Where should the sprite be output?",
      initial: "public/sprite.svg",
    },
    {
      type: "confirm",
      name: "generateTypes",
      message: "Do you want to generate TypeScript types (sprite.d.ts)?",
      initial: true,
    },
    {
      type: (prev) => (prev ? "text" : null),
      name: "typesOutput",
      message: "Where should the TypeScript declarations be output?",
      initial: "src/sprite.d.ts",
    },
    {
      type: "text",
      name: "spriteUrl",
      message:
        "What is the public URL path to your sprite? (Optional, press enter to auto-detect)",
      initial: "",
    },
  ]);

  if (!responses.input || !responses.output) {
    logger.error("Initialization cancelled.");
    return;
  }

  const configContent = `/** @type {import('svg-sprite-watcher').SpriteConfig} */
export default {
  input: "${responses.input}",
  output: "${responses.output}",
${responses.spriteUrl ? `  spriteUrl: "${responses.spriteUrl}",\n` : ""}\
${responses.generateTypes === false ? `  generateTypes: false,\n` : ""}\
${responses.typesOutput && responses.typesOutput !== "src/sprite.d.ts" ? `  typesOutput: "${responses.typesOutput}",\n` : ""}\
}
`;

  // Use mjs by default for better ESM support in projects that don't specify type: module
  const configPath = path.resolve(process.cwd(), "sprite-config.js");
  fs.writeFileSync(configPath, configContent, "utf-8");
  logger.success("Created sprite-config.js with JSDoc types!");
  logger.info("Run 'pnpm svg-sprite-watcher init' to generate your sprite");
}
