import prompts from "prompts";
import fs from "fs";
import path from "path";
import { logger } from "./logger";

export async function initCommand() {
  const responses = await prompts([
    {
      type: "text",
      name: "input",
      message: "Where are your SVG icons?",
      initial: "src/icons",
    },
    {
      type: "text",
      name: "output",
      message: "Where should the sprite be output?",
      initial: "public/sprite.svg",
    },
    {
      type: "confirm",
      name: "generateComponents",
      message: "Generate components?",
      initial: true,
    },
    {
      type: (prev) => (prev ? "multiselect" : null),
      name: "components",
      message: "Which frameworks?",
      choices: [
        { title: "React", value: "react" },
        { title: "Astro", value: "astro" },
        { title: "Vue", value: "vue" },
      ],
    },
  ]);

  if (!responses.input || !responses.output) {
    logger.error("Initialization cancelled.");
    return;
  }

  const configContent = `export default {
  input: "${responses.input}",
  output: "${responses.output}",
${responses.components?.length ? `  components: ${JSON.stringify(responses.components)},` : ""}
}
`;

  const configPath = path.resolve(process.cwd(), "sprite-config.js");
  fs.writeFileSync(configPath, configContent, "utf-8");
  logger.success("Created sprite-config.js");
  logger.info("Run 'npx svg-sprite-generate' to generate your sprite");
}
