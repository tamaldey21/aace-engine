import React, { useState, useEffect } from "react";
import { ShieldCheck, Cpu, Code, Database, Server, Layers, Bot, Users, Target, Activity, Clock, MessageSquare, Terminal } from "lucide-react";
import { AaceApi } from "../utils/api";

const DEPT_METRIC_PRESETS = {
  tech: {
    labels: ["API Queue Depth", "Server Health Status", "DB Handshakes Active"],
    vals: ["2 requests", "99.98% Nominal", "14 open channels"]
  },
  design: {
    labels: ["Assets Render Queue", "Creative Fuel Balance", "Figma Frame Syncs"],
    vals: ["0 pending", "88% Optimized", "7 frames synced"]
  },
  biz: {
    labels: ["Conversion Rate", "Sales Funnel Leads", "Contract Signature SLA"],
    vals: ["12.4% avg", "34 new today", "100% compliant"]
  },
  hr: {
    labels: ["Open Positions", "Pending Onboardings", "Average Clock-in Rate"],
    vals: ["4 roles", "2 candidates", "94.2% present"]
  }
};

export function DeptDashboard({ department }) {
  const [tasks, setTasks] = useState([]);
  const [messages, setMessages] = useState([]);
  
  useEffect(() => {
    fetchDeptData();
  }, [department]);

  const fetchDeptData = async () => {
    try {
      // Fetch all tasks for this department
      const tData = await AaceApi.request("/api/tasks");
      const deptTasks = (tData || []).filter(t => t.department === department.name);
      setTasks(deptTasks);

      // Fetch all messages for the channel mapped to this department
      const clean = department.name.toLowerCase();
      let channel = "#general";
      if (clean.includes("frontend") || clean.includes("backend") || clean.includes("database") || clean.includes("engineering") || clean.includes("devops") || clean.includes("cybersecurity") || clean.includes("ml")) {
        channel = "#engineering";
      } else if (clean.includes("product") || clean.includes("ux") || clean.includes("design") || clean.includes("qa")) {
        channel = "#product";
      } else if (clean.includes("coo") || clean.includes("operations") || clean.includes("hr") || clean.includes("finance") || clean.includes("marketing") || clean.includes("sales") || clean.includes("legal") || clean.includes("customer")) {
        channel = "#operations";
      }

      const mData = await AaceApi.request(`/api/messages?channel=${encodeURIComponent(channel)}`);
      setMessages((mData || []).slice(-8)); // last 8 messages
    } catch (err) {
      console.error("Failed to fetch department info:", err);
    }
  };

  // Determine which metric presets to use
  const getMetricType = () => {
    const name = department.name.toLowerCase();
    if (name.includes("frontend") || name.includes("backend") || name.includes("database") || name.includes("devops") || name.includes("engineering") || name.includes("cybersecurity") || name.includes("ml")) {
      return DEPT_METRIC_PRESETS.tech;
    }
    if (name.includes("design") || name.includes("ui/ux")) {
      return DEPT_METRIC_PRESETS.design;
    }
    if (name.includes("hr")) {
      return DEPT_METRIC_PRESETS.hr;
    }
    return DEPT_METRIC_PRESETS.biz;
  };

  const preset = getMetricType();
  const Icon = department.icon || Bot;

  return (
    <div className="dept-dashboard-container" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      
      {/* Header Profile card */}
      <div className="glass-card" style={{ display: "flex", flexWrap: "wrap", gap: "20px", alignItems: "center", padding: "24px" }}>
        <div style={{
          width: "56px", height: "56px", borderRadius: "12px", 
          background: `radial-gradient(circle at top left, ${department.color || "var(--accent-cyan)"}, rgba(0,0,0,0.5))`,
          display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(255,255,255,0.1)"
        }}>
          <Icon size={24} style={{ color: "white" }} />
        </div>

        <div style={{ flex: 1, minWidth: "250px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "bold" }}>{department.name}</h2>
            <span style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "10px", background: "rgba(255,255,255,0.06)", border: "1px solid var(--border-color)", color: department.color }}>
              ACTIVE
            </span>
          </div>
          <p style={{ margin: "4px 0 0", fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.4 }}>{department.role}</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "4px", textAlign: "right", borderLeft: "1px solid var(--border-color)", paddingLeft: "20px" }}>
          <span style={{ fontSize: "10px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>DEPARTMENT PARAMETERS</span>
          <span style={{ fontSize: "12px", fontWeight: "bold", color: "white" }}>{department.meta}</span>
          <span style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>Priority Allocation: High</span>
        </div>
      </div>

      {/* Grid: Live metrics and Tasks */}
      <div className="console-grid" style={{ gridTemplateColumns: "1fr 1.2fr" }}>
        
        {/* Dynamic Metric Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <h3 className="plan-section-title"><Terminal size={16} /> Department Operations Ledger</h3>
          
          {preset.labels.map((lbl, idx) => (
            <div key={idx} className="glass-card" style={{ padding: "16px 20px" }}>
              <span style={{ fontSize: "10px", color: "var(--text-secondary)", fontFamily: "var(--font-mono)", display: "block" }}>
                {lbl.toUpperCase()}
              </span>
              <span style={{ fontSize: "18px", fontWeight: "bold", color: department.color, marginTop: "6px", display: "block" }}>
                {preset.vals[idx]}
              </span>
            </div>
          ))}
        </div>

        {/* Task List */}
        <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <h3 className="plan-section-title"><Clock size={16} /> Assigned Operational Tasks</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {tasks.length === 0 ? (
              <div style={{ padding: "30px", textAlign: "center", color: "var(--text-muted)" }}>
                No active tasks assigned to this department at the moment.
              </div>
            ) : (
              tasks.map(t => (
                <div key={t._id} className="deliverable-card" style={{ padding: "12px 16px", background: "rgba(255,255,255,0.01)" }}>
                  <div>
                    <span style={{ fontSize: "13px", fontWeight: "bold", color: "white" }}>{t.title}</span>
                    <p style={{ fontSize: "11px", color: "var(--text-secondary)", margin: "4px 0 0" }}>{t.description}</p>
                  </div>
                  <span style={{
                    fontSize: "10px", color: t.status === "Completed" ? "var(--accent-green)" : "var(--accent-blue)",
                    padding: "2px 8px", borderRadius: "4px", background: "rgba(255,255,255,0.04)"
                  }}>
                    {t.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Messaging Channel Stream */}
      <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <h3 className="plan-section-title"><MessageSquare size={16} /> Channel Communication Feed</h3>
        <div style={{
          background: "rgba(0,0,0,0.4)", border: "1px solid var(--border-color)", borderRadius: "6px",
          padding: "16px", minHeight: "180px", display: "flex", flexDirection: "column", gap: "12px",
          fontFamily: "var(--font-mono)", fontSize: "11px"
        }}>
          {messages.length === 0 ? (
            <div style={{ color: "var(--text-muted)" }}>// Connecting activity stream... No channel traffic.</div>
          ) : (
            messages.map(m => (
              <div key={m._id} style={{ display: "flex", flexDirection: "column", gap: "2px", borderBottom: "1px dashed rgba(255,255,255,0.03)", paddingBottom: "6px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", color: department.color }}>
                  <span>[{m.sender}]</span>
                  <span style={{ color: "var(--text-muted)" }}>{new Date(m.createdAt).toLocaleTimeString()}</span>
                </div>
                <div style={{ color: "var(--text-primary)" }}>{m.text}</div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}

export default DeptDashboard;
