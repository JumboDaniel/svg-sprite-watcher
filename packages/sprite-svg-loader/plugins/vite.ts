import { spawn, type ChildProcess } from "child_process";
import path from "path";

type ClosableServer = {
  on(event: "close", cb: () => void): void;
};

type ViteServer = {
  httpServer?: ClosableServer;
};

function isViteServer(server: unknown): server is ViteServer {
  return typeof server === "object" && server !== null;
}

export default function vitePluginSvgSprite() {
  let child: ChildProcess | null = null;

  return {
    name: "vite-plugin-svg-sprite",
    configureServer(server: unknown) {
      // Spawn watcher during dev
      const cliPath = path.resolve(
        process.cwd(),
        "node_modules/.bin/svg-sprite-watcher",
      );
      child = spawn(cliPath, ["--watch"], {
        stdio: "inherit",
        shell: true,
      });

      if (isViteServer(server)) {
        server.httpServer?.on("close", () => {
          if (child) child.kill();
        });
      }
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
