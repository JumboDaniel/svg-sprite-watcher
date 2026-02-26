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
        "node_modules/.bin/svg-sprite",
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
      // Vite handles watch vs build context inherently.
      // If we are in build (not dev server), run generator once.
      // Checking process.env.NODE_ENV is a common proxy for this in Vite plugins,
      // but to be safe, we only run the one-off build if 'child' hasn't been spawned by configureServer
      if (!child) {
        const cliPath = path.resolve(
          process.cwd(),
          "node_modules/.bin/svg-sprite",
        );
        spawn(cliPath, [], {
          stdio: "inherit",
          shell: true,
        });
      }
    },
  };
}
