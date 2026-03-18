import { describe, it, expect } from "vitest";
import { join } from "node:path";
import {
  runDoctorChecks,
  computeFreshness,
} from "../../src/core/doctor-checks.js";
import type { FsDeps } from "../../src/types.js";

function makeFsDeps(
  files: Record<string, string>,
  existingPaths: string[] = [],
): FsDeps {
  return {
    async readFile(path: string) {
      if (path in files) return files[path];
      throw new Error(`File not found: ${path}`);
    },
    async writeFile() {},
    async fileExists(path: string) {
      return path in files || existingPaths.includes(path);
    },
    async readDir() {
      return [];
    },
  };
}

describe("doctor checks", () => {
  const projectRoot = "/fake/project";

  it("passes scripts-exist when all referenced scripts exist", async () => {
    const claudeMd = "Run `npm run build` and `npm run test`";
    const deps = makeFsDeps({
      [join(projectRoot, "package.json")]: JSON.stringify({
        scripts: { build: "tsc", test: "vitest" },
      }),
    });

    const results = await runDoctorChecks(claudeMd, projectRoot, undefined, deps);
    const scriptCheck = results.find((r) => r.check === "scripts-exist");
    expect(scriptCheck!.status).toBe("pass");
  });

  it("fails scripts-exist when referenced script is missing", async () => {
    const claudeMd = "Run `npm run deploy` to deploy";
    const deps = makeFsDeps({
      [join(projectRoot, "package.json")]: JSON.stringify({
        scripts: { build: "tsc" },
      }),
    });

    const results = await runDoctorChecks(claudeMd, projectRoot, undefined, deps);
    const scriptCheck = results.find((r) => r.check === "scripts-exist");
    expect(scriptCheck!.status).toBe("fail");
  });

  it("passes when no package.json exists", async () => {
    const claudeMd = "Some content";
    const deps = makeFsDeps({});

    const results = await runDoctorChecks(claudeMd, projectRoot, undefined, deps);
    const scriptCheck = results.find((r) => r.check === "scripts-exist");
    expect(scriptCheck!.status).toBe("pass");
  });

  it("warns about package manager mismatch", async () => {
    const claudeMd = "Run `yarn install` to install dependencies";
    const deps = makeFsDeps({}, [join(projectRoot, "package-lock.json")]);

    const results = await runDoctorChecks(claudeMd, projectRoot, undefined, deps);
    const pmCheck = results.find((r) => r.check === "package-manager-match");
    expect(pmCheck!.status).toBe("warn");
  });

  it("passes package manager match for consistent usage", async () => {
    const claudeMd = "Run `npm install` to install dependencies";
    const deps = makeFsDeps({}, [join(projectRoot, "package-lock.json")]);

    const results = await runDoctorChecks(claudeMd, projectRoot, undefined, deps);
    const pmCheck = results.find((r) => r.check === "package-manager-match");
    expect(pmCheck!.status).toBe("pass");
  });
});

describe("computeFreshness", () => {
  it("returns 100 for all passing checks", () => {
    const results = [
      { check: "a", status: "pass" as const, message: "" },
      { check: "b", status: "pass" as const, message: "" },
    ];
    expect(computeFreshness(results)).toBe(100);
  });

  it("returns 0 for all failing checks", () => {
    const results = [
      { check: "a", status: "fail" as const, message: "" },
      { check: "b", status: "fail" as const, message: "" },
    ];
    expect(computeFreshness(results)).toBe(0);
  });

  it("returns 50 for mixed results", () => {
    const results = [
      { check: "a", status: "pass" as const, message: "" },
      { check: "b", status: "fail" as const, message: "" },
    ];
    expect(computeFreshness(results)).toBe(50);
  });

  it("treats warnings as half-pass", () => {
    const results = [
      { check: "a", status: "warn" as const, message: "" },
      { check: "b", status: "warn" as const, message: "" },
    ];
    expect(computeFreshness(results)).toBe(50);
  });

  it("returns 100 for empty results", () => {
    expect(computeFreshness([])).toBe(100);
  });
});
