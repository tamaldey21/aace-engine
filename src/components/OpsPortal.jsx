import React, { useState } from "react";
import { BarChart3, TrendingUp, Target, Plus, Check } from "lucide-react";

export function OpsPortal() {
  const [campaigns, setCampaigns] = useState([
    { name: "Enterprise LinkedIn Outreach", budget: "$1,200", conversions: "42 leads", active: true },
    { name: "Developer Newsletter Sponsorship", budget: "$800", conversions: "21 signups", active: true },
    { name: "AI Hackathon Event Ad", budget: "$1,500", conversions: "105 signups", active: false }
  ]);
  const [newCampName, setNewCampName] = useState("");
  const [newCampBudget, setNewCampBudget] = useState("");

  const handleAddCampaign = (e) => {
    e.preventDefault();
    if (!newCampName.trim() || !newCampBudget.trim()) return;
    setCampaigns(prev => [
      ...prev,
      { name: newCampName.trim(), budget: newCampBudget.trim(), conversions: "0 leads", active: true }
    ]);
    setNewCampName("");
    setNewCampBudget("");
  };

  const toggleCampaign = (idx) => {
    setCampaigns(prev => prev.map((c, i) => i === idx ? { ...c, active: !c.active } : c));
  };

  return (
    <div className="ops-portal-container" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      
      {/* Metric Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px" }}>
        
        <div className="glass-card" style={{ padding: "16px 20px" }}>
          <span style={{ fontSize: "11px", color: "var(--text-secondary)", fontFamily: "var(--font-mono)", display: "block" }}>CUSTOMER ACQUISITION COST</span>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: "8px" }}>
            <span style={{ fontSize: "28px", fontWeight: "bold", color: "var(--accent-cyan)", fontFamily: "var(--font-heading)" }}>$14.20</span>
            <span style={{ fontSize: "12px", color: "var(--accent-green)", display: "flex", alignItems: "center" }}>
              <TrendingUp size={12} style={{ marginRight: "2px" }} /> -8.4%
            </span>
          </div>
        </div>

        <div className="glass-card" style={{ padding: "16px 20px" }}>
          <span style={{ fontSize: "11px", color: "var(--text-secondary)", fontFamily: "var(--font-mono)", display: "block" }}>WEEKLY NEW USER SIGNUPS</span>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: "8px" }}>
            <span style={{ fontSize: "28px", fontWeight: "bold", color: "var(--accent-blue)", fontFamily: "var(--font-heading)" }}>168</span>
            <span style={{ fontSize: "12px", color: "var(--accent-green)" }}>+12.6%</span>
          </div>
        </div>

        <div className="glass-card" style={{ padding: "16px 20px" }}>
          <span style={{ fontSize: "11px", color: "var(--text-secondary)", fontFamily: "var(--font-mono)", display: "block" }}>EMAIL NEWSLETTER OPEN RATE</span>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: "8px" }}>
            <span style={{ fontSize: "28px", fontWeight: "bold", color: "var(--accent-purple)", fontFamily: "var(--font-heading)" }}>48.7%</span>
            <span style={{ fontSize: "12px", color: "var(--accent-green)" }}>+4.1%</span>
          </div>
        </div>

      </div>

      {/* Campaigns list & New Campaign form */}
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
                  padding: "16px", borderColor: camp.active ? "rgba(0, 240, 255, 0.2)" : "var(--border-color)",
                  background: camp.active ? "rgba(0, 240, 255, 0.01)" : "transparent"
                }}
              >
                <div>
                  <span style={{ fontWeight: "600", fontSize: "14px", display: "block", color: camp.active ? "var(--text-primary)" : "var(--text-secondary)" }}>
                    {camp.name}
                  </span>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Budget: {camp.budget} &bull; Conversion: {camp.conversions}</span>
                </div>
                
                <button
                  onClick={() => toggleCampaign(idx)}
                  className="btn btn-secondary"
                  style={{
                    padding: "6px 12px", fontSize: "11px",
                    background: camp.active ? "rgba(239, 68, 68, 0.1)" : "rgba(16, 185, 129, 0.1)",
                    color: camp.active ? "var(--accent-red)" : "var(--accent-green)",
                    borderColor: camp.active ? "rgba(239, 68, 68, 0.25)" : "rgba(16, 185, 129, 0.25)"
                  }}
                >
                  {camp.active ? "Pause" : "Activate"}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Campaign Creation */}
        <div className="glass-card">
          <h3 className="plan-section-title"><Plus size={16} /> Launch Campaign</h3>
          <form onSubmit={handleAddCampaign} style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "16px" }}>
            <div className="input-group">
              <label>Campaign Name / Ad Set</label>
              <input 
                type="text" 
                placeholder="e.g. Q4 SEO optimization" 
                value={newCampName} 
                onChange={(e) => setNewCampName(e.target.value)} 
              />
            </div>
            
            <div className="input-group">
              <label>Target Budget</label>
              <input 
                type="text" 
                placeholder="e.g. $1,000" 
                value={newCampBudget} 
                onChange={(e) => setNewCampBudget(e.target.value)} 
              />
            </div>

            <button type="submit" className="btn" style={{ background: "linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))", width: "100%", justifyContent: "center", marginTop: "8px" }}>
              <Plus size={16} /> Deploy Campaign Ad Set
            </button>
          </form>
        </div>

      </div>

    </div>
  );
}
export default OpsPortal;
