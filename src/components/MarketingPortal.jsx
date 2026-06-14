import React, { useState } from "react";
import { Send, MessageSquare, Target, Plus } from "lucide-react";

export function MarketingPortal() {
  const [campaigns, setCampaigns] = useState([
    { name: "Enterprise LinkedIn Outreach", budget: "$1,200", conversions: "42 leads", active: true },
    { name: "Developer Newsletter Sponsorship", budget: "$800", conversions: "21 signups", active: true },
    { name: "AI Hackathon Event Ad", budget: "$1,500", conversions: "105 signups", active: false }
  ]);
  const [newCampName, setNewCampName] = useState("");
  const [newCampBudget, setNewCampBudget] = useState("");

  const [chatLog, setChatLog] = useState([
    { sender: "system", text: "[Growth Dashboard] Active session for Lead Marketing Manager (Rachel). Deploy new ad sets, configure target budgets, toggle active campaigns, and review outreach performance metrics." }
  ]);
  const [chatInput, setChatInput] = useState("");

  const handleSendChat = (e) => {
    if (e) e.preventDefault();
    if (!chatInput.trim()) return;
    const msg = chatInput;
    setChatLog(prev => [...prev, { sender: "user", text: msg }]);
    setChatInput("");

    setTimeout(() => {
      let reply = `[Marketing Alert] Campaign metrics synchronized. Customer Acquisition Cost is trending down.`;
      const lower = msg.toLowerCase();
      if (lower.includes("campaign") || lower.includes("ads") || lower.includes("budget")) {
        reply = `[Campaign Audit] Active Campaigns: Mapped 2 active ad sets. LinkedIn outreach is generating enterprise leads at an optimal Customer Acquisition Cost.`;
      } else if (lower.includes("copy") || lower.includes("email") || lower.includes("newsletter")) {
        reply = `[Content Review] Copy Brief: Recommended newsletter headline: "Rebooting the Creative Connection." Core value focused on automated AI co-founders.`;
      }
      setChatLog(prev => [...prev, { sender: "system", text: reply }]);
    }, 1000);
  };

  const handleAddCampaign = (e) => {
    e.preventDefault();
    if (!newCampName.trim() || !newCampBudget.trim()) return;
    setCampaigns(prev => [
      ...prev,
      { name: newCampName.trim(), budget: newCampBudget.trim(), conversions: "0 leads", active: true }
    ]);
    setNewCampName("");
    setNewCampBudget("");

    // Simulate chat log report confirmation
    setChatLog(prev => [
      ...prev,
      {
        sender: "system",
        text: `[Ad Set Launch] Ad set launched: deployed "${newCampName.trim()}" campaign with budget target ${newCampBudget.trim()}.`
      }
    ]);
  };

  const toggleCampaign = (idx) => {
    setCampaigns(prev => prev.map((c, i) => i === idx ? { ...c, active: !c.active } : c));
  };

  return (
    <div className="marketing-portal-container" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      
      {/* Metric Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px" }}>
        <div className="glass-card" style={{ padding: "16px 20px" }}>
          <span style={{ fontSize: "11px", color: "var(--text-secondary)", fontFamily: "var(--font-mono)", display: "block" }}>TOTAL AD IMPRESSIONS</span>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: "8px" }}>
            <span style={{ fontSize: "28px", fontWeight: "bold", color: "var(--accent-cyan)", fontFamily: "var(--font-heading)" }}>24.8K</span>
            <span style={{ fontSize: "12px", color: "var(--accent-green)" }}>+18.4% this week</span>
          </div>
        </div>
        <div className="glass-card" style={{ padding: "16px 20px" }}>
          <span style={{ fontSize: "11px", color: "var(--text-secondary)", fontFamily: "var(--font-mono)", display: "block" }}>CAMPAIGN CONVERSIONS</span>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: "8px" }}>
            <span style={{ fontSize: "28px", fontWeight: "bold", color: "var(--accent-blue)", fontFamily: "var(--font-heading)" }}>148</span>
            <span style={{ fontSize: "12px", color: "var(--accent-green)", fontWeight: "600" }}>+12.6% CTR</span>
          </div>
        </div>
        <div className="glass-card" style={{ padding: "16px 20px" }}>
          <span style={{ fontSize: "11px", color: "var(--text-secondary)", fontFamily: "var(--font-mono)", display: "block" }}>AVERAGE CPC (COST PER CLICK)</span>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: "8px" }}>
            <span style={{ fontSize: "28px", fontWeight: "bold", color: "var(--accent-yellow)", fontFamily: "var(--font-heading)" }}>$1.12</span>
            <span style={{ fontSize: "12px", color: "var(--accent-green)" }}>-5.4% CAC</span>
          </div>
        </div>
      </div>

      <div className="console-grid">
        
        {/* Campaign List */}
        <div className="glass-card">
          <h3 className="plan-section-title"><Target size={16} /> Active Marketing Campaigns</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "16px" }}>
            {campaigns.map((camp, idx) => (
              <div 
                key={idx} 
                className="deliverable-card" 
                style={{ 
                  padding: "16px", borderColor: camp.active ? "rgba(245, 158, 11, 0.2)" : "var(--border-color)",
                  background: camp.active ? "rgba(245, 158, 11, 0.01)" : "transparent"
                }}
              >
                <div>
                  <span style={{ fontWeight: "600", fontSize: "14px", display: "block", color: camp.active ? "var(--text-primary)" : "var(--text-secondary)" }}>
                    {camp.name}
                  </span>
                  <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>Budget: {camp.budget} &bull; Conversion: {camp.conversions}</span>
                </div>
                
                <button
                  onClick={() => toggleCampaign(idx)}
                  className="btn btn-secondary"
                  style={{
                    padding: "6px 12px", fontSize: "11px",
                    background: camp.active ? "rgba(239, 68, 68, 0.08)" : "rgba(16, 185, 129, 0.08)",
                    color: camp.active ? "var(--accent-red)" : "var(--accent-green)",
                    borderColor: camp.active ? "rgba(239, 68, 68, 0.2)" : "rgba(16, 185, 129, 0.2)"
                  }}
                >
                  {camp.active ? "Pause" : "Activate"}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Launch Campaign */}
        <div className="glass-card">
          <h3 className="plan-section-title"><Plus size={16} /> Deploy New Campaign</h3>
          <form onSubmit={handleAddCampaign} style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "16px" }}>
            <div className="input-group">
              <label>Campaign Name / Ad Set</label>
              <input 
                type="text" 
                placeholder="e.g. Q4 SEO optimization" 
                value={newCampName} 
                onChange={(e) => setNewCampName(e.target.value)} 
                required
              />
            </div>
            
            <div className="input-group">
              <label>Target Budget</label>
              <input 
                type="text" 
                placeholder="e.g. $1,000" 
                value={newCampBudget} 
                onChange={(e) => setNewCampBudget(e.target.value)} 
                required
              />
            </div>

            <button type="submit" className="btn" style={{ background: "linear-gradient(135deg, var(--accent-yellow), #d97706)", width: "100%", justifyContent: "center", marginTop: "8px", color: "black" }}>
              <Plus size={16} /> Deploy Campaign Ad Set
            </button>
          </form>
        </div>

      </div>

      {/* Marketing Chat Console */}
      <div className="glass-card" style={{ display: "flex", flexDirection: "column", height: "300px" }}>
        <h3 className="plan-section-title"><MessageSquare size={16} style={{ color: "var(--accent-yellow)" }} /> Direct Message Feed (CEO &lt;&rarr;&gt; Marketing Rachel)</h3>
        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px", margin: "16px 0", paddingRight: "4px" }}>
          {chatLog.map((chat, idx) => {
            const isSystem = chat.sender === "system";
            return (
              <div key={idx} style={{
                alignSelf: isSystem ? "flex-start" : "flex-end",
                background: isSystem ? "var(--bg-input)" : "rgba(245, 158, 11, 0.05)",
                border: `1px solid ${isSystem ? "var(--border-color)" : "rgba(245, 158, 11, 0.2)"}`,
                borderRadius: "8px", padding: "10px 14px", fontSize: "13px", maxWidth: "85%"
              }}>
                <span style={{ fontWeight: "600", fontSize: "10px", color: isSystem ? "var(--accent-yellow)" : "#d97706", display: "block", marginBottom: "4px" }}>
                  {isSystem ? "System Feed" : "Marketing (Rachel)"}
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
          <button type="submit" className="btn" style={{ padding: "0 12px", height: "36px", background: "var(--accent-yellow)", color: "black" }}>
            <Send size={14} />
          </button>
        </form>
      </div>

    </div>
  );
}
export default MarketingPortal;
