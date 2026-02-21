import { SpriteConfig } from "./config";
import { logger } from "./logger";
import { scanIcons } from "./scanner";
import { generateSprite } from "./sprite";
import { generateTypes } from "./codegen/types";
import { generateReactComponent } from "./codegen/react";
import { generateAstroComponent } from "./codegen/astro";

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

    if (config.components) {
      const components = Array.isArray(config.components)
        ? config.components
        : Object.keys(config.components);

      if (components.includes("react")) await generateReactComponent(config);
      if (components.includes("astro")) await generateAstroComponent(config);
    }
  } catch (error: any) {
    logger.error(error.message);
    process.exit(1);
  }
}
