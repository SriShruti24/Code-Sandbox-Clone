import express from 'express';
import cors from 'cors';
import { createServer } from 'node:http';
import { handleContainerCreate } from './containers/handleContainerCreate.js';
import { WebSocketServer } from 'ws';
import { handleTerminalCreation } from './containers/handleTerminalCreation.js';


const app = express();

const server = createServer(app);


app.use(express.json());
app.use(express.urlencoded());
app.use(cors());


if (process.env.NODE_ENV !== 'test') {
  server.listen(4000, () => {
    console.info(`Terminal WebSockets Server is running on port 4000`);
  });
}

const webSocketForTerminal = new WebSocketServer({
    server
});

webSocketForTerminal.on("connection", async (ws, req, container) => {
    console.info(`Incoming Terminal WebSocket connection: ${req.url}`);
    const isTerminal = req.url.includes("/terminal");

    if(isTerminal) {

        const projectId = req.url.split("=")[1];

        if (!projectId) {
            ws.close();
            return;
        }

        try {
            const container = await handleContainerCreate(projectId, webSocketForTerminal);
            handleTerminalCreation(container, ws);
        } catch (error) {
            console.error("Terminal connection setup failed:", error);
            ws.close();
        }
    }
    
});