import SVGSpriter from "svg-sprite";
import fs from "fs";
import path from "path";
import { SpriteConfig } from "./types/config";
import { logger } from "./logger";
import { ensureDir, resolvePath } from "./utils/paths";
import { translateConfig } from "./utils/translate-config";
import { getErrorMessage } from "./utils/getErrorMessage";

type SpriterChunk = { contents: string | Buffer };
type SpriterResult = Record<string, Record<string, SpriterChunk>>;

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
    } catch (err: unknown) {
      logger.warn(
        `Failed to read or add ${path.basename(file)}: ${getErrorMessage(err)}`,
      );
    }
  }

  return new Promise<void>((resolve, reject) => {
    spriter.compile((error: unknown, result: unknown) => {
      if (error) {
        reject(error instanceof Error ? error : new Error(getErrorMessage(error)));
        return;
      }

      const compileResult = result as SpriterResult;

      for (const mode of Object.keys(compileResult)) {
        for (const resource of Object.keys(compileResult[mode])) {
          const chunk = compileResult[mode][resource];
          try {
            fs.writeFileSync(outputPath, chunk.contents);
            logger.success(`Generated ${config.output}`);
            resolve();
            return;
          } catch {
            logger.error(
              `Cannot write to "${config.output}"\n  Check folder permissions or update output path`,
            );
            reject(new Error("Write permission denied"));
            return;
          }
        }
      }
    });
  });
}
