import { describe, it, expect, vi, beforeEach } from "vitest";
import { createSandboxTools } from "../service/langgraphAgent.js";
import fs from "fs/promises";
import path from "path";

// Mock fs/promises
vi.mock("fs/promises", () => ({
  default: {
    readdir: vi.fn(),
    readFile: vi.fn(),
    writeFile: vi.fn(),
    mkdir: vi.fn(),
    rm: vi.fn(),
    unlink: vi.fn(),
    stat: vi.fn(),
  },
}));

describe("Agent Sandbox Tools", () => {
  const projectId = "test-project";
  const tools = createSandboxTools(projectId);
  const [listFiles, readFile, writeFile, deleteFile, runCommand] = tools;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("writeFileTool", () => {
    it("should prevent path traversal", async () => {
      const result = await writeFile.func({ filePath: "../secret.txt", content: "data" });
      expect(result).toContain("Error: Path traversal not allowed");
      expect(fs.writeFile).not.toHaveBeenCalled();
    });

    it("should write to a valid relative path", async () => {
      fs.mkdir.mockResolvedValue(undefined);
      fs.writeFile.mockResolvedValue(undefined);

      const result = await writeFile.func({ filePath: "src/App.jsx", content: "new content" });
      expect(result).toContain("Successfully wrote to src/App.jsx");
      expect(fs.writeFile).toHaveBeenCalled();
    });
  });

  describe("readFileTool", () => {
    it("should read from a valid relative path", async () => {
      fs.readFile.mockResolvedValue("file content");
      const result = await readFile.func({ filePath: "package.json" });
      expect(result).toBe("file content");
      expect(fs.readFile).toHaveBeenCalled();
    });

    it("should return error if file not found", async () => {
      fs.readFile.mockRejectedValue(new Error("File not found"));
      const result = await readFile.func({ filePath: "missing.txt" });
      expect(result).toContain("Error reading file");
    });
  });
});
