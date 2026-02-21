import SVGSpriter from "svg-sprite";
import fs from "fs";
import path from "path";
import { SpriteConfig } from "./config";
import { logger } from "./logger";
import { ensureDir, resolvePath } from "./utils/paths";
import { translateConfig } from "./utils/translate-config";

export async function generateSprite(config: SpriteConfig, files: string[]) {
  const outputPath = resolvePath(config.output);
  const outputDir = path.dirname(outputPath);
  const basename = path.basename(outputPath);

  ensureDir(outputDir);

  const spriterConfig = translateConfig(config, outputDir, basename);
  const spriter = new SVGSpriter(spriterConfig);

  for (const file of files) {
    try {
      const content = fs.readFileSync(file, "utf-8");

      if (!content.includes("<svg") || !content.includes("</svg>")) {
        logger.warn(
          `Skipped ${path.basename(file)} (malformed XML)\n  Fix the file or add to ignore list in sprite.config.js`,
        );
        continue;
      }

      spriter.add(file, null, content);
    } catch (err: any) {
      logger.warn(
        `Failed to read or add ${path.basename(file)}: ${err.message}`,
      );
    }
  }

  return new Promise<void>((resolve, reject) => {
    spriter.compile((error: any, result: any, data: any) => {
      if (error) {
        return reject(error);
      }

      for (const mode in result) {
        for (const resource in result[mode]) {
          const chunk = result[mode][resource];
          try {
            fs.writeFileSync(outputPath, chunk.contents);
            logger.success(`Generated ${config.output}`);
            resolve();
          } catch (err: any) {
            logger.error(
              `Cannot write to "${config.output}"\n  Check folder permissions or update output path`,
            );
            reject(new Error("Write permission denied"));
          }
        }
      }
    });
  });
}
