import React, { useState, useEffect } from "react";
import { BarChart3, TrendingUp, Target, Plus, Check, Play, AlertCircle, RefreshCw, Trash2, Clock, MessageSquare, ShieldCheck, Activity } from "lucide-react";
import { AaceApi } from "../utils/api";

export function OpsPortal() {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [tasks, setTasks] = useState([]);
  const [messages, setMessages] = useState([]);
  const [metrics, setMetrics] = useState({
    activeTasks: 0,
    completedTasks: 0,
    teamUtilization: 15,
    healthScore: 98
  });

  const [newGoal, setNewGoal] = useState("");
  const [loading, setLoading] = useState(false);
  const [simulating, setSimulating] = useState(false);

  // Load projects and metrics on mount
  useEffect(() => {
    fetchProjects();
    fetchMetrics();
    
    // Refresh metrics periodically
    const timer = setInterval(() => {
      fetchMetrics();
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  // Fetch tasks and messages whenever the selected project changes
  useEffect(() => {
    if (selectedProjectId) {
      fetchProjectData(selectedProjectId);
    } else {
      setTasks([]);
      setMessages([]);
    }
  }, [selectedProjectId]);

  const fetchProjects = async () => {
    try {
      const data = await AaceApi.request("/api/projects");
      setProjects(data || []);
      if (data && data.length > 0 && !selectedProjectId) {
        setSelectedProjectId(data[0]._id);
      }
    } catch (err) {
      console.error("Failed to fetch projects:", err);
    }
  };

  const fetchMetrics = async () => {
    try {
      const data = await AaceApi.request("/api/metrics");
      if (data) setMetrics(data);
    } catch (err) {
      console.error("Failed to fetch metrics:", err);
    }
  };

  const fetchProjectData = async (projectId) => {
    try {
      const tData = await AaceApi.request(`/api/tasks?projectId=${projectId}`);
      setTasks(tData || []);
      const mData = await AaceApi.request(`/api/messages?projectId=${projectId}`);
      setMessages(mData || []);
    } catch (err) {
      console.error("Failed to fetch project tasks/messages:", err);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newGoal.trim()) return;
    setLoading(true);
    try {
      const result = await AaceApi.request("/api/projects/create-autonomous", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal: newGoal.trim() })
      });
      if (result && result.project) {
        setNewGoal("");
        await fetchProjects();
        setSelectedProjectId(result.project._id);
        fetchMetrics();
      }
    } catch (err) {
      alert("Error generating project: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm("Are you sure you want to delete this autonomous project and all associated tasks?")) return;
    try {
      await AaceApi.request(`/api/projects?id=${projectId}`, {
        method: "DELETE"
      });
      setSelectedProjectId("");
      await fetchProjects();
      fetchMetrics();
    } catch (err) {
      console.error("Failed to delete project:", err);
    }
  };

  const handleSimulateStep = async () => {
    if (!selectedProjectId || simulating) return;
    setSimulating(true);
    try {
      const result = await AaceApi.request("/api/projects/simulate-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: selectedProjectId })
      });
      
      if (result) {
        // Refresh project list to update progress percentage
        await fetchProjects();
        await fetchProjectData(selectedProjectId);
        await fetchMetrics();
      }
    } catch (err) {
      console.error("Simulation step failed:", err);
    } finally {
      setSimulating(false);
    }
  };

  const currentProject = projects.find(p => p._id === selectedProjectId);

  // Helper to determine status color
  const getStatusColor = (status) => {
    switch (status) {
      case "Completed": return "var(--accent-green)";
      case "Review": return "var(--accent-purple)";
      case "In-Progress": return "var(--accent-blue)";
      default: return "var(--text-muted)";
    }
  };

  return (
    <div className="ops-portal-container" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      
      {/* Top Controls: Goal Generation and Selector */}
      <div className="glass-card" style={{ padding: "20px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Activity className="pulse" style={{ color: "var(--accent-cyan)" }} />
            <div>
              <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "bold" }}>Autonomous Operations Control</h2>
              <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>COO Command &amp; Live Process Scheduler</span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <label style={{ fontSize: "12px", color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>ACTIVE GOAL:</label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              style={{
                padding: "8px 12px",
                background: "var(--bg-input)",
                border: "1px solid var(--border-color)",
                borderRadius: "6px",
                color: "var(--text-primary)",
                outline: "none",
                minWidth: "200px"
              }}
            >
              <option value="">-- No Active Objectives --</option>
              {projects.map(p => (
                <option key={p._id} value={p._id}>{p.name} ({p.progress}%)</option>
              ))}
            </select>
            {selectedProjectId && (
              <button
                onClick={() => handleDeleteProject(selectedProjectId)}
                className="btn-icon-danger"
                style={{ padding: "8px", borderRadius: "6px" }}
                title="Delete Objective"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Generate Objective Form */}
        <form onSubmit={handleCreateProject} style={{ display: "flex", gap: "12px", marginTop: "20px", borderTop: "1px solid var(--border-color)", paddingTop: "16px" }}>
          <input
            type="text"
            placeholder="Describe a new strategic company objective (e.g., 'Develop a multi-tenant subscription backend module')..."
            value={newGoal}
            onChange={(e) => setNewGoal(e.target.value)}
            disabled={loading}
            style={{
              flex: 1,
              padding: "10px 16px",
              background: "var(--bg-input)",
              border: "1px solid var(--border-color)",
              borderRadius: "6px",
              color: "var(--text-primary)",
              fontSize: "13px",
              outline: "none"
            }}
          />
          <button
            type="submit"
            disabled={loading || !newGoal.trim()}
            className="btn"
            style={{
              background: "linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))",
              padding: "10px 18px",
              fontSize: "13px"
            }}
          >
            {loading ? <RefreshCw size={14} className="spin" /> : <Plus size={14} />}
            <span>Route AI Goal</span>
          </button>
        </form>
      </div>

      {/* Real-time Metrics dashboard grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px" }}>
        
        {/* Company Health Score gauge */}
        <div className="glass-card" style={{ padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <span style={{ fontSize: "11px", color: "var(--text-secondary)", fontFamily: "var(--font-mono)", display: "block" }}>COMPANY HEALTH SCORE</span>
            <span style={{ fontSize: "28px", fontWeight: "bold", color: "var(--accent-cyan)", fontFamily: "var(--font-heading)", marginTop: "4px", display: "block" }}>
              {metrics.healthScore}%
            </span>
            <span style={{ fontSize: "11px", color: "var(--accent-green)", display: "flex", alignItems: "center", marginTop: "2px" }}>
              <ShieldCheck size={12} style={{ marginRight: "4px" }} /> Operating Nominal
            </span>
          </div>
          {/* Radial SVG health indicator */}
          <svg width="60" height="60" viewBox="0 0 36 36">
            <path
              className="circle-bg"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="3.5"
            />
            <path
              className="circle"
              strokeDasharray={`${metrics.healthScore}, 100`}
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="var(--accent-cyan)"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Active Tasks stats */}
        <div className="glass-card" style={{ padding: "16px 20px" }}>
          <span style={{ fontSize: "11px", color: "var(--text-secondary)", fontFamily: "var(--font-mono)", display: "block" }}>ACTIVE QUEUE DEPTH</span>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: "8px" }}>
            <span style={{ fontSize: "28px", fontWeight: "bold", color: "var(--accent-blue)", fontFamily: "var(--font-heading)" }}>
              {metrics.activeTasks}
            </span>
            <span style={{ fontSize: "12px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
              {metrics.completedTasks} completed
            </span>
          </div>
          <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
            Tasks loaded across 19 bot engines
          </div>
        </div>

        {/* Team Utilization bar chart */}
        <div className="glass-card" style={{ padding: "16px 20px" }}>
          <span style={{ fontSize: "11px", color: "var(--text-secondary)", fontFamily: "var(--font-mono)", display: "block" }}>DEPARTMENT UTILIZATION</span>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: "8px" }}>
            <span style={{ fontSize: "28px", fontWeight: "bold", color: "var(--accent-purple)", fontFamily: "var(--font-heading)" }}>
              {metrics.teamUtilization}%
            </span>
            <span style={{ fontSize: "12px", color: "var(--accent-purple)", display: "flex", alignItems: "center" }}>
              <TrendingUp size={12} style={{ marginRight: "2px" }} /> Optimizing load
            </span>
          </div>
          <div style={{ background: "rgba(255,255,255,0.05)", height: "6px", borderRadius: "3px", overflow: "hidden", marginTop: "8px" }}>
            <div style={{ background: "var(--accent-purple)", width: `${metrics.teamUtilization}%`, height: "100%", borderRadius: "3px" }}></div>
          </div>
        </div>

      </div>

      {/* Project Execution workspace panels */}
      {selectedProjectId && (
        <div className="console-grid" style={{ gridTemplateColumns: "1.6fr 1.2fr" }}>
          
          {/* Gantt / Task List Timeline Panel */}
          <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 className="plan-section-title" style={{ margin: 0 }}><Clock size={16} /> Autonomous Task Schedule (Gantt Chart)</h3>
              <div style={{ display: "flex", gap: "8px", fontSize: "11px", fontFamily: "var(--font-mono)" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--accent-blue)" }}></span> Progress</span>
                <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--accent-purple)" }}></span> Review</span>
                <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--accent-green)" }}></span> Complete</span>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "8px" }}>
              {tasks.length === 0 ? (
                <div style={{ padding: "20px", textAlign: "center", color: "var(--text-muted)" }}>
                  No tasks generated for this project.
                </div>
              ) : (
                tasks.map((task, idx) => (
                  <div
                    key={task._id}
                    className="deliverable-card"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                      padding: "12px 16px",
                      borderLeft: `3px solid ${getStatusColor(task.status)}`,
                      background: "rgba(255,255,255,0.01)"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                      <div>
                        <span style={{ fontSize: "13px", fontWeight: "bold", color: "var(--text-primary)" }}>{task.title}</span>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                          Assigned: <span style={{ color: "var(--accent-cyan)" }}>{task.department}</span> &bull; Complexity: {task.complexity}
                        </div>
                      </div>
                      <span
                        style={{
                          fontSize: "10px",
                          fontFamily: "var(--font-mono)",
                          padding: "2px 8px",
                          borderRadius: "4px",
                          border: `1px solid ${getStatusColor(task.status)}`,
                          color: getStatusColor(task.status)
                        }}
                      >
                        {task.status}
                      </span>
                    </div>

                    {/* horizontal Gantt progress bar representation */}
                    <div style={{ width: "100%", height: "4px", background: "rgba(255,255,255,0.05)", borderRadius: "2px", position: "relative" }}>
                      <div
                        style={{
                          position: "absolute",
                          left: `${idx * (100 / tasks.length)}%`,
                          width: `${100 / tasks.length}%`,
                          height: "100%",
                          background: getStatusColor(task.status),
                          borderRadius: "2px",
                          opacity: task.status === "Backlog" ? 0.25 : 1
                        }}
                      ></div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Simulation Loop Command & Feed */}
          <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 className="plan-section-title" style={{ margin: 0 }}><MessageSquare size={16} /> Inter-Agent Activity Log</h3>
              <span style={{ fontSize: "11px", color: "var(--accent-green)", fontFamily: "var(--font-mono)" }}>
                {currentProject?.progress}% PROGRESS
              </span>
            </div>

            {/* Simulation trigger button */}
            <button
              onClick={handleSimulateStep}
              disabled={simulating || (currentProject && currentProject.status === "Completed")}
              className="btn"
              style={{
                background: "linear-gradient(135deg, var(--accent-purple), var(--accent-blue))",
                width: "100%",
                justifyContent: "center",
                padding: "12px",
                fontSize: "13px"
              }}
            >
              {simulating ? (
                <>
                  <RefreshCw size={14} className="spin" />
                  <span>Agent Collaborating...</span>
                </>
              ) : (
                <>
                  <Play size={14} />
                  <span>{currentProject?.status === "Completed" ? "Objective Completed" : "Trigger Simulation Cycle"}</span>
                </>
              )}
            </button>

            {/* Interactive Terminal Activity Feed */}
            <div
              style={{
                flex: 1,
                background: "var(--bg-input)",
                border: "1px solid var(--border-color)",
                borderRadius: "6px",
                padding: "16px",
                maxHeight: "350px",
                minHeight: "250px",
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                fontFamily: "var(--font-mono)",
                fontSize: "11px"
              }}
            >
              <div style={{ color: "var(--text-muted)" }}>// Connecting activity streams...</div>
              {messages.length === 0 ? (
                <div style={{ color: "var(--text-muted)", padding: "12px 0" }}>No conversation logs recorded yet. Click 'Trigger Simulation Cycle' to advance operations.</div>
              ) : (
                messages.map((msg) => (
                  <div key={msg._id} style={{ borderBottom: "1px dashed rgba(255,255,255,0.05)", paddingBottom: "8px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", color: "var(--accent-cyan)", marginBottom: "4px" }}>
                      <span>[{msg.sender}]</span>
                      <span style={{ color: "var(--text-muted)" }}>{new Date(msg.createdAt).toLocaleTimeString()}</span>
                    </div>
                    <div style={{ color: "var(--text-primary)", lineHeight: 1.4 }}>{msg.text}</div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      )}

      {!selectedProjectId && (
        <div className="glass-card" style={{ padding: "40px", textAlign: "center" }}>
          <AlertCircle size={32} style={{ color: "var(--text-muted)", marginBottom: "12px" }} />
          <h3 style={{ margin: 0, fontSize: "16px", color: "white" }}>No Active Objective Selected</h3>
          <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "8px", maxWidth: "400px", margin: "8px auto 0" }}>
            Enter a strategic objective prompt above to initialize tasks and launch the autonomous dialogue simulation.
          </p>
        </div>
      )}

    </div>
  );
}

export default OpsPortal;
