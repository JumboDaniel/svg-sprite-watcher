import { createJiti } from "jiti";
import { pathToFileURL } from "url";
import path from "path";
import fs from "fs";
import { logger } from "./logger";
import { SpriteConfig } from "./types/config";

const DEFAULT_CONFIG: Partial<SpriteConfig> = {
  input: "src/icons",
  output: "public/sprite.svg",
  generateTypes: true,
  typesOutput: "src/sprite.d.ts",
};

export async function loadConfig(
  configPath?: string,
): Promise<SpriteConfig | null> {
  const root = process.cwd();
  const jiti = createJiti(import.meta.url);

  let resolvedPath = configPath
    ? path.resolve(root, configPath)
    : path.resolve(root, "sprite-config.js");

  if (configPath && !fs.existsSync(resolvedPath)) {
    logger.error(`Config file not found at ${resolvedPath}`);
    return null;
  }

  if (!configPath && !fs.existsSync(resolvedPath)) {
    const tsPath = path.resolve(root, "sprite-config.ts");
    if (fs.existsSync(tsPath)) {
      resolvedPath = tsPath;
    } else {
      logger.error(
        "No sprite-config.js or sprite-config.ts found. Run `pnpm svg-sprite-watcher init` first.",
      );
      return null;
    }
  }
  try {
    const fileUrl = pathToFileURL(resolvedPath).href;
    const importedConfig = (await jiti.import(fileUrl)) as any;
    const userConfig = importedConfig.default || importedConfig;

    const finalConfig = {
      ...DEFAULT_CONFIG,
      ...userConfig,
    };

    if (process.env.SPRITE_INPUT) {
      finalConfig.input = process.env.SPRITE_INPUT;
    }

    if (!finalConfig.spriteUrl) {
      // Best guess for public sprite: "/sprite.svg" instead of "public/sprite.svg"
      const basename = path.basename(finalConfig.output);
      finalConfig.spriteUrl = `/${basename}`;
    }

    return finalConfig as SpriteConfig;
  } catch (error: any) {
    logger.error(`Failed to load config file: ${error.message}`);
    return null;
  }
}
