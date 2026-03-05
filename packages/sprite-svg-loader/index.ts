#!/usr/bin/env node

import { SpriteConfig } from "./config";
import { logger } from "./logger";
import { scanIcons } from "./scanner";
import { generateSprite } from "./sprite";
import { generateTypes } from "./codegen/types";

export type IconName = string;

export * from "./utils/iconNames";
export * from "./utils/isValidIcon";

export async function runCoreGenerator(config: SpriteConfig) {
  try {
    logger.info(`Loading config`);
    const files = await scanIcons(config);

    if (files.length === 0) {
      logger.warn(`No SVG files found in ${config.input}`);
      return;
    }

    logger.success(`Scanned ${files.length} icons from ${config.input}`);

    await generateSprite(config, files);

    if (config.generateTypes !== false) {
      await generateTypes(config);
    }
  } catch (error: any) {
    logger.error(error.message);
    process.exit(1);
  }
}
