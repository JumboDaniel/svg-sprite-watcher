import { glob } from "glob";
import fs from "fs";
import { SpriteConfig } from "./types/config";
import { logger } from "./logger";
import { resolvePath } from "./utils/paths";

export async function scanIcons(config: SpriteConfig): Promise<string[]> {
  const inputs = Array.isArray(config.input) ? config.input : [config.input];
  const nameMap = new Map<string, string>();

  const filesByInput = await Promise.all(
    inputs.map(async (input) => {
      const inputPath = resolvePath(input);

      if (!fs.existsSync(inputPath)) {
        logger.error(`Input folder "${input}" does not exist`);
        throw new Error(`Input folder missing: ${input}`);
      }

      const pattern = `${inputPath}/**/*.svg`.replace(/\\/g, "/");
      return glob(pattern, {
        ignore: config.ignore?.map((i) =>
          `${inputPath}/**/${i}`.replace(/\\/g, "/"),
        ),
      });
    }),
  );

  for (const files of filesByInput) {
    for (const file of files) {
      const match = file.match(/[^\\/]+(?=\.svg$)/);
      if (match) {
        const name = match[0];

        if (nameMap.has(name)) {
          const existingPath = nameMap.get(name)!;
          logger.duplicateIcon(name, [existingPath, file]);
        }

        nameMap.set(name, file);
      }
    }
  }

  return Array.from(nameMap.values());
}
