import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import { Button } from "antd";
import { Allotment } from "allotment";
import "allotment/dist/style.css";

import { EditorComponent } from "../components/molecules/EditorComponent/EditorComponent";
import { TreeStructure } from "../components/organisms/TreeStructure/TreeStructure";
import { BrowserTerminal } from "../components/molecules/BrowserTerminal/BrowserTerminal";
import { Browser } from "../components/organisms/Browser/Browser";
import { AgentPanel } from "../components/organisms/AgentPanel/AgentPanel";

import { useTreeStructureStore } from "../stores/treeStructureStore";
import { useEditorSocketStore } from "../stores/editorSocketStore";
import { useTerminalSocketStore } from "../stores/terminalSocketStore";
export const ProjectPlayground = () => {

    const {projectId: projectIdFromUrl } = useParams();

    const { setProjectId, projectId } = useTreeStructureStore();

    const { setEditorSocket } = useEditorSocketStore();
    const { terminalSocket, setTerminalSocket } = useTerminalSocketStore();

    const [loadBrowser, setLoadBrowser] = useState(false);
    const [rightPanelTab, setRightPanelTab] = useState("agent"); // "agent" or "browser"

    useEffect(() => {
        if(projectIdFromUrl) {
            setProjectId(projectIdFromUrl);
        
            const editorSocketConn = io(import.meta.env.VITE_BACKEND_URL || "http://localhost:3000/editor", {
                query: {
                    projectId: projectIdFromUrl
                }
            });

            try {
                const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
                const terminalHost = import.meta.env.VITE_TERMINAL_URL || `${window.location.hostname}:4000`;
                const wsUrl = `${protocol}//${terminalHost}/terminal?projectId=${projectIdFromUrl}`;
                const ws = new WebSocket(wsUrl);
                setTerminalSocket(ws);
            } catch (error) {
                console.error("Terminal WebSocket connection failed:", error);
            }
            setEditorSocket(editorSocketConn);
        }
        
    }, [setProjectId, projectIdFromUrl, setEditorSocket, setTerminalSocket]);

    return (
        <>
        <div style={{ display: "flex" }}>
            { projectId && (
                    <div
                        style={{
                            backgroundColor: "#333254",
                            paddingRight: "10px",
                            paddingTop: "0.3vh",
                            minWidth: "250px",
                            maxWidth: "25%",
                            height: "100vh",
                            overflow: "auto"
                        }}
                    >
                        <TreeStructure />
                    </div>
                )}
            <div
                style={{
                    width: "100vw",
                    height: "100vh"
                }}
            >
                <Allotment>
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            width: "100%",
                            height: "100%",
                            backgroundColor: "#282a36"

                        }}
                    >

                    <Allotment vertical={true}>
                        <EditorComponent />
                        <BrowserTerminal />
                    </Allotment>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                        {/* Tab Buttons */}
                        <div style={{
                            display: "flex",
                            backgroundColor: "#282a36",
                            borderBottom: "1px solid #44475a",
                        }}>
                            <button
                                onClick={() => setRightPanelTab("agent")}
                                style={{
                                    flex: 1,
                                    padding: "10px",
                                    border: "none",
                                    cursor: "pointer",
                                    fontFamily: "'Fira Code', monospace",
                                    fontSize: "13px",
                                    fontWeight: 600,
                                    backgroundColor: rightPanelTab === "agent" ? "#44475a" : "#282a36",
                                    color: rightPanelTab === "agent" ? "#50fa7b" : "#6272a4",
                                    borderBottom: rightPanelTab === "agent" ? "2px solid #50fa7b" : "2px solid transparent",
                                    transition: "all 0.2s",
                                }}
                            >
                                🧠 AI Agent
                            </button>
                            <button
                                onClick={() => {
                                    setRightPanelTab("browser");
                                    setLoadBrowser(true);
                                }}
                                style={{
                                    flex: 1,
                                    padding: "10px",
                                    border: "none",
                                    cursor: "pointer",
                                    fontFamily: "'Fira Code', monospace",
                                    fontSize: "13px",
                                    fontWeight: 600,
                                    backgroundColor: rightPanelTab === "browser" ? "#44475a" : "#282a36",
                                    color: rightPanelTab === "browser" ? "#8be9fd" : "#6272a4",
                                    borderBottom: rightPanelTab === "browser" ? "2px solid #8be9fd" : "2px solid transparent",
                                    transition: "all 0.2s",
                                }}
                            >
                                🌐 Browser
                            </button>
                        </div>

                        {/* Tab Content */}
                        <div style={{ flex: 1, overflow: "hidden" }}>
                            {rightPanelTab === "agent" && projectIdFromUrl && (
                                <AgentPanel projectId={projectIdFromUrl} />
                            )}
                            {rightPanelTab === "browser" && (
                                <>
                                    { loadBrowser && projectIdFromUrl && terminalSocket && <Browser projectId={projectIdFromUrl} />}
                                    { !loadBrowser && (
                                        <div style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            height: "100%",
                                            backgroundColor: "#1e1f29",
                                        }}>
                                            <Button onClick={() => setLoadBrowser(true)}>
                                                Load my browser
                                            </Button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </Allotment>

            </div>
        </div>
        </>
    );
};