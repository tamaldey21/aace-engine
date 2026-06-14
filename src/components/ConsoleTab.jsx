import React, { useState, useEffect } from "react";
import { 
  Play, Cpu, Layers, ShieldAlert, ListChecks, FileDown, 
  Settings, Key, Copy, Check, ExternalLink, FileText, 
  Sparkles, Clock, ArrowRight, CheckSquare, Square, RefreshCw,
  MoreVertical
} from "lucide-react";
import { runAACE } from "../utils/ai";
import { presets } from "../utils/presets";
import Terminal from "./Terminal";
import { AaceApi } from "../utils/api";

const STAGES = [
  { id: 1, name: "Intent Analysis", description: "Parsing founder directive" },
  { id: 2, name: "Objective Extraction", description: "Defining success metrics" },
  { id: 3, name: "Constraint Detection", description: "Identifying limitations" },
  { id: 4, name: "Task Decomposition", description: "Breaking down tasks" },
  { id: 5, name: "Engine Assignment", description: "Mapping to engine agents" },
  { id: 6, name: "Execution Planning", description: "Sequencing dependencies" },
  { id: 7, name: "Risk Evaluation", description: "Mitigating failure modes" },
  { id: 8, name: "Resource Allocation", description: "Mapping tools & databases" },
  { id: 9, name: "Action Generation", description: "Compiling code and SOPs" },
  { id: 10, name: "Memory Storage", description: "Logging decisions to ledger" },
  { id: 11, name: "Outcome Monitoring", description: "Drafting audit specifications" }
];

export function ConsoleTab({ memories, onAddMemoryUpdates }) {
  const [directive, setDirective] = useState("");
  const [runMode, setRunMode] = useState("simulation"); // simulation | live
  
  // Multiple API key states
  const [ceoKey, setCeoKey] = useState(() => localStorage.getItem("aace_ceo_key") || import.meta.env.VITE_API_KEY_CEO || "");
  const [cooKey, setCooKey] = useState(() => localStorage.getItem("aace_coo_key") || import.meta.env.VITE_API_KEY_COO || "");
  const [engineerKey, setEngineerKey] = useState(() => localStorage.getItem("aace_engineer_key") || import.meta.env.VITE_API_KEY_ENGINEER || "");
  const [hrKey, setHrKey] = useState(() => localStorage.getItem("aace_hr_key") || import.meta.env.VITE_API_KEY_HR || "");
  const [productKey, setProductKey] = useState(() => localStorage.getItem("aace_product_key") || import.meta.env.VITE_API_KEY_PRODUCT || "");
  const [uiuxKey, setUiuxKey] = useState(() => localStorage.getItem("aace_uiux_key") || import.meta.env.VITE_API_KEY_UIUX || "");
  const [qaKey, setQaKey] = useState(() => localStorage.getItem("aace_qa_key") || import.meta.env.VITE_API_KEY_QA || "");
  const [marketingKey, setMarketingKey] = useState(() => localStorage.getItem("aace_marketing_key") || import.meta.env.VITE_API_KEY_MARKETING || "");
  const [legalKey, setLegalKey] = useState(() => localStorage.getItem("aace_legal_key") || import.meta.env.VITE_API_KEY_LEGAL || "");
  const [geminiKey, setGeminiKey] = useState(() => localStorage.getItem("aace_gemini_key") || "");
  
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStageId, setCurrentStageId] = useState(null);
  const [stageProgress, setStageProgress] = useState([]);
  const [terminalLogs, setTerminalLogs] = useState([]);
  const [resultPlan, setResultPlan] = useState(null);
  const [activeResultsTab, setActiveResultsTab] = useState("dashboard"); // dashboard | json
  const [completedTasks, setCompletedTasks] = useState({});
  const [copied, setCopied] = useState(false);
  
  // Temporary keys for modal form
  const [tempCeoKey, setTempCeoKey] = useState(ceoKey);
  const [tempCooKey, setTempCooKey] = useState(cooKey);
  const [tempEngineerKey, setTempEngineerKey] = useState(engineerKey);
  const [tempHrKey, setTempHrKey] = useState(hrKey);
  const [tempProductKey, setTempProductKey] = useState(productKey);
  const [tempUiuxKey, setTempUiuxKey] = useState(uiuxKey);
  const [tempQaKey, setTempQaKey] = useState(qaKey);
  const [tempMarketingKey, setTempMarketingKey] = useState(marketingKey);
  const [tempLegalKey, setTempLegalKey] = useState(legalKey);
  const [tempGeminiKey, setTempGeminiKey] = useState(geminiKey);
  
  const [downloadingFile, setDownloadingFile] = useState(null);

  const handlePresetChange = (e) => {
    const presetId = e.target.value;
    if (!presetId) return;
    const preset = presets.find(p => p.id === presetId);
    if (preset) {
      setDirective(preset.directive);
    }
  };

  const handleSaveKeys = () => {
    localStorage.setItem("aace_ceo_key", tempCeoKey);
    localStorage.setItem("aace_coo_key", tempCooKey);
    localStorage.setItem("aace_engineer_key", tempEngineerKey);
    localStorage.setItem("aace_hr_key", tempHrKey);
    localStorage.setItem("aace_product_key", tempProductKey);
    localStorage.setItem("aace_uiux_key", tempUiuxKey);
    localStorage.setItem("aace_qa_key", tempQaKey);
    localStorage.setItem("aace_marketing_key", tempMarketingKey);
    localStorage.setItem("aace_legal_key", tempLegalKey);
    localStorage.setItem("aace_gemini_key", tempGeminiKey);
    
    setCeoKey(tempCeoKey);
    setCooKey(tempCooKey);
    setEngineerKey(tempEngineerKey);
    setHrKey(tempHrKey);
    setProductKey(tempProductKey);
    setUiuxKey(tempUiuxKey);
    setQaKey(tempQaKey);
    setMarketingKey(tempMarketingKey);
    setLegalKey(tempLegalKey);
    setGeminiKey(tempGeminiKey);
    
    setShowKeyModal(false);
  };

  const executeDirective = async (e) => {
    if (e) e.preventDefault();
    if (!directive.trim()) return;

    setIsProcessing(true);
    setResultPlan(null);
    setCurrentStageId(1);
    setTerminalLogs([]);
    setStageProgress([]);
    setCompletedTasks({});

    // Dynamic routing announcement logs based on keywords
    const lowerDir = directive.toLowerCase();
    let selectedApi = "Simulation Engine";

    if (runMode === "live") {
      if (lowerDir.includes("build") || lowerDir.includes("code") || lowerDir.includes("app") || lowerDir.includes("api") || lowerDir.includes("cto") || lowerDir.includes("frontend") || lowerDir.includes("backend") || lowerDir.includes("deploy")) {
        selectedApi = engineerKey ? "CTO / Developer Engine (Kimi-K2.6-azure)" : "Google Gemini API [fallback]";
      } else if (lowerDir.includes("policy") || lowerDir.includes("onboard") || lowerDir.includes("sop") || lowerDir.includes("recruiting") || lowerDir.includes("hr") || lowerDir.includes("hiring")) {
        selectedApi = hrKey ? "HR Operations Engine (Kimi-K2.6-azure)" : "Google Gemini API [fallback]";
      } else if (lowerDir.includes("ceo") || lowerDir.includes("advisor") || lowerDir.includes("strategy") || lowerDir.includes("investor") || lowerDir.includes("pitch")) {
        selectedApi = ceoKey ? "CEO Advisor Engine (Kimi-K2.6-azure)" : "Google Gemini API [fallback]";
      } else if (lowerDir.includes("coo") || lowerDir.includes("operations") || lowerDir.includes("ops") || lowerDir.includes("logistics")) {
        selectedApi = cooKey ? "COO Operations Engine (Kimi-K2.6-azure)" : "Google Gemini API [fallback]";
      } else if (lowerDir.includes("product") || lowerDir.includes("prd") || lowerDir.includes("manage") || lowerDir.includes("requirements")) {
        selectedApi = productKey ? "Product Management Engine (Kimi-K2.6-azure)" : "Google Gemini API [fallback]";
      } else if (lowerDir.includes("uiux") || lowerDir.includes("design") || lowerDir.includes("theme") || lowerDir.includes("style")) {
        selectedApi = uiuxKey ? "UI/UX Design Engine (Kimi-K2.6-azure)" : "Google Gemini API [fallback]";
      } else if (lowerDir.includes("qa") || lowerDir.includes("test") || lowerDir.includes("bug") || lowerDir.includes("triage")) {
        selectedApi = qaKey ? "QA Testing Engine (Kimi-K2.6-azure)" : "Google Gemini API [fallback]";
      } else if (lowerDir.includes("marketing") || lowerDir.includes("growth") || lowerDir.includes("campaign") || lowerDir.includes("ad")) {
        selectedApi = marketingKey ? "Marketing Engine (Kimi-K2.6-azure)" : "Google Gemini API [fallback]";
      } else if (lowerDir.includes("legal") || lowerDir.includes("compliance") || lowerDir.includes("contract") || lowerDir.includes("nda")) {
        selectedApi = legalKey ? "Legal & Compliance Engine (Kimi-K2.6-azure)" : "Google Gemini API [fallback]";
      } else {
        selectedApi = ceoKey ? "CEO Advisor Engine (Kimi-K2.6-azure)" : "Google Gemini API [fallback]";
      }
    }

    try {
      // Print initial orchestrator routing choice
      setTerminalLogs(prev => [
        ...prev, 
        `[orchestrator] Initializing multi-API router...`,
        `[orchestrator] Routing task dynamically to: ${selectedApi}`,
        `[orchestrator] Connecting to secure API gateway endpoint...`
      ]);

      const result = await runAACE(
        directive, 
        runMode, 
        {
          ceoKey,
          cooKey,
          engineerKey,
          hrKey,
          productKey,
          uiuxKey,
          qaKey,
          marketingKey,
          legalKey,
          geminiKey
        },
        memories, 
        (progressUpdate) => {
          setCurrentStageId(progressUpdate.stageId);
          setStageProgress(prev => [...prev, progressUpdate.stageId]);
          setTerminalLogs(prev => [...prev, ...progressUpdate.logs]);
        }
      );

      setResultPlan(result);
      if (result.memory_updates && Array.isArray(result.memory_updates)) {
        onAddMemoryUpdates(result.memory_updates);
      }
    } catch (err) {
      setTerminalLogs(prev => [...prev, `[SYSTEM ERROR] ${err.message}`]);
      alert(err.message);
    } finally {
      setIsProcessing(false);
      setCurrentStageId(null);
    }
  };

  const toggleTask = (index) => {
    setCompletedTasks(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const copyJson = () => {
    if (!resultPlan) return;
    navigator.clipboard.writeText(JSON.stringify(resultPlan, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (filename) => {
    setDownloadingFile(filename);
    AaceApi.request("/api/deploy-file", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filename,
        directive,
        keys: {
          ceoKey,
          cooKey,
          engineerKey,
          hrKey,
          productKey,
          uiuxKey,
          qaKey,
          marketingKey,
          legalKey,
          geminiKey
        }
      })
    })
      .then(data => {
        setDownloadingFile(null);
        if (data.success) {
          if (data.offline) {
            alert(`[Offline Local Mode] API Server down. File "${data.filename}" compiled client-side and downloaded directly to your local computer!`);
          } else {
            if (confirm(`[DevOps & Deploy Bot] File "${data.filename}" has been successfully built and deployed to the workspace public directory!\n\nWould you like to open it now?`)) {
              window.open(data.url, "_blank");
            }
          }
        } else {
          alert(`Deploy failed: ${data.error}`);
        }
      })
      .catch(err => {
        setDownloadingFile(null);
        console.error("Deploy error:", err);
        alert(`Deploy error: Could not contact build server.`);
      });
  };

  // Helper mapping to display colored engine badges
  const getEngineClass = (eng) => {
    if (eng === "ceo_bot") return "engine-pill orchestrator";
    if (eng === "cto_bot") return "engine-pill app_builder";
    if (eng === "coo_bot") return "engine-pill business";
    if (eng === "frontend_bot") return "engine-pill document";
    if (eng === "backend_bot") return "engine-pill app_builder";
    if (eng === "deploy_bot") return "engine-pill memory";
    if (eng === "marketing_bot") return "engine-pill learning";
    if (eng === "hr_bot") return "engine-pill business";
    if (eng === "product_bot") return "engine-pill learning";
    if (eng === "legal_bot") return "engine-pill orchestrator";
    return "engine-pill";
  };

  return (
    <div className="console-tab-container" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      
      {/* Input Console */}
      <div className="glass-card" style={{ position: "relative" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 className="plan-section-title" style={{ borderLeftColor: "var(--accent-cyan)", margin: 0, paddingLeft: "10px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Sparkles size={18} style={{ color: "var(--accent-cyan)" }} /> Executive Directive Input
          </h2>
          
          {/* 3-dot Menu */}
          <div style={{ position: "relative" }}>
            <button 
              type="button" 
              onClick={() => setShowMenu(!showMenu)} 
              className="btn-icon" 
              style={{
                background: "transparent", border: "none", cursor: "pointer", 
                color: "var(--text-secondary)", display: "flex", alignItems: "center", 
                justifyContent: "center", padding: "6px", borderRadius: "50%",
                transition: "background 0.2s"
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-input)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              <MoreVertical size={16} />
            </button>
            
            {showMenu && (
              <div className="dropdown-menu" style={{
                position: "absolute", right: 0, top: "28px", background: "var(--bg-card)",
                border: "1px solid var(--border-color)", borderRadius: "6px", width: "160px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)", zIndex: 10, padding: "4px",
                display: "flex", flexDirection: "column"
              }}>
                <button 
                  type="button"
                  onClick={() => {
                    setTempCeoKey(ceoKey);
                    setTempCooKey(cooKey);
                    setTempEngineerKey(engineerKey);
                    setTempHrKey(hrKey);
                    setTempProductKey(productKey);
                    setTempUiuxKey(uiuxKey);
                    setTempQaKey(qaKey);
                    setTempMarketingKey(marketingKey);
                    setTempLegalKey(legalKey);
                    setTempGeminiKey(geminiKey);
                    setShowKeyModal(true); 
                    setShowMenu(false); 
                  }}
                  style={{
                    width: "100%", textAlign: "left", background: "transparent", border: "none",
                    padding: "8px 12px", fontSize: "12px", color: "var(--text-primary)",
                    cursor: "pointer", borderRadius: "4px", display: "flex", alignItems: "center", gap: "8px",
                    transition: "background 0.2s"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-input)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                >
                  <Key size={14} /> Credentials Panel
                </button>
              </div>
            )}
          </div>
        </div>
        <form onSubmit={executeDirective} className="directive-form" style={{ marginTop: "16px" }}>
          <div className="textarea-container">
            <textarea
              placeholder="Enter founder directive (e.g. 'Build a vendor onboarding workflow' or 'Set up a project status tracking system for engineering')..."
              value={directive}
              onChange={(e) => setDirective(e.target.value)}
              disabled={isProcessing}
            />
          </div>
          
          <div className="form-actions">
            <div className="presets-container">
              <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Presets:</span>
              <select onChange={handlePresetChange} disabled={isProcessing} className="presets-select">
                <option value="">-- Choose Preset --</option>
                {presets.map(p => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            </div>

            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <div style={{ display: "flex", background: "var(--bg-input)", borderRadius: "6px", border: "1px solid var(--border-color)", padding: "2px" }}>
                <button
                  type="button"
                  onClick={() => setRunMode("simulation")}
                  disabled={isProcessing}
                  style={{
                    padding: "6px 12px", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "12px", fontWeight: 500,
                    background: runMode === "simulation" ? "var(--accent-blue)" : "transparent",
                    color: runMode === "simulation" ? "white" : "var(--text-secondary)"
                  }}
                >
                  Simulation
                </button>
                <button
                  type="button"
                  onClick={() => setRunMode("live")}
                  disabled={isProcessing}
                  style={{
                    padding: "6px 12px", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "12px", fontWeight: 500,
                    background: runMode === "live" ? "var(--accent-blue)" : "transparent",
                    color: runMode === "live" ? "white" : "var(--text-secondary)"
                  }}
                >
                  Live Multi-API
                </button>
              </div>

              <button
                type="button"
                onClick={() => { 
                  setTempCeoKey(ceoKey);
                  setTempCooKey(cooKey);
                  setTempEngineerKey(engineerKey);
                  setTempHrKey(hrKey);
                  setTempProductKey(productKey);
                  setTempUiuxKey(uiuxKey);
                  setTempQaKey(qaKey);
                  setTempMarketingKey(marketingKey);
                  setTempLegalKey(legalKey);
                  setTempGeminiKey(geminiKey);
                  setShowKeyModal(true); 
                }}
                disabled={isProcessing}
                className="btn btn-secondary"
                style={{ padding: "8px 12px" }}
                title="Configure LLM API Keys"
              >
                <Settings size={16} />
              </button>

              <button
                type="submit"
                disabled={isProcessing || !directive.trim()}
                className="btn"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw size={16} className="spin-animation" style={{ animation: "spin 2s linear infinite" }} />
                    AACE Executing...
                  </>
                ) : (
                  <>
                    <Play size={16} fill="white" />
                    Run Directive
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Stepper and Terminal Columns */}
      {(isProcessing || terminalLogs.length > 0) && (
        <div className="console-grid">
          {/* stepper */}
          <div className="glass-card">
            <h3 className="plan-section-title">
              <Cpu size={18} style={{ color: "var(--accent-cyan)" }} /> 11-Stage AI Routing Pipeline
            </h3>
            <div className="stepper-container" style={{ marginTop: "16px" }}>
              {STAGES.map(stage => {
                const isActive = currentStageId === stage.id;
                const isCompleted = stageProgress.includes(stage.id) && currentStageId !== stage.id;
                return (
                  <div key={stage.id} className={`step-node ${isActive ? "active" : ""} ${isCompleted ? "completed" : ""}`}>
                    <div className="step-icon-wrapper">{stage.id}</div>
                    <div className="step-details">
                      <div className="step-name">{stage.name}</div>
                      <div className="step-desc">{stage.description}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* logs */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <Terminal logs={terminalLogs} />
          </div>
        </div>
      )}

      {/* Results Dashboard Panel */}
      {resultPlan && (
        <div className="glass-card results-container">
          <div className="results-header-tabs">
            <div 
              className={`results-tab ${activeResultsTab === "dashboard" ? "active" : ""}`}
              onClick={() => setActiveResultsTab("dashboard")}
            >
              Structured Execution Plan
            </div>
            <div 
              className={`results-tab ${activeResultsTab === "json" ? "active" : ""}`}
              onClick={() => setActiveResultsTab("json")}
            >
              Raw AACE JSON Payload
            </div>
          </div>

          {activeResultsTab === "dashboard" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              
              {/* Objective Hero Section */}
              <div className="plan-hero-grid" style={{ background: "rgba(255,255,255,0.015)", padding: "20px", borderRadius: "10px", border: "1px solid var(--border-color)" }}>
                <div className="plan-title-block">
                  <span style={{ fontSize: "11px", fontWeight: "bold", color: "var(--accent-cyan)", fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>COGNITIVE BLUEPRINT</span>
                  <h3 style={{ margin: "4px 0 12px 0" }}>System Objective</h3>
                  <div className="objective-tag">
                    <Sparkles size={16} />
                    <span>{resultPlan.objective}</span>
                  </div>
                </div>
                
                <div>
                  <h4 style={{ margin: "0 0 8px 0", fontSize: "13px", color: "var(--text-secondary)" }}>AI Roles Involved</h4>
                  <div className="engine-pill-group">
                    {resultPlan.selected_engines?.map(eng => (
                      <span key={eng} className={getEngineClass(eng)} style={{ fontFamily: "var(--font-mono)", fontSize: "11px" }}>{eng}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Analysis Text */}
              <div className="glass-card" style={{ background: "rgba(0, 240, 255, 0.02)", borderColor: "rgba(0, 240, 255, 0.1)" }}>
                <h4 className="plan-section-title"><Layers size={16} /> Context & Analysis</h4>
                <p style={{ fontSize: "14px", color: "var(--text-primary)", lineHeight: 1.6, margin: "8px 0 0 0" }}>
                  {resultPlan.analysis}
                </p>
              </div>

              {/* Grid: Tasks and Deliverables Left, Risks and Timeline Right */}
              <div className="plan-dashboard-grid">
                
                {/* Left Side */}
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                  {/* Tasks list */}
                  <div className="glass-card">
                    <h4 className="plan-section-title"><ListChecks size={16} /> Decomposed Action Items</h4>
                    <div className="tasks-list" style={{ marginTop: "16px" }}>
                      {resultPlan.tasks?.map((task, idx) => {
                        const isDone = !!completedTasks[idx];
                        return (
                          <div key={idx} className={`task-item ${isDone ? "completed" : ""}`} onClick={() => toggleTask(idx)}>
                            <div className="task-checkbox">
                              {isDone && <Check size={12} strokeWidth={3} />}
                            </div>
                            <span className="task-text">{task}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Deliverables */}
                  <div className="glass-card">
                    <h4 className="plan-section-title"><FileText size={16} /> Concrete Deliverables</h4>
                    <div className="deliverables-grid" style={{ marginTop: "16px" }}>
                      {resultPlan.deliverables?.map((del, idx) => (
                        <div key={idx} className="deliverable-card">
                          <div className="deliverable-info">
                            <FileDown className="deliverable-icon" size={16} />
                            <span className="deliverable-name">{del}</span>
                          </div>
                          <button
                            onClick={() => handleDownload(del)}
                            className="btn btn-secondary"
                            style={{ padding: "6px 12px", fontSize: "11px" }}
                            disabled={downloadingFile === del}
                          >
                            {downloadingFile === del ? "Deploying..." : "Deploy File"}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Side */}
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                  {/* Risks */}
                  <div className="glass-card">
                    <h4 className="plan-section-title"><ShieldAlert size={16} /> Risk Map & Mitigations</h4>
                    <div className="risks-list" style={{ marginTop: "16px" }}>
                      {resultPlan.risks?.map((riskStr, idx) => {
                        const parts = riskStr.split(" — mitigate with ");
                        const threat = parts[0] || riskStr;
                        const mitigation = parts[1] || "";
                        return (
                          <div key={idx} className="risk-card danger">
                            <div className="risk-title-row">
                              <ShieldAlert size={14} />
                              <span>{threat}</span>
                            </div>
                            {mitigation && (
                              <div className="risk-mitigation">
                                <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>Mitigation:</span> {mitigation}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Narrative Timeline */}
                  <div className="glass-card">
                    <h4 className="plan-section-title"><Clock size={16} /> Sequential Timeline</h4>
                    <div className="timeline-card" style={{ marginTop: "16px" }}>
                      <p>{resultPlan.execution_plan}</p>
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div className="glass-card">
                    <h4 className="plan-section-title"><ArrowRight size={16} /> Forward-Looking Recommendations</h4>
                    <ul style={{ margin: "12px 0 0 0", paddingLeft: "20px", color: "var(--text-secondary)", fontSize: "13px", lineHeight: "1.6" }}>
                      {resultPlan.recommendations?.map((rec, idx) => (
                        <li key={idx} style={{ marginBottom: "8px" }}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                </div>

              </div>

            </div>
          ) : (
            /* JSON View */
            <div className="json-view-wrapper">
              <button onClick={copyJson} className="json-copy-btn">
                {copied ? <><Check size={12} style={{ marginRight: "4px" }} /> Copied!</> : <><Copy size={12} style={{ marginRight: "4px" }} /> Copy JSON</>}
              </button>
              <pre className="json-pre">
                {JSON.stringify(resultPlan, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Multi-API Settings Modal */}
      {showKeyModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "520px", maxHeight: "85vh", overflowY: "auto" }}>
            <h3 className="modal-title">
              <Key size={18} style={{ color: "var(--accent-cyan)" }} /> Role-Specific Credentials Panel
            </h3>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: 0, lineHeight: 1.5 }}>
              Configure API keys to activate Live routing. Keys are loaded securely from `.env` by default. You can override them here.
            </p>
            
            <div className="input-group" style={{ marginTop: "12px" }}>
              <label>CEO Advisor Key (sk-...)</label>
              <input
                type="password"
                placeholder="sk-..."
                value={tempCeoKey}
                onChange={(e) => setTempCeoKey(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label>COO Operations Key (sk-...)</label>
              <input
                type="password"
                placeholder="sk-..."
                value={tempCooKey}
                onChange={(e) => setTempCooKey(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label>Engineering Key (CTO/Devs) (sk-...)</label>
              <input
                type="password"
                placeholder="sk-..."
                value={tempEngineerKey}
                onChange={(e) => setTempEngineerKey(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label>HR Operations Key (sk-...)</label>
              <input
                type="password"
                placeholder="sk-..."
                value={tempHrKey}
                onChange={(e) => setTempHrKey(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label>Product Management Key (sk-...)</label>
              <input
                type="password"
                placeholder="sk-..."
                value={tempProductKey}
                onChange={(e) => setTempProductKey(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label>UI/UX Design Key (sk-...)</label>
              <input
                type="password"
                placeholder="sk-..."
                value={tempUiuxKey}
                onChange={(e) => setTempUiuxKey(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label>QA Testing Key (sk-...)</label>
              <input
                type="password"
                placeholder="sk-..."
                value={tempQaKey}
                onChange={(e) => setTempQaKey(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label>Marketing Key (sk-...)</label>
              <input
                type="password"
                placeholder="sk-..."
                value={tempMarketingKey}
                onChange={(e) => setTempMarketingKey(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label>Legal Key (sk-...)</label>
              <input
                type="password"
                placeholder="sk-..."
                value={tempLegalKey}
                onChange={(e) => setTempLegalKey(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label>Google Gemini API Key (Fallback Engine)</label>
              <input
                type="password"
                placeholder="AIzaSy..."
                value={tempGeminiKey}
                onChange={(e) => setTempGeminiKey(e.target.value)}
              />
            </div>

            <div className="modal-buttons">
              <button 
                type="button" 
                onClick={() => setShowKeyModal(false)} 
                className="btn btn-secondary"
                style={{ padding: "8px 16px" }}
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={handleSaveKeys} 
                className="btn"
                style={{ padding: "8px 20px" }}
              >
                Save Keys
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
export default ConsoleTab;
