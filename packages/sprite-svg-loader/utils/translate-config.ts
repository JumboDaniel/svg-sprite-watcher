import { Config } from "svg-sprite";
import path from "path";
import File from "vinyl";
import { SpriteConfig } from "../types/config";

export function translateConfig(
  config: SpriteConfig,
  outputDir: string,
  basename: string,
): Config {
  const baseConfig: Config = {
    mode: {
      symbol: {
        dest: ".",
        sprite: basename,
        example: false,
      },
    },
    shape: {
      id: {
        generator: (_svg: string, file: File) => {
          // Ex: "C:/project/src/icons/ui/home.svg" -> "home"
          return path.basename(file.path, ".svg");
        },
      },
    },
  };

  return {
    ...baseConfig,
    ...config.svgSpriteConfig,
    mode: {
      ...baseConfig.mode,
      ...(config.svgSpriteConfig?.mode || {}),
    },
    shape: {
      ...baseConfig.shape,
      ...(config.svgSpriteConfig?.shape || {}),
    },
  };
}
