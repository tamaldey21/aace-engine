import React, { useState } from "react";
import { Send, MessageSquare, Check, AlertCircle, Plus, Terminal } from "lucide-react";

export function QaPortal() {
  const [bugs, setBugs] = useState([
    { id: "BUG-241", title: "White text rendering invisibly on light card backdrops", severity: "High", status: "Resolved" },
    { id: "BUG-242", title: "PostCSS stray closing brace error on line 1124 in index.css", severity: "Critical", status: "Resolved" },
    { id: "BUG-243", title: "Memory vault ledger entries failing token lookup", severity: "Medium", status: "Open" }
  ]);

  const [testSuites, setTestSuites] = useState([
    { id: 1, name: "Landing Page 3D Undulating Wave Grid Handshake", passed: true },
    { id: 2, name: "Vite Client Bundler Production Target Index Compiler", passed: true },
    { id: 3, name: "Global Context Memory Vault Commit Audit", passed: false },
    { id: 4, name: "Express Session Token Expiry Validation", passed: true }
  ]);

  const [bugTitle, setBugTitle] = useState("");
  const [bugSeverity, setBugSeverity] = useState("High");

  const [chatLog, setChatLog] = useState([
    { sender: "system", text: "[QA Pipeline] Active session for Lead QA Tester (Kevin). Run automated test harnesses, verify CSS contrast targets, report bugs, and view open tickets." }
  ]);
  const [chatInput, setChatInput] = useState("");

  const handleSendChat = (e) => {
    if (e) e.preventDefault();
    if (!chatInput.trim()) return;
    const msg = chatInput;
    setChatLog(prev => [...prev, { sender: "user", text: msg }]);
    setChatInput("");

    setTimeout(() => {
      let reply = `[QA Alert] Regression run complete. Automated checklist synced with CEO console.`;
      const lower = msg.toLowerCase();
      if (lower.includes("test") || lower.includes("suite") || lower.includes("coverage")) {
        reply = `[QA Suites] Active Test Suites: 4 suites total. 3 passed, 1 failed. Integration Test 'Global Context Memory Vault Commit Audit' has failed assert codes.`;
      } else if (lower.includes("bug") || lower.includes("report") || lower.includes("error")) {
        reply = `[QA Tracker] Bug Tracker active: currently 1 Open bug ('BUG-243' - Memory vault ledger entries failing token lookup) under review.`;
      }
      setChatLog(prev => [...prev, { sender: "system", text: reply }]);
    }, 1000);
  };

  const handleReportBug = (e) => {
    e.preventDefault();
    if (!bugTitle.trim()) return;

    const newBugId = "BUG-" + Math.floor(244 + Math.random() * 50);
    const newBug = {
      id: newBugId,
      title: bugTitle.trim(),
      severity: bugSeverity,
      status: "Open"
    };

    setBugs(prev => [...prev, newBug]);
    setBugTitle("");

    // Simulate chat log report confirmation
    setChatLog(prev => [
      ...prev,
      {
        sender: "system",
        text: `[Bug Board] Ticket created: logged "${bugTitle.trim()}" inside bug board with severity "${bugSeverity}". Unique ID generated: ${newBugId}.`
      }
    ]);
  };

  const toggleSuite = (id) => {
    setTestSuites(prev => prev.map(suite => suite.id === id ? { ...suite, passed: !suite.passed } : suite));
  };

  return (
    <div className="qa-portal-container" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      
      {/* Metric Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px" }}>
        <div className="glass-card" style={{ padding: "16px 20px" }}>
          <span style={{ fontSize: "11px", color: "var(--text-secondary)", fontFamily: "var(--font-mono)", display: "block" }}>TEST RUNS COVERAGE</span>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: "8px" }}>
            <span style={{ fontSize: "28px", fontWeight: "bold", color: "var(--accent-green)", fontFamily: "var(--font-heading)" }}>82%</span>
            <span style={{ fontSize: "12px", color: "var(--accent-green)" }}>+4.2% MoM</span>
          </div>
        </div>
        <div className="glass-card" style={{ padding: "16px 20px" }}>
          <span style={{ fontSize: "11px", color: "var(--text-secondary)", fontFamily: "var(--font-mono)", display: "block" }}>OPEN COMPLIANCE BUGS</span>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: "8px" }}>
            <span style={{ fontSize: "28px", fontWeight: "bold", color: "var(--accent-red)", fontFamily: "var(--font-heading)" }}>
              {bugs.filter(b => b.status === "Open").length}
            </span>
            <span style={{ fontSize: "12px", color: "var(--accent-red)", fontWeight: "600" }}>Action required</span>
          </div>
        </div>
        <div className="glass-card" style={{ padding: "16px 20px" }}>
          <span style={{ fontSize: "11px", color: "var(--text-secondary)", fontFamily: "var(--font-mono)", display: "block" }}>QA BUILD VERSION</span>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: "8px" }}>
            <span style={{ fontSize: "28px", fontWeight: "bold", color: "var(--accent-cyan)", fontFamily: "var(--font-heading)" }}>v2.1.0</span>
            <span style={{ fontSize: "12px", color: "var(--accent-green)" }}>stable_build</span>
          </div>
        </div>
      </div>

      <div className="console-grid">
        
        {/* Test Case Board */}
        <div className="glass-card">
          <h3 className="plan-section-title"><Terminal size={16} /> Automation Suite Checklist</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "16px" }}>
            {testSuites.map(suite => (
              <div 
                key={suite.id} 
                className={`task-item ${suite.passed ? "completed" : ""}`}
                onClick={() => toggleSuite(suite.id)}
                style={{ padding: "10px 14px", display: "flex", gap: "10px", alignItems: "center" }}
              >
                <div className="task-checkbox" style={{
                  background: suite.passed ? "var(--accent-green)" : "transparent",
                  borderColor: suite.passed ? "var(--accent-green)" : "var(--accent-red)"
                }}>
                  {suite.passed && <span style={{ color: "white", fontSize: "10px", fontWeight: "bold" }}>✓</span>}
                </div>
                <span style={{ fontSize: "13px", color: "var(--text-primary)" }}>{suite.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bug Reporter Form & Pipeline */}
        <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <h3 className="plan-section-title"><AlertCircle size={16} /> File QA Bug Ticket</h3>
          <form onSubmit={handleReportBug} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div className="input-group">
              <label>Bug Title / Issue Description</label>
              <input 
                type="text" 
                placeholder="e.g. Broken index link on login page..." 
                value={bugTitle} 
                onChange={(e) => setBugTitle(e.target.value)} 
                required
              />
            </div>
            
            <div className="input-group">
              <label>Severity Level</label>
              <select 
                value={bugSeverity} 
                onChange={(e) => setBugSeverity(e.target.value)}
                style={{
                  width: "100%", background: "var(--bg-input)", border: "1px solid var(--border-color)",
                  borderRadius: "6px", padding: "8px 12px", color: "var(--text-primary)", outline: "none", fontSize: "13px"
                }}
              >
                <option value="Critical">Critical (Blocker)</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <button type="submit" className="btn" style={{ background: "linear-gradient(135deg, var(--accent-red), #dc2626)", width: "100%", justifyContent: "center", marginTop: "4px" }}>
              <Plus size={16} /> Log Bug to Dev Backlog
            </button>
          </form>

          {/* Mini Bugs Pipeline */}
          <div style={{ marginTop: "10px" }}>
            <span style={{ fontSize: "10px", fontWeight: "bold", color: "var(--text-secondary)" }}>ACTIVE PIPELINE TICKETS</span>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "6px", maxHeight: "110px", overflowY: "auto" }}>
              {bugs.map((bug) => (
                <div key={bug.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px", padding: "6px 8px", background: "var(--bg-input)", border: "1px solid var(--border-color)", borderRadius: "4px" }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontWeight: "bold", color: bug.status === "Resolved" ? "var(--text-muted)" : "var(--accent-red)" }}>{bug.id}</span>
                  <span style={{ flex: 1, marginLeft: "8px", color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginRight: "12px" }}>{bug.title}</span>
                  <span className="engine-pill" style={{ 
                    fontSize: "9px", padding: "1px 6px",
                    background: bug.status === "Resolved" ? "rgba(16, 185, 129, 0.08)" : "rgba(239, 68, 68, 0.08)",
                    color: bug.status === "Resolved" ? "var(--accent-green)" : "var(--accent-red)",
                    borderColor: bug.status === "Resolved" ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.2)"
                  }}>{bug.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* QA Chat Console */}
      <div className="glass-card" style={{ display: "flex", flexDirection: "column", height: "300px" }}>
        <h3 className="plan-section-title"><MessageSquare size={16} /> Direct Message Feed (CEO &lt;&rarr;&gt; QA Kevin)</h3>
        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px", margin: "16px 0", paddingRight: "4px" }}>
          {chatLog.map((chat, idx) => {
            const isSystem = chat.sender === "system";
            return (
              <div key={idx} style={{
                alignSelf: isSystem ? "flex-start" : "flex-end",
                background: isSystem ? "var(--bg-input)" : "rgba(239, 68, 68, 0.05)",
                border: `1px solid ${isSystem ? "var(--border-color)" : "rgba(239, 68, 68, 0.2)"}`,
                borderRadius: "8px", padding: "10px 14px", fontSize: "13px", maxWidth: "85%"
              }}>
                <span style={{ fontWeight: "600", fontSize: "10px", color: isSystem ? "var(--accent-red)" : "#f87171", display: "block", marginBottom: "4px" }}>
                  {isSystem ? "System Feed" : "QA (Kevin)"}
                </span>
                {chat.text}
              </div>
            );
          })}
        </div>
        <form onSubmit={handleSendChat} style={{ display: "flex", gap: "8px" }}>
          <input 
            type="text" 
            placeholder="Post status update or message CEO..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            style={{
              flex: 1, background: "var(--bg-input)", border: "1px solid var(--border-color)",
              borderRadius: "6px", padding: "8px 12px", color: "var(--text-primary)", outline: "none", fontSize: "13px"
            }}
          />
          <button type="submit" className="btn" style={{ padding: "0 12px", height: "36px", background: "var(--accent-red)" }}>
            <Send size={14} />
          </button>
        </form>
      </div>

    </div>
  );
}
export default QaPortal;
