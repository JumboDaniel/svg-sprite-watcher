import { Command } from "commander";
import { initCommand } from "./init";
import { loadConfig } from "./config";
import { watch } from "./watcher";
import { runCoreGenerator } from "./index";

const program = new Command();

program
  .name("svg-sprite")
  .description("SVG Sprite Generator CLI")
  .version("0.0.1");

program
  .command("init")
  .description("Creates sprite.config.js interactively")
  .action(initCommand);

program
  .description("Generate sprite sheet")
  .option("-w, --watch", "Watch mode — regenerates on file changes")
  .option("-c, --config <path>", "Use custom config file")
  .action(async (options) => {
    const config = await loadConfig(options.config);
    if (!config) return;

    if (options.watch) {
      await runCoreGenerator(config);
      watch(config, () => {
        runCoreGenerator(config);
      });
    } else {
      await runCoreGenerator(config);
    }
  });

program.parse();
