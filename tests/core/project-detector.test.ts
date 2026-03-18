import { describe, it, expect } from "vitest";
import { join } from "node:path";
import { detectStack } from "../../src/core/project-detector.js";
import type { FsDeps } from "../../src/types.js";

const fixturesDir = join(import.meta.dirname, "..", "fixtures", "projects");

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

describe("detectStack", () => {
  it("detects a Node.js TypeScript MERN project", async () => {
    const root = join(fixturesDir, "node-ts");
    const files: Record<string, string> = {
      [join(root, "package.json")]: JSON.stringify({
        dependencies: { express: "^4", react: "^18", mongoose: "^7" },
        devDependencies: { typescript: "^5", vitest: "^1" },
      }),
    };
    const existingPaths = [
      join(root, "tsconfig.json"),
      join(root, "package-lock.json"),
    ];

    const stack = await detectStack(root, makeFsDeps(files, existingPaths));
    expect(stack).not.toBeNull();
    expect(stack!.language).toBe("javascript");
    expect(stack!.framework).toBe("MERN");
    expect(stack!.packageManager).toBe("npm");
    expect(stack!.testFramework).toBe("vitest");
    expect(stack!.dependencies).toContain("express");
  });

  it("detects a Next.js project", async () => {
    const root = "/fake/next-project";
    const files: Record<string, string> = {
      [join(root, "package.json")]: JSON.stringify({
        dependencies: { next: "^14", react: "^18" },
        devDependencies: { typescript: "^5" },
      }),
    };

    const stack = await detectStack(root, makeFsDeps(files));
    expect(stack!.framework).toBe("Next.js");
  });

  it("detects a Python Django project", async () => {
    const root = join(fixturesDir, "python-django");
    const files: Record<string, string> = {
      [join(root, "requirements.txt")]:
        "django>=4.2\ndjangorestframework>=3.14\npsycopg2-binary>=2.9\n",
    };

    const stack = await detectStack(root, makeFsDeps(files));
    expect(stack).not.toBeNull();
    expect(stack!.language).toBe("python");
    expect(stack!.framework).toBe("Django");
    expect(stack!.dependencies).toContain("django");
  });

  it("detects a Python FastAPI project", async () => {
    const root = "/fake/fastapi";
    const files: Record<string, string> = {
      [join(root, "requirements.txt")]: "fastapi>=0.100\nuvicorn>=0.23\nsqlalchemy>=2.0\n",
    };

    const stack = await detectStack(root, makeFsDeps(files));
    expect(stack!.language).toBe("python");
    expect(stack!.framework).toBe("FastAPI");
  });

  it("detects a Rust project", async () => {
    const root = join(fixturesDir, "rust");
    const files: Record<string, string> = {
      [join(root, "Cargo.toml")]:
        '[package]\nname = "test"\n\n[dependencies]\naxum = "0.7"\n',
    };

    const stack = await detectStack(root, makeFsDeps(files));
    expect(stack!.language).toBe("rust");
    expect(stack!.framework).toBe("Axum");
    expect(stack!.packageManager).toBe("cargo");
  });

  it("detects a Go project", async () => {
    const root = join(fixturesDir, "go");
    const files: Record<string, string> = {
      [join(root, "go.mod")]:
        "module example.com/test\n\ngo 1.21\n\nrequire github.com/go-chi/chi/v5 v5.0.10\n",
    };

    const stack = await detectStack(root, makeFsDeps(files));
    expect(stack!.language).toBe("go");
    expect(stack!.framework).toBe("Chi");
    expect(stack!.packageManager).toBe("go");
  });

  it("returns null for empty directory", async () => {
    const root = "/fake/empty";
    const deps = makeFsDeps({});
    const stack = await detectStack(root, deps);
    expect(stack).toBeNull();
  });

  it("detects pnpm from lockfile", async () => {
    const root = "/fake/pnpm-project";
    const files: Record<string, string> = {
      [join(root, "package.json")]: JSON.stringify({
        dependencies: {},
        devDependencies: {},
      }),
    };
    const existingPaths = [join(root, "pnpm-lock.yaml")];

    const stack = await detectStack(root, makeFsDeps(files, existingPaths));
    expect(stack!.packageManager).toBe("pnpm");
  });
});
