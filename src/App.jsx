import React, { useState, useEffect } from "react";
import { Cpu, Brain, Activity, LogOut, MessageSquare, Briefcase, Code, Users, Settings, FileText, Sparkles, Layers, Terminal, Target, ShieldCheck, Key, X } from "lucide-react";
import { AaceApi } from "./utils/api";
import ConsoleTab from "./components/ConsoleTab";
import MemoryTab from "./components/MemoryTab";
import EngineTab, { ENGINES_INFO } from "./components/EngineTab";
import LoginGate from "./components/LoginGate";
import CeoChat from "./components/CeoChat";
import HrPortal from "./components/HrPortal";
import DevPortal from "./components/DevPortal";
import OpsPortal from "./components/OpsPortal";
import ProductPortal from "./components/ProductPortal";
import UiUxPortal from "./components/UiUxPortal";
import QaPortal from "./components/QaPortal";
import MarketingPortal from "./components/MarketingPortal";
import LegalPortal from "./components/LegalPortal";
import DeptDashboard from "./components/DeptDashboard";
import ExecutiveChat from "./components/ExecutiveChat";

const INITIAL_MEMORIES = [
  "Engineering stack parameters are bound to Vite + React + Node.js.",
  "Internal databases are hosted on SQL/NoSQL containers under strict IAM control.",
  "Compliance rules require W-9 and NDA verification for all contract vendors.",
  "Maximum discount thresholds for account representatives is capped at 15%.",
  "Customer support triage paths must always maintain a direct escalation link to human agents."
];

export function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem("aace_is_logged_in") === "true";
  });
  const [userRole, setUserRole] = useState(() => {
    return localStorage.getItem("aace_user_role") || ""; // ceo | hr | cto | coo
  });
  const [currentUserInfo, setCurrentUserInfo] = useState(() => {
    try {
      const saved = localStorage.getItem("aace_user_info");
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  const [activeTab, setActiveTab] = useState(() => {
    const role = localStorage.getItem("aace_user_role") || "";
    return role === "ceo" ? "console" : "portal";
  });
  
  const [selectedDept, setSelectedDept] = useState(null);
  const [memories, setMemories] = useState([]);
  const [apiBaseUrl, setApiBaseUrl] = useState(() => {
    return AaceApi.getApiBaseUrl();
  });

  const handleUpdateApiUrl = (newUrl) => {
    AaceApi.setApiBaseUrl(newUrl);
    setApiBaseUrl(newUrl);
    AaceApi.setOfflineMode(false); // Try connecting again
  };

  const [isOffline, setIsOffline] = useState(() => {
    return AaceApi.isOfflineMode();
  });

  useEffect(() => {
    AaceApi.onModeChange = (offline) => {
      setIsOffline(offline);
    };
    return () => {
      AaceApi.onModeChange = null;
    };
  }, []);

  // Change Passcode Modal States
  const [showChangePasscodeModal, setShowChangePasscodeModal] = useState(false);
  const [oldPasscode, setOldPasscode] = useState("");
  const [newPasscode, setNewPasscode] = useState("");
  const [changePasscodeError, setChangePasscodeError] = useState("");
  const [changePasscodeSuccess, setChangePasscodeSuccess] = useState("");
  const [isChangingPasscode, setIsChangingPasscode] = useState(false);

  const handleChangePasscodeSubmit = async (e) => {
    e.preventDefault();
    setChangePasscodeError("");
    setChangePasscodeSuccess("");
    
    if (!oldPasscode || !newPasscode) {
      setChangePasscodeError("Both current and new passcodes are required.");
      return;
    }
    
    const empId = getCurrentEmpId();
    if (!empId) {
      setChangePasscodeError("Could not retrieve employee ID.");
      return;
    }
    
    setIsChangingPasscode(true);
    try {
      const data = await AaceApi.request("/api/employees/change-passcode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          empId,
          oldPasscode,
          newPasscode
        })
      });
      setIsChangingPasscode(false);
      
      if (data.success) {
        setChangePasscodeSuccess("Passcode updated successfully!");
        setOldPasscode("");
        setNewPasscode("");
        
        if (currentUserInfo) {
          const updatedUserInfo = { ...currentUserInfo, passcode: newPasscode.trim() };
          setCurrentUserInfo(updatedUserInfo);
          localStorage.setItem("aace_user_info", JSON.stringify(updatedUserInfo));
        }
        
        setTimeout(() => {
          setShowChangePasscodeModal(false);
          setChangePasscodeSuccess("");
        }, 1500);
      } else {
        setChangePasscodeError(data.error || "Failed to update passcode.");
      }
    } catch (err) {
      setIsChangingPasscode(false);
      setChangePasscodeError(err.message || "Network error while updating passcode.");
    }
  };

  useEffect(() => {
    AaceApi.request("/api/memories")
      .then(data => {
        if (data && data.length > 0) {
          setMemories(data);
        } else {
          setMemories(INITIAL_MEMORIES);
          INITIAL_MEMORIES.forEach(text => {
            AaceApi.request("/api/memories", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ text })
            }).catch(err => console.error("Error seeding memory:", err));
          });
        }
      })
      .catch(err => {
        console.error("Error loading memories, falling back to localStorage:", err);
        const saved = localStorage.getItem("aace_memories");
        setMemories(saved ? JSON.parse(saved) : INITIAL_MEMORIES);
      });
  }, []);

  const handleLogin = (role, userInfo) => {
    setIsLoggedIn(true);
    setUserRole(role);
    localStorage.setItem("aace_is_logged_in", "true");
    localStorage.setItem("aace_user_role", role);
    if (userInfo) {
      setCurrentUserInfo(userInfo);
      localStorage.setItem("aace_user_info", JSON.stringify(userInfo));
    }
    if (role === "ceo") {
      setActiveTab("console");
    } else {
      setActiveTab("portal");
    }
  };

  const handleLogout = async () => {
    const empId = currentUserInfo?.empId;
    if (empId) {
      try {
        await AaceApi.request("/api/logout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ empId })
        });
      } catch (err) {
        console.error("Error updating attendance status on logout:", err);
      }
    }

    setIsLoggedIn(false);
    setUserRole("");
    setCurrentUserInfo(null);
    localStorage.removeItem("aace_is_logged_in");
    localStorage.removeItem("aace_user_role");
    localStorage.removeItem("aace_user_info");
  };

  const handleAddMemory = async (newMem) => {
    if (!memories.some(m => m.toLowerCase() === newMem.toLowerCase())) {
      try {
        const data = await AaceApi.request("/api/memories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: newMem })
        });
        if (data.success) {
          setMemories(prev => [newMem, ...prev]);
        }
      } catch (err) {
        console.error("Error saving memory:", err);
        setMemories(prev => [newMem, ...prev]);
      }
    }
  };

  const handleAddMemoryUpdates = async (newMems) => {
    for (const text of newMems) {
      if (!memories.some(m => m.toLowerCase() === text.toLowerCase())) {
        try {
          await AaceApi.request("/api/memories", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text })
          });
        } catch (err) {
          console.error("Error saving memory update:", err);
        }
      }
    }
    AaceApi.request("/api/memories")
      .then(data => setMemories(data))
      .catch(err => console.error("Error refetching memories:", err));
  };

  const handleDeleteMemory = async (memToDelete) => {
    try {
      const data = await AaceApi.request("/api/memories", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: memToDelete })
      });
      if (data.success) {
        setMemories(prev => prev.filter(m => m !== memToDelete));
      }
    } catch (err) {
      console.error("Error deleting memory:", err);
      setMemories(prev => prev.filter(m => m !== memToDelete));
    }
  };

  if (!isLoggedIn) {
    return <LoginGate onLogin={handleLogin} />;
  }

  const getRoleBadgeColor = () => {
    if (userRole === "ceo") return "var(--accent-cyan)";
    if (userRole === "hr") return "var(--accent-purple)";
    if (userRole === "cto") return "var(--accent-blue)";
    if (userRole === "coo") return "var(--accent-yellow)";
    if (userRole === "product") return "var(--accent-cyan)";
    if (userRole === "uiux") return "var(--accent-purple)";
    if (userRole === "qa") return "var(--accent-red)";
    if (userRole === "marketing") return "var(--accent-yellow)";
    if (userRole === "legal") return "var(--accent-red)";
    return "var(--text-secondary)";
  };

  const getRoleDisplayName = () => {
    if (currentUserInfo && currentUserInfo.name) return currentUserInfo.name;
    if (userRole === "ceo") return "Tamal Dey";
    if (userRole === "hr") return "sarah";
    if (userRole === "cto") return "john";
    if (userRole === "coo") return "clara";
    if (userRole === "product") return "alex";
    if (userRole === "uiux") return "lisa";
    if (userRole === "qa") return "kevin";
    if (userRole === "marketing") return "rachel";
    if (userRole === "legal") return "harvey";
    return "Employee";
  };

  const getCurrentEmpId = () => {
    if (currentUserInfo && currentUserInfo.empId) return currentUserInfo.empId;
    return "";
  };

  const getCurrentRole = () => {
    if (currentUserInfo && currentUserInfo.role) return currentUserInfo.role;
    return userRole.toUpperCase();
  };

  return (
    <div className="app-container">
      
      {/* Left Navigation Sidebar */}
      <aside className="sidebar">
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          <div className="brand">
            <div className="brand-logo">
              AACE. <span>v2.1</span>
            </div>
          </div>

          {/* Navigation links switcher */}
          <nav className="nav-menu">
            {userRole === "ceo" ? (
              <>
                <div 
                  className={`nav-item ${activeTab === "console" ? "active" : ""}`}
                  onClick={() => setActiveTab("console")}
                >
                  <Cpu size={15} />
                  <span>AACE Console</span>
                </div>
                
                <div 
                  className={`nav-item ${activeTab === "chat" ? "active" : ""}`}
                  onClick={() => setActiveTab("chat")}
                >
                  <MessageSquare size={15} />
                  <span>CEO Advisor Chat</span>
                </div>

                <div 
                  className={`nav-item ${activeTab === "hr" ? "active" : ""}`}
                  onClick={() => setActiveTab("hr")}
                >
                  <Users size={15} />
                  <span>HR Operations</span>
                </div>

                <div 
                  className={`nav-item ${activeTab === "cto" ? "active" : ""}`}
                  onClick={() => setActiveTab("cto")}
                >
                  <Code size={15} />
                  <span>Developer Board</span>
                </div>

                <div 
                  className={`nav-item ${activeTab === "coo" ? "active" : ""}`}
                  onClick={() => setActiveTab("coo")}
                >
                  <Briefcase size={15} />
                  <span>COO Operations</span>
                </div>

                <div 
                  className={`nav-item ${activeTab === "product" ? "active" : ""}`}
                  onClick={() => setActiveTab("product")}
                >
                  <Layers size={15} />
                  <span>Product Manager</span>
                </div>

                <div 
                  className={`nav-item ${activeTab === "uiux" ? "active" : ""}`}
                  onClick={() => setActiveTab("uiux")}
                >
                  <Sparkles size={15} />
                  <span>UI/UX Design</span>
                </div>

                <div 
                  className={`nav-item ${activeTab === "qa" ? "active" : ""}`}
                  onClick={() => setActiveTab("qa")}
                >
                  <Terminal size={15} />
                  <span>QA Testing</span>
                </div>

                <div 
                  className={`nav-item ${activeTab === "marketing" ? "active" : ""}`}
                  onClick={() => setActiveTab("marketing")}
                >
                  <Target size={15} />
                  <span>Marketing & Growth</span>
                </div>

                <div 
                  className={`nav-item ${activeTab === "legal" ? "active" : ""}`}
                  onClick={() => setActiveTab("legal")}
                >
                  <ShieldCheck size={15} />
                  <span>Legal & Compliance</span>
                </div>

                <div 
                  className={`nav-item ${activeTab === "memory" ? "active" : ""}`}
                  onClick={() => setActiveTab("memory")}
                >
                  <Brain size={15} />
                  <span>Memory Vault</span>
                </div>

                <div 
                  className={`nav-item ${activeTab === "engines" ? "active" : ""}`}
                  onClick={() => setActiveTab("engines")}
                >
                  <Activity size={15} />
                  <span>Engine Matrix</span>
                </div>

                <div 
                  className={`nav-item ${activeTab === "executive_chat" ? "active" : ""}`}
                  onClick={() => setActiveTab("executive_chat")}
                >
                  <MessageSquare size={15} />
                  <span>Executive Chat</span>
                </div>

                <div style={{ marginTop: "12px", borderTop: "1px solid var(--border-color)", paddingTop: "12px", paddingLeft: "8px", paddingRight: "8px" }}>
                  <label style={{ fontSize: "9px", color: "var(--text-muted)", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "6px" }}>
                    AI Departments
                  </label>
                  <select
                    value={activeTab === "dept_dashboard" && selectedDept ? selectedDept.id : ""}
                    onChange={(e) => {
                      const deptId = e.target.value;
                      if (!deptId) return;
                      const dept = ENGINES_INFO.find(d => d.id === deptId);
                      if (dept) {
                        setSelectedDept(dept);
                        setActiveTab("dept_dashboard");
                      }
                    }}
                    style={{
                      padding: "6px 10px",
                      fontSize: "11px",
                      background: "rgba(0,0,0,0.4)",
                      border: "1px solid var(--border-color)",
                      color: "white",
                      borderRadius: "4px",
                      width: "100%",
                      outline: "none"
                    }}
                  >
                    <option value="">-- Choose Dept --</option>
                    {ENGINES_INFO.map(dept => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>
              </>
            ) : (
              // Employee Portals
              <div className="nav-item active">
                {userRole === "hr" && <><Users size={15} /><span>HR Dashboard</span></>}
                {userRole === "cto" && <><Code size={15} /><span>CTO Workspace</span></>}
                {userRole === "coo" && <><Briefcase size={15} /><span>COO Operations</span></>}
                {userRole === "product" && <><Layers size={15} /><span>Product Dashboard</span></>}
                {userRole === "uiux" && <><Sparkles size={15} /><span>UI/UX Design</span></>}
                {userRole === "qa" && <><Terminal size={15} /><span>QA Testing</span></>}
                {userRole === "marketing" && <><Target size={15} /><span>Marketing Portal</span></>}
                {userRole === "legal" && <><ShieldCheck size={15} /><span>Legal Portal</span></>}
              </div>
            )}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          <div className="connection-pill" style={{ borderColor: getRoleBadgeColor() }}>
            <span style={{ fontSize: "11px", fontWeight: "bold" }}>PROFILE</span>
            <span style={{ fontSize: "10px", color: getRoleBadgeColor(), fontFamily: "var(--font-mono)", fontWeight: "bold" }}>
              {userRole === "ceo" ? "CEO" : `UNDER ${userRole === "uiux" ? "UI/UX" : userRole.toUpperCase()}`}
            </span>
          </div>

          <div style={{ padding: "0 8px", lineHeight: 1.6 }}>
            <div style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-primary)", fontFamily: "var(--font-sans)" }}>
              {getRoleDisplayName()}
            </div>
            <div style={{ fontSize: "10px", color: getRoleBadgeColor(), fontFamily: "var(--font-mono)", fontWeight: "600", marginTop: "1px" }}>
              {getCurrentEmpId()}
            </div>
            <div style={{ fontSize: "10px", color: "var(--text-muted)", fontFamily: "var(--font-mono)", marginTop: "3px" }}>
              {getCurrentRole()}
            </div>
            <div style={{ fontSize: "10px", color: "var(--text-muted)", fontFamily: "var(--font-mono)", marginTop: "2px" }}>
              Status: SESSION_ACTIVE
            </div>
          </div>

          <div style={{ padding: "0 8px", margin: "10px 0", textAlign: "left" }}>
            <label style={{ fontSize: "9px", color: "var(--text-muted)", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>API Server Base:</label>
            <input 
              type="text" 
              value={apiBaseUrl} 
              onChange={(e) => handleUpdateApiUrl(e.target.value)} 
              style={{ 
                padding: "6px 10px", fontSize: "11px", background: "rgba(0,0,0,0.4)", 
                border: "1px solid var(--border-color)", color: "white", borderRadius: "4px",
                fontFamily: "var(--font-mono)", width: "100%", marginTop: "4px", outline: "none"
              }} 
            />
          </div>

          <button 
            onClick={() => {
              setChangePasscodeError("");
              setChangePasscodeSuccess("");
              setOldPasscode("");
              setNewPasscode("");
              setShowChangePasscodeModal(true);
            }}
            className="btn btn-secondary"
            style={{ 
              width: "100%", height: "36px", padding: 0, justifyContent: "center", 
              fontSize: "12px", gap: "6px", marginBottom: "8px"
            }}
          >
            <Settings size={13} />
            <span>Change Passcode</span>
          </button>

          <button 
            onClick={handleLogout}
            className="btn btn-secondary"
            style={{ 
              width: "100%", height: "36px", padding: 0, justifyContent: "center", 
              fontSize: "12px", gap: "6px", background: "rgba(239, 68, 68, 0.05)",
              borderColor: "rgba(239, 68, 68, 0.15)", color: "var(--accent-red)"
            }}
          >
            <LogOut size={13} />
            <span>Log Out Session</span>
          </button>
        </div>
      </aside>

      {/* Main Workspace Frame */}
      <main className="main-content">
        
        {/* Top Header */}
        <div className="top-header">
          <div>
            <h1 style={{ margin: 0, fontSize: "24px", fontFamily: "var(--font-heading)", fontWeight: "600", letterSpacing: "-0.5px" }}>
              {userRole === "ceo" && activeTab === "console" && "AACE Executive Operations Control"}
              {userRole === "ceo" && activeTab === "chat" && "Strategic Advisor Room"}
              {userRole === "ceo" && activeTab === "hr" && "HR Operations Bot Workspace (sarah)"}
              {userRole === "ceo" && activeTab === "cto" && "CTO Architecture Bot Workspace (john)"}
              {userRole === "ceo" && activeTab === "coo" && "COO Operations Bot Workspace (clara)"}
              {userRole === "ceo" && activeTab === "product" && "Human Product Manager Workspace (Alex)"}
              {userRole === "ceo" && activeTab === "uiux" && "Human UI/UX Designer Workspace (Lisa)"}
              {userRole === "ceo" && activeTab === "qa" && "Human QA Tester Workspace (Kevin)"}
              {userRole === "ceo" && activeTab === "marketing" && "Human Marketing Manager Workspace (Rachel)"}
              {userRole === "ceo" && activeTab === "legal" && "Human Legal Counsel Workspace (Harvey)"}
              {userRole === "ceo" && activeTab === "memory" && "Global Context Ledger Repository"}
              {userRole === "ceo" && activeTab === "engines" && "19-Engine Diagnostic Grid"}
              {userRole === "ceo" && activeTab === "executive_chat" && "Executive Messaging Board"}
              {userRole === "ceo" && activeTab === "dept_dashboard" && (selectedDept ? `${selectedDept.name} Workspace` : "AI Department Dashboard")}
              
              {userRole === "hr" && `HR Operations Bot Workspace (${getRoleDisplayName()})`}
              {userRole === "cto" && `CTO Architecture Bot Workspace (${getRoleDisplayName()})`}
              {userRole === "coo" && `COO Operations Bot Workspace (${getRoleDisplayName()})`}
              {userRole === "product" && `Human Product Manager Workspace (${getRoleDisplayName()})`}
              {userRole === "uiux" && `Human UI/UX Designer Workspace (${getRoleDisplayName()})`}
              {userRole === "qa" && `Human QA Tester Workspace (${getRoleDisplayName()})`}
              {userRole === "marketing" && `Human Marketing Manager Workspace (${getRoleDisplayName()})`}
              {userRole === "legal" && `Human Legal Counsel Workspace (${getRoleDisplayName()})`}
            </h1>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
              Connected to AACE Central Core &bull; Secure Node
            </p>
          </div>
          
          <div className="system-status" style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <div style={{
              display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", fontWeight: "bold",
              padding: "4px 10px", borderRadius: "12px", border: "1px solid",
              borderColor: isOffline ? "var(--accent-red)" : "var(--accent-green)",
              color: isOffline ? "var(--accent-red)" : "var(--accent-green)",
              background: isOffline ? "rgba(239, 68, 68, 0.05)" : "rgba(16, 185, 129, 0.05)"
            }}>
              <span style={{
                width: "6px", height: "6px", borderRadius: "50%",
                background: isOffline ? "var(--accent-red)" : "var(--accent-green)",
                boxShadow: `0 0 6px ${isOffline ? "var(--accent-red)" : "var(--accent-green)"}`
              }}></span>
              {isOffline ? "OFFLINE DATABASE" : "ONLINE BACKEND"}
            </div>
            <div className="status-indicator">
              <span className="dot pulse" style={{ backgroundColor: getRoleBadgeColor(), boxShadow: `0 0 8px ${getRoleBadgeColor()}` }}></span>
              <span style={{ color: "var(--text-main)", fontWeight: 500 }}>{getRoleDisplayName()} View</span>
            </div>
          </div>
        </div>

        {/* Tab switch routing */}
        <div style={{ flex: 1 }}>
          {userRole === "ceo" ? (
            <>
              {activeTab === "console" && (
                <ConsoleTab 
                  memories={memories} 
                  onAddMemoryUpdates={handleAddMemoryUpdates} 
                />
              )}
              {activeTab === "chat" && (
                <CeoChat />
              )}
              {activeTab === "hr" && (
                <HrPortal />
              )}
              {activeTab === "cto" && (
                <DevPortal />
              )}
              {activeTab === "coo" && (
                <OpsPortal />
              )}
              {activeTab === "product" && (
                <ProductPortal />
              )}
              {activeTab === "uiux" && (
                <UiUxPortal />
              )}
              {activeTab === "qa" && (
                <QaPortal />
              )}
              {activeTab === "marketing" && (
                <MarketingPortal />
              )}
              {activeTab === "legal" && (
                <LegalPortal />
              )}
              {activeTab === "memory" && (
                <MemoryTab 
                  memories={memories} 
                  onAddMemory={handleAddMemory} 
                  onDeleteMemory={handleDeleteMemory} 
                />
              )}
              {activeTab === "engines" && (
                <EngineTab 
                  memories={memories}
                  onAddMemory={handleAddMemory}
                />
              )}
              {activeTab === "executive_chat" && (
                <ExecutiveChat />
              )}
              {activeTab === "dept_dashboard" && selectedDept && (
                <DeptDashboard department={selectedDept} />
              )}
            </>
          ) : (
            // Non-CEO Restricted Single View
            <>
              {userRole === "hr" && <HrPortal />}
              {userRole === "cto" && <DevPortal />}
              {userRole === "coo" && <OpsPortal />}
              {userRole === "product" && <ProductPortal />}
              {userRole === "uiux" && <UiUxPortal />}
              {userRole === "qa" && <QaPortal />}
              {userRole === "marketing" && <MarketingPortal />}
              {userRole === "legal" && <LegalPortal />}
            </>
          )}
        </div>

      </main>

      {/* Change Passcode Modal */}
      {showChangePasscodeModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "400px", width: "90%" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-color)", paddingBottom: "12px" }}>
              <h3 className="modal-title" style={{ gap: "8px", margin: 0, display: "flex", alignItems: "center" }}>
                <Key size={18} style={{ color: "var(--accent-cyan)" }} /> Change Passcode
              </h3>
              <button 
                onClick={() => setShowChangePasscodeModal(false)}
                className="btn-icon-danger"
                style={{ padding: "4px", borderRadius: "50%" }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleChangePasscodeSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "16px" }}>
              <div className="input-group">
                <label>Current Passcode</label>
                <input 
                  type="password" 
                  placeholder="Enter current passcode..." 
                  value={oldPasscode}
                  onChange={(e) => setOldPasscode(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <label>New Passcode</label>
                <input 
                  type="password" 
                  placeholder="Enter new passcode..." 
                  value={newPasscode}
                  onChange={(e) => setNewPasscode(e.target.value)}
                  required
                />
              </div>

              {changePasscodeError && (
                <div style={{ color: "var(--accent-red)", fontSize: "12px", background: "rgba(239, 68, 68, 0.05)", padding: "8px", borderRadius: "4px", border: "1px solid rgba(239, 68, 68, 0.15)" }}>
                  {changePasscodeError}
                </div>
              )}

              {changePasscodeSuccess && (
                <div style={{ color: "var(--accent-green)", fontSize: "12px", background: "rgba(16, 185, 129, 0.05)", padding: "8px", borderRadius: "4px", border: "1px solid rgba(16, 185, 129, 0.15)" }}>
                  {changePasscodeSuccess}
                </div>
              )}

              <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                <button type="submit" className="btn" disabled={isChangingPasscode} style={{ flex: 1, justifyContent: "center", background: "var(--accent-cyan)", color: "#000000" }}>
                  {isChangingPasscode ? "Updating..." : "Update Passcode"}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowChangePasscodeModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
