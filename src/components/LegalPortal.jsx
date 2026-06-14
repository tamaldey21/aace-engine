import React, { useState } from "react";
import { Send, MessageSquare, ShieldCheck, Plus, FileText } from "lucide-react";

export function LegalPortal() {
  const [contracts, setContracts] = useState([
    { id: "CON-101", party: "Sarah Jenkins", type: "Employment Agreement & IP", status: "Executed" },
    { id: "CON-102", party: "Marcus Chen", type: "Proprietary NDA Clause", status: "Executed" },
    { id: "CON-103", party: "Stripe Gateway", type: "API Vendor SLA Terms", status: "Under Review" }
  ]);

  const [vendorName, setVendorName] = useState("");
  const [contractType, setContractType] = useState("NDA");
  const [contractOutput, setContractOutput] = useState("");
  const [isCompiling, setIsCompiling] = useState(false);

  const [chatLog, setChatLog] = useState([
    { sender: "system", text: "[Legal Ledger] Active session for Lead Legal Counsel (Harvey). Manage intellectual property clauses, review vendor NDAs, evaluate regulatory compliance status, and log executed contracts below." }
  ]);
  const [chatInput, setChatInput] = useState("");

  const handleSendChat = (e) => {
    if (e) e.preventDefault();
    if (!chatInput.trim()) return;
    const msg = chatInput;
    setChatLog(prev => [...prev, { sender: "user", text: msg }]);
    setChatInput("");

    setTimeout(() => {
      let reply = `[Legal Alert] Contract terms audited. All clauses conform to standard compliance thresholds.`;
      const lower = msg.toLowerCase();
      if (lower.includes("contract") || lower.includes("nda") || lower.includes("ip") || lower.includes("agreement")) {
        reply = `[Agreement Vault] Contract Review: Mapped 3 active documents. Standard contractor IP assignment clauses require all work products to belong strictly to the AACE Company Core.`;
      } else if (lower.includes("risk") || lower.includes("compliance") || lower.includes("audit")) {
        reply = `[Risk Check] Compliance Audit: Current score stands at 100%. Mapped no active regulatory risks or pending liability flags.`;
      }
      setChatLog(prev => [...prev, { sender: "system", text: reply }]);
    }, 1000);
  };

  const handleCompileContract = (e) => {
    e.preventDefault();
    if (!vendorName.trim()) return;
    setIsCompiling(true);
    setContractOutput("");

    setTimeout(() => {
      setIsCompiling(false);
      const docId = "CON-" + Math.floor(104 + Math.random() * 50);
      setContractOutput(`MUTUAL ${contractType.toUpperCase()} AGREEMENT

Document ID: ${docId}
Effective Date: 2026-06-13
Drafter: Harvey (Lead Legal Counsel)
Disclosing Party: AACE Company Core Engine
Receiving Party: ${vendorName.trim()}

1. Confidentiality obligations:
The Receiving Party agrees to safeguard all proprietary repository keys, data models, and database schema mappings.

2. Intellectual Property Rights:
All code scripts, React bundles, and design tokens created under this agreement are assigned fully to AACE Core.

3. Dispute Resolution:
Governed by local standard arbitration panels.`);
      
      setContracts(prev => [
        ...prev,
        { id: docId, party: vendorName.trim(), type: `${contractType} Agreement`, status: "Drafted" }
      ]);
      setVendorName("");
    }, 1500);
  };

  return (
    <div className="legal-portal-container" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      
      {/* Metric Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px" }}>
        <div className="glass-card" style={{ padding: "16px 20px" }}>
          <span style={{ fontSize: "11px", color: "var(--text-secondary)", fontFamily: "var(--font-mono)", display: "block" }}>REGULATORY COMPLIANCE SCORE</span>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: "8px" }}>
            <span style={{ fontSize: "28px", fontWeight: "bold", color: "var(--accent-green)", fontFamily: "var(--font-heading)" }}>100%</span>
            <span style={{ fontSize: "12px", color: "var(--accent-green)" }}>No Violations</span>
          </div>
        </div>
        <div className="glass-card" style={{ padding: "16px 20px" }}>
          <span style={{ fontSize: "11px", color: "var(--text-secondary)", fontFamily: "var(--font-mono)", display: "block" }}>ACTIVE CONTRACTS SECURED</span>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: "8px" }}>
            <span style={{ fontSize: "28px", fontWeight: "bold", color: "var(--accent-cyan)", fontFamily: "var(--font-heading)" }}>{contracts.length}</span>
            <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Vendor & IP Agreements</span>
          </div>
        </div>
        <div className="glass-card" style={{ padding: "16px 20px" }}>
          <span style={{ fontSize: "11px", color: "var(--text-secondary)", fontFamily: "var(--font-mono)", display: "block" }}>REGULATORY RISK LEVEL</span>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: "8px" }}>
            <span style={{ fontSize: "28px", fontWeight: "bold", color: "var(--accent-blue)", fontFamily: "var(--font-heading)" }}>Low</span>
            <span style={{ fontSize: "12px", color: "var(--accent-green)" }}>Optimal status</span>
          </div>
        </div>
      </div>

      <div className="console-grid">
        
        {/* Compliance Contract List */}
        <div className="glass-card">
          <h3 className="plan-section-title"><ShieldCheck size={16} /> Compliance Contract Vault</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "16px" }}>
            {contracts.map(con => (
              <div key={con.id} className="deliverable-card" style={{ padding: "14px 16px" }}>
                <div>
                  <span style={{ fontWeight: "600", fontSize: "14px", display: "block", color: "var(--text-primary)" }}>{con.party}</span>
                  <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>Type: {con.type} &bull; ID: {con.id}</span>
                </div>
                <span className="engine-pill orchestrator" style={{ fontSize: "10px", padding: "2px 8px", background: con.status === "Executed" ? "rgba(16, 185, 129, 0.08)" : "rgba(59, 130, 246, 0.08)", color: con.status === "Executed" ? "var(--accent-green)" : "var(--accent-cyan)", borderColor: con.status === "Executed" ? "rgba(16, 185, 129, 0.2)" : "rgba(59, 130, 246, 0.2)" }}>{con.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Contract Builder Form */}
        <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <h3 className="plan-section-title"><FileText size={16} /> Draft Legal Contract</h3>
          <form onSubmit={handleCompileContract} style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "8px" }}>
            <div className="input-group">
              <label>Second Party / Vendor Name</label>
              <input 
                type="text" 
                placeholder="e.g. Acme Corporation" 
                value={vendorName} 
                onChange={(e) => setVendorName(e.target.value)} 
                required
              />
            </div>
            
            <div className="input-group">
              <label>Agreement Type</label>
              <select 
                value={contractType} 
                onChange={(e) => setContractType(e.target.value)}
                style={{
                  width: "100%", background: "var(--bg-input)", border: "1px solid var(--border-color)",
                  borderRadius: "6px", padding: "8px 12px", color: "var(--text-primary)", outline: "none", fontSize: "13px"
                }}
              >
                <option value="NDA">Non-Disclosure Agreement (NDA)</option>
                <option value="IP Assignment">Intellectual Property (IP) Assignment</option>
                <option value="SLA">Service Level Agreement (SLA)</option>
              </select>
            </div>

            <button type="submit" disabled={isCompiling} className="btn" style={{ background: "linear-gradient(135deg, var(--accent-red), #b91c1c)", width: "100%", justifyContent: "center" }}>
              {isCompiling ? "Compiling Contract..." : "Compile Legal Agreement"}
            </button>
          </form>

          {contractOutput && (
            <pre style={{
              background: "var(--bg-main)", border: "1px solid var(--border-color)", borderRadius: "6px",
              padding: "12px", color: "var(--text-primary)", fontSize: "11px", fontFamily: "var(--font-mono)",
              lineHeight: 1.5, overflowX: "auto", margin: "10px 0 0 0", whiteSpace: "pre-wrap", maxHeight: "150px"
            }}>
              <code>{contractOutput}</code>
            </pre>
          )}
        </div>

      </div>

      {/* Legal Chat Console */}
      <div className="glass-card" style={{ display: "flex", flexDirection: "column", height: "300px" }}>
        <h3 className="plan-section-title"><MessageSquare size={16} style={{ color: "var(--accent-red)" }} /> Direct Message Feed (CEO &lt;&rarr;&gt; Legal Harvey)</h3>
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
                <span style={{ fontWeight: "600", fontSize: "10px", color: isSystem ? "var(--accent-red)" : "#dc2626", display: "block", marginBottom: "4px" }}>
                  {isSystem ? "System Feed" : "Legal (Harvey)"}
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
export default LegalPortal;
