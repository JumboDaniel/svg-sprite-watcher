import inquirer from "inquirer";
import fs from "fs";
import path from "path";
import { logger } from "./logger";

export async function initCommand() {
  const responses = await inquirer.prompt([
    {
      type: "input",
      name: "input",
      message: "Where are your SVG icons?",
      default: "src/icons",
    },
    {
      type: "input",
      name: "output",
      message: "Where should the sprite be output?",
      default: "public/sprite.svg",
    },
    {
      type: "confirm",
      name: "generateComponents",
      message: "Generate components?",
      default: true,
    },
    {
      type: "checkbox",
      name: "components",
      message: "Which frameworks?",
      choices: [
        { name: "React", value: "react" },
        { name: "Astro", value: "astro" },
        { name: "Vue", value: "vue" },
      ],
      when: (answers) => answers.generateComponents,
    },
  ]);

  const configContent = `export default {
  input: "${responses.input}",
  output: "${responses.output}",
${responses.components?.length ? `  components: ${JSON.stringify(responses.components)},` : ""}
}
`;

  const configPath = path.resolve(process.cwd(), "sprite.config.js");
  fs.writeFileSync(configPath, configContent, "utf-8");
  logger.success("Created sprite.config.js");
  logger.info("Run 'pnpm svg-sprite' to generate your sprite");
}
