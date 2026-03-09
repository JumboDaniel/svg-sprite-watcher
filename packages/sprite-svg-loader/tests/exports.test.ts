import { describe, it, expect } from "vitest";

describe("Package Exports Validation", () => {
  it("should securely export the core runner and utilities from root", async () => {
    const main = await import("../index");
    expect(main.runCoreGenerator).toBeTypeOf("function");
    expect(Array.isArray(main.iconNames)).toBe(true);
    expect(main.isValidIcon).toBeTypeOf("function");
  });

  it("should successfully emit types generation script", async () => {
    const codegen = await import("../codegen/types");
    expect(codegen.generateTypes).toBeTypeOf("function");
  });

  it("should export React components successfully", async () => {
    const reactComp = await import("../components/react");
    expect(reactComp.Icon).toBeDefined();
    // Verify it is a functional component (a function returning React nodes)
    expect(typeof reactComp.Icon).toBe("function");
  });

  it("should export the default Astro integration plugin", async () => {
    const astroPlugin = await import("../plugins/astro");
    expect(astroPlugin.default).toBeTypeOf("function");
  });

  it("should export the default Vite integration plugin", async () => {
    const vitePlugin = await import("../plugins/vite");
    expect(vitePlugin.default).toBeTypeOf("function");
  });
});
