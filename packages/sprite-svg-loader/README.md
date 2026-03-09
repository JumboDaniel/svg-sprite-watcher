# svg-sprite-watcher

TypeScript-first SVG sprite generator with watch mode, type generation, and framework integrations.

## Features

- Generate a single SVG sprite from one or more icon folders
- Watch mode with auto-regeneration on icon changes
- Auto-generate `IconName` TypeScript definitions from sprite symbols
- React and Astro icon components
- Vite and Astro integrations

## Install

```bash
pnpm i -D svg-sprite-watcher
```

## Quick start

```bash
pnpm i -D svg-sprite-watcher
pnpm svg-sprite-watcher init
pnpm svg-sprite-watcher
pnpm svg-sprite-watcher --watch
```

## Config (`sprite-config.ts`)

```ts
import type { SpriteConfig } from "svg-sprite-watcher/types/config";

export default {
  input: "src/icons",
  output: "public/sprite.svg",
  spriteUrl: "/sprite.svg",
  generateTypes: true,
  typesOutput: "src/sprite.d.ts",
  ignore: ["**/*.test.svg"],
} satisfies SpriteConfig;
```

## CLI options

```bash
svg-sprite-watcher [options]

Options:
  -w, --watch          Watch and regenerate on file changes
  -c, --config <path>  Use custom config file
  -r, --run <command>  Run another command concurrently
  --no-types           Disable type generation

Commands:
  init                 Create sprite-config.ts interactively
```

## API

```ts
import { runCoreGenerator } from "svg-sprite-watcher";
```

Also exported:

- `iconNames`
- `isValidIcon`
- `svg-sprite-watcher/types/config`

## React component

```tsx
import { Icon } from "svg-sprite-watcher/components/react";

<Icon name="home" size={20} />
```

## Astro component

```astro
---
import Icon from "svg-sprite-watcher/components/astro";
---

<Icon name="home" size={20} />
```

## Vite integration

```ts
import { defineConfig } from "vite";
import svgSpritePlugin from "svg-sprite-watcher/plugins/vite";

export default defineConfig({
  plugins: [svgSpritePlugin()],
});
```

## Astro integration

```ts
import { defineConfig } from "astro/config";
import svgSpritePlugin from "svg-sprite-watcher/plugins/astro";

export default defineConfig({
  integrations: [svgSpritePlugin()],
});
```

## Framework-agnostic setup (Next.js, Remix, custom SSR, etc.)

If your framework does not use a dedicated plugin, run the sprite CLI in parallel with your dev server and once before build.

1. Add `sprite-config.ts` in your app root.
2. Output sprite to a public path (for example `public/sprite.svg`).
3. Run watch mode in dev, and one-shot generation in build.

Example scripts (Next.js):

```json
{
  "scripts": {
    "sprite:watch": "svg-sprite-watcher --watch",
    "sprite:build": "svg-sprite-watcher",
    "dev": "concurrently \"pnpm sprite:watch\" \"next dev\"",
    "build": "pnpm sprite:build && next build"
  }
}
```

Example usage in React/Next components:

```tsx
import { Icon } from "svg-sprite-watcher/components/react";

<Icon name="home" size={20} spriteUrl="/sprite.svg" />
```

## Internal flow

```text
loadConfig()
   -> scanIcons()
   -> generateSprite()
   -> generateTypes() [optional]

watch mode:
chokidar events -> debounce -> rerun pipeline
```

## Behavior notes

- Duplicate icon filenames are logged; last one found wins.
- If `spriteUrl` is not provided, it is inferred from `output` basename.
- Type generation reads `<symbol id="...">` from the generated sprite.
