# Code Sandbox - Complete System Architecture

## Table of Contents
1. [System Overview](#system-overview)
2. [Component Breakdown](#component-breakdown)
3. [Detailed Interaction Flows](#detailed-interaction-flows)
4. [Technology Stack](#technology-stack)

---

## System Overview

**Code Sandbox** is a full-stack web application that provides an interactive, cloud-based coding environment. It allows users to create isolated projects, edit code in a browser-based IDE, run a development server, execute terminal commands, and leverage AI agents to assist with coding tasks.

### Key Features
- ✅ **Project Creation**: Generate Vite + React projects on demand
- ✅ **Browser-Based IDE**: Monaco Editor for code editing
- ✅ **File System Management**: Full CRUD operations on project files
- ✅ **Live Terminal**: Interactive terminal inside browser using XTerm.js
- ✅ **Live Preview**: Real-time preview of React app with HMR
- ✅ **AI Agent**: LangGraph-powered agent that can analyze and modify code
- ✅ **Containerization**: Docker sandboxes for each project

### Architecture Pattern
The system follows a **Client-Server Architecture** with:
- **Frontend**: React SPA (Single Page Application)
- **Backend**: Express.js with Socket.io for real-time communication
- **Infrastructure**: Docker containers for project isolation

---

## Component Breakdown

### Frontend Architecture

```
frontend/
├── src/
│   ├── App.jsx                          # Root component
│   ├── Router.jsx                       # Route definitions
│   ├── main.jsx                         # Entry point
│   ├── pages/
│   │   ├── CreateProject.jsx            # Project creation page
│   │   └── ProjectPlayground.jsx        # Main IDE interface
│   ├── components/
│   │   ├── atoms/
│   │   │   ├── EditorButton/            # Reusable button component
│   │   │   └── FileIcon/                # File type icon renderer
│   │   ├── molecules/
│   │   │   ├── TreeNode/                # Folder/file tree item
│   │   │   ├── BrowserTerminal/         # XTerm.js wrapper
│   │   │   ├── EditorComponent/         # Monaco editor wrapper
│   │   │   └── ContextMenu/             # Right-click menu for files
│   │   └── organisms/
│   │       ├── TreeStructure/           # Complete file tree
│   │       ├── Browser/                 # Live preview iframe
│   │       └── AgentPanel/              # AI agent interface
│   ├── stores/                          # Zustand state management
│   │   ├── activeFileTabStore.js        # Current active file
│   │   ├── agentStore.js                # Agent logs & state
│   │   ├── editorSocketStore.js         # Socket.io connection
│   │   ├── terminalSocketStore.js       # WebSocket connection
│   │   ├── treeStructureStore.js        # File tree data
│   │   ├── fileContextMenuStore.js      # Context menu state
│   │   ├── folderContextMenuStore.js    # Folder context menu state
│   │   └── portStore.js                 # Vite dev server port
│   ├── hooks/
│   │   └── apis/
│   │       ├── mutations/
│   │       │   └── useCreateProject.js  # Create project hook
│   │       └── queries/
│   │           ├── usePing.js           # Health check
│   │           └── useProjectTree.js    # Fetch file tree
│   ├── apis/
│   │   ├── ping.js                      # Ping endpoint
│   │   └── projects.js                  # Project CRUD endpoints
│   ├── config/
│   │   └── axiosConfig.js               # Axios instance config
│   └── utils/
│       └── extensionToFileType.js       # Map file ext to language
```

#### Key Frontend Components

##### **App.jsx**
```javascript
// Root component - renders Router
function App() {
  return <Router />
}
```
- Simple wrapper that renders the routing layer
- No state management at this level

##### **Router.jsx**
```javascript
// Two main routes:
// 1. / → CreateProject page (home)
// 2. /project/:projectId → ProjectPlayground (IDE)
```

##### **CreateProject.jsx**
- **Purpose**: Landing page for creating new projects
- **Functionality**:
  - Displays "Create Playground" button with animated background
  - On button click:
    1. Calls `createProjectMutation()` (REST API)
    2. Receives `projectId` from backend
    3. Navigates to `/project/{projectId}`
- **Styling**: Dark theme with gradient glow effects

##### **ProjectPlayground.jsx** (Main IDE Page)
- **Purpose**: The core IDE interface
- **Structure**:
  ```
  Left Panel (250px-25%)     | Right Panel (75%)
  - TreeStructure            | ┌─────────────────┐
  - File explorer            | │ Allotment Split  │
  - Folder/file tree         | ├─────────────────┤
                             | Top: Editor       │
                             | Mid: Browser      │
                             | Bottom: Terminal  │
                             | Right: AgentPanel │
                             └─────────────────┘
  ```

- **Direct Connections**:
  1. **editorSocket**: Socket.io to `/editor` namespace
     - Query param: `projectId`
     - Used for: file read/write, file watching, agent logs
  
  2. **terminalSocket**: WebSocket to `/terminal`
     - Query param: `projectId`
     - Used for: PTY communication with container

- **State Management** (via Zustand stores):
  - `projectId`: Current project identifier
  - `editorSocket`: Socket.io connection reference
  - `terminalSocket`: WebSocket connection reference

- **Sub-Components**:
  1. **TreeStructure**: File explorer
  2. **EditorComponent**: Monaco code editor
  3. **BrowserTerminal**: XTerm.js terminal
  4. **Browser**: Live preview iframe
  5. **AgentPanel**: AI assistant panel

---

#### Key Component Deep Dives

##### **TreeStructure & TreeNode**

**TreeStructure.jsx**
```javascript
// Lifecycle:
useEffect(() => {
  if (!treeStructure) {
    setTreeStructure(); // Fetch tree from backend
  }
}, []);
```
- On first load: fetches directory tree for current project
- Renders `<TreeNode>` recursively

**TreeNode.jsx**
```javascript
// Component behavior:
// If folder: render expandable button
// If file: render clickable file item
```

**User Interactions**:
1. **Expand/Collapse Folder**
   - Click arrow → `toggleVisibility(name)`
   - Updates local state → re-render children
   - No backend call (state-only)

2. **Double-Click File**
   - `handleDoubleClick(fileFolderData)`
   - Emits: `editorSocket.emit('readFile', { pathToFileOrFolder: path })`
   - Backend reads file → sends content
   - Frontend updates `activeFileTabStore` with file content
   - Monaco editor updates with new content

3. **Right-Click (Context Menu)**
   - `handleContextMenu(e, path, isFolder)`
   - Updates `fileContextMenuStore` with position and path
   - Shows context menu with options:
     - Create File / Create Folder
     - Delete File / Delete Folder
   - Selection triggers appropriate socket event

**Data Flow**:
```
Tree Data (object structure):
{
  name: "projectId",
  path: "/absolute/path",
  type: "directory",
  children: [
    {
      name: "src",
      path: "/absolute/path/src",
      type: "directory",
      children: [...]
    },
    {
      name: "App.jsx",
      path: "/absolute/path/App.jsx",
      type: "file"
    }
  ]
}
```

---

##### **EditorComponent**

**Features**:
- Uses Monaco Editor (VS Code editor)
- Dracula theme (fetched from `/Dracula.json`)
- Language detection based on file extension

**File Editing Flow**:
```
User types in Editor
    ↓
onChange event triggered
    ↓
handleChange(value) called
    ↓
Clear previous debounce timer
    ↓
Set 2-second debounce timer
    ↓
Timer expires (no new changes for 2 seconds)
    ↓
Emit writeFile event to backend
    ↓
Backend writes to file system
    ↓
Chokidar detects change
    ↓
Backend broadcasts fileChanged event
    ↓
(Live preview auto-refreshes if applicable)
```

**Why 2-second debounce?**
- Prevents excessive file writes
- Reduces I/O operations
- Still provides near-instant file persistence
- Similar to VS Code's auto-save behavior

**Key Code**:
```javascript
function handleChange(value) {
  if (timerId.current != null) {
    clearTimeout(timerId.current); // Clear old timer
  }
  
  timerId.current = setTimeout(() => {
    editorSocket.emit("writeFile", {
      data: value,
      pathToFileOrFolder: activeFileTab.path
    });
  }, 2000); // 2-second delay
}
```

---

##### **BrowserTerminal**

**Architecture**:
- Uses `@xterm/xterm` library for terminal rendering
- Uses `@xterm/addon-fit` for responsive sizing
- Uses `@xterm/addon-attach` to attach WebSocket stream

**Initialization Flow**:
```
Component Mounts
    ↓
Create Terminal instance with Dracula theme
    ↓
Load FitAddon (for responsive sizing)
    ↓
Render terminal in DOM
    ↓
Window resize observer → auto-fit terminal
    ↓
WebSocket opens
    ↓
AttachAddon connects WebSocket stream
    ↓
User can type commands
```

**Why PTY Stream via WebSocket?**
- Real bidirectional communication
- Docker container's PTY output → WebSocket → XTerm
- User input: XTerm → WebSocket → Docker container's PTY

**Stream Protocol**:
The Docker exec stream uses a binary protocol:
```
[Header 8 bytes][Message]
  - Bytes 0-3: Stream type (stdout/stderr)
  - Bytes 4-7: Message length
  - Bytes 8+: Actual data
```
Backend parses this and extracts the actual output.

---

##### **Browser (Live Preview)**

**Key Concept**: The preview is an embedded iframe pointing to Vite dev server

**Port Discovery**:
```javascript
useEffect(() => {
  if (!port) {
    editorSocket?.emit("getPort", { containerName: projectId })
  }
}, [port, editorSocket, projectId]);
```
- On first load: requests port number
- Backend inspects Docker container → finds dynamically assigned 5173 port
- Sets port in `portStore`
- Renders: `<iframe src={'http://localhost:${port}'} />`

**Auto-Refresh on File Changes**:
```javascript
useEffect(() => {
  const handleFileChange = (data) => {
    if (browserRef.current) {
      // Reassign src to force reload (Vite HMR does most work)
      const oldAddr = browserRef.current.src;
      browserRef.current.src = oldAddr;
    }
  };
  
  editorSocket?.on("fileChanged", handleFileChange);
  return () => editorSocket?.off("fileChanged", handleFileChange);
}, [editorSocket]);
```

**User Refresh Button**:
```javascript
function handleRefresh() {
  if (browserRef.current) {
    // Reassign src to force full page reload
    const oldAddr = browserRef.current.src;
    browserRef.current.src = oldAddr;
  }
}
```

---

##### **AgentPanel**

**Purpose**: Interface to communicate with AI agent

**UI Layout**:
```
┌─────────────────────────────────┐
│ 🧠 CogniBox Agent  [Working...] │ <- Header
├─────────────────────────────────┤
│ [Scrollable log area]           │
│ 🤔 Analyzing structure...       │
│ 💭 I'll create components...    │
│ 🔧 Using: listFiles             │
│ 📋 src/ [DIR] App.jsx [FILE]... │
│ ✅ Agent complete               │
├─────────────────────────────────┤
│ [Input field]                   │
│ "Create a counter component" [▶] │ <- Goal input
└─────────────────────────────────┘
```

**Log Entry Types**:
- `thinking`: Agent's internal reasoning (type color: cyan)
- `thought`: Agent's decision (type color: light gray)
- `tool_start`: Starting tool execution (type color: green)
- `tool_result`: Tool execution result (type color: purple)
- `status`: Status updates (type color: orange)
- `done`: Completion message (type color: green)
- `error`: Error occurred (type color: red)

**User Workflow**:
1. Type goal in input field (e.g., "Create a button component")
2. Click send button or press Enter
3. Agent starts working (isRunning = true)
4. Logs stream in real-time via Socket.io
5. Each log entry has icon + timestamp + message
6. When agent finishes (type="done"), isRunning = false
7. User can clear logs or submit new goal

**State Management**:
```javascript
const { logs, isRunning, addLog, setLogs, setIsRunning, clearLogs } = useAgentStore();

// Fetch previous logs on mount
useEffect(() => {
  fetch(`/api/v1/agent/${projectId}/logs`)
    .then(res => res.json())
    .then(json => setLogs(json.data));
}, [projectId]);

// Listen for live logs
useEffect(() => {
  editorSocket.on("agent:log", (data) => {
    addLog(data);
    if (data.type === "done" || data.type === "error") {
      setIsRunning(false);
    }
  });
}, [editorSocket]);
```

**Auto-scroll to Latest**:
```javascript
useEffect(() => {
  logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
}, [logs]); // Scroll whenever new logs arrive
```

---

### Backend Architecture

```
backend/
├── src/
│   ├── index.js                         # Main Express server
│   ├── terminalApp.js                   # Terminal WebSocket server
│   ├── config/
│   │   └── serverConfig.js              # Environment config
│   ├── routes/
│   │   ├── index.js                     # API route aggregator
│   │   └── v1/
│   │       ├── index.js                 # V1 API routes
│   │       ├── projects.js              # Project endpoints
│   │       └── agent.js                 # Agent endpoints
│   ├── controllers/
│   │   ├── projectController.js         # Project logic
│   │   ├── agentController.js           # Agent logic
│   │   └── pingController.js            # Health check
│   ├── service/
│   │   ├── projectService.js            # Project file ops
│   │   └── langgraphAgent.js            # LangGraph agent logic
│   ├── containers/
│   │   ├── handleContainerCreate.js     # Docker container setup
│   │   └── handleTerminalCreation.js    # PTY setup
│   ├── socketHandlers/
│   │   └── editorHandler.js             # Socket.io event handlers
│   └── utils/
│       └── execUtility.js               # Utility functions
```

#### Backend Server Setup

##### **index.js (Main Server)**

**Two Servers Simultaneously**:
1. **Express HTTP Server** (Port 3000)
   - Handles REST API requests
   - Manages Socket.io connections

2. **WebSocket Server** (Port 4000)
   - Runs in terminalApp.js
   - Handles terminal connections

**Socket.io Namespaces**:
```javascript
const editorNamespace = io.of("/editor");
```

**File Watching**:
```javascript
// When client connects to /editor with projectId
editorNamespace.on("connection", (socket) => {
  const projectId = socket.handshake.query["projectId"];
  
  // Watch project directory for file changes
  const watcher = chokidar.watch(`./projects/${projectId}`, {
    ignored: (path) => path.includes("node_modules"),
    persistent: true,
    awaitWriteFinish: { stabilityThreshold: 2000 },
    ignoreInitial: true
  });
  
  // Broadcast file changes to all clients
  watcher.on("all", (event, path) => {
    editorNamespace.emit("fileChanged", {
      event: event,
      path: path,
      projectId: projectId
    });
  });
});
```

**Flow**:
1. Client connects to `/editor` namespace with projectId
2. Backend starts Chokidar watcher on project directory
3. Any file change (create/modify/delete) triggers "all" event
4. Backend broadcasts to all connected clients: "fileChanged"
5. Frontend receives notification and can update live preview

---

##### **terminalApp.js (Terminal Server)**

```javascript
const server = createServer(app);
const webSocketForTerminal = new WebSocketServer({ server });
server.listen(4000);

webSocketForTerminal.on("connection", async (ws, req) => {
  const isTerminal = req.url.includes("/terminal");
  
  if (isTerminal) {
    const projectId = req.url.split("=")[1];
    
    // Create/get Docker container
    const container = await handleContainerCreate(projectId, webSocketForTerminal);
    
    // Setup PTY communication
    handleTerminalCreation(container, ws);
  }
});
```

**Key Points**:
- Separate server on port 4000 (avoiding port conflicts)
- Parses `projectId` from WebSocket URL query params
- Creates Docker container on first terminal connection
- Attaches WebSocket to PTY stream

---

#### Route Handlers

##### **Projects Routes** (`/api/v1/projects`)

```javascript
// POST /api/v1/projects
// Create new React project with Vite
const createProjectController = async (req, res) => {
  const projectId = await createProjectService();
  return res.json({ message: "Project created", data: projectId });
};

// GET /api/v1/projects/:projectId
// Fetch project file tree
const getProjectTree = async (req, res) => {
  const tree = await getProjectTreeService(req.params.projectId);
  return res.status(200).json({
    data: tree,
    success: true,
    message: "Successfully fetched the tree"
  });
};
```

---

##### **Agent Routes** (`/api/v1/agent`)

```javascript
// POST /api/v1/agent
// Run agent with given goal
const runAgentController = async (req, res) => {
  const { projectId, goal } = req.body;
  
  // Return immediately (agent runs in background)
  res.json({
    success: true,
    message: "Agent started working on your goal"
  });
  
  // Execute agent asynchronously
  runAgent(projectId, goal, emitLog);
};

// GET /api/v1/agent/:projectId/logs
// Fetch agent execution logs
const getAgentLogsController = async (req, res) => {
  const logsPath = path.resolve(`./projects/${projectId}/agent_logs.json`);
  const logs = JSON.parse(await fs.readFile(logsPath, "utf-8"));
  res.json({ success: true, data: logs });
};
```

---

#### Services

##### **projectService.js**

```javascript
export const createProjectService = async () => {
  // 1. Generate unique ID
  const projectId = uuid4();
  
  // 2. Create project directory
  await fs.mkdir(`./projects/${projectId}`, { recursive: true });
  
  // 3. Run: npm create vite@latest sandbox --template react
  const response = await execPromisified(REACT_PROJECT_COMMAND, {
    cwd: `./projects/${projectId}`
  });
  
  // 4. Write Docker-optimized vite.config.js
  // (fixes HMR for container environment)
  await fs.writeFile(viteConfigPath, VITE_CONFIG_TEMPLATE);
  
  // 5. Fix permissions for sandbox user (non-root)
  await execPromisified(`chmod -R 777 ./projects/${projectId}`);
  
  return projectId;
};

export const getProjectTreeService = async (projectId) => {
  const projectPath = path.resolve(`./projects/${projectId}`);
  const tree = directoryTree(projectPath);
  return tree;
};
```

**Key Files Created**:
```
projects/{projectId}/
├── sandbox/
│   ├── node_modules/
│   ├── public/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js (Docker-optimized)
│   └── ...
├── projects/ (for agent to work in)
└── agent_logs.json (agent execution logs)
```

---

##### **langgraphAgent.js**

**Purpose**: LangGraph ReAct agent that can autonomously modify code

**Architecture**:
```
LLM (Google Generative AI)
    ↓
ReAct Agent Framework
    ↓
Tools (listFiles, readFile, writeFile, deleteFile, runCommand)
    ↓
Docker Container Execution
```

**Tool Definitions**:
1. **listFiles**
   - Lists files/directories at a path
   - Returns formatted list with [DIR] / [FILE] prefixes

2. **readFile**
   - Reads file contents
   - Returns full file text

3. **writeFile**
   - Writes/creates files
   - Creates parent directories automatically
   - Security: prevents path traversal attacks

4. **deleteFile**
   - Deletes files or folders (recursive)
   - Returns success/error message

5. **runCommand**
   - Executes shell commands in Docker container
   - Runs in `/home/sandbox/app/sandbox` (project root)
   - Used for: `npm install`, `npm run build`, `node script.js`, etc.
   - Collects stdout + stderr
   - Returns combined output

**Agent Loop**:
```
1. LLM gets goal + tools + project structure
2. LLM decides: "I need to create a button component"
3. LLM uses listFiles tool → sees project structure
4. LLM uses readFile tool → reads App.jsx
5. LLM decides: "I'll create Button.jsx in src/components"
6. LLM uses writeFile tool → creates file with JSX code
7. LLM uses runCommand tool → npm install (if needed)
8. LLM generates final response
9. Loop ends
```

**Logging**:
Each action emits a log entry:
```javascript
await emitLog({
  type: "thinking|thought|tool_start|tool_result|done|error",
  message: "Human-readable message"
});
```
These logs are:
1. Emitted to Socket.io → broadcasted to frontend
2. Saved to `projects/{projectId}/agent_logs.json`

---

#### Socket Handlers

##### **editorHandler.js**

Handles real-time file operations via Socket.io

**Event: writeFile**
```javascript
socket.on("writeFile", async ({ data, pathToFileOrFolder }) => {
  await fs.writeFile(pathToFileOrFolder, data);
  editorNamespace.emit("writeFileSuccess", {...});
});
```

**Event: readFile**
```javascript
socket.on("readFile", async ({ pathToFileOrFolder }) => {
  const response = await fs.readFile(pathToFileOrFolder);
  socket.emit("readFileSuccess", {
    value: response.toString(),
    path: pathToFileOrFolder
  });
});
```

**Event: createFile**
```javascript
socket.on("createFile", async ({ pathToFileOrFolder }) => {
  const parentDir = path.dirname(pathToFileOrFolder);
  await fs.mkdir(parentDir, { recursive: true });
  await fs.writeFile(pathToFileOrFolder, "");
  socket.emit("createFileSuccess", {...});
});
```

**Event: deleteFile**
```javascript
socket.on("deleteFile", async ({ pathToFileOrFolder }) => {
  await fs.unlink(pathToFileOrFolder);
  socket.emit("deleteFileSuccess", {...});
});
```

**Event: createFolder**
```javascript
socket.on("createFolder", async ({ pathToFileOrFolder }) => {
  await fs.mkdir(pathToFileOrFolder, { recursive: true });
  socket.emit("createFolderSuccess", {...});
});
```

**Event: deleteFolder**
```javascript
socket.on("deleteFolder", async ({ pathToFileOrFolder }) => {
  await fs.rm(pathToFileOrFolder, { recursive: true, force: true });
  socket.emit("deleteFolderSuccess", {...});
});
```

---

#### Container Operations

##### **handleContainerCreate.js**

**Purpose**: Create and manage Docker containers for projects

```javascript
export const handleContainerCreate = async (projectId) => {
  // 1. Check if container already exists
  const existingContainer = await docker.listContainers({
    all: true,
    filters: JSON.stringify({ name: [`^/${projectId}$`] })
  });
  
  // 2. Remove old container if exists
  if (existingContainer.length > 0) {
    await existingContainer[0].remove({ force: true });
  }
  
  // 3. Create new container
  const container = await docker.createContainer({
    Image: "sandbox", // Custom image with Node.js + Vite
    name: projectId,
    User: "sandbox", // Non-root user
    
    // Mount host project to container
    HostConfig: {
      Binds: [
        `${HOST_PROJECT_PATH}/projects/${projectId}:/home/sandbox/app`
      ],
      PortBindings: {
        "5173/tcp": [{ HostPort: "0" }] // Random port
      }
    },
    
    // Expose Vite port
    ExposedPorts: { "5173/tcp": {} }
  });
  
  // 4. Start container
  await container.start();
  
  return container;
};
```

**Container Lifecycle**:
1. User opens terminal (ProjectPlayground mounts)
2. WebSocket connection to `/terminal?projectId=XXX`
3. Backend creates container with projectId as name
4. Container has project directory mounted
5. User can run commands like `npm run dev`
6. Vite starts on 0.0.0.0:5173
7. Backend inspects container → finds dynamic port mapping
8. Frontend renders iframe with discovered port
9. Browser can now access Vite dev server

---

##### **handleTerminalCreation.js**

**Purpose**: Setup bidirectional PTY communication

```javascript
export const handleTerminalCreation = (container, ws) => {
  container.exec({
    Cmd: ["/bin/bash"],
    AttachStdin: true,
    AttachStdout: true,
    AttachStderr: true,
    Tty: true,
    User: "sandbox"
  }, (err, exec) => {
    exec.start({ hijack: true }, (err, stream) => {
      // Attach Docker output stream to WebSocket
      processStreamOutput(stream, ws);
      
      // Listen for WebSocket input → write to container
      ws.on("message", (data) => {
        stream.write(data);
      });
    });
  });
};
```

**Stream Processing**:
Docker uses a binary protocol:
```
Header (8 bytes):
- Bytes 0-3: Stream type (stdout/stderr)
- Bytes 4-7: Data length

Body (N bytes): Actual terminal output
```

Backend parser:
1. Reads 8-byte header
2. Extracts stream type and data length
3. Reads body (N bytes)
4. Sends pure data to WebSocket
5. Repeats

---

## Detailed Interaction Flows

### Flow 1: Creating a Project

**User Action**: Click "🚀 Create Playground" button

**Sequence**:
1. Frontend: `createProjectMutation()`
2. HTTP POST to `POST /api/v1/projects`
3. Backend: `createProjectController()`
   - Generate UUID for projectId
   - Create directory: `projects/{projectId}/`
   - Run: `npm create vite@latest sandbox --template react`
   - Create Vite config optimized for Docker
   - Fix permissions: `chmod -R 777`
4. Backend returns `{ data: projectId }`
5. Frontend: `navigate(/project/{projectId})`
6. ProjectPlayground component loads
7. Establish connections:
   - Socket.io to `/editor` namespace
   - WebSocket to `/terminal`
8. TreeStructure fetches file tree
9. UI renders with empty editor, terminal ready, browser loading

**Time**: ~3-5 seconds (npm install takes time)

---

### Flow 2: Clicking on a File in Folder Structure

**User Action**: Double-click on `src/App.jsx`

**Sequence**:
1. TreeNode component detects double-click
2. Calls: `editorSocket.emit('readFile', { pathToFileOrFolder: 'projects/{projectId}/sandbox/src/App.jsx' })`
3. Backend socket handler receives event
4. Backend: `fs.readFile(path)` → reads file to string
5. Backend emits: `socket.emit('readFileSuccess', { value: content, path: path })`
6. Frontend Socket.io listener receives event
7. Updates Zustand store: `activeFileTabStore.setActiveFileTab({ value, extension: 'jsx', path })`
8. EditorComponent re-renders with:
   - Language: `jsx`
   - Value: file content
   - Theme: Dracula
9. User sees file content in Monaco editor
10. Cursor positioned at start

**Time**: ~100-200ms

---

### Flow 3: Editing a File

**User Action**: Type code in the editor

**Sequence**:
1. Monaco editor fires `onChange(newValue)`
2. EditorComponent: `handleChange(newValue)`
3. Clear any existing debounce timer
4. Create new 2-second debounce timer
5. User continues typing (timer resets each keystroke)
6. User stops typing for 2 seconds
7. Timer executes:
   ```javascript
   editorSocket.emit('writeFile', {
     data: newValue,
     pathToFileOrFolder: activeFileTab.path
   })
   ```
8. Backend socket handler: `fs.writeFile(path, data)`
9. File written to disk
10. Chokidar watcher detects file change
11. Backend emits: `editorNamespace.emit('fileChanged', { event, path, projectId })`
12. All connected clients receive notification
13. If live preview active: auto-refresh triggered
14. Vite HMR detects change → hot module replacement
15. Preview updates without full page reload

**Time**: Variable (based on typing speed + 2 second delay)

---

### Flow 4: Right-Clicking on File (Context Menu)

**User Action**: Right-click on file/folder

**Sequence**:
1. TreeNode: `handleContextMenu(e, path, isFolder)`
2. Prevent default context menu
3. Update fileContextMenuStore:
   ```javascript
   openMenu({
     x: e.clientX,
     y: e.clientY,
     path: path,
     isFolder: isFolder
   })
   ```
4. FileContextMenu component renders at (x, y)
5. User selects option:

**Option A: Delete File**
- Emit: `editorSocket.emit('deleteFile', { pathToFileOrFolder })`
- Backend: `fs.unlink(path)`
- File deleted from disk
- Chokidar notifies → fileChanged event
- Frontend can remove from tree

**Option B: Create New File**
- Emit: `editorSocket.emit('createFile', { pathToFileOrFolder: newPath })`
- Backend: `fs.mkdir(parentDir)` + `fs.writeFile(newPath, '')`
- Creates empty file
- Chokidar notifies
- Frontend updates tree

**Time**: ~100ms per operation

---

### Flow 5: Opening Terminal

**User Action**: Terminal component mounts (ProjectPlayground loads)

**Sequence**:
1. ProjectPlayground mounts BrowserTerminal component
2. BrowserTerminal connects WebSocket:
   ```javascript
   const ws = new WebSocket(`ws://localhost:3000/terminal?projectId=${projectId}`)
   ```
3. Backend (terminalApp.js) receives connection
4. Docker: `handleContainerCreate(projectId)`
   - Check if container exists (remove old)
   - Create new container:
     - Image: `sandbox` (Node.js + necessary tools)
     - Name: projectId
     - Volume: Mount `projects/{projectId}` to `/home/sandbox/app`
     - Port: 5173 (Vite dev server)
     - User: `sandbox` (non-root)
5. Container starts
6. Backend executes `/bin/bash` inside container with TTY
7. Backend attaches PTY stream to WebSocket
8. Frontend (XTerm.js) loads AddonAttach
9. Terminal renders in browser
10. User sees bash prompt ready for input

**Time**: ~1-2 seconds (container startup)

---

### Flow 6: Typing Commands in Terminal

**User Action**: Type `npm run dev` and press Enter

**Sequence**:
1. XTerm.js captures keyboard input
2. Sends raw bytes to WebSocket: `npm run dev\r`
3. Backend receives WebSocket message
4. Backend writes to PTY stream: `stream.write(data)`
5. Container's bash receives input
6. Bash executes: `npm run dev`
7. npm starts Vite dev server
8. Vite outputs: `VITE v4.x.x ready in xxx ms`
9. Container stdout/stderr captured by PTY
10. Backend reads from stream with binary protocol parser:
    - Parse header (8 bytes)
    - Extract stream type + length
    - Slice data payload
    - Send via WebSocket
11. Frontend XTerm receives data
12. XTerm renders color-coded terminal output
13. User sees Vite server startup messages

**Time**: Real-time (streaming)

---

### Flow 7: Clicking Live Preview/Browser Button

**User Action**: Open ProjectPlayground, Browser component mounts

**Sequence**:
1. Browser component mounts
2. useEffect runs:
   ```javascript
   if (!port) {
     editorSocket?.emit("getPort", { containerName: projectId })
   }
   ```
3. Backend receives "getPort" event
4. Backend calls: `getContainerPort(projectId)`
   - Lists containers: `docker.listContainers({ filters: { name: projectId } })`
   - Gets container info: `container.inspect()`
   - Extracts HostPort from: `containerInfo.NetworkSettings.Ports["5173/tcp"][0].HostPort`
   - Returns dynamic port (e.g., 32156)
5. Backend emits port to Socket.io
6. Frontend: `portStore.setPort(port)`
7. Browser component renders:
   ```javascript
   <iframe src={`http://localhost:${port}`} />
   ```
8. Iframe makes HTTP request to Vite dev server
9. Container's Vite server (listening on 5173) receives request
10. Vite serves:
    - `/index.html` (main HTML)
    - Bundle JS with React app
    - CSS files
    - Assets
11. Browser loads and renders React app
12. Vite client connects: HMR WebSocket for hot module replacement

**Time**: ~1-2 seconds (container startup) + network latency

**Live Reload**:
When file changes:
1. Backend detects via Chokidar
2. Broadcasts fileChanged event
3. Frontend Browser component handler:
   ```javascript
   handleFileChange = (data) => {
     browserRef.current.src = browserRef.current.src; // Reassign src
   };
   ```
4. Iframe reloads (or Vite HMR applies changes)
5. User sees updated preview

---

### Flow 8: Talking to the AI Agent

**User Action**: Type "Create a counter component" in AgentPanel and submit

**Sequence**:

#### Phase 1: Request Submission
1. User types goal and clicks submit
2. AgentPanel: `handleSubmit(goal)`
3. Zustand: `agentStore.setIsRunning(true)` + `setLogs([])`
4. HTTP POST: `POST /api/v1/agent`
   ```javascript
   {
     projectId: "abc123...",
     goal: "Create a counter component"
   }
   ```
5. Backend: `runAgentController(req, res)`
6. **Immediately respond**: `res.json({ success: true, message: "Agent started..." })`
7. Backend executes: `runAgent(projectId, goal, emitLog)` **asynchronously**

**Why immediate response?**
- HTTP requests timeout after ~30 seconds
- Agent might take longer
- Agent work happens in background

#### Phase 2: Agent Initialization
1. LanggraphAgent service initializes
2. Create tools scoped to projectId:
   - listFiles, readFile, writeFile, deleteFile, runCommand
   - All paths relative to: `projects/{projectId}/sandbox`
3. Initialize LLM: `ChatGoogleGenerativeAI`
4. Create ReAct agent framework
5. First emitLog: `{ type: 'thinking', message: 'Analyzing project structure...' }`

#### Phase 3: ReAct Loop (Agent Reasoning)
Repeat until agent decides it's done:

**Step A: Agent Thinks**
```
LLM receives:
- System prompt (you're a code assistant)
- Goal: "Create a counter component"
- Tools available: [listFiles, readFile, writeFile, deleteFile, runCommand]
- Current file tree: (from earlier listFiles)
```

emitLog: `{ type: 'thinking', message: '...' }`

**Step B: LLM Decides Action**
LLM output: "I'll use listFiles to see the project structure"

emitLog: `{ type: 'thought', message: 'I will first examine the project... ' }`

**Step C: Agent Executes Tool**
Tool: `listFiles('src')`
- Backend: `fs.readdir('./projects/abc123/sandbox/src')`
- Result: `[DIR] components, [FILE] App.jsx, [FILE] main.jsx, ...`

emitLog: 
```javascript
{
  type: 'tool_start',
  message: 'Using listFiles tool to examine src directory'
}
```

emitLog:
```javascript
{
  type: 'tool_result',
  message: '[DIR] components\n[FILE] App.jsx\n...'
}
```

**Step D: LLM Makes Next Decision**
LLM: "Now I'll read App.jsx to understand the structure"

Tool: `readFile('src/App.jsx')`
Result: (full App.jsx code)

**Step E: LLM Creates Component**
LLM: "I'll create Counter.jsx in src/components"

Tool: `writeFile('src/components/Counter.jsx', 'import React, { useState }...')`

emitLog:
```javascript
{
  type: 'tool_result',
  message: 'Successfully wrote Counter.jsx'
}
```

**Step F: LLM Finishes**
LLM: "I have successfully created a Counter component with increment/decrement buttons..."

emitLog:
```javascript
{
  type: 'done',
  message: 'Counter component created at src/components/Counter.jsx. Increment/Decrement functionality implemented.'
}
```

#### Phase 4: Frontend Reception
Each emitLog call:
1. Backend Socket.io emits: `editorNamespace.emit('agent:log', entry)`
2. Frontend listener: `editorSocket.on('agent:log', handleAgentLog)`
3. Zustand: `agentStore.addLog(data)`
4. AgentPanel re-renders with new log
5. Auto-scroll to bottom

When type="done":
- `agentStore.setIsRunning(false)`
- Submit button re-enables
- Agent badge disappears

#### Phase 5: Persistence
Each emitLog also saved to file:
- Path: `projects/abc123/agent_logs.json`
- Format: Array of log entries with timestamps
- Used to fetch history on page reload

**Total Time**: 5-60 seconds (depends on complexity)

---

## Technology Stack

### Frontend Stack
| Technology | Purpose |
|---|---|
| React 18 | UI framework |
| React Router v6 | Page routing |
| Socket.io Client | Real-time communication |
| Monaco Editor | Code editor (VS Code engine) |
| XTerm.js | Terminal emulation |
| Zustand | State management |
| Allotment | Resizable split panes |
| Antd (Ant Design) | UI components |
| Vite | Build tool + dev server |
| Axios | HTTP client |

### Backend Stack
| Technology | Purpose |
|---|---|
| Node.js | Runtime |
| Express.js | HTTP framework |
| Socket.io | WebSocket library |
| WS (ws) | WebSocket implementation |
| Docker SDK | Container management |
| Chokidar | File system watcher |
| LangChain | LLM framework |
| LangGraph | Agent framework |
| Google GenerativeAI | LLM provider |
| directory-tree | File tree generator |

### Infrastructure
| Technology | Purpose |
|---|---|
| Docker | Container runtime |
| Vite | Dev server (in container) |
| Node.js | Container base image |

---

## Environment Configuration

### Frontend (.env)
```
VITE_API_URL=http://localhost:3000
```

### Backend (.env)
```
PORT=3000                           # HTTP server port
HOST_PROJECT_PATH=/path/to/projects # Host directory mount point
SANDBOX_IMAGE=sandbox               # Docker image name
GOOGLE_API_KEY=xxxxx               # LLM API key
```

### Docker Compose
```yaml
services:
  backend:
    ports: 3000:3000 (HTTP), 4000:4000 (WebSocket)
    volumes: ./projects (project files)
             /var/run/docker.sock (Docker access)
  
  frontend:
    ports: 5173:5173
    depends_on: backend
```

---

## Security Considerations

1. **Path Traversal Prevention**: Agent tools use `path.normalize()` and check for `..`
2. **Non-root Container**: Sandbox user (non-root) prevents privilege escalation
3. **CORS**: Enabled for frontend-backend communication
4. **File Permissions**: `chmod 777` allows sandbox user read/write access
5. **Container Isolation**: Docker provides process isolation (not foolproof)

---

## Performance Optimizations

1. **2-Second Edit Debounce**: Reduces file write frequency
2. **Lazy File Tree Loading**: Tree loads specific depths on demand
3. **HMR (Hot Module Replacement)**: Vite provides code updates without full reload
4. **WebSocket Streaming**: Binary protocol for efficient terminal output
5. **Socket.io Namespaces**: Separates editor and terminal communication

---

## Areas for Future Enhancement

1. **Collaborative Editing**: Multi-user support via Yjs/Quill
2. **Version Control**: Git integration for projects
3. **Plugin System**: Custom tools for agent
4. **Database Persistence**: Save projects beyond session
5. **Performance Monitoring**: Logs, metrics, debugging
6. **Testing Framework**: Unit/component testing UI
7. **Code Formatting**: Prettier/ESLint integration
8. **PWA Support**: Offline capability

---

## Troubleshooting Guide

### Terminal won't connect
- [ ] Check Docker running: `docker ps`
- [ ] Verify port 4000 available
- [ ] Check container logs: `docker logs {projectId}`

### Live preview blank
- [ ] Check Vite is running: `npm run dev` in terminal
- [ ] Verify port is correctly discovered
- [ ] Check browser console for errors

### Agent not responding
- [ ] Verify GOOGLE_API_KEY set in backend
- [ ] Check agent logs in `/api/v1/agent/:projectId/logs`
- [ ] Verify LLM API available & not rate-limited

### File changes not persisting
- [ ] Check Socket.io connection active
- [ ] Verify project directory writable
- [ ] Check file permissions (chmod 777)

---

Generated: May 2, 2026
Last Updated: Today
