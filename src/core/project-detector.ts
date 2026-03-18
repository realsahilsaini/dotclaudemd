import { join } from "node:path";
import type { DetectedStack, FsDeps } from "../types.js";
import { defaultFsDeps } from "../utils/fs.js";

export async function detectStack(
  projectRoot: string,
  deps: FsDeps = defaultFsDeps,
): Promise<DetectedStack | null> {
  // Try each detector in order of specificity
  const detectors = [
    detectNode,
    detectPython,
    detectRust,
    detectGo,
  ];

  for (const detector of detectors) {
    const result = await detector(projectRoot, deps);
    if (result) return result;
  }

  return null;
}

async function detectNode(
  projectRoot: string,
  deps: FsDeps,
): Promise<DetectedStack | null> {
  const pkgPath = join(projectRoot, "package.json");
  if (!(await deps.fileExists(pkgPath))) return null;

  let pkg: Record<string, unknown>;
  try {
    pkg = JSON.parse(await deps.readFile(pkgPath));
  } catch {
    return null;
  }

  const allDeps = (pkg.dependencies ?? {}) as Record<string, string>;
  const allDevDeps = (pkg.devDependencies ?? {}) as Record<string, string>;
  const depNames = Object.keys(allDeps);
  const devDepNames = Object.keys(allDevDeps);

  const stack: DetectedStack = {
    language: "javascript",
    dependencies: depNames,
    devDependencies: devDepNames,
  };

  // Detect TypeScript
  if (
    devDepNames.includes("typescript") ||
    (await deps.fileExists(join(projectRoot, "tsconfig.json")))
  ) {
    stack.language = "javascript"; // category stays javascript
  }

  // Detect framework
  if (depNames.includes("next")) {
    stack.framework = "Next.js";
  } else if (depNames.includes("express") && depNames.includes("react")) {
    stack.framework = "MERN";
  } else if (depNames.includes("express")) {
    stack.framework = "Express";
  } else if (depNames.includes("react")) {
    stack.framework = "React";
  }

  // Detect package manager from lockfiles
  if (await deps.fileExists(join(projectRoot, "pnpm-lock.yaml"))) {
    stack.packageManager = "pnpm";
  } else if (await deps.fileExists(join(projectRoot, "yarn.lock"))) {
    stack.packageManager = "yarn";
  } else if (await deps.fileExists(join(projectRoot, "bun.lockb"))) {
    stack.packageManager = "bun";
  } else if (await deps.fileExists(join(projectRoot, "package-lock.json"))) {
    stack.packageManager = "npm";
  }

  // Detect test framework
  if (devDepNames.includes("vitest")) {
    stack.testFramework = "vitest";
  } else if (devDepNames.includes("jest")) {
    stack.testFramework = "jest";
  } else if (devDepNames.includes("mocha")) {
    stack.testFramework = "mocha";
  }

  return stack;
}

async function detectPython(
  projectRoot: string,
  deps: FsDeps,
): Promise<DetectedStack | null> {
  const hasPyproject = await deps.fileExists(
    join(projectRoot, "pyproject.toml"),
  );
  const hasRequirements = await deps.fileExists(
    join(projectRoot, "requirements.txt"),
  );

  if (!hasPyproject && !hasRequirements) return null;

  const stack: DetectedStack = {
    language: "python",
    dependencies: [],
    devDependencies: [],
  };

  // Try to detect framework from requirements.txt
  if (hasRequirements) {
    try {
      const content = await deps.readFile(
        join(projectRoot, "requirements.txt"),
      );
      const lines = content
        .split("\n")
        .map((l) => l.trim().toLowerCase().split("==")[0].split(">=")[0]);
      stack.dependencies = lines.filter((l) => l && !l.startsWith("#"));

      if (lines.includes("fastapi")) stack.framework = "FastAPI";
      else if (lines.includes("django")) stack.framework = "Django";
      else if (lines.includes("flask")) stack.framework = "Flask";
    } catch {
      // ignore
    }
  }

  // Try to detect from pyproject.toml
  if (hasPyproject) {
    try {
      const content = await deps.readFile(
        join(projectRoot, "pyproject.toml"),
      );
      if (content.includes("fastapi")) stack.framework = "FastAPI";
      else if (content.includes("django")) stack.framework = "Django";
      else if (content.includes("flask")) stack.framework = "Flask";

      if (content.includes("pytest")) stack.testFramework = "pytest";
    } catch {
      // ignore
    }
  }

  // Detect package manager
  if (await deps.fileExists(join(projectRoot, "poetry.lock"))) {
    stack.packageManager = "poetry";
  } else if (await deps.fileExists(join(projectRoot, "Pipfile.lock"))) {
    stack.packageManager = "pipenv";
  } else if (await deps.fileExists(join(projectRoot, "uv.lock"))) {
    stack.packageManager = "uv";
  } else {
    stack.packageManager = "pip";
  }

  return stack;
}

async function detectRust(
  projectRoot: string,
  deps: FsDeps,
): Promise<DetectedStack | null> {
  if (!(await deps.fileExists(join(projectRoot, "Cargo.toml")))) return null;

  const stack: DetectedStack = {
    language: "rust",
    packageManager: "cargo",
    dependencies: [],
    devDependencies: [],
  };

  try {
    const content = await deps.readFile(join(projectRoot, "Cargo.toml"));
    if (content.includes("actix-web")) stack.framework = "Actix";
    else if (content.includes("axum")) stack.framework = "Axum";
    else if (content.includes("rocket")) stack.framework = "Rocket";
  } catch {
    // ignore
  }

  return stack;
}

async function detectGo(
  projectRoot: string,
  deps: FsDeps,
): Promise<DetectedStack | null> {
  if (!(await deps.fileExists(join(projectRoot, "go.mod")))) return null;

  const stack: DetectedStack = {
    language: "go",
    packageManager: "go",
    dependencies: [],
    devDependencies: [],
  };

  try {
    const content = await deps.readFile(join(projectRoot, "go.mod"));
    if (content.includes("gin-gonic/gin")) stack.framework = "Gin";
    else if (content.includes("gofiber/fiber")) stack.framework = "Fiber";
    else if (content.includes("go-chi/chi")) stack.framework = "Chi";
    else if (content.includes("labstack/echo")) stack.framework = "Echo";
  } catch {
    // ignore
  }

  return stack;
}
