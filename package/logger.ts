export const logger = {
  info: (msg: string) => console.log(`ℹ ${msg}`),
  success: (msg: string) => console.log(`✓ ${msg}`),
  warn: (msg: string) => console.warn(`⚠ Warning: ${msg}`),
  error: (msg: string) => console.error(`✖ Error: ${msg}`),
  duplicateIcon: (name: string, paths: string[]) => {
    console.warn(`⚠ Warning: Duplicate icon name "${name}"`);
    paths.forEach((path, i) => {
      const marker = i === paths.length - 1 ? "✓" : "overwritten";
      console.warn(`  - ${path} (${marker})`);
    });
    console.warn(`  Consider renaming one to avoid confusion\n`);
  },
};
