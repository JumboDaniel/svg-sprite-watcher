import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
  entries: ["src/index", "src/cli", "src/astro", "src/nextjs", "src/vite"],
  clean: true,
  declaration: true,
  rollup: {
    emitCJS: true, // Next.js often still uses CJS requires in next.config.js
    inlineDependencies: true,
  },
});
