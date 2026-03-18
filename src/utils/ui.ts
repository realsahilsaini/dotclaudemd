import ora, { type Ora } from "ora";

const isCI = process.env.CI === "true";
const isTest = process.env.NODE_ENV === "test";

export function createSpinner(text: string): Ora {
  return ora({
    text,
    isSilent: isCI || isTest,
  });
}
