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
pnpm add svg-sprite-watcher
```

## Quick start

```bash
# create sprite-config.ts
pnpm svg-sprite-watcher init

# generate sprite once
pnpm svg-sprite-watcher

# watch mode
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
