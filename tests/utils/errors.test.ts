import { describe, it, expect } from "vitest";
import {
  TemplateNotFoundError,
  ValidationError,
  FileExistsError,
  formatError,
} from "../../src/utils/errors.js";

describe("errors", () => {
  describe("TemplateNotFoundError", () => {
    it("creates error with template name", () => {
      const err = new TemplateNotFoundError("my-template");
      expect(err.message).toBe('Template not found: "my-template"');
      expect(err.name).toBe("TemplateNotFoundError");
    });
  });

  describe("ValidationError", () => {
    it("creates error with message", () => {
      const err = new ValidationError("invalid input");
      expect(err.message).toBe("invalid input");
      expect(err.name).toBe("ValidationError");
    });
  });

  describe("FileExistsError", () => {
    it("creates error with path", () => {
      const err = new FileExistsError("/path/to/file");
      expect(err.message).toBe("File already exists: /path/to/file");
      expect(err.name).toBe("FileExistsError");
    });
  });

  describe("formatError", () => {
    it("formats TemplateNotFoundError", () => {
      const result = formatError(new TemplateNotFoundError("test"));
      expect(result).toContain("Template not found");
    });

    it("formats ValidationError", () => {
      const result = formatError(new ValidationError("bad"));
      expect(result).toContain("Validation Error");
    });

    it("formats FileExistsError", () => {
      const result = formatError(new FileExistsError("/file"));
      expect(result).toContain("File already exists");
    });

    it("formats generic Error", () => {
      const result = formatError(new Error("generic"));
      expect(result).toBe("Error: generic");
    });

    it("formats non-Error values", () => {
      const result = formatError("string error");
      expect(result).toBe("Error: string error");
    });
  });
});
