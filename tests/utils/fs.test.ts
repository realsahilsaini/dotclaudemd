import { describe, it, expect } from "vitest";
import { join } from "node:path";
import { defaultFsDeps } from "../../src/utils/fs.js";

describe("fs helpers", () => {
  it("reads an existing file", async () => {
    const content = await defaultFsDeps.readFile(
      join(import.meta.dirname, "..", "..", "package.json"),
    );
    expect(content).toContain("dotclaudemd");
  });

  it("checks file existence correctly", async () => {
    const exists = await defaultFsDeps.fileExists(
      join(import.meta.dirname, "..", "..", "package.json"),
    );
    expect(exists).toBe(true);

    const notExists = await defaultFsDeps.fileExists(
      join(import.meta.dirname, "nonexistent.file"),
    );
    expect(notExists).toBe(false);
  });

  it("reads a directory", async () => {
    const files = await defaultFsDeps.readDir(
      join(import.meta.dirname, "..", ".."),
    );
    expect(files).toContain("package.json");
  });
});
