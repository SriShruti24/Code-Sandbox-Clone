import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * API Integration Tests for CogniBox Backend
 *
 * These tests validate the HTTP endpoint contracts — request validation,
 * response shapes, and error handling — without requiring a running
 * Docker daemon or live LLM connection.
 *
 * Combined with the unit tests in agentTools.test.js, this satisfies
 * the hackathon's "at least two different types of testing" requirement.
 */

// ── Mock dependencies that require infrastructure ──
vi.mock("dockerode", () => {
  return {
    default: class Docker {
      listContainers() { return Promise.resolve([]); }
      getContainer() { return {}; }
    },
  };
});

vi.mock("chokidar", () => ({
  default: { watch: () => ({ on: vi.fn(), close: vi.fn() }) },
}));

// Import after mocks are set up
const { default: express } = await import("express");
const { default: request } = await import("supertest");

// Build a minimal Express app with only the routes under test
async function createTestApp() {
  const { 
    runAgentController, 
    getAgentLogsController,
    getPromptsController,
    updatePromptsController
  } = await import("../controllers/agentController.js");
  
  const { 
    createProjectController, 
    getProjectTree 
  } = await import("../controllers/projectController.js");

  const app = express();
  app.use(express.json());

  // Agent routes
  app.post("/api/v1/agent", runAgentController);
  app.get("/api/v1/agent/prompts", getPromptsController);
  app.put("/api/v1/agent/prompts", updatePromptsController);
  app.get("/api/v1/agent/:projectId/logs", getAgentLogsController);

  // Project routes
  app.post("/api/v1/projects", createProjectController);
  app.get("/api/v1/projects/:projectId", getProjectTree);

  // Health check
  app.get("/ping", (req, res) => res.json({ message: "pong" }));

  return app;
}

// ─────────────────────────────────────────────────────────
// Health Check
// ─────────────────────────────────────────────────────────
describe("GET /ping", () => {
  it("should return pong", async () => {
    const app = await createTestApp();
    const res = await request(app).get("/ping");
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("pong");
  });
});

// ─────────────────────────────────────────────────────────
// Agent Endpoint Validation
// ─────────────────────────────────────────────────────────
describe("POST /api/v1/agent", () => {
  it("should return 400 when projectId is missing", async () => {
    const app = await createTestApp();
    const res = await request(app)
      .post("/api/v1/agent")
      .send({ goal: "create a counter" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain("projectId");
  });

  it("should return 400 when goal is missing", async () => {
    const app = await createTestApp();
    const res = await request(app)
      .post("/api/v1/agent")
      .send({ projectId: "test-id" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain("goal");
  });

  it("should return 400 when body is empty", async () => {
    const app = await createTestApp();
    const res = await request(app)
      .post("/api/v1/agent")
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────
// Agent Logs Endpoint
// ─────────────────────────────────────────────────────────
describe("GET /api/v1/agent/:projectId/logs", () => {
  it("should return empty array for non-existent project", async () => {
    const app = await createTestApp();
    const res = await request(app).get(
      "/api/v1/agent/non-existent-project/logs"
    );

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual([]);
  });

  it("should return 200 with data array shape", async () => {
    const app = await createTestApp();
    const res = await request(app).get(
      "/api/v1/agent/any-project-id/logs"
    );

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("success");
    expect(res.body).toHaveProperty("data");
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────
// Prompt Configuration
// ─────────────────────────────────────────────────────────
describe("Agent Prompts Config", () => {
  it("should load system prompt from agent_prompts.json", async () => {
    const fs = await import("fs/promises");
    const path = await import("path");

    const configPath = path.resolve("./src/config/agent_prompts.json");
    const raw = await fs.readFile(configPath, "utf-8");
    const config = JSON.parse(raw);

    expect(config).toHaveProperty("systemPrompt");
    expect(typeof config.systemPrompt).toBe("string");
    expect(config.systemPrompt.length).toBeGreaterThan(100);
    expect(config.systemPrompt).toContain("CogniBox");
  });

  it("should contain critical safety rules in the prompt", async () => {
    const fs = await import("fs/promises");
    const path = await import("path");

    const configPath = path.resolve("./src/config/agent_prompts.json");
    const raw = await fs.readFile(configPath, "utf-8");
    const config = JSON.parse(raw);

    // Verify the prompt includes key safety instructions
    expect(config.systemPrompt).toContain("RELATIVE");
    expect(config.systemPrompt).toContain("node_modules");
    expect(config.systemPrompt).toContain("readFile");
  });
});