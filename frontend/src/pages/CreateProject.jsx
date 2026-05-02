import { Button } from "antd";
import { useCreateProject } from "../hooks/apis/mutations/useCreateProject";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";

/* ── tiny icon components ── */
const Icon = ({ children, bg }) => (
  <span style={{
    width: 48, height: 48, borderRadius: 12, display: "inline-flex",
    alignItems: "center", justifyContent: "center", fontSize: 22,
    background: bg || "rgba(99,102,241,0.15)",
  }}>{children}</span>
);

/* ── feature data ── */
const features = [
  { icon: "⚡", title: "Instant Projects", desc: "Spin up a Vite + React sandbox in seconds with one click.", bg: "rgba(99,102,241,0.15)" },
  { icon: "📝", title: "Monaco Editor", desc: "VS Code-grade editing with Dracula theme, IntelliSense & syntax highlighting.", bg: "rgba(139,92,246,0.15)" },
  { icon: "💻", title: "Live Terminal", desc: "Full interactive terminal powered by XTerm.js connected to your container.", bg: "rgba(34,211,238,0.15)" },
  { icon: "👁️", title: "Live Preview", desc: "Real-time browser preview with Hot Module Replacement built in.", bg: "rgba(16,185,129,0.15)" },
  { icon: "🤖", title: "AI Agent", desc: "LangGraph-powered AI that can read, write, and refactor your code autonomously.", bg: "rgba(244,114,182,0.15)" },
  { icon: "🐳", title: "Docker Isolation", desc: "Every project runs in its own Docker container for complete isolation.", bg: "rgba(251,191,36,0.15)" },
];

/* ── architecture steps ── */
const archSteps = [
  { num: "01", title: "React SPA", desc: "Frontend built with React 19, Zustand state, and TanStack Query for data fetching.", color: "#6366f1" },
  { num: "02", title: "Express + Socket.io", desc: "REST API server on port 3000 with real-time Socket.io for file ops & agent logs.", color: "#8b5cf6" },
  { num: "03", title: "WebSocket Terminal", desc: "Dedicated WebSocket server on port 4000 streams PTY I/O to the browser terminal.", color: "#22d3ee" },
  { num: "04", title: "Docker Containers", desc: "Each project gets its own container with Vite dev server, file system & shell access.", color: "#10b981" },
  { num: "05", title: "Chokidar Watcher", desc: "File system watcher detects changes and broadcasts events for live preview refresh.", color: "#f472b6" },
  { num: "06", title: "LangGraph Agent", desc: "ReAct agent powered by Google Generative AI with tools: listFiles, readFile, writeFile, runCommand.", color: "#fbbf24" },
];

/* ── tech stack ── */
const techStack = [
  { name: "React 19", cat: "Frontend" }, { name: "Zustand", cat: "State" },
  { name: "Monaco Editor", cat: "Editor" }, { name: "XTerm.js", cat: "Terminal" },
  { name: "Socket.io", cat: "Realtime" }, { name: "Express.js", cat: "Backend" },
  { name: "Docker", cat: "Infra" }, { name: "Chokidar", cat: "Watcher" },
  { name: "LangGraph", cat: "AI" }, { name: "Vite", cat: "Bundler" },
];

/* ── intersection observer hook ── */
function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { el.style.opacity = 1; el.style.transform = "translateY(0)"; obs.unobserve(el); }
    }, { threshold: 0.15 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

const RevealSection = ({ children, style }) => {
  const ref = useReveal();
  return <div ref={ref} style={{ opacity: 0, transform: "translateY(40px)", transition: "all 0.7s cubic-bezier(.25,.46,.45,.94)", ...style }}>{children}</div>;
};

/* ════════════════════════════════════════ */
export const CreateProject = () => {
  const { createProjectMutation } = useCreateProject();
  const navigate = useNavigate();

  async function handleCreateProject() {
    try {
      const response = await createProjectMutation();
      navigate(`/project/${response.data}`);
    } catch (error) {
      console.error("Error creating project", error);
    }
  }

  return (
    <div style={s.page}>
      {/* floating bg glows */}
      <div style={s.glow1} />
      <div style={s.glow2} />
      <div style={s.gridOverlay} />

      {/* ── HERO ── */}
      <section style={s.hero}>
        <div style={s.heroInner}>
          <p style={s.badge}>☁️ Cloud-Based Development Environment</p>
          <h1 style={s.title}>CODE SANDBOX</h1>
          <p style={s.subtitle}>
            A full-stack, browser-based IDE that lets you create isolated React projects,
            edit code with Monaco Editor, run commands in a live terminal, preview your app
            in real time, and leverage an AI agent — all inside Docker containers.
          </p>
          <div style={s.heroBtns}>
            <Button size="large" onClick={handleCreateProject} style={s.ctaBtn}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px) scale(1.03)"; e.currentTarget.style.boxShadow = "0 14px 40px rgba(99,102,241,0.55)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0) scale(1)"; e.currentTarget.style.boxShadow = "0 10px 30px rgba(99,102,241,0.45)"; }}>
              🚀 Create Playground
            </Button>
            <Button size="large" style={s.ghostBtn}
              onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
              ↓ Explore Features
            </Button>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={s.section}>
        <RevealSection>
          <h2 style={s.sectionTitle}>Powerful Features</h2>
          <p style={s.sectionSub}>Everything you need for a complete cloud coding experience.</p>
          <div style={s.featGrid}>
            {features.map((f, i) => (
              <div key={i} style={s.featCard}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.borderColor = "rgba(99,102,241,0.5)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(99,102,241,0.15)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; e.currentTarget.style.boxShadow = "none"; }}>
                <Icon bg={f.bg}>{f.icon}</Icon>
                <h3 style={s.featTitle}>{f.title}</h3>
                <p style={s.featDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </RevealSection>
      </section>

      {/* ── ARCHITECTURE ── */}
      <section style={{ ...s.section, background: "rgba(0,0,0,0.25)" }}>
        <RevealSection>
          <h2 style={s.sectionTitle}>System Architecture</h2>
          <p style={s.sectionSub}>A client-server architecture with real-time communication and Docker-based isolation.</p>

          {/* diagram */}
          <div style={s.archDiagram}>
            <div style={s.archBox}>
              <div style={{ ...s.archLabel, background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>Frontend</div>
              <p style={s.archText}>React SPA · Monaco · XTerm.js</p>
            </div>
            <div style={s.archArrow}>⇅ Socket.io &amp; WebSocket</div>
            <div style={s.archBox}>
              <div style={{ ...s.archLabel, background: "linear-gradient(135deg,#8b5cf6,#22d3ee)" }}>Backend</div>
              <p style={s.archText}>Express · Chokidar · LangGraph Agent</p>
            </div>
            <div style={s.archArrow}>⇅ Docker API</div>
            <div style={s.archBox}>
              <div style={{ ...s.archLabel, background: "linear-gradient(135deg,#10b981,#22d3ee)" }}>Docker Containers</div>
              <p style={s.archText}>Isolated sandboxes · PTY · Vite Dev Server</p>
            </div>
          </div>

          {/* steps */}
          <div style={s.stepsGrid}>
            {archSteps.map((st, i) => (
              <div key={i} style={s.stepCard}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.borderColor = st.color + "66"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; }}>
                <span style={{ ...s.stepNum, color: st.color }}>{st.num}</span>
                <h4 style={s.stepTitle}>{st.title}</h4>
                <p style={s.stepDesc}>{st.desc}</p>
              </div>
            ))}
          </div>
        </RevealSection>
      </section>

      {/* ── TECH STACK ── */}
      <section style={s.section}>
        <RevealSection>
          <h2 style={s.sectionTitle}>Tech Stack</h2>
          <p style={s.sectionSub}>Built with modern, battle-tested technologies.</p>
          <div style={s.techGrid}>
            {techStack.map((t, i) => (
              <div key={i} style={s.techPill}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(99,102,241,0.2)"; e.currentTarget.style.borderColor = "rgba(99,102,241,0.5)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}>
                <span style={s.techName}>{t.name}</span>
                <span style={s.techCat}>{t.cat}</span>
              </div>
            ))}
          </div>
        </RevealSection>
      </section>

      {/* ── CTA FOOTER ── */}
      <section style={s.ctaSection}>
        <RevealSection style={{ textAlign: "center" }}>
          <h2 style={{ ...s.sectionTitle, marginBottom: 16 }}>Ready to start coding?</h2>
          <p style={{ ...s.sectionSub, marginBottom: 36 }}>Launch your own cloud sandbox in seconds — no setup needed.</p>
          <Button size="large" onClick={handleCreateProject} style={s.ctaBtn}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px) scale(1.03)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0) scale(1)"; }}>
            🚀 Create Playground
          </Button>
        </RevealSection>
      </section>

      {/* ── FOOTER ── */}
      <footer style={s.footer}>
        <p>Built with ❤️ — Code Sandbox Clone</p>
      </footer>
    </div>
  );
};

/* ════════════════ STYLES ════════════════ */
const s = {
  page: {
    minHeight: "100vh", width: "100%", background: "linear-gradient(135deg, #0b1120, #111827, #0b1120)",
    fontFamily: "'Inter', sans-serif", color: "#e2e8f0", position: "relative", overflowX: "hidden",
  },
  gridOverlay: {
    position: "fixed", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
    backgroundSize: "60px 60px", pointerEvents: "none", zIndex: 0,
  },
  glow1: {
    position: "fixed", width: 600, height: 600, background: "radial-gradient(circle, rgba(99,102,241,0.25), transparent 70%)",
    filter: "blur(120px)", top: "-10%", left: "-5%", animation: "float 8s ease-in-out infinite", pointerEvents: "none",
  },
  glow2: {
    position: "fixed", width: 500, height: 500, background: "radial-gradient(circle, rgba(139,92,246,0.2), transparent 70%)",
    filter: "blur(120px)", top: "30%", right: "-5%", animation: "float 10s ease-in-out infinite reverse", pointerEvents: "none",
  },

  /* hero */
  hero: {
    minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
    position: "relative", zIndex: 1, padding: "0 24px",
  },
  heroInner: { textAlign: "center", maxWidth: 800, animation: "fadeIn 1s ease forwards" },
  badge: {
    display: "inline-block", padding: "8px 20px", borderRadius: 999,
    background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.3)",
    fontSize: 14, fontWeight: 500, color: "#a5b4fc", marginBottom: 28, letterSpacing: 0.5,
    animation: "borderGlow 3s ease-in-out infinite",
  },
  title: {
    fontSize: "clamp(40px, 8vw, 72px)", fontWeight: 900, marginBottom: 20, letterSpacing: 2, lineHeight: 1.1,
    background: "linear-gradient(90deg, #6366f1, #8b5cf6, #22d3ee)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
  },
  subtitle: { fontSize: 18, color: "#94a3b8", lineHeight: 1.7, marginBottom: 40, maxWidth: 640, margin: "0 auto 40px" },
  heroBtns: { display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" },
  ctaBtn: {
    background: "linear-gradient(135deg, #6366f1, #8b5cf6)", border: "none", color: "#fff",
    padding: "0 48px", height: 56, fontSize: 18, fontWeight: 600, borderRadius: 14,
    boxShadow: "0 10px 30px rgba(99,102,241,0.45)", transition: "all 0.25s ease", cursor: "pointer",
  },
  ghostBtn: {
    background: "transparent", border: "1px solid rgba(255,255,255,0.2)", color: "#cbd5e1",
    padding: "0 36px", height: 56, fontSize: 16, fontWeight: 500, borderRadius: 14, transition: "all 0.25s ease", cursor: "pointer",
  },

  /* sections */
  section: { position: "relative", zIndex: 1, padding: "100px 24px", maxWidth: 1100, margin: "0 auto" },
  sectionTitle: {
    fontSize: 36, fontWeight: 800, textAlign: "center", marginBottom: 12,
    background: "linear-gradient(90deg, #e2e8f0, #cbd5e1)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
  },
  sectionSub: { textAlign: "center", color: "#64748b", fontSize: 16, marginBottom: 56, maxWidth: 560, margin: "0 auto 56px" },

  /* features */
  featGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 24 },
  featCard: {
    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16,
    padding: "32px 28px", transition: "all 0.3s ease", cursor: "default",
  },
  featTitle: { fontSize: 18, fontWeight: 700, color: "#f1f5f9", margin: "16px 0 8px" },
  featDesc: { fontSize: 14, color: "#94a3b8", lineHeight: 1.6 },

  /* architecture */
  archDiagram: {
    display: "flex", flexDirection: "column", alignItems: "center", gap: 8, marginBottom: 56,
    padding: 32, background: "rgba(255,255,255,0.02)", borderRadius: 20, border: "1px solid rgba(255,255,255,0.06)",
  },
  archBox: { textAlign: "center", width: "100%", maxWidth: 400 },
  archLabel: {
    display: "inline-block", padding: "8px 24px", borderRadius: 10, color: "#fff",
    fontWeight: 700, fontSize: 15, letterSpacing: 0.5,
  },
  archText: { fontSize: 13, color: "#94a3b8", marginTop: 6 },
  archArrow: { fontSize: 14, color: "#6366f1", fontWeight: 600, padding: "8px 0", letterSpacing: 1 },
  stepsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 },
  stepCard: {
    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14,
    padding: "24px 24px", transition: "all 0.3s ease",
  },
  stepNum: { fontSize: 28, fontWeight: 800, opacity: 0.7 },
  stepTitle: { fontSize: 16, fontWeight: 700, color: "#f1f5f9", marginTop: 4 },
  stepDesc: { fontSize: 13, color: "#94a3b8", lineHeight: 1.6, marginTop: 6 },

  /* tech */
  techGrid: { display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "center" },
  techPill: {
    display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 12, padding: "16px 28px", transition: "all 0.3s ease", cursor: "default",
  },
  techName: { fontSize: 15, fontWeight: 700, color: "#f1f5f9" },
  techCat: { fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: 1 },

  /* cta */
  ctaSection: {
    position: "relative", zIndex: 1, padding: "80px 24px", textAlign: "center",
    background: "linear-gradient(180deg, transparent, rgba(99,102,241,0.06), transparent)",
  },

  /* footer */
  footer: {
    position: "relative", zIndex: 1, textAlign: "center", padding: "32px 24px",
    borderTop: "1px solid rgba(255,255,255,0.06)", color: "#475569", fontSize: 14,
  },
};
