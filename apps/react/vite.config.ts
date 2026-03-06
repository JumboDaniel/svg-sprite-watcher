import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgSpritePlugin from "svg-sprite-watcher/plugins/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), svgSpritePlugin()],
});
