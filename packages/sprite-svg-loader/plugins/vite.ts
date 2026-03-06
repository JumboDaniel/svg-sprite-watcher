import { spawn } from "child_process";
import path from "path";

export default function vitePluginSvgSprite() {
  let child: any = null;

  return {
    name: "vite-plugin-svg-sprite",
    configureServer(server: any) {
      // Spawn watcher during dev
      const cliPath = path.resolve(
        process.cwd(),
        "node_modules/.bin/svg-sprite-watcher",
      );
      child = spawn(cliPath, ["--watch"], {
        stdio: "inherit",
        shell: true,
      });

      server.httpServer?.on("close", () => {
        if (child) child.kill();
      });
    },
    buildStart() {
      if (!child) {
        const cliPath = path.resolve(
          process.cwd(),
          "node_modules/.bin/svg-sprite-watcher",
        );
        spawn(cliPath, [], {
          stdio: "inherit",
          shell: true,
        });
      }
    },
  };
}
