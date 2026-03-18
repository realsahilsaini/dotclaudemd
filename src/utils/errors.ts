export class TemplateNotFoundError extends Error {
  constructor(name: string) {
    super(`Template not found: "${name}"`);
    this.name = "TemplateNotFoundError";
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export class FileExistsError extends Error {
  constructor(path: string) {
    super(`File already exists: ${path}`);
    this.name = "FileExistsError";
  }
}

export function formatError(error: unknown): string {
  if (error instanceof TemplateNotFoundError) {
    return `Error: ${error.message}`;
  }
  if (error instanceof ValidationError) {
    return `Validation Error: ${error.message}`;
  }
  if (error instanceof FileExistsError) {
    return `Error: ${error.message}`;
  }
  if (error instanceof Error) {
    return `Error: ${error.message}`;
  }
  return `Error: ${String(error)}`;
}
