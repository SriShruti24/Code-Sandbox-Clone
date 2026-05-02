# CogniBox API Documentation

CogniBox exposes a REST API (Express) and real-time event channels (Socket.io + raw WebSocket).

---

## Base URL

```
http://localhost:3000
```

---

## REST Endpoints

### Health Check

```
GET /ping
```

**Response**
```json
{ "message": "pong" }
```

---

### Projects

#### Create a New Project

```
POST /api/v1/projects
```

**Request Body**
```json
{
  "name": "my-todo-app"
}
```

**Response** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "c210b12b-14ff-499e-a752-6f6a0816da18"
  }
}
```

**Description**: Creates a new sandbox project with a UUID, scaffolds a Vite + React starter inside `projects/<id>/sandbox/`, and builds the Docker container for it.

---

#### Get Project Details

```
GET /api/v1/projects/:projectId
```

**Response** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "c210b12b-14ff-499e-a752-6f6a0816da18",
    "tree": { ... }
  }
}
```

**Description**: Returns the project metadata and the full directory tree of the sandbox filesystem.

---

### AI Agent

#### Run Agent

```
POST /api/v1/agent
```

**Request Body**
```json
{
  "projectId": "c210b12b-14ff-499e-a752-6f6a0816da18",
  "goal": "Create a counter component with increment and decrement buttons"
}
```

**Response** `200 OK` (immediate — agent runs in background)
```json
{
  "success": true,
  "message": "Agent started working on your goal"
}
```

**Description**: Starts the LangGraph ReAct agent asynchronously. The agent's reasoning, tool calls, and results are streamed in real-time via Socket.io `agent:log` events. The HTTP response returns immediately to avoid timeout.

**Error Responses**:
| Status | Body | Condition |
|--------|------|-----------|
| `400` | `{ "success": false, "message": "projectId and goal are required" }` | Missing required fields |

---

#### Get Agent Logs

```
GET /api/v1/agent/:projectId/logs
```

**Response** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "type": "status",
      "message": "🧠 Agent initialized. Starting work...",
      "projectId": "c210b12b-...",
      "timestamp": 1714650000000
    },
    {
      "type": "thinking",
      "message": "Agent is thinking...",
      "projectId": "c210b12b-...",
      "timestamp": 1714650001000
    },
    {
      "type": "tool_start",
      "message": "🔧 Calling tool: listFiles",
      "detail": "{\"dirPath\":\".\"}",
      "projectId": "c210b12b-...",
      "timestamp": 1714650002000
    },
    {
      "type": "tool_result",
      "message": "[DIR] src\n[FILE] package.json\n...",
      "projectId": "c210b12b-...",
      "timestamp": 1714650003000
    },
    {
      "type": "done",
      "message": "Agent finished:\nI've created the Counter component...",
      "projectId": "c210b12b-...",
      "timestamp": 1714650010000
    }
  ]
}
```

**Description**: Returns the persisted log history for a project's agent sessions. Logs are saved to `projects/<id>/agent_logs.json`.

---

#### Get Agent Prompts

```
GET /api/v1/agent/prompts
```

**Response** `200 OK`
```json
{
  "success": true,
  "data": {
    "systemPrompt": "You are CogniBox, an autonomous AI developer..."
  }
}
```

**Description**: Returns the current agent system prompt configuration. This allows reviewers to inspect and understand the agent's behavior.

---

#### Update Agent Prompts

```
PUT /api/v1/agent/prompts
```

**Request Body**
```json
{
  "systemPrompt": "You are CogniBox, an updated prompt..."
}
```

**Response** `200 OK`
```json
{
  "success": true,
  "message": "Prompts updated successfully"
}
```

**Description**: Updates the agent's system prompt at runtime. Changes take effect on the next agent invocation. The updated prompts are written to `backend/src/config/agent_prompts.json`.

---

## Real-Time Events

### Socket.io — Editor Namespace (`/editor`)

**Connection**:
```javascript
const socket = io("http://localhost:3000/editor", {
  query: { projectId: "c210b12b-..." }
});
```

#### Events (Server → Client)

| Event | Payload | Description |
|-------|---------|-------------|
| `agent:log` | `{ type, message, detail?, projectId, timestamp }` | Streamed agent reasoning, tool calls, and results |
| `fileChanged` | `{ event, path, projectId }` | Filesystem change detected by Chokidar watcher |

**Agent Log Types**:

| Type | Description | Color (UI) |
|------|-------------|------------|
| `status` | Agent lifecycle events | 🟠 Orange |
| `thinking` | Agent is reasoning | 🔵 Cyan |
| `thought` | Agent's reasoning output | ⚪ White |
| `tool_start` | Tool invocation started | 🟢 Green |
| `tool_result` | Tool execution result | 🟣 Purple |
| `done` | Agent completed successfully | 🟢 Green |
| `error` | Agent encountered an error | 🔴 Red |

#### Events (Client → Server)

| Event | Payload | Description |
|-------|---------|-------------|
| `readFile` | `{ path }` | Request file contents |
| `writeFile` | `{ path, content }` | Write file to sandbox |
| `createFile` | `{ path }` | Create empty file |
| `deleteFile` | `{ path }` | Delete a file |
| `renameFile` | `{ oldPath, newPath }` | Rename/move a file |

---

### WebSocket — Terminal Server (port 4000)

**Connection**:
```javascript
const ws = new WebSocket("ws://localhost:4000/terminal?projectId=c210b12b-...");
```

**Description**: Raw WebSocket connection to an interactive terminal session inside the Docker container. Bidirectional binary stream — client sends keystrokes, server sends terminal output.

---

## Agent Tools

The AI agent has access to 5 tools for interacting with the sandbox:

| Tool | Parameters | Description |
|------|-----------|-------------|
| `listFiles` | `{ dirPath: string }` | List files/directories at a path |
| `readFile` | `{ filePath: string }` | Read file contents |
| `writeFile` | `{ filePath: string, content: string }` | Write/create a file |
| `deleteFile` | `{ filePath: string }` | Delete a file or directory |
| `runCommand` | `{ command: string }` | Execute shell command in container |

All file operations use **relative paths** scoped to the sandbox root. Path traversal attempts (e.g., `../`) are blocked.
