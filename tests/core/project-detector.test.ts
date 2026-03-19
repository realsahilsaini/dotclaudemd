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

  // --- New JS framework detections ---

  it("detects a SvelteKit project", async () => {
    const root = "/fake/sveltekit";
    const files: Record<string, string> = {
      [join(root, "package.json")]: JSON.stringify({
        dependencies: { "@sveltejs/kit": "^2", svelte: "^4" },
        devDependencies: { typescript: "^5" },
      }),
    };

    const stack = await detectStack(root, makeFsDeps(files));
    expect(stack!.language).toBe("javascript");
    expect(stack!.framework).toBe("SvelteKit");
  });

  it("detects an Astro project", async () => {
    const root = "/fake/astro";
    const files: Record<string, string> = {
      [join(root, "package.json")]: JSON.stringify({
        dependencies: { astro: "^4", "@astrojs/react": "^3", react: "^18" },
        devDependencies: {},
      }),
    };

    const stack = await detectStack(root, makeFsDeps(files));
    expect(stack!.language).toBe("javascript");
    expect(stack!.framework).toBe("Astro");
  });

  it("detects a Nuxt project (not plain Vue)", async () => {
    const root = "/fake/nuxt";
    const files: Record<string, string> = {
      [join(root, "package.json")]: JSON.stringify({
        dependencies: { nuxt: "^3", vue: "^3" },
        devDependencies: {},
      }),
    };

    const stack = await detectStack(root, makeFsDeps(files));
    expect(stack!.language).toBe("javascript");
    expect(stack!.framework).toBe("Nuxt");
  });

  it("detects a Vue SPA project", async () => {
    const root = "/fake/vue";
    const files: Record<string, string> = {
      [join(root, "package.json")]: JSON.stringify({
        dependencies: { vue: "^3" },
        devDependencies: { vite: "^5" },
      }),
    };

    const stack = await detectStack(root, makeFsDeps(files));
    expect(stack!.language).toBe("javascript");
    expect(stack!.framework).toBe("Vue");
  });

  it("detects a Turborepo monorepo", async () => {
    const root = "/fake/turborepo";
    const files: Record<string, string> = {
      [join(root, "package.json")]: JSON.stringify({
        dependencies: { next: "^14", react: "^18" },
        devDependencies: { turbo: "^2" },
      }),
    };
    const existingPaths = [join(root, "turbo.json")];

    const stack = await detectStack(root, makeFsDeps(files, existingPaths));
    expect(stack!.language).toBe("javascript");
    expect(stack!.framework).toBe("Turborepo");
  });

  it("detects an Nx monorepo", async () => {
    const root = "/fake/nx";
    const files: Record<string, string> = {
      [join(root, "package.json")]: JSON.stringify({
        dependencies: {},
        devDependencies: { nx: "^17" },
      }),
    };
    const existingPaths = [join(root, "nx.json")];

    const stack = await detectStack(root, makeFsDeps(files, existingPaths));
    expect(stack!.language).toBe("javascript");
    expect(stack!.framework).toBe("Nx");
  });

  // --- Java detection ---

  it("detects a Spring Boot Maven project", async () => {
    const root = "/fake/spring-maven";
    const files: Record<string, string> = {
      [join(root, "pom.xml")]:
        '<project><parent><artifactId>spring-boot-starter-parent</artifactId></parent></project>',
    };

    const stack = await detectStack(root, makeFsDeps(files));
    expect(stack!.language).toBe("java");
    expect(stack!.framework).toBe("Spring Boot");
    expect(stack!.packageManager).toBe("maven");
  });

  it("detects a Spring Boot Gradle project", async () => {
    const root = "/fake/spring-gradle";
    const files: Record<string, string> = {
      [join(root, "build.gradle.kts")]:
        'plugins {\n  id("org.springframework.boot") version "3.2.0"\n}',
    };

    const stack = await detectStack(root, makeFsDeps(files));
    expect(stack!.language).toBe("java");
    expect(stack!.framework).toBe("Spring Boot");
    expect(stack!.packageManager).toBe("gradle");
  });

  it("detects a plain Java Maven project without framework", async () => {
    const root = "/fake/java-plain";
    const files: Record<string, string> = {
      [join(root, "pom.xml")]:
        '<project><groupId>com.example</groupId><artifactId>myapp</artifactId></project>',
    };

    const stack = await detectStack(root, makeFsDeps(files));
    expect(stack!.language).toBe("java");
    expect(stack!.framework).toBeUndefined();
    expect(stack!.packageManager).toBe("maven");
  });

  // --- Ruby detection ---

  it("detects a Ruby on Rails project", async () => {
    const root = "/fake/rails";
    const files: Record<string, string> = {
      [join(root, "Gemfile")]:
        "source 'https://rubygems.org'\ngem 'rails', '~> 7.1'\ngem 'pg'\n",
    };

    const stack = await detectStack(root, makeFsDeps(files));
    expect(stack!.language).toBe("ruby");
    expect(stack!.framework).toBe("Rails");
    expect(stack!.packageManager).toBe("bundler");
  });

  it("detects a plain Ruby project without framework", async () => {
    const root = "/fake/ruby-plain";
    const files: Record<string, string> = {
      [join(root, "Gemfile")]:
        "source 'https://rubygems.org'\ngem 'sinatra'\n",
    };

    const stack = await detectStack(root, makeFsDeps(files));
    expect(stack!.language).toBe("ruby");
    expect(stack!.framework).toBeUndefined();
    expect(stack!.packageManager).toBe("bundler");
  });

  // --- PHP detection ---

  it("detects a Laravel project", async () => {
    const root = "/fake/laravel";
    const files: Record<string, string> = {
      [join(root, "composer.json")]: JSON.stringify({
        require: { "php": "^8.2", "laravel/framework": "^11.0" },
      }),
    };

    const stack = await detectStack(root, makeFsDeps(files));
    expect(stack!.language).toBe("php");
    expect(stack!.framework).toBe("Laravel");
    expect(stack!.packageManager).toBe("composer");
    expect(stack!.dependencies).toContain("laravel/framework");
  });

  it("detects a plain PHP project without framework", async () => {
    const root = "/fake/php-plain";
    const files: Record<string, string> = {
      [join(root, "composer.json")]: JSON.stringify({
        require: { "php": "^8.1" },
      }),
    };

    const stack = await detectStack(root, makeFsDeps(files));
    expect(stack!.language).toBe("php");
    expect(stack!.framework).toBeUndefined();
    expect(stack!.packageManager).toBe("composer");
  });
});
