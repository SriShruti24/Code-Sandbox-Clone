import { useState, useRef, useEffect } from "react";
import { useEditorSocketStore } from "../../../stores/editorSocketStore";
import { useAgentStore } from "../../../stores/agentStore";
import api from "../../../config/axiosConfig";

/* ── SVG Icon Components ── */
const SvgIcon = ({ children, size = 16, color = "currentColor", style = {} }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, ...style }}>
    {children}
  </svg>
);

const IconThinking = ({ color, size }) => (
  <SvgIcon size={size} color={color}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
  </SvgIcon>
);

const IconThought = ({ color, size }) => (
  <SvgIcon size={size} color={color}>
    <polyline points="22 12 16 12 14 15 10 9 8 12 2 12" />
    <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
  </SvgIcon>
);

const IconToolStart = ({ color, size }) => (
  <SvgIcon size={size} color={color}>
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </SvgIcon>
);

const IconToolResult = ({ color, size }) => (
  <SvgIcon size={size} color={color}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </SvgIcon>
);

const IconStatus = ({ color, size }) => (
  <SvgIcon size={size} color={color}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </SvgIcon>
);

const IconDone = ({ color, size }) => (
  <SvgIcon size={size} color={color}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </SvgIcon>
);

const IconError = ({ color, size }) => (
  <SvgIcon size={size} color={color}>
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </SvgIcon>
);

const IconAgent = ({ size = 20, color = "#8be9fd" }) => (
  <SvgIcon size={size} color={color}>
    <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
    <path d="M12 12v9" />
    <path d="m16 16-4-4-4 4" />
  </SvgIcon>
);

const IconTrash = ({ size = 14, color = "#6272a4" }) => (
  <SvgIcon size={size} color={color}>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </SvgIcon>
);

const IconSend = ({ size = 18, color = "#fff" }) => (
  <SvgIcon size={size} color={color}>
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </SvgIcon>
);

const IconLoading = ({ size = 18, color = "#fff" }) => (
  <SvgIcon size={size} color={color} style={{ animation: "spin 1s linear infinite" }}>
    <line x1="12" y1="2" x2="12" y2="6" />
    <line x1="12" y1="18" x2="12" y2="22" />
    <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
    <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
    <line x1="2" y1="12" x2="6" y2="12" />
    <line x1="18" y1="12" x2="22" y2="12" />
    <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
    <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
  </SvgIcon>
);

const typeStyles = {
  thinking: { color: "#8be9fd", icon: IconThinking },
  thought: { color: "#f8f8f2", icon: IconThought },
  tool_start: { color: "#50fa7b", icon: IconToolStart },
  tool_result: { color: "#bd93f9", icon: IconToolResult },
  status: { color: "#ffb86c", icon: IconStatus },
  done: { color: "#50fa7b", icon: IconDone },
  error: { color: "#ff5555", icon: IconError },
};

export const AgentPanel = ({ projectId }) => {
  const [goal, setGoal] = useState("");
  const { logs, isRunning, addLog, setLogs, setIsRunning, clearLogs } = useAgentStore();
  const logsEndRef = useRef(null);
  const { editorSocket } = useEditorSocketStore();

  // Fetch log history on mount
  useEffect(() => {
    if (!projectId) return;

    async function fetchHistory() {
      try {
        const response = await api.get(`/api/v1/agent/${projectId}/logs`);
        if (response.data.success && response.data.data) {
          setLogs(response.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch agent history:", err);
      }
    }

    fetchHistory();
  }, [projectId, setLogs]);

  // Listen for agent:log events from the backend
  useEffect(() => {
    if (!editorSocket) return;

    const handleAgentLog = (data) => {
      addLog(data);

      if (data.type === "done" || data.type === "error") {
        setIsRunning(false);
      }
    };

    editorSocket.on("agent:log", handleAgentLog);

    return () => {
      editorSocket.off("agent:log", handleAgentLog);
    };
  }, [editorSocket, addLog, setIsRunning]);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!goal.trim() || isRunning) return;

    setIsRunning(true);
    setLogs([]);


    try {
      await api.post("/api/v1/agent", {
        projectId,
        goal: goal.trim(),
      });
    } catch (err) {
      setLogs((prev) => [
        ...prev,
        { type: "error", message: `Failed to reach backend: ${err.message}`, timestamp: Date.now() },
      ]);
      setIsRunning(false);
    }
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <span style={styles.headerIcon}><IconAgent size={18} color="#8be9fd" /></span>
        <span style={styles.headerTitle}>CogniBox Agent</span>
        {isRunning && <span style={styles.runningBadge}>Working...</span>}
        <button 
          onClick={() => clearLogs()} 
          style={styles.clearBtn}
          title="Clear logs"
        >
          <IconTrash />
        </button>
      </div>

      {/* Logs Area */}
      <div style={styles.logsArea}>
        {logs.length === 0 && (
          <div style={styles.emptyState}>
            <p style={{ fontSize: "32px", margin: 0 }}><IconAgent size={40} color="#6272a4" /></p>
            <p style={{ color: "#6272a4", margin: "8px 0 0 0", fontSize: "14px" }}>
              Give me a goal and I will autonomously write &amp; test code in your sandbox.
            </p>
          </div>
        )}
        {logs.map((log, idx) => {
          const style = typeStyles[log.type] || typeStyles.status;
          return (
            <div key={idx} style={{
                ...styles.logEntry,
                backgroundColor: log.type === "tool_start" ? "rgba(80, 250, 124, 0.05)" : "transparent",
                borderRadius: "4px",
                margin: "4px 0",
              }}>
              <span style={{ marginRight: "8px", marginTop: "2px", display: "inline-flex" }}>{<style.icon color={style.color} size={14} />}</span>
              <div style={{ flex: 1 }}>
                <pre style={{ 
                  ...styles.logMessage, 
                  color: style.color,
                  fontWeight: (log.type === "tool_start" || log.type === "done") ? "600" : "400"
                }}>
                  {log.message}
                </pre>
                {log.detail && (
                  <div style={styles.logDetailWrapper}>
                    <pre style={styles.logDetail}>{log.detail}</pre>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={logsEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} style={styles.inputArea}>
        <input
          type="text"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder={isRunning ? "Agent is working..." : "Enter a goal for the AI agent..."}
          disabled={isRunning}
          style={styles.input}
        />
        <button
          type="submit"
          disabled={isRunning || !goal.trim()}
          style={{
            ...styles.submitBtn,
            opacity: isRunning || !goal.trim() ? 0.5 : 1,
          }}
        >
          {isRunning ? <IconLoading /> : <IconSend />}
        </button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    backgroundColor: "#1e1f29",
    fontFamily: "'Fira Code', 'Consolas', monospace",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 16px",
    backgroundColor: "#282a36",
    borderBottom: "1px solid #44475a",
  },
  headerIcon: {
    fontSize: "18px",
  },
  headerTitle: {
    color: "#f8f8f2",
    fontSize: "14px",
    fontWeight: 600,
    letterSpacing: "0.5px",
  },
  runningBadge: {
    marginLeft: "auto",
    color: "#50fa7b",
    fontSize: "12px",
    padding: "2px 8px",
    borderRadius: "8px",
    backgroundColor: "rgba(80, 250, 124, 0.15)",
    animation: "pulse 1.5s infinite",
  },
  clearBtn: {
    marginLeft: "8px",
    backgroundColor: "transparent",
    border: "none",
    cursor: "pointer",
    fontSize: "14px",
    opacity: 0.6,
    transition: "opacity 0.2s",
    padding: "4px",
  },
  logsArea: {
    flex: 1,
    overflowY: "auto",
    padding: "12px 16px",
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    textAlign: "center",
  },
  logEntry: {
    display: "flex",
    alignItems: "flex-start",
    padding: "6px 0",
    borderBottom: "1px solid rgba(68, 71, 90, 0.3)",
  },
  logMessage: {
    margin: 0,
    fontSize: "13px",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    lineHeight: "1.5",
    fontFamily: "'Fira Code', 'Consolas', monospace",
  },
  logDetailWrapper: {
    marginTop: "6px",
    padding: "8px",
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    borderRadius: "6px",
    borderLeft: "2px solid #6272a4",
  },
  logDetail: {
    margin: 0,
    fontSize: "12px",
    color: "#bd93f9",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    lineHeight: "1.4",
    fontFamily: "'Fira Code', 'Consolas', monospace",
  },
  inputArea: {
    display: "flex",
    gap: "8px",
    padding: "12px 16px",
    borderTop: "1px solid #44475a",
    backgroundColor: "#282a36",
  },
  input: {
    flex: 1,
    padding: "10px 14px",
    fontSize: "14px",
    fontFamily: "'Fira Code', 'Consolas', monospace",
    backgroundColor: "#44475a",
    border: "1px solid #6272a4",
    borderRadius: "8px",
    color: "#f8f8f2",
    outline: "none",
  },
  submitBtn: {
    padding: "10px 16px",
    fontSize: "18px",
    backgroundColor: "#6366f1",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s",
  },
};
