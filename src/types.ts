export interface TemplateVariable {
  name: string;
  prompt: string;
  options?: string[];
  default?: string;
}

export interface TemplateFrontmatter {
  name: string;
  displayName: string;
  description: string;
  category: string;
  tags: string[];
  variables: TemplateVariable[];
  detects?: {
    files?: string[];
    dependencies?: string[];
    devDependencies?: string[];
  };
  priority: number;
}

export interface Template {
  filePath: string;
  frontmatter: TemplateFrontmatter;
  content: string;
}

export type LintSeverity = "error" | "warn" | "info";

export interface LintRule {
  name: string;
  description: string;
  severity: LintSeverity;
  check: (content: string, projectRoot?: string) => LintResult[];
}

export interface LintResult {
  rule: string;
  severity: LintSeverity;
  message: string;
  line?: number;
}

export interface LintReport {
  file: string;
  results: LintResult[];
  errorCount: number;
  warnCount: number;
  infoCount: number;
}

export interface DoctorCheck {
  name: string;
  description: string;
  check: (
    claudeMdContent: string,
    projectRoot: string,
    deps?: FsDeps,
  ) => Promise<DoctorResult>;
}

export interface DoctorResult {
  check: string;
  status: "pass" | "warn" | "fail";
  message: string;
  details?: string[];
}

export interface DetectedStack {
  language: string;
  framework?: string;
  packageManager?: string;
  testFramework?: string;
  dependencies: string[];
  devDependencies: string[];
}

export interface FsDeps {
  readFile: (path: string) => Promise<string>;
  writeFile: (path: string, content: string) => Promise<void>;
  fileExists: (path: string) => Promise<boolean>;
  readDir: (path: string) => Promise<string[]>;
}
