# sprite-svg-loader workspace

TypeScript-first SVG sprite tooling with a core package (`svg-sprite-watcher`) plus example apps for React, Astro, Next.js, and vanilla usage.

## What this repo contains

- `packages/sprite-svg-loader`: the main package (`svg-sprite-watcher`)
- `apps/react`: Vite + React example with Vite plugin integration
- `apps/astro`: Astro example with Astro integration
- `apps/next-js`: Next.js example running CLI watcher in parallel
- `apps/vanilla`: minimal consumer example

## How it works

The core flow is:

1. Load user config (`sprite-config.ts` or `sprite-config.js`).
2. Scan one or more icon folders for `*.svg` files.
3. Detect duplicate icon names (same filename in different paths).
4. Build a single sprite using `svg-sprite` (symbol mode).
5. Optionally generate `d.ts` types by parsing symbol IDs.
6. In watch mode, repeat on file changes with debounce.

### Runtime flow (ASCII)

```text
+-------------------------------+
| CLI / Plugin Trigger          |
| - svg-sprite-watcher          |
| - Vite plugin                 |
| - Astro integration           |
+---------------+---------------+
                |
                v
+-------------------------------+
| loadConfig()                  |
| - sprite-config.ts/.js        |
| - merge defaults              |
+---------------+---------------+
                |
                v
+-------------------------------+
| runCoreGenerator()            |
|  1) scanIcons()               |
|  2) generateSprite()          |
|  3) generateTypes() (optional)|
+---+-----------------------+---+
    |                       |
    v                       v
+-----------+        +----------------+
| sprite.svg|        | sprite.d.ts    |
| output    |        | type union IDs |
+-----------+        +----------------+

Watch mode:
chokidar -> debounce -> runCoreGenerator() again
```

## Package: `svg-sprite-watcher`

The main package lives at `packages/sprite-svg-loader` and exports:

- Core runner: `runCoreGenerator`
- CLI binary: `svg-sprite-watcher`
- React component: `svg-sprite-watcher/components/react`
- Astro component: `svg-sprite-watcher/components/astro`
- Vite plugin: `svg-sprite-watcher/plugins/vite`
- Astro integration: `svg-sprite-watcher/plugins/astro`
- Config type: `svg-sprite-watcher/types/config`

## CLI usage

```bash
# initialize sprite-config.ts interactively
pnpm svg-sprite-watcher init

# one-off generation
pnpm svg-sprite-watcher

# watch mode
pnpm svg-sprite-watcher --watch

# custom config path
pnpm svg-sprite-watcher --config ./path/to/sprite-config.ts

# disable type generation
pnpm svg-sprite-watcher --no-types
```

## Config reference

Create `sprite-config.ts` in your app root:

```ts
import type { SpriteConfig } from "svg-sprite-watcher/types/config";

export default {
  input: "src/icons",          // string | string[]
  output: "public/sprite.svg", // sprite output path
  spriteUrl: "/sprite.svg",    // optional runtime URL for <use href="...">
  generateTypes: true,          // default true
  typesOutput: "src/sprite.d.ts",
  ignore: ["**/*.test.svg"],
  svgSpriteConfig: {
    // forwarded to svg-sprite (except `dest`)
  },
} satisfies SpriteConfig;
```

## Framework integrations

### React component

```tsx
import { Icon } from "svg-sprite-watcher/components/react";

<Icon name="circle" size={24} />
```

### Astro component

```astro
---
import Icon from "svg-sprite-watcher/components/astro";
---

<Icon name="circle" size={24} />
```

### Vite plugin

```ts
import { defineConfig } from "vite";
import svgSpritePlugin from "svg-sprite-watcher/plugins/vite";

export default defineConfig({
  plugins: [svgSpritePlugin()],
});
```

### Astro integration

```ts
import { defineConfig } from "astro/config";
import svgSpritePlugin from "svg-sprite-watcher/plugins/astro";

export default defineConfig({
  integrations: [svgSpritePlugin()],
});
```

### Next.js pattern used in this repo

Run watcher + Next dev together:

```json
{
  "scripts": {
    "dev": "concurrently \"svg-sprite-watcher --watch\" \"next dev\""
  }
}
```

## Monorepo development

From repo root:

```bash
# run lint
npm run lint

# run package tests
pnpm run test:svg-sprite-watcher

# run examples
pnpm run dev:react
pnpm run dev:astro
pnpm run dev:next
pnpm run dev:all
```

## Notes and behaviors

- Duplicate icon names are allowed but logged; the later file wins.
- Type generation reads IDs from generated sprite `<symbol id="...">` entries.
- Default sprite URL fallback is inferred from `output` basename when omitted.
- Watch mode uses `chokidar` and debounces regeneration to avoid noisy rebuilds.
