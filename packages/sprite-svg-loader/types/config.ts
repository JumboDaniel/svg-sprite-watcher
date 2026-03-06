import type { Config } from "svg-sprite";

export interface SpriteConfig {
  input: string | string[];
  output: string;
  spriteUrl?: string;
  generateTypes?: boolean;
  typesOutput?: string;
  components?:
    | string[]
    | {
        react?: string;
        astro?: string;
        vue?: string;
      };
  svgSpriteConfig?: Partial<Omit<Config, "dest">>;
  ignore?: string[];
}
