import React, { useState } from "react";
import { Layers, Target, Send, MessageSquare, FileText, Plus, Check } from "lucide-react";

export function ProductPortal() {
  const [epics, setEpics] = useState([
    { id: 1, title: "Secure Vendor Onboarding Portal", status: "In Progress", health: "Stable" },
    { id: 2, title: "Multi-API LLM Router Integration", status: "Completed", health: "Optimal" },
    { id: 3, title: "Global Context Memory Ledger", status: "In Progress", health: "Needs Review" }
  ]);

  const [prdTitle, setPrdTitle] = useState("");
  const [prdTarget, setPrdTarget] = useState("");
  const [prdOutput, setPrdOutput] = useState("");
  const [isCompiling, setIsCompiling] = useState(false);

  const [chatLog, setChatLog] = useState([
    { sender: "system", text: "[Product Workspace] Active session for Lead Product Manager (Alex). Use the PRD Specifications Compiler to synthesize documents and log roadmap priorities onto the CEO board feed." }
  ]);
  const [chatInput, setChatInput] = useState("");

  const handleSendChat = (e) => {
    if (e) e.preventDefault();
    if (!chatInput.trim()) return;
    const msg = chatInput;
    setChatLog(prev => [...prev, { sender: "user", text: msg }]);
    setChatInput("");

    setTimeout(() => {
      let reply = `[Workspace Alert] Feature milestone registered. Syncing roadmap priorities with CEO board.`;
      const lower = msg.toLowerCase();
      if (lower.includes("roadmap") || lower.includes("epic") || lower.includes("priority")) {
        reply = `[Priority Audit] Focus is locked on finalising the 'Secure Vendor Onboarding Portal' to unblock operations. Epic health is Stable.`;
      } else if (lower.includes("metric") || lower.includes("retention") || lower.includes("growth")) {
        reply = `[Metrics Sync] Current User Retention stands at 42%. Goal is to reach 55% after release of automated webhook status alerts in v1.2.`;
      }
      setChatLog(prev => [...prev, { sender: "system", text: reply }]);
    }, 1000);
  };

  const handleCompilePrd = (e) => {
    e.preventDefault();
    if (!prdTitle.trim() || !prdTarget.trim()) return;
    setIsCompiling(true);
    setPrdOutput("");

    setTimeout(() => {
      setIsCompiling(false);
      setPrdOutput(`PRODUCT REQUIREMENTS DOCUMENT (PRD)

Title: ${prdTitle.trim()}
Author: Alex (Lead Product Manager)
Target Audience: ${prdTarget.trim()}
Core Success Metric: User Retention Rate & Conversion SLA

1. Feature Overview:
Automate document exchanges and verification logs. Surfaces alerts inside Slack/email channels.

2. User Stories:
- As a coordinator, I want to see vendor NDA compliance metadata in an admin panel.
- As a candidate, I want to receive secure employee logons and bypass key options.

3. Out of Scope:
- Multi-currency ledger support.
- Custom invoice builder integration.`);
    }, 1500);
  };

  return (
    <div className="product-portal-container" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      
      {/* Metric Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px" }}>
        <div className="glass-card" style={{ padding: "16px 20px" }}>
          <span style={{ fontSize: "11px", color: "var(--text-secondary)", fontFamily: "var(--font-mono)", display: "block" }}>ACTIVE PRODUCT EPICS</span>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: "8px" }}>
            <span style={{ fontSize: "28px", fontWeight: "bold", color: "var(--accent-blue)", fontFamily: "var(--font-heading)" }}>{epics.length}</span>
            <span style={{ fontSize: "12px", color: "var(--accent-green)" }}>v2.1 Stable</span>
          </div>
        </div>
        <div className="glass-card" style={{ padding: "16px 20px" }}>
          <span style={{ fontSize: "11px", color: "var(--text-secondary)", fontFamily: "var(--font-mono)", display: "block" }}>PRODUCT HEALTH RATING</span>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: "8px" }}>
            <span style={{ fontSize: "28px", fontWeight: "bold", color: "var(--accent-cyan)", fontFamily: "var(--font-heading)" }}>94%</span>
            <span style={{ fontSize: "12px", color: "var(--accent-cyan)" }}>Optimal</span>
          </div>
        </div>
        <div className="glass-card" style={{ padding: "16px 20px" }}>
          <span style={{ fontSize: "11px", color: "var(--text-secondary)", fontFamily: "var(--font-mono)", display: "block" }}>WEEKLY USER RETENTION</span>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: "8px" }}>
            <span style={{ fontSize: "28px", fontWeight: "bold", color: "var(--accent-purple)", fontFamily: "var(--font-heading)" }}>42%</span>
            <span style={{ fontSize: "12px", color: "var(--accent-green)" }}>+1.4% MoM</span>
          </div>
        </div>
      </div>

      <div className="console-grid">
        
        {/* Epics List */}
        <div className="glass-card">
          <h3 className="plan-section-title"><Layers size={16} /> Product Roadmap Epic Tracking</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "16px" }}>
            {epics.map(epic => (
              <div key={epic.id} className="deliverable-card" style={{ padding: "14px 16px" }}>
                <div>
                  <span style={{ fontWeight: "600", fontSize: "14px", display: "block", color: "var(--text-primary)" }}>{epic.title}</span>
                  <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>Health Status: <span style={{ color: epic.health === "Stable" || epic.health === "Optimal" ? "var(--accent-green)" : "var(--accent-red)", fontWeight: "600" }}>{epic.health}</span></span>
                </div>
                <span className="engine-pill business" style={{ fontSize: "10px", padding: "2px 8px" }}>{epic.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* PRD Compiler Form */}
        <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <h3 className="plan-section-title"><FileText size={16} /> PRD Specifications Compiler</h3>
          <form onSubmit={handleCompilePrd} style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "8px" }}>
            <div className="input-group">
              <label>Feature / Module Title</label>
              <input 
                type="text" 
                placeholder="e.g. Email Alert Gateway" 
                value={prdTitle} 
                onChange={(e) => setPrdTitle(e.target.value)} 
                required
              />
            </div>
            <div className="input-group">
              <label>Target Segment / Audience</label>
              <input 
                type="text" 
                placeholder="e.g. Contract Vendors" 
                value={prdTarget} 
                onChange={(e) => setPrdTarget(e.target.value)} 
                required
              />
            </div>
            <button type="submit" disabled={isCompiling} className="btn" style={{ background: "linear-gradient(135deg, var(--accent-blue), #1d4ed8)", width: "100%", justifyContent: "center" }}>
              {isCompiling ? "Compiling PRD..." : "Synthesize PRD Blueprint"}
            </button>
          </form>

          {prdOutput && (
            <pre style={{
              background: "var(--bg-main)", border: "1px solid var(--border-color)", borderRadius: "6px",
              padding: "12px", color: "var(--text-primary)", fontSize: "11px", fontFamily: "var(--font-mono)",
              lineHeight: 1.5, overflowX: "auto", margin: "10px 0 0 0", whiteSpace: "pre-wrap", maxHeight: "150px"
            }}>
              <code>{prdOutput}</code>
            </pre>
          )}
        </div>

      </div>

      {/* Product Chat Console */}
      <div className="glass-card" style={{ display: "flex", flexDirection: "column", height: "300px" }}>
        <h3 className="plan-section-title"><MessageSquare size={16} /> Direct Message Feed (CEO &lt;&rarr;&gt; PM Alex)</h3>
        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px", margin: "16px 0", paddingRight: "4px" }}>
          {chatLog.map((chat, idx) => {
            const isSystem = chat.sender === "system";
            return (
              <div key={idx} style={{
                alignSelf: isSystem ? "flex-start" : "flex-end",
                background: isSystem ? "var(--bg-input)" : "rgba(59, 130, 246, 0.08)",
                border: `1px solid ${isSystem ? "var(--border-color)" : "rgba(59, 130, 246, 0.2)"}`,
                borderRadius: "8px", padding: "10px 14px", fontSize: "13px", maxWidth: "85%"
              }}>
                <span style={{ fontWeight: "600", fontSize: "10px", color: isSystem ? "var(--accent-blue)" : "#3b82f6", display: "block", marginBottom: "4px" }}>
                  {isSystem ? "System Feed" : "PM (Alex)"}
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
          <button type="submit" className="btn" style={{ padding: "0 12px", height: "36px", background: "var(--accent-blue)" }}>
            <Send size={14} />
          </button>
        </form>
      </div>

    </div>
  );
}
export default ProductPortal;
