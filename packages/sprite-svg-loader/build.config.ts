import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
  entries: [
    "index",
    "cli",
    "vite",
    "codegen/types",
    {
      builder: "mkdist",
      input: "./components/",
      pattern: ["**/*.tsx", "**/*.ts", "**/*.astro"],
      outDir: "./dist/components",
    },
  ],
  clean: true,
  declaration: true,
  failOnWarn: false,
  rollup: {
    emitCJS: true,
    inlineDependencies: true,
    esbuild: {
      jsx: "automatic",
    },
  },
});
