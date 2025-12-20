🔧 Core Engine: Project Execution & Sandbox Automation

This module represents the core backend engine of the CodeSandbox clone. It is responsible for creating projects, executing commands, and managing runtime workflows programmatically using Node.js.

At the heart of this system is controlled OS-level command execution, which enables the platform to behave like a real online IDE.

🚀 Why This Is the Core Logic of the Project

A CodeSandbox-style platform is not just a UI—it must dynamically perform developer operations such as:

Creating isolated project directories

Initializing projects (npm init)

Installing dependencies (npm install)

Running development servers (npm start)

Capturing build logs and runtime errors

Returning execution output to the frontend in real time

All of these operations require executing shell commands from the backend.

This module is the foundation that enables all of those features.

⚙️ How It Works (Execution Flow)
Client Request
     ↓
Backend Controller
     ↓
child_process.exec (Promisified)
     ↓
OS Shell Execution
     ↓
stdout / stderr Captured
     ↓
Response & Logs Sent to UI


This flow is the same architectural principle used by platforms like CodeSandbox, Replit, and StackBlitz.

🧠 Key Technologies Used
child_process.exec

Allows the backend to run system-level commands such as:

mkdir

npm init

npm install

npm run dev

Node.js itself cannot perform these operations without delegating them to the operating system.

util.promisify

The exec API is callback-based by default.
To support clean, readable, and scalable async workflows, it is converted into a Promise-based API using util.promisify.

This enables:

async/await syntax

Sequential execution of commands

Proper error handling

Production-ready control flow

📌 Example: Core Execution Logic
const execPromisified = util.promisify(child_process.exec);

const { stdout, stderr } = await execPromisified('dir');


stdout captures normal execution logs (build output, success messages)

stderr captures errors (compilation failures, runtime crashes)

These outputs are surfaced directly in the sandbox terminal and error panels.

🧩 Why This Is Critical for a CodeSandbox Clone

Without this execution layer:

❌ Projects cannot be created dynamically

❌ Dependencies cannot be installed

❌ User code cannot run

❌ Logs cannot be streamed

❌ The platform becomes a static editor only

With this layer:

✅ Full project lifecycle is automated

✅ True IDE-like behavior is achieved

✅ Backend controls and monitors execution

✅ Frontend becomes a live coding environment

This module is therefore the backbone of the entire system.

🔐 Future Enhancements

Containerized execution using Docker

Per-user sandbox isolation

Real-time log streaming via WebSockets

Resource limits (CPU / memory)

Secure command whitelisting

🏁 Summary (For Interviewers)

This module implements the execution layer of the CodeSandbox clone. By leveraging Node.js child processes with promisified command execution, the backend can dynamically create projects, install dependencies, run applications, and stream logs—making the platform function as a real online development environment rather than a static code editor.

If you want, I can:

Shorten this for 1-page README

Rewrite it in more technical / system-design language

Add architecture diagrams

Align it with TanStack Query + frontend flow

Just tell me how deep you want the README to go.
_____________________
I want this all command execute inside projects folder --> unique id folder inside that
____________________________________-
to create folder of react we use 
npm create vite@Latest sandbox  -- --template react