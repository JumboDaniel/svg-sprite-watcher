import { createJiti } from "jiti";
import path from "path";
import fs from "fs";
import { logger } from "./logger";
import { Config } from "svg-sprite";

export interface SpriteConfig {
  input: string | string[];
  output: string;
  spriteUrl?: string;
  generateTypes?: boolean;
  typesOutput?: string;
  components?:
    | string[]
    | {
        react?: string;
        astro?: string;
        vue?: string;
      };
  // We omit "dest" because we handle the output directory manually.
  // We can't use Omit for nested keys like shape.id cleanly without complex utility types,
  // so we just let them provide Partial<Config> and we intentionally override their shape.id.generator
  svgSpriteConfig?: Partial<Omit<Config, "dest">>;
  ignore?: string[];
}

const DEFAULT_CONFIG: Partial<SpriteConfig> = {
  input: "src/icons",
  output: "public/sprite.svg",
  generateTypes: true,
  typesOutput: "src/sprite.gen.ts",
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
        "No sprite-config.js or sprite-config.ts found. Run `npx svg-sprite-generate init` first.",
      );
      return null;
    }
  }

  try {
    const importedConfig = (await jiti.import(resolvedPath)) as any;
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
