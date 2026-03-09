/* eslint-disable no-console */
export const logger = {
  info: (msg: string) => console.log(`[INFO] ${msg}`),
  success: (msg: string) => console.log(`[OK] ${msg}`),
  warn: (msg: string) => console.warn(`[WARN] ${msg}`),
  error: (msg: string) => console.error(`[ERROR] ${msg}`),
  duplicateIcon: (name: string, paths: string[]) => {
    console.warn(`[WARN] Duplicate icon name "${name}"`);
    paths.forEach((iconPath, i) => {
      const marker = i === paths.length - 1 ? "kept" : "overwritten";
      console.warn(`  - ${iconPath} (${marker})`);
    });
    console.warn("  Consider renaming one to avoid confusion\n");
  },
};
