import { join } from "node:path";
import type { DoctorCheck, DoctorResult, FsDeps } from "../types.js";
import { defaultFsDeps } from "../utils/fs.js";

export const builtinChecks: DoctorCheck[] = [
  {
    name: "scripts-exist",
    description: "Commands in CLAUDE.md exist in package.json scripts",
    async check(
      claudeMd: string,
      projectRoot: string,
      deps: FsDeps = defaultFsDeps,
    ): Promise<DoctorResult> {
      const pkgPath = join(projectRoot, "package.json");
      if (!(await deps.fileExists(pkgPath))) {
        return {
          check: "scripts-exist",
          status: "pass",
          message: "No package.json found (skipped)",
        };
      }

      let pkg: Record<string, unknown>;
      try {
        pkg = JSON.parse(await deps.readFile(pkgPath));
      } catch {
        return {
          check: "scripts-exist",
          status: "warn",
          message: "Could not parse package.json",
        };
      }

      const scripts = Object.keys(
        (pkg.scripts ?? {}) as Record<string, string>,
      );
      // Find npm run <script> references in CLAUDE.md
      const scriptRefs = [
        ...claudeMd.matchAll(/npm run (\w[\w-]*)/g),
      ].map((m) => m[1]);
      const missing = scriptRefs.filter((s) => !scripts.includes(s));

      if (missing.length > 0) {
        return {
          check: "scripts-exist",
          status: "fail",
          message: `Referenced scripts not found in package.json: ${missing.join(", ")}`,
          details: missing.map((s) => `"npm run ${s}" not in package.json`),
        };
      }

      return {
        check: "scripts-exist",
        status: "pass",
        message: `All ${scriptRefs.length} referenced scripts exist`,
      };
    },
  },
  {
    name: "deps-mentioned",
    description: "Major dependencies are mentioned",
    async check(
      claudeMd: string,
      projectRoot: string,
      deps: FsDeps = defaultFsDeps,
    ): Promise<DoctorResult> {
      const pkgPath = join(projectRoot, "package.json");
      if (!(await deps.fileExists(pkgPath))) {
        return {
          check: "deps-mentioned",
          status: "pass",
          message: "No package.json found (skipped)",
        };
      }

      let pkg: Record<string, unknown>;
      try {
        pkg = JSON.parse(await deps.readFile(pkgPath));
      } catch {
        return {
          check: "deps-mentioned",
          status: "warn",
          message: "Could not parse package.json",
        };
      }

      const prodDeps = Object.keys(
        (pkg.dependencies ?? {}) as Record<string, string>,
      );
      const lower = claudeMd.toLowerCase();
      const unmentioned = prodDeps.filter(
        (d) => !lower.includes(d.toLowerCase()),
      );

      if (unmentioned.length > prodDeps.length * 0.5 && prodDeps.length > 3) {
        return {
          check: "deps-mentioned",
          status: "warn",
          message: `${unmentioned.length}/${prodDeps.length} major dependencies not mentioned in CLAUDE.md`,
          details: unmentioned.slice(0, 10),
        };
      }

      return {
        check: "deps-mentioned",
        status: "pass",
        message: "Key dependencies are referenced",
      };
    },
  },
  {
    name: "file-refs-valid",
    description: "File paths mentioned in CLAUDE.md exist",
    async check(
      claudeMd: string,
      projectRoot: string,
      deps: FsDeps = defaultFsDeps,
    ): Promise<DoctorResult> {
      const pathRegex =
        /(?:^|\s)(?:\.\/)?([a-zA-Z][\w\-./]*\.\w{1,10})(?:\s|$|`|"|\))/gm;
      let match: RegExpExecArray | null;
      const invalid: string[] = [];

      while ((match = pathRegex.exec(claudeMd)) !== null) {
        const filePath = match[1];
        if (
          filePath.includes("example") ||
          filePath.startsWith("http") ||
          filePath.includes("*")
        )
          continue;
        const fullPath = join(projectRoot, filePath);
        if (!(await deps.fileExists(fullPath))) {
          invalid.push(filePath);
        }
      }

      if (invalid.length > 0) {
        return {
          check: "file-refs-valid",
          status: "warn",
          message: `${invalid.length} referenced file(s) do not exist`,
          details: invalid,
        };
      }

      return {
        check: "file-refs-valid",
        status: "pass",
        message: "All referenced files exist",
      };
    },
  },
  {
    name: "node-version-match",
    description: "Stated Node version matches engines/.nvmrc",
    async check(
      claudeMd: string,
      projectRoot: string,
      deps: FsDeps = defaultFsDeps,
    ): Promise<DoctorResult> {
      // Extract Node version mentioned in CLAUDE.md
      const nodeVersionMatch = claudeMd.match(
        /node\s*(?:version\s*)?:?\s*(\d+(?:\.\d+)*)/i,
      );
      if (!nodeVersionMatch) {
        return {
          check: "node-version-match",
          status: "pass",
          message: "No Node version mentioned (skipped)",
        };
      }

      const mentioned = nodeVersionMatch[1];

      // Check .nvmrc
      const nvmrcPath = join(projectRoot, ".nvmrc");
      if (await deps.fileExists(nvmrcPath)) {
        const nvmrc = (await deps.readFile(nvmrcPath)).trim().replace("v", "");
        if (!nvmrc.startsWith(mentioned.split(".")[0])) {
          return {
            check: "node-version-match",
            status: "fail",
            message: `CLAUDE.md says Node ${mentioned}, but .nvmrc says ${nvmrc}`,
          };
        }
      }

      return {
        check: "node-version-match",
        status: "pass",
        message: `Node version ${mentioned} is consistent`,
      };
    },
  },
  {
    name: "test-framework-match",
    description: "Mentioned test framework matches actual devDeps",
    async check(
      claudeMd: string,
      projectRoot: string,
      deps: FsDeps = defaultFsDeps,
    ): Promise<DoctorResult> {
      const pkgPath = join(projectRoot, "package.json");
      if (!(await deps.fileExists(pkgPath))) {
        return {
          check: "test-framework-match",
          status: "pass",
          message: "No package.json found (skipped)",
        };
      }

      let pkg: Record<string, unknown>;
      try {
        pkg = JSON.parse(await deps.readFile(pkgPath));
      } catch {
        return {
          check: "test-framework-match",
          status: "warn",
          message: "Could not parse package.json",
        };
      }

      const devDeps = Object.keys(
        (pkg.devDependencies ?? {}) as Record<string, string>,
      );
      const lower = claudeMd.toLowerCase();

      const frameworks = [
        "vitest",
        "jest",
        "mocha",
        "ava",
        "tap",
        "pytest",
        "unittest",
      ];
      for (const fw of frameworks) {
        if (lower.includes(fw) && !devDeps.includes(fw)) {
          // Check if it's actually just mentioned as something NOT to use
          if (
            lower.includes(`not ${fw}`) ||
            lower.includes(`don't use ${fw}`)
          )
            continue;

          return {
            check: "test-framework-match",
            status: "warn",
            message: `CLAUDE.md mentions "${fw}" but it's not in devDependencies`,
          };
        }
      }

      return {
        check: "test-framework-match",
        status: "pass",
        message: "Test framework references are consistent",
      };
    },
  },
  {
    name: "package-manager-match",
    description: "Stated package manager matches lockfile",
    async check(
      claudeMd: string,
      projectRoot: string,
      deps: FsDeps = defaultFsDeps,
    ): Promise<DoctorResult> {
      const lower = claudeMd.toLowerCase();

      const lockfileMap: [string, string, string][] = [
        ["pnpm-lock.yaml", "pnpm", "pnpm"],
        ["yarn.lock", "yarn", "yarn"],
        ["bun.lockb", "bun", "bun"],
        ["package-lock.json", "npm", "npm"],
      ];

      for (const [lockfile, manager, keyword] of lockfileMap) {
        if (await deps.fileExists(join(projectRoot, lockfile))) {
          // Check if CLAUDE.md mentions a different package manager
          for (const [, otherManager, otherKeyword] of lockfileMap) {
            if (otherManager === manager) continue;
            if (
              lower.includes(`${otherKeyword} install`) ||
              lower.includes(`${otherKeyword} run`)
            ) {
              return {
                check: "package-manager-match",
                status: "warn",
                message: `CLAUDE.md references "${otherKeyword}" but lockfile is ${lockfile} (${manager})`,
              };
            }
          }
          break;
        }
      }

      return {
        check: "package-manager-match",
        status: "pass",
        message: "Package manager references are consistent",
      };
    },
  },
];

export async function runDoctorChecks(
  claudeMdContent: string,
  projectRoot: string,
  checks: DoctorCheck[] = builtinChecks,
  deps: FsDeps = defaultFsDeps,
): Promise<DoctorResult[]> {
  const results: DoctorResult[] = [];
  for (const check of checks) {
    results.push(await check.check(claudeMdContent, projectRoot, deps));
  }
  return results;
}

export function computeFreshness(results: DoctorResult[]): number {
  const total = results.length;
  if (total === 0) return 100;

  const passing = results.filter((r) => r.status === "pass").length;
  const warnings = results.filter((r) => r.status === "warn").length;

  return Math.round(((passing + warnings * 0.5) / total) * 100);
}
