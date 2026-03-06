// @ts-check
import { defineConfig } from "astro/config";
import svgSpritePlugin from "svg-sprite-watcher/plugins/astro";

// https://astro.build/config
export default defineConfig({
  integrations: [svgSpritePlugin()],
});
