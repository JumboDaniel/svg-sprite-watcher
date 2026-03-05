import chokidar from "chokidar";
import { SpriteConfig } from "./config";
import { logger } from "./logger";
import { resolvePath } from "./utils/paths";

export function watch(config: SpriteConfig, onChange: () => void) {
  let debounceTimer: NodeJS.Timeout;

  const regenerate = () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
      onChange();
    }, 100);
  };

  const inputs = Array.isArray(config.input) ? config.input : [config.input];
  const patterns = inputs.map((dir) =>
    `${resolvePath(dir)}/**/*.svg`.replace(/\\/g, "/"),
  );

  chokidar.watch(patterns, { ignoreInitial: true }).on("all", (event, path) => {
    logger.info(`File ${event}: ${path}`);
    regenerate();
  });

  logger.info(`👀 Watching for changes...`);
}
