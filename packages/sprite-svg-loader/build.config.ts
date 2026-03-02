import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
  entries: [
    "index",
    "cli",
    "vite",
    "codegen/astro",
    "codegen/react",
    "codegen/vue",
    "codegen/types",
  ],
  clean: true,
  declaration: true,
  rollup: {
    emitCJS: true, // Next.js often still uses CJS requires in next.config.js
    inlineDependencies: true,
  },
});
