import type { StaticRule } from "../../../types.js";
import { imageRules } from "./01-images.js";
import { frameRules } from "./02-frames.js";
import { tableRules } from "./05-tables.js";
import { linkRules } from "./06-links.js";
import { mandatoryRules } from "./08-mandatory.js";
import { structureRules } from "./09-structure.js";
import { formRules } from "./11-forms.js";

export const ALL_STATIC_RULES: StaticRule[] = [
  ...imageRules,
  ...frameRules,
  ...tableRules,
  ...linkRules,
  ...mandatoryRules,
  ...structureRules,
  ...formRules,
];

export { imageRules, frameRules, tableRules, linkRules, mandatoryRules, structureRules, formRules };
