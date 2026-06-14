import React, { useState, useEffect, useRef } from "react";
import { Code, Server, Terminal as TermIcon, Play, RefreshCw, Layers, Bot, Send, Link, Upload, UploadCloud } from "lucide-react";

export function DevPortal() {
  const [editorFile, setEditorFile] = useState("api"); // api | docker | page
  const [deployLogs, setDeployLogs] = useState([]);
  const [isDeploying, setIsDeploying] = useState(false);
  const [projectLink, setProjectLink] = useState(() => localStorage.getItem("aace_project_link") || "");
  const [projectLinkSaved, setProjectLinkSaved] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const handleSaveProjectLink = () => {
    if (projectLink.trim()) {
      localStorage.setItem("aace_project_link", projectLink.trim());
      setProjectLinkSaved(true);
      setTimeout(() => setProjectLinkSaved(false), 3000);
      setDeployLogs(prev => [
        ...prev,
        `[DevOps Bot] Project repository linked: ${projectLink.trim()}`
      ]);
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const names = files.map(f => f.name);
      setUploadedFiles(prev => [...prev, ...names]);
      setDeployLogs(prev => [
        ...prev,
        `[DevOps Bot] Received upload of ${files.length} file(s): ${names.join(", ")}`,
        `[DevOps Bot] Upload processed. Directory structure synchronized.`
      ]);
    }
  };

  const [activeTasks, setActiveTasks] = useState([
    { id: 1, text: "Build JWT authentication Middleware", done: true },
    { id: 2, text: "Configure CORS access limits in server.js", done: false },
    { id: 3, text: "Optimize React home listing grid render", done: false },
    { id: 4, text: "Map database migration script templates", done: true }
  ]);

  const [chatLog, setChatLog] = useState([
    { sender: "bot", text: "[CTO Architecture Bot] CTO Architecture Bot active. I am auditing database schemas, testing code compilation targets, and managing the backlog check. Ask me about system designs, security setups, or indexes." }
  ]);
  const [chatInput, setChatInput] = useState("");

  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatLog]);

  const handleSendCto = (e, directText) => {
    if (e && e.preventDefault) e.preventDefault();
    const queryText = directText || chatInput;
    if (!queryText.trim()) return;
    setChatLog(prev => [...prev, { sender: "user", text: queryText }]);
    setChatInput("");

    setTimeout(() => {
      const lower = queryText.toLowerCase();
      let reply = `[CTO Architecture Bot] Request parsed. All staging container parameters are currently stable. Let me know if you would like me to review sequence structures or Prisma schemas.`;
      
      if (lower.includes("db") || lower.includes("database") || lower.includes("sql") || lower.includes("schema") || lower.includes("index")) {
        reply = `[CTO Architecture Bot] Database Index Audit: Recommend setting a composite index on (project_id, status) inside the Project table to speed up query execution time. Prisma schema has index definitions set.`;
      } else if (lower.includes("auth") || lower.includes("token") || lower.includes("jwt") || lower.includes("security")) {
        reply = `[CTO Architecture Bot] Authentication Audit: Recommend setting JWT tokens to expire in 1 hour. Session verification endpoints should use HS256 HMAC encryption with keys loaded from secure environment storage.`;
      } else if (lower.includes("docker") || lower.includes("container") || lower.includes("port")) {
        reply = `[CTO Architecture Bot] Staging containers are bound to port 8080. Base container image is node:20-alpine to minimize build dependencies and footprint.`;
      }

      setChatLog(prev => [...prev, { sender: "bot", text: reply }]);
    }, 1000);
  };

  const apiCode = `// src/routes/projects.js - Express CRUD Router
import express from 'express';
const router = express.Router();

// GET /projects
router.get('/', async (req, res) => {
  try {
    const projects = await req.db.models.Project.findAll();
    res.json({ success: true, data: projects });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;`;

  const dockerCode = `# Dockerfile - AACE Sandbox Container
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 8080
CMD ["npm", "start"]`;

  const pageCode = `// src/components/EngineStatus.jsx
import React from 'react';

export default function EngineStatus({ status }) {
  return (
    <div className="status-indicator">
      <span className={\`dot \${status === 'active' ? 'pulse' : ''}\`} />
      <span>Node Status: {status.toUpperCase()}</span>
    </div>
  );
}`;

  const triggerDeployment = async () => {
    setIsDeploying(true);
    setDeployLogs([]);

    const allSteps = [
      "[DevOps Bot] Initializing AACE multi-stack build pipeline...",
      "[DevOps Bot] Resolving workspace dependencies (package.json)...",
      "[DevOps Bot] Installing node_modules: express, mongoose, cors, dotenv...",
      "[DevOps Bot] Installing client packages: react, vite, lucide-react...",
      "[DevOps Bot] Compiling React client bundles via Vite...",
      "[DevOps Bot] Transforming 1778 JSX/JS modules...",
      "[DevOps Bot] Bundling CEO Chat Portal (CeoChat.jsx)... ✓",
      "[DevOps Bot] Bundling HR Operations Portal (HrPortal.jsx)... ✓",
      "[DevOps Bot] Bundling CTO Developer Board (DevPortal.jsx)... ✓",
      "[DevOps Bot] Bundling COO Operations Portal (OpsPortal.jsx)... ✓",
      "[DevOps Bot] Bundling Product Manager Portal (ProductPortal.jsx)... ✓",
      "[DevOps Bot] Bundling UI/UX Design Portal (UiUxPortal.jsx)... ✓",
      "[DevOps Bot] Bundling QA Testing Portal (QaPortal.jsx)... ✓",
      "[DevOps Bot] Bundling Marketing & Growth Portal (MarketingPortal.jsx)... ✓",
      "[DevOps Bot] Bundling Legal & Compliance Portal (LegalPortal.jsx)... ✓",
      "[DevOps Bot] Bundling Memory Vault & Engine Matrix... ✓",
      "[DevOps Bot] Building production target dist/index.html (0.65 kB)...",
      "[DevOps Bot] Optimizing CSS bundle (dist/assets/index.css 34.14 kB)...",
      "[DevOps Bot] Tree-shaking JS bundle (dist/assets/index.js 435.40 kB)...",
      "[DevOps Bot] Connecting MongoDB Atlas cluster (MONGO_URI)...",
      "[DevOps Bot] Atlas handshake: Connected to MongoDB successfully. ✓",
      "[DevOps Bot] Seeding employees directory (10 agents + CEO)... ✓",
      "[DevOps Bot] API server launched on http://localhost:3001 ✓",
      "[DevOps Bot] Vite dev server launched on http://localhost:5173 ✓",
      "[DevOps Bot] Hot-reload watch mode: ACTIVE ✓",
      "[DevOps Bot] ✅ BUILD SUCCESSFUL — All 10 portals deployed and operational.",
    ];

    for (let i = 0; i < allSteps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 380));
      setDeployLogs(prev => [...prev, allSteps[i]]);
    }
    setIsDeploying(false);
  };

  const toggleTask = (id) => {
    setActiveTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  return (
    <div className="dev-portal-container" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      
      {/* Project Repository Link & File Upload */}
      <div className="glass-card">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
          
          {/* Project Link Input */}
          <div>
            <h4 style={{ margin: "0 0 12px 0", fontSize: "14px", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px", color: "var(--text-primary)" }}>
              <Link size={16} style={{ color: "var(--accent-blue)" }} /> Connect Project Repository
            </h4>
            <div style={{ display: "flex", gap: "8px" }}>
              <input 
                type="text"
                placeholder="e.g. https://github.com/your-org/your-repo"
                value={projectLink}
                onChange={(e) => setProjectLink(e.target.value)}
                style={{
                  flex: 1, background: "var(--bg-input)", border: "1px solid var(--border-color)",
                  borderRadius: "6px", padding: "8px 12px", color: "var(--text-primary)", outline: "none", fontSize: "13px"
                }}
              />
              <button 
                onClick={handleSaveProjectLink}
                className="btn btn-secondary"
                style={{ padding: "8px 14px", background: "var(--accent-blue)", borderColor: "var(--accent-blue)", color: "white" }}
              >
                Link Repo
              </button>
            </div>
            {projectLinkSaved && (
              <p style={{ fontSize: "11px", color: "var(--accent-green)", margin: "6px 0 0 0", fontWeight: "500" }}>
                ✓ Repository link saved successfully.
              </p>
            )}
          </div>

          {/* File / Folder Upload Option */}
          <div>
            <h4 style={{ margin: "0 0 12px 0", fontSize: "14px", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px", color: "var(--text-primary)" }}>
              <Upload size={16} style={{ color: "var(--accent-blue)" }} /> Upload Source Files / Directory
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{
                border: "1.5px dashed var(--border-color)", borderRadius: "8px",
                padding: "16px", textAlign: "center", cursor: "pointer",
                background: "rgba(0, 0, 0, 0.01)"
              }} onClick={() => document.getElementById("cto-file-upload")?.click()}>
                <UploadCloud size={24} style={{ color: "var(--text-muted)", marginBottom: "6px", display: "inline-block" }} />
                <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: 0 }}>
                  Click to browse or drop your code files/directories here
                </p>
                <input 
                  id="cto-file-upload"
                  type="file"
                  multiple
                  webkitdirectory="true" // allows folder upload
                  onChange={handleFileUpload}
                  style={{ display: "none" }}
                />
              </div>
              {uploadedFiles.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <span style={{ fontSize: "11px", color: "var(--text-secondary)", fontWeight: "500" }}>Uploaded files:</span>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", maxHeight: "80px", overflowY: "auto" }}>
                    {uploadedFiles.map((f, i) => (
                      <span key={i} style={{
                        fontSize: "10px", background: "var(--bg-input)", border: "1px solid var(--border-color)",
                        borderRadius: "4px", padding: "2px 6px", fontFamily: "var(--font-mono)", color: "var(--text-primary)"
                      }}>{f}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Editor & DevOps Columns */}
      <div className="console-grid">
        
        {/* Editor Box */}
        <div className="glass-card" style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-color)", paddingBottom: "12px", marginBottom: "16px" }}>
            <h3 className="plan-section-title" style={{ border: "none", margin: 0, padding: 0 }}><Code size={16} /> Code Editor Workspace</h3>
            <div style={{ display: "flex", gap: "6px", background: "var(--bg-input)", borderRadius: "4px", padding: "2px" }}>
              <button 
                onClick={() => setEditorFile("api")} 
                style={{
                  fontSize: "11px", padding: "4px 8px", border: "none", cursor: "pointer", borderRadius: "3px",
                  background: editorFile === "api" ? "var(--accent-blue)" : "transparent",
                  color: editorFile === "api" ? "white" : "var(--text-secondary)"
                }}
              >
                projects.js
              </button>
              <button 
                onClick={() => setEditorFile("docker")} 
                style={{
                  fontSize: "11px", padding: "4px 8px", border: "none", cursor: "pointer", borderRadius: "3px",
                  background: editorFile === "docker" ? "var(--accent-blue)" : "transparent",
                  color: editorFile === "docker" ? "white" : "var(--text-secondary)"
                }}
              >
                Dockerfile
              </button>
              <button 
                onClick={() => setEditorFile("page")} 
                style={{
                  fontSize: "11px", padding: "4px 8px", border: "none", cursor: "pointer", borderRadius: "3px",
                  background: editorFile === "page" ? "var(--accent-blue)" : "transparent",
                  color: editorFile === "page" ? "white" : "var(--text-secondary)"
                }}
              >
                EngineStatus.jsx
              </button>
            </div>
          </div>

          <pre style={{
            background: "var(--bg-main)", border: "1px solid var(--border-color)", borderRadius: "6px",
            padding: "16px", color: "var(--text-primary)", fontSize: "12px", fontFamily: "var(--font-mono)",
            lineHeight: 1.5, overflowX: "auto", margin: 0, height: "260px"
          }}>
            <code>
              {editorFile === "api" && apiCode}
              {editorFile === "docker" && dockerCode}
              {editorFile === "page" && pageCode}
            </code>
          </pre>
        </div>

        {/* Backlog checklist */}
        <div className="glass-card">
          <h3 className="plan-section-title"><Layers size={16} /> Engineering Backlog</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "16px" }}>
            {activeTasks.map(task => (
              <div 
                key={task.id} 
                className={`task-item ${task.done ? "completed" : ""}`} 
                onClick={() => toggleTask(task.id)}
                style={{ padding: "10px 14px", display: "flex", gap: "10px", alignItems: "center" }}
              >
                <div className="task-checkbox" style={{
                  background: task.done ? "var(--accent-blue)" : "transparent",
                  borderColor: task.done ? "var(--accent-blue)" : "var(--text-secondary)"
                }}>
                  {task.done && <span style={{ color: "white", fontSize: "10px", fontWeight: "bold" }}>✓</span>}
                </div>
                <span className="task-text" style={{ fontSize: "13px" }}>{task.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Split Layout: Chat & CTO Profile */}
      <div className="chat-profile-grid">
        
        {/* Interactive CTO Bot Chat Console */}
        <div className="glass-card" style={{ display: "flex", flexDirection: "column", height: "420px" }}>
          <h3 className="plan-section-title">
            <Bot size={16} style={{ color: "var(--accent-blue)" }} /> Consult CTO Architecture Bot
          </h3>
          <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px", margin: "16px 0", paddingRight: "4px" }}>
            {chatLog.map((chat, idx) => {
              const isBot = chat.sender === "bot";
              return (
                <div key={idx} style={{
                  alignSelf: isBot ? "flex-start" : "flex-end",
                  background: isBot ? "rgba(37, 99, 235, 0.04)" : "var(--bg-input)",
                  border: `1px solid ${isBot ? "rgba(37, 99, 235, 0.15)" : "var(--border-color)"}`,
                  borderRadius: "8px", padding: "10px 14px", fontSize: "13px", maxWidth: "85%",
                  color: "var(--text-primary)", whiteSpace: "pre-wrap"
                }}>
                  <span style={{ fontWeight: "600", fontSize: "10px", color: isBot ? "var(--accent-blue)" : "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                    {isBot ? "CTO Architecture Bot" : "Developer Staff"}
                  </span>
                  {chat.text}
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>
          <form onSubmit={(e) => handleSendCto(e)} style={{ display: "flex", gap: "8px" }}>
            <input 
              type="text" 
              placeholder="Ask CTO Architecture Bot about database indexing, JWT security, Docker config..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              style={{
                flex: 1, background: "var(--bg-input)", border: "1px solid var(--border-color)",
                borderRadius: "6px", padding: "8px 12px", color: "var(--text-primary)", outline: "none", fontSize: "13px"
              }}
            />
            <button type="submit" className="btn" style={{ padding: "0 12px", height: "36px", background: "var(--accent-blue)" }}>
              <Send size={14} />
            </button>
          </form>
        </div>

        {/* CTO Bot Profile Card */}
        <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "14px", height: "420px", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", borderBottom: "1px solid var(--border-color)", paddingBottom: "10px" }}>
              <div style={{
                width: "32px", height: "32px", borderRadius: "50%",
                background: "rgba(37, 99, 235, 0.08)", border: "1px solid var(--accent-blue)",
                display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                <Bot size={18} style={{ color: "var(--accent-blue)" }} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: "13px", fontWeight: "600", color: "var(--text-primary)" }}>CTO Architecture Bot</h4>
                <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
                  <span className="live-dot" style={{ display: "inline-block", width: "6px", height: "6px", borderRadius: "50%", background: "var(--accent-green)", animation: "pulse-green 1.5s infinite" }} />
                  <span style={{ fontSize: "10px", color: "var(--accent-green)", fontWeight: "bold" }}>ACTIVE AGENT</span>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "12px", fontSize: "11px", color: "var(--text-secondary)" }}>
              <div><strong style={{ color: "var(--text-primary)" }}>Model:</strong> Gemini 1.5 Pro (Custom tuning)</div>
              <div><strong style={{ color: "var(--text-primary)" }}>Scope:</strong> Technical structures, APIs, SQL indexing, deployment rules</div>
              <div><strong style={{ color: "var(--text-primary)" }}>Current Target:</strong> Prisma Schema & Docker container constraints</div>
            </div>
          </div>

          <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "10px" }}>
            <span style={{ fontSize: "10px", fontWeight: "bold", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>QUICK CONSULTATIONS</span>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <button 
                onClick={() => handleSendCto(null, "Review database composite index strategy")} 
                className="light-helper-btn"
                style={{ width: "100%", textAlign: "left", padding: "6px 10px", fontSize: "11px" }}
                type="button"
              >
                🔍 Audit DB Indexes
              </button>
              <button 
                onClick={() => handleSendCto(null, "What is the JWT token encryption and expiry specification?")} 
                className="light-helper-btn"
                style={{ width: "100%", textAlign: "left", padding: "6px 10px", fontSize: "11px" }}
                type="button"
              >
                🔑 Check JWT Security
              </button>
              <button 
                onClick={() => handleSendCto(null, "Show Docker staging container configuration settings")} 
                className="light-helper-btn"
                style={{ width: "100%", textAlign: "left", padding: "6px 10px", fontSize: "11px" }}
                type="button"
              >
                🐳 View Docker Image Config
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* DevOps Deploy Terminal */}
      <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 className="plan-section-title" style={{ borderLeftColor: "var(--accent-blue)", margin: 0, paddingLeft: "10px" }}>
              <Server size={18} style={{ color: "var(--accent-blue)" }} /> DevOps & Deploy Bot Pipeline (Deploy in File)
            </h3>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
              Hot-reload deploy configuration script triggers.
            </p>
          </div>
          <button 
            onClick={triggerDeployment} 
            disabled={isDeploying}
            className="btn" 
            style={{ background: "linear-gradient(135deg, var(--accent-blue), #1d4ed8)", padding: "10px 20px" }}
          >
            {isDeploying ? (
              <>
                <RefreshCw size={14} className="spin-animation" style={{ animation: "spin 2s linear infinite" }} />
                Deploying target file...
              </>
            ) : (
              <>
                <Play size={14} fill="white" /> Launch Build Script
              </>
            )}
          </button>
        </div>

        {/* Deploy output logs */}
        <div className="terminal-window" style={{ minHeight: "180px" }}>
          <div className="terminal-header">
            <div className="terminal-dots">
              <span className="terminal-dot red" />
              <span className="terminal-dot yellow" />
              <span className="terminal-dot green" />
            </div>
            <span className="terminal-title">DEPLOY_SHELL // logger</span>
          </div>
          <div className="terminal-body" style={{ maxHeight: "200px" }}>
            {deployLogs.length === 0 ? (
              <span style={{ color: "var(--text-muted)", fontSize: "12px" }}>Awaiting build execution... Press 'Launch Build Script' to deploy to container.</span>
            ) : (
              deployLogs.map((log, idx) => (
                <div key={idx} style={{ 
                  color: log.includes("✅") || log.includes("✓") || log.includes("SUCCESSFUL") 
                    ? "var(--accent-green)" 
                    : log.includes("Error") || log.includes("FAIL") 
                      ? "var(--accent-red)" 
                      : "var(--text-primary)",
                  fontSize: "12px",
                  lineHeight: "1.6"
                }}>
                  {log}
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
export default DevPortal;
