import type { IconName } from "../index";
import { iconNames } from "./iconNames";

export function isValidIcon(name: string): name is IconName {
  return iconNames.includes(name);
}
