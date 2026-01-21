import express from "express";
import { PORT } from "./config/serverConfig.js";
import { createServer } from "node:http";
import { Server } from "socket.io";
import apiRouter from "./routes/index.js";
import cors from "cors";
import chokidar from "chokidar";
import { handleEditorSocketEvents } from "./socketHandlers/editorHandler.js";
import { handleContainerCreate } from "./containers/handleContainerCreate.js";
import { WebSocketServer } from "ws";
import { handleTerminalCreation } from "./containers/handleTerminalCreation.js";
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    method: ["GET", "POST"],
  },
});
app.use(express.json());
app.use(express.urlencoded());
app.use(cors());

app.use("/api", apiRouter);

app.get("/ping", (req, res) => {
  return res.json({ message: "pong" });
});

const editorNamespace = io.of("/editor");

editorNamespace.on("connection", (socket) => {
  console.log("editor connected");

  // somehow we will get the projectId from frontend;
  let projectId = socket.handshake.query["projectId"];

  console.log("Project id received after connection", projectId);

  if (projectId) {
    var watcher = chokidar.watch(`./projects/${projectId}`, {
      ignored: (path) => path.includes("node_modules"),
      persistent: true /** keeps the watcher in running state till the time app is running */,
      awaitWriteFinish: {
        stabilityThreshold: 2000 /** Ensures stability of files before triggering event */,
      },
      ignoreInitial: true /** Ignores the initial files in the directory */,
    });

    watcher.on("all", (event, path) => {
      console.log(event, path);
    });
  }

  handleEditorSocketEvents(socket, editorNamespace);
});

server.listen(PORT, () => {
  //its have express configuration as well as socket.io server
  console.log(`Server is running on port ${PORT}`);
  console.log(process.cwd());
});

const webSocketForTerminal = new WebSocketServer({
  noServer: true, //we will handle the upgrade event
});

server.on("upgrade", (req, tcp, head) => {
   console.log("UPGRADE URL:", req.url);
  /* 
  1. req -> incoming request from client to upgrade the connection from http to websocket
  2. socket -> TCP socket
  3. head -> Buffer object containing the first packet of the upgraded stream
  */
  //this callback will be called when ever there is an upgrade request from client tries to connect to websocket server

  const isTerminal = req.url.includes("/terminal");

  if (isTerminal) {
    console.log("req url received", req.url);
    const projectId = req.url.split("=")[1];
    console.log("Project id received after connection", projectId);

    handleContainerCreate(
      projectId,
      webSocketForTerminal,
      req,
      tcp,
      head,
    );
    
  }
});
//this ws: which is connected freshly from client
webSocketForTerminal.on("connection", (ws, req, container) => {
  console.log("container.projectId =", container?.projectId);
  console.log("Terminal connected ", ws, req, container);
  handleTerminalCreation(container, ws);
  //sanity check to remove container on websocket disconnection
  ws.on("close", () => { 
    container.remove({ force: true }, (err, data) => {
     if (err) { 
      console.log("Error while removing container", err); 
     } 
     console.log("Container removed ", data); });
     });

});
