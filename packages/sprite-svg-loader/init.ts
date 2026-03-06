#!/usr/bin/env node
import prompts from "prompts";
import fs from "fs";
import path from "path";
import { logger } from "./logger";

import type { SpriteConfig } from "./types/config";
import type { CliOptions } from "./cli";

export async function initCommand(options: CliOptions) {
  let responses: Partial<SpriteConfig> = {
    input: "src/icons",
    output: "public/sprite.svg",
    generateTypes: options.types !== false,
    typesOutput: "src/sprite.d.ts",
    spriteUrl: "",
  };

  if (!options.yes) {
    const prompted = await prompts([
      {
        type: "text",
        name: "input",
        message: "Where are your SVG icons?",
        initial: responses.input as string,
      },
      {
        type: "text",
        name: "output",
        message: "Where should the sprite be output?",
        initial: responses.output,
      },
      {
        type: "confirm",
        name: "generateTypes",
        message: "Do you want to generate TypeScript types (sprite.d.ts)?",
        initial: responses.generateTypes,
      },
      {
        type: (prev) => (prev ? "text" : null),
        name: "typesOutput",
        message: "Where should the TypeScript declarations be output?",
        initial: responses.typesOutput,
      },
      {
        type: "text",
        name: "spriteUrl",
        message:
          "What is the public URL path to your sprite? (Optional, press enter to auto-detect)",
        initial: responses.spriteUrl,
      },
    ]);

    if (!prompted.input || !prompted.output) {
      logger.error("Initialization cancelled.");
      return;
    }
    responses = { ...responses, ...prompted };
  }

  const configContent = `import type { SpriteConfig } from "svg-sprite-watcher/types/config";

export default {
  input: "${responses.input}",
  output: "${responses.output}",
${responses.spriteUrl ? `  spriteUrl: "${responses.spriteUrl}",\n` : ""}\
${responses.generateTypes === false ? `  generateTypes: false,\n` : ""}\
${responses.typesOutput && responses.typesOutput !== "src/sprite.d.ts" ? `  typesOutput: "${responses.typesOutput}",\n` : ""}\
} satisfies SpriteConfig;
`;

  const configPath = path.resolve(process.cwd(), "sprite-config.ts");
  fs.writeFileSync(configPath, configContent, "utf-8");
  logger.success("Created sprite-config.ts!");
  logger.info("Run 'pnpm svg-sprite-watcher init' to generate your sprite");
}
