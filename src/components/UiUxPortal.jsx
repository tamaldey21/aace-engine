import React, { useState } from "react";
import { Layers, Send, MessageSquare, Settings, RefreshCw } from "lucide-react";

export function UiUxPortal() {
  const [borderRadius, setBorderRadius] = useState("8px");
  const [accentColor, setAccentColor] = useState("var(--accent-blue)");
  
  const [components] = useState([
    { name: "Global Header Navigation", status: "Approved", size: "1440px wide" },
    { name: " macOS Light Terminal Console", status: "Approved", size: "Fluid height" },
    { name: "Neural Diagnostics Grid Card", status: "Under Review", size: "320px grid" }
  ]);

  const [chatLog, setChatLog] = useState([
    { sender: "system", text: "[Design Canvas] Active session for Lead UI/UX Designer (Lisa). Track typography variables, spacing scales, figma styles, and test active variables below." }
  ]);
  const [chatInput, setChatInput] = useState("");

  const handleSendChat = (e) => {
    if (e) e.preventDefault();
    if (!chatInput.trim()) return;
    const msg = chatInput;
    setChatLog(prev => [...prev, { sender: "user", text: msg }]);
    setChatInput("");

    setTimeout(() => {
      let reply = `[Design Alert] Layout coordinates synced with active Figma library. Spacing tokens standard.`;
      const lower = msg.toLowerCase();
      if (lower.includes("figma") || lower.includes("library") || lower.includes("component")) {
        reply = `[Figma Sync] Figma Library Status: Design tokens are mapped to active variables. 'Neural Diagnostics Grid Card' is undergoing final compliance checks.`;
      } else if (lower.includes("color") || lower.includes("hex") || lower.includes("theme") || lower.includes("contrast")) {
        reply = `[Palette Audit] Palette Audit: Custom HSL colors check complete. Design system is WCAG AAA compliant.`;
      }
      setChatLog(prev => [...prev, { sender: "system", text: reply }]);
    }, 1000);
  };

  return (
    <div className="uiux-portal-container" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      
      {/* Metric Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px" }}>
        <div className="glass-card" style={{ padding: "16px 20px" }}>
          <span style={{ fontSize: "11px", color: "var(--text-secondary)", fontFamily: "var(--font-mono)", display: "block" }}>FIGMA LIBRARY VERSION</span>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: "8px" }}>
            <span style={{ fontSize: "28px", fontWeight: "bold", color: "var(--accent-purple)", fontFamily: "var(--font-heading)" }}>v3.2</span>
            <span style={{ fontSize: "12px", color: "var(--accent-green)" }}>Live Link Synced</span>
          </div>
        </div>
        <div className="glass-card" style={{ padding: "16px 20px" }}>
          <span style={{ fontSize: "11px", color: "var(--text-secondary)", fontFamily: "var(--font-mono)", display: "block" }}>DESIGN TOKENS DEFINED</span>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: "8px" }}>
            <span style={{ fontSize: "28px", fontWeight: "bold", color: "var(--accent-blue)", fontFamily: "var(--font-heading)" }}>140</span>
            <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Spacing & Color HSL</span>
          </div>
        </div>
        <div className="glass-card" style={{ padding: "16px 20px" }}>
          <span style={{ fontSize: "11px", color: "var(--text-secondary)", fontFamily: "var(--font-mono)", display: "block" }}>COMPONENT CONSISTENCY</span>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: "8px" }}>
            <span style={{ fontSize: "28px", fontWeight: "bold", color: "var(--accent-cyan)", fontFamily: "var(--font-heading)" }}>98%</span>
            <span style={{ fontSize: "12px", color: "var(--accent-green)" }}>WCAG AAA compliant</span>
          </div>
        </div>
      </div>

      <div className="console-grid">
        
        {/* Design Library Component Review */}
        <div className="glass-card">
          <h3 className="plan-section-title"><Layers size={16} /> Visual Design Library Component Review</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "16px" }}>
            {components.map((comp, idx) => (
              <div key={idx} className="deliverable-card" style={{ padding: "14px 16px" }}>
                <div>
                  <span style={{ fontWeight: "600", fontSize: "14px", display: "block", color: "var(--text-primary)" }}>{comp.name}</span>
                  <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>Resolution Spec: {comp.size}</span>
                </div>
                <span className="engine-pill business" style={{ fontSize: "10px", padding: "2px 8px", background: comp.status === "Approved" ? "rgba(16, 185, 129, 0.08)" : "rgba(245, 158, 11, 0.08)", color: comp.status === "Approved" ? "var(--accent-green)" : "var(--accent-yellow)", borderColor: comp.status === "Approved" ? "rgba(16, 185, 129, 0.2)" : "rgba(245, 158, 11, 0.2)" }}>{comp.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Interactive Theme Token Previewer */}
        <div className="glass-card">
          <h3 className="plan-section-title"><Settings size={16} /> Spacing & Spacing Scale Token Previewer</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "16px" }}>
            <div className="input-group">
              <label>Select Border Radius (Token: `--border-radius-card`)</label>
              <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                {["0px", "4px", "8px", "16px", "24px"].map(val => (
                  <button 
                    key={val} 
                    onClick={() => setBorderRadius(val)}
                    style={{
                      padding: "6px 12px", border: "1px solid var(--border-color)", borderRadius: "4px", cursor: "pointer", fontSize: "12px",
                      background: borderRadius === val ? "var(--text-primary)" : "var(--bg-input)",
                      color: borderRadius === val ? "var(--bg-main)" : "var(--text-secondary)"
                    }}
                  >
                    {val === "0px" ? "Sharp" : val}
                  </button>
                ))}
              </div>
            </div>

            <div className="input-group">
              <label>Select Active Accent (Token: `--accent-color`)</label>
              <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                {[
                  { name: "Cyan", value: "var(--accent-cyan)" },
                  { name: "Blue", value: "var(--accent-blue)" },
                  { name: "Purple", value: "var(--accent-purple)" },
                  { name: "Pink", value: "#db2777" }
                ].map(item => (
                  <button 
                    key={item.name} 
                    onClick={() => setAccentColor(item.value)}
                    style={{
                      padding: "6px 12px", border: "1px solid var(--border-color)", borderRadius: "4px", cursor: "pointer", fontSize: "12px",
                      background: accentColor === item.value ? item.value : "var(--bg-input)",
                      color: accentColor === item.value ? "white" : "var(--text-secondary)"
                    }}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Simulated Live Preview Card */}
            <div style={{
              marginTop: "12px", border: "1px solid var(--border-color)", padding: "16px", background: "var(--bg-main)",
              borderRadius: borderRadius
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "12px", fontWeight: "bold", color: "var(--text-primary)" }}>Preview Layout Token</span>
                <span className="live-dot" style={{ display: "inline-block", width: "8px", height: "8px", borderRadius: "50%", background: accentColor }} />
              </div>
              <p style={{ fontSize: "11px", color: "var(--text-secondary)", margin: "8px 0 0 0", lineHeight: 1.4 }}>
                This card dynamically previews the spacing borders and color accents selected above. Active component border-radius matches: {borderRadius}.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* UI/UX Chat Console */}
      <div className="glass-card" style={{ display: "flex", flexDirection: "column", height: "300px" }}>
        <h3 className="plan-section-title"><MessageSquare size={16} /> Direct Message Feed (CEO &lt;&rarr;&gt; Designer Lisa)</h3>
        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px", margin: "16px 0", paddingRight: "4px" }}>
          {chatLog.map((chat, idx) => {
            const isSystem = chat.sender === "system";
            return (
              <div key={idx} style={{
                alignSelf: isSystem ? "flex-start" : "flex-end",
                background: isSystem ? "var(--bg-input)" : "rgba(139, 92, 246, 0.08)",
                border: `1px solid ${isSystem ? "var(--border-color)" : "rgba(139, 92, 246, 0.2)"}`,
                borderRadius: "8px", padding: "10px 14px", fontSize: "13px", maxWidth: "85%"
              }}>
                <span style={{ fontWeight: "600", fontSize: "10px", color: isSystem ? "var(--accent-purple)" : "#a78bfa", display: "block", marginBottom: "4px" }}>
                  {isSystem ? "System Feed" : "Designer (Lisa)"}
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
          <button type="submit" className="btn" style={{ padding: "0 12px", height: "36px", background: "var(--accent-purple)" }}>
            <Send size={14} />
          </button>
        </form>
      </div>

    </div>
  );
}
export default UiUxPortal;
