import { readFile as nodeReadFile, writeFile as nodeWriteFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { readdir } from "node:fs/promises";
import type { FsDeps } from "../types.js";

export const defaultFsDeps: FsDeps = {
  async readFile(path: string): Promise<string> {
    return nodeReadFile(path, "utf-8");
  },

  async writeFile(path: string, content: string): Promise<void> {
    await nodeWriteFile(path, content, "utf-8");
  },

  async fileExists(path: string): Promise<boolean> {
    return existsSync(path);
  },

  async readDir(path: string): Promise<string[]> {
    return readdir(path);
  },
};
