import React, { useState, useEffect } from "react";
import { Users, FileUser, Plus, Check, Send, Bot, Mail, Eye, X, AlertCircle, Settings, Key, EyeOff, MoreVertical, Clock } from "lucide-react";
import emailjs from "@emailjs/browser";
import { AaceApi } from "../utils/api";

export function HrPortal() {
  const [candidates, setCandidates] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [attendanceLogs, setAttendanceLogs] = useState([]);

  // Outbox email log state
  const [dispatchedEmails, setDispatchedEmails] = useState([
    {
      id: "mail-1",
      toName: "Sarah Jenkins",
      toEmail: "s.jenkins@aace-agent.io",
      empId: "EMP-2026-8942",
      role: "Frontend Developer",
      subject: "Welcome to AACE! Onboarding Invitation [EMP-2026-8942]",
      sentTime: "2026-06-13 10:14",
      body: `Dear Sarah Jenkins,\n\nWe are thrilled to welcome you to the AACE Operations framework as our new Frontend Developer.\n\nYour generated Corporate Employee ID is: EMP-2026-8942\n\nTo establish your secure profile link and configure your terminal parameters, please activate your profile via the local AACE gateway link below:\nhttp://localhost:5173/activate?id=EMP-2026-8942\n\nBest regards,\nHR Operations Bot\nAACE Company Core Engine`
    }
  ]);

  const [chatLog, setChatLog] = useState([]);

  const [inputText, setInputText] = useState("");
  const [newCandidateName, setNewCandidateName] = useState("");
  const [newCandidateRole, setNewCandidateRole] = useState("Frontend Developer");
  const [newCandidateEmail, setNewCandidateEmail] = useState("");
  const [newCandidateDesc, setNewCandidateDesc] = useState("");

  // Direct Employee Registration Form States
  const [newEmpName, setNewEmpName] = useState("");
  const [newEmpRole, setNewEmpRole] = useState("Frontend Developer");
  const [newEmpDept, setNewEmpDept] = useState("Engineering (AI Agent)");
  const [newEmpType, setNewEmpType] = useState("Full-Time");
  const [newEmpPasscode, setNewEmpPasscode] = useState("");
  
  // Selected email for preview modal
  const [selectedMail, setSelectedMail] = useState(null);

  const [showEmailSettings, setShowEmailSettings] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [serviceId, setServiceId] = useState(
    localStorage.getItem("emailjs_service_id") || import.meta.env.VITE_EMAILJS_SERVICE_ID || ""
  );
  const [templateId, setTemplateId] = useState(
    localStorage.getItem("emailjs_template_id") || import.meta.env.VITE_EMAILJS_TEMPLATE_ID || ""
  );
  const [publicKey, setPublicKey] = useState(
    localStorage.getItem("emailjs_public_key") || import.meta.env.VITE_EMAILJS_PUBLIC_KEY || ""
  );
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showPublicKey, setShowPublicKey] = useState(false);
  const [testEmailRecipient, setTestEmailRecipient] = useState("");
  const [testSending, setTestSending] = useState(false);

  // 1. Fetch data on mount
  useEffect(() => {
    // Fetch Candidates
    AaceApi.request("/api/candidates")
      .then(data => {
        if (data && data.length > 0) {
          setCandidates(data);
        } else {
          // Fallback / initial set
          setCandidates([
            { name: "Sarah Jenkins", role: "Frontend Developer", email: "s.jenkins@aace-agent.io", empId: "EMP-2026-8942", stage: "Technical Interview", status: "Active" },
            { name: "Marcus Chen", role: "Backend Developer", email: "m.chen@aace-agent.io", empId: "EMP-2026-3105", stage: "Architectural Review", status: "Active" }
          ]);
        }
      })
      .catch(err => console.error("Error loading candidates:", err));

    // Fetch Employees
    AaceApi.request("/api/employees")
      .then(data => setEmployees(data))
      .catch(err => console.error("Error loading employees:", err));

    // Fetch Attendance Logs
    AaceApi.request("/api/attendance")
      .then(data => setAttendanceLogs(data))
      .catch(err => console.error("Error loading attendance logs:", err));

    // Fetch Chat Logs
    AaceApi.request("/api/chat-logs?portal=hr")
      .then(async (data) => {
        if (data && data.length > 0) {
          setChatLog(data);
        } else {
          const initialMsg = {
            portal: "hr",
            sender: "bot",
            text: "[HR Operations Bot] HR Operations Bot active. I am monitoring candidate onboarding and auditing employee directories. When you register a candidate, I will automatically synthesize their Employee ID and dispatch a welcome onboarding email."
          };
          setChatLog([initialMsg]);
          // Seed the initial message
          try {
            await AaceApi.request("/api/chat-logs", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(initialMsg)
            });
          } catch (err) {
            console.error("Error saving initial chat log:", err);
          }
        }
      })
      .catch(err => console.error("Error loading chat logs:", err));
  }, []);

  const handleUpdateType = async (empId, newType) => {
    try {
      const data = await AaceApi.request("/api/employees/update-type", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ empId, type: newType })
      });
      if (data.success) {
        // Refresh employees list
        AaceApi.request("/api/employees")
          .then(data => setEmployees(data))
          .catch(err => console.error("Error refreshing employees:", err));
      } else {
        alert("Failed to update employee type.");
      }
    } catch (err) {
      console.error("Error updating employee type:", err);
    }
  };

  // Helper to append and save chat logs
  const appendChatMessage = async (sender, text) => {
    const msgObj = { portal: "hr", sender, text };
    try {
      const saved = await AaceApi.request("/api/chat-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(msgObj)
      });
      setChatLog(prev => [...prev, saved]);
    } catch (err) {
      console.error("Error saving chat log:", err);
      setChatLog(prev => [...prev, msgObj]);
    }
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    localStorage.setItem("emailjs_service_id", serviceId);
    localStorage.setItem("emailjs_template_id", templateId);
    localStorage.setItem("emailjs_public_key", publicKey);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleClearSettings = () => {
    localStorage.removeItem("emailjs_service_id");
    localStorage.removeItem("emailjs_template_id");
    localStorage.removeItem("emailjs_public_key");
    setServiceId(import.meta.env.VITE_EMAILJS_SERVICE_ID || "");
    setTemplateId(import.meta.env.VITE_EMAILJS_TEMPLATE_ID || "");
    setPublicKey(import.meta.env.VITE_EMAILJS_PUBLIC_KEY || "");
  };

  const handleSendTestEmail = (e) => {
    e.preventDefault();
    if (!testEmailRecipient.trim()) return;
    if (!serviceId || !templateId || !publicKey) {
      alert("Please configure all EmailJS credentials before sending a test email.");
      return;
    }

    setTestSending(true);
    const templateParams = {
      name: "Test Recipient",
      to_name: "Test Recipient",
      email: testEmailRecipient.trim(),
      to_email: testEmailRecipient.trim(),
      employee_id: "EMP-TEST-9999",
      role: "Quality Assurance Engineer",
      activation_link: `${window.location.origin}/activate?id=EMP-TEST-9999`
    };

    emailjs.send(serviceId, templateId, templateParams, publicKey)
      .then((response) => {
        setTestSending(false);
        setTestEmailRecipient("");
        appendChatMessage("bot", `[HR Operations Bot] Test Email Success: Sent successfully to <${templateParams.to_email}> (Status: ${response.status}).`);
      })
      .catch((err) => {
        setTestSending(false);
        appendChatMessage("bot", `[HR Operations Bot] Test Email Error: Failed to send test to <${templateParams.to_email}>. Error: ${err.text || err.message || JSON.stringify(err)}`);
      });
  };

  const handleRegisterCandidate = (e) => {
    e.preventDefault();
    if (!newCandidateName.trim() || !newCandidateRole.trim() || !newCandidateEmail.trim()) return;

    // Generate unique employee ID
    const generatedId = "EMP-2026-" + Math.floor(1000 + Math.random() * 9000);
    const candidateName = newCandidateName.trim();
    const candidateRole = newCandidateRole.trim();
    const candidateEmail = newCandidateEmail.trim();
    const candidateDesc = newCandidateDesc.trim();

    // Add candidate to DB
    const newCandObj = {
      name: candidateName,
      role: candidateRole,
      email: candidateEmail,
      empId: generatedId,
      stage: "Onboarding Stage",
      status: "Active"
    };

    AaceApi.request("/api/candidates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newCandObj)
    })
      .then(savedCand => {
        setCandidates(prev => [savedCand, ...prev]);
      })
      .catch(err => console.error("Error saving candidate:", err));

    // Construct and simulate email dispatch
    const mailId = "mail-" + Date.now();
    const mailSubject = `Welcome to AACE! Onboarding Invitation [${generatedId}]`;
    const mailBody = `Dear ${candidateName},\n\nWe are thrilled to welcome you to the AACE Operations framework as our new ${candidateRole}.\n\nYour generated Corporate Employee ID is: ${generatedId}.\n\n${candidateDesc ? `Onboarding Details / Description:\n${candidateDesc}\n\n` : ""}To establish your secure profile link and configure your terminal parameters, please activate your profile via the local AACE gateway link below:\n${window.location.origin}/activate?id=${generatedId}\n\nBest regards,\nHR Operations Bot\nAACE Company Core Engine`;

    const newMailObj = {
      id: mailId,
      toName: candidateName,
      toEmail: candidateEmail,
      empId: generatedId,
      role: candidateRole,
      subject: mailSubject,
      body: mailBody,
      sentTime: new Date().toISOString().replace('T', ' ').slice(0, 16)
    };

    setDispatchedEmails(prev => [newMailObj, ...prev]);

    // Trigger HR Bot chat confirmation
    appendChatMessage("bot", `[HR Operations Bot] Onboarding Event: Registered candidate "${candidateName}". Unique Employee ID generated: ${generatedId}. Outbox dispatch logged.`);

    // Send welcome email via EmailJS if credentials exist
    if (serviceId && templateId && publicKey) {
      appendChatMessage("bot", `[HR Operations Bot] Dispatching live welcome email to <${candidateEmail}> via EmailJS...`);

      const templateParams = {
        name: candidateName,
        to_name: candidateName,
        email: candidateEmail,
        to_email: candidateEmail,
        employee_id: generatedId,
        role: candidateRole,
        description: candidateDesc,
        activation_link: `${window.location.origin}/activate?id=${generatedId}`
      };

      emailjs.send(serviceId, templateId, templateParams, publicKey)
        .then((response) => {
          appendChatMessage("bot", `[HR Operations Bot] EmailJS Success: Live welcome email successfully sent to <${candidateEmail}> (Status: ${response.status}).`);
        })
        .catch((err) => {
          appendChatMessage("bot", `[HR Operations Bot] EmailJS Error: Failed to send welcome email to <${candidateEmail}>. Error: ${err.text || err.message || JSON.stringify(err)}`);
        });
    } else {
      appendChatMessage("bot", `[HR Operations Bot] Live dispatch skipped: EmailJS credentials not set. Simulated welcome email generated in Outbox.`);
    }

    // Clear form inputs
    setNewCandidateName("");
    setNewCandidateRole("");
    setNewCandidateEmail("");
    setNewCandidateDesc("");
  };

  const handleAddEmployee = (e) => {
    e.preventDefault();
    if (!newEmpName.trim() || !newEmpRole.trim()) return;

    const newEmpObj = {
      name: newEmpName.trim(),
      role: newEmpRole.trim(),
      dept: newEmpDept,
      type: newEmpType,
      passcode: newEmpPasscode.trim() || undefined
    };

    AaceApi.request("/api/employees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newEmpObj)
    })
      .then(savedEmp => {
        setEmployees(prev => [...prev, savedEmp]);
        setNewEmpName("");
        setNewEmpRole("");
        setNewEmpPasscode("");
        appendChatMessage("bot", `[HR Operations Bot] Directory Update: Manually registered employee "${savedEmp.name}" to the global registry (${savedEmp.role} under ${savedEmp.dept}).`);
      })
      .catch(err => {
        console.error("Error creating employee:", err);
        alert("Failed to save employee to backend.");
      });
  };

  const handleSendHrBot = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    const userMsg = inputText;
    setInputText("");

    appendChatMessage("user", userMsg);

    setTimeout(() => {
      let reply = `[HR Operations Bot] Request parsed. All active employee credentials can be reviewed in the global registry table. For newly dispatched candidate onboarding files, click the Preview button in the Outbox panel.`;
      if (userMsg.toLowerCase().includes("onboard") || userMsg.toLowerCase().includes("onboarding")) {
        reply = `[HR Operations Bot] Active onboarding pipeline lists: ${candidates.map(c => `${c.name} (${c.empId})`).join(', ') || 'Sarah Jenkins (EMP-2026-8942) and Marcus Chen (EMP-2026-3105)'}. Welcome emails have been successfully sent.`;
      }
      appendChatMessage("bot", reply);
    }, 1000);
  };

  return (
    <div className="hr-portal-container" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      
      {/* Current AI & Human Directories */}
      <div className="console-grid">
        {/* Left Column Stack */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div className="glass-card">
            <h3 className="plan-section-title"><Users size={16} /> Employee Directory (AI & Human)</h3>
          <div style={{ overflowX: "auto", marginTop: "16px" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border-color)", color: "var(--text-secondary)" }}>
                  <th style={{ padding: "12px 8px" }}>Username</th>
                  <th style={{ padding: "12px 8px" }}>Role Designation</th>
                  <th style={{ padding: "12px 8px" }}>Core Designation</th>
                  <th style={{ padding: "12px 8px" }}>Access Mode</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp, idx) => (
                  <tr key={idx} style={{ borderBottom: "1px solid var(--border-color)" }}>
                    <td style={{ padding: "12px 8px", fontWeight: "600", fontFamily: "var(--font-mono)", color: emp.name === "Tamal Dey" ? "var(--accent-cyan)" : "var(--accent-blue)" }}>{emp.name}</td>
                    <td style={{ padding: "12px 8px", color: "var(--text-primary)" }}>{emp.role}</td>
                    <td style={{ padding: "12px 8px" }}><span className={emp.name === "Tamal Dey" ? "engine-pill orchestrator" : "engine-pill business"} style={{ fontSize: "10px" }}>{emp.dept}</span></td>
                    <td style={{ padding: "12px 8px" }}>
                      <select
                        value={emp.type === "Autonomous" ? "Autonomous" : "Full-Time"}
                        onChange={(e) => handleUpdateType(emp.empId, e.target.value)}
                        style={{
                          background: "var(--bg-input)",
                          border: "1px solid var(--border-color)",
                          borderRadius: "6px",
                          padding: "4px 8px",
                          fontSize: "12px",
                          color: "var(--text-primary)",
                          outline: "none",
                          cursor: "pointer"
                        }}
                      >
                        <option value="Full-Time">Human</option>
                        <option value="Autonomous">AI</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Attendance Ledger */}
        <div className="glass-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 className="plan-section-title" style={{ margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
              <Clock size={16} /> Live Attendance Ledger
            </h3>
            <button 
              type="button" 
              onClick={() => {
                AaceApi.request("/api/attendance")
                  .then(data => setAttendanceLogs(data))
                  .catch(err => console.error("Error loading attendance logs:", err));
              }}
              className="btn btn-secondary"
              style={{ padding: "4px 8px", fontSize: "11px" }}
            >
              Refresh
            </button>
          </div>
          <div style={{ overflowX: "auto", marginTop: "16px" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border-color)", color: "var(--text-secondary)" }}>
                  <th style={{ padding: "12px 8px" }}>Employee ID</th>
                  <th style={{ padding: "12px 8px" }}>Name</th>
                  <th style={{ padding: "12px 8px" }}>Role</th>
                  <th style={{ padding: "12px 8px" }}>Clock-In Time</th>
                  <th style={{ padding: "12px 8px" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {attendanceLogs.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ padding: "20px 8px", textAlign: "center", color: "var(--text-muted)" }}>
                      No recent clock-in activity found.
                    </td>
                  </tr>
                ) : (
                  attendanceLogs.map((log, idx) => (
                    <tr key={idx} style={{ borderBottom: "1px solid var(--border-color)" }}>
                      <td style={{ padding: "12px 8px", fontFamily: "var(--font-mono)", color: "var(--text-secondary)" }}>{log.empId}</td>
                      <td style={{ padding: "12px 8px", fontWeight: "600", color: "var(--text-primary)" }}>{log.name}</td>
                      <td style={{ padding: "12px 8px", color: "var(--text-primary)" }}>{log.role}</td>
                      <td style={{ padding: "12px 8px", color: "var(--text-muted)", fontSize: "12px" }}>
                        {new Date(log.loginTime).toLocaleString()}
                      </td>
                      <td style={{ padding: "12px 8px" }}>
                        <span className="engine-pill orchestrator" style={{ fontSize: "10px", background: "rgba(16, 185, 129, 0.1)", color: "var(--accent-green)", border: "1px solid rgba(16, 185, 129, 0.2)" }}>
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Right Column Stack */}
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Add Candidate Form */}
          <div className="glass-card" style={{ position: "relative" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 className="plan-section-title" style={{ margin: 0 }}><Plus size={16} /> Register & Onboard Candidate</h3>
              
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
                      onClick={() => { setShowEmailSettings(true); setShowMenu(false); }}
                      style={{
                        width: "100%", textAlign: "left", background: "transparent", border: "none",
                        padding: "8px 12px", fontSize: "12px", color: "var(--text-primary)",
                        cursor: "pointer", borderRadius: "4px", display: "flex", alignItems: "center", gap: "8px",
                        transition: "background 0.2s"
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-input)"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                    >
                      <Settings size={14} /> EmailJS Settings
                    </button>
                  </div>
                )}
              </div>
            </div>
            <form onSubmit={handleRegisterCandidate} style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "16px" }}>
              <div className="input-group">
                <label>Candidate Name</label>
                <input 
                  type="text" 
                  placeholder="Enter full name..." 
                  value={newCandidateName} 
                  onChange={(e) => setNewCandidateName(e.target.value)} 
                  required
                />
              </div>
              
              <div className="input-group">
                <label>Candidate Email Address</label>
                <input 
                  type="email" 
                  placeholder="e.g. candidate@email.com" 
                  value={newCandidateEmail} 
                  onChange={(e) => setNewCandidateEmail(e.target.value)} 
                  required
                />
              </div>

              <div className="input-group">
                <label>Target Role Position</label>
                <select
                  value={newCandidateRole}
                  onChange={(e) => setNewCandidateRole(e.target.value)}
                  required
                  style={{
                    background: "var(--bg-input)", border: "1px solid var(--border-color)",
                    borderRadius: "6px", padding: "10px 12px", color: "var(--text-primary)",
                    outline: "none", fontSize: "14px", cursor: "pointer"
                  }}
                >
                  <option value="CEO & Founder">CEO & Founder</option>
                  <option value="COO Operations Bot">COO Operations Bot</option>
                  <option value="CTO Architecture Bot">CTO Architecture Bot</option>
                  <option value="HR Operations Bot">HR Operations Bot</option>
                  <option value="Lead Product Manager">Lead Product Manager</option>
                  <option value="Lead UI/UX Designer">Lead UI/UX Designer</option>
                  <option value="Lead QA Tester">Lead QA Tester</option>
                  <option value="Lead Marketing Manager">Lead Marketing Manager</option>
                  <option value="Lead Legal Counsel">Lead Legal Counsel</option>
                  <option value="Frontend Developer">Frontend Developer</option>
                  <option value="Backend Developer">Backend Developer</option>
                  <option value="Full-Stack Developer">Full-Stack Developer</option>
                  <option value="DevOps Engineer">DevOps Engineer</option>
                  <option value="QA Engineer">QA Engineer</option>
                  <option value="UI/UX Designer">UI/UX Designer</option>
                  <option value="Product Manager">Product Manager</option>
                  <option value="Marketing Manager">Marketing Manager</option>
                  <option value="Legal Counsel">Legal Counsel</option>
                  <option value="HR Coordinator">HR Coordinator</option>
                </select>
              </div>

              <div className="input-group">
                <label>Onboarding Description / Personal Note</label>
                <textarea 
                  placeholder="Enter details, description, or custom onboarding instructions..." 
                  value={newCandidateDesc} 
                  onChange={(e) => setNewCandidateDesc(e.target.value)}
                  style={{
                    minHeight: "80px", background: "var(--bg-input)", border: "1px solid var(--border-color)",
                    borderRadius: "6px", padding: "8px 12px", color: "var(--text-primary)", outline: "none", fontSize: "13px",
                    resize: "vertical", fontFamily: "var(--font-sans)"
                  }}
                />
              </div>

              <button type="submit" className="btn" style={{ background: "linear-gradient(135deg, var(--accent-purple), #7c3aed)", width: "100%", justifyContent: "center", marginTop: "8px" }}>
                <Plus size={16} /> Register & Send Welcome Email
              </button>
            </form>
          </div>

          {/* Add Employee Direct Form */}
          <div className="glass-card" style={{ marginTop: "12px" }}>
            <h3 className="plan-section-title"><Plus size={16} /> Register Employee Direct</h3>
            <form onSubmit={handleAddEmployee} style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "16px" }}>
              <div className="input-group">
                <label>Employee Name</label>
                <input 
                  type="text" 
                  placeholder="Enter employee name..." 
                  value={newEmpName} 
                  onChange={(e) => setNewEmpName(e.target.value)} 
                  required
                />
              </div>

              <div className="input-group">
                <label>Role Designation</label>
                <select
                  value={newEmpRole}
                  onChange={(e) => setNewEmpRole(e.target.value)}
                  required
                  style={{
                    background: "var(--bg-input)", border: "1px solid var(--border-color)",
                    borderRadius: "6px", padding: "10px 12px", color: "var(--text-primary)",
                    outline: "none", fontSize: "14px", cursor: "pointer"
                  }}
                >
                  <option value="CEO & Founder">CEO & Founder</option>
                  <option value="COO Operations Bot">COO Operations Bot</option>
                  <option value="CTO Architecture Bot">CTO Architecture Bot</option>
                  <option value="HR Operations Bot">HR Operations Bot</option>
                  <option value="Lead Product Manager">Lead Product Manager</option>
                  <option value="Lead UI/UX Designer">Lead UI/UX Designer</option>
                  <option value="Lead QA Tester">Lead QA Tester</option>
                  <option value="Lead Marketing Manager">Lead Marketing Manager</option>
                  <option value="Lead Legal Counsel">Lead Legal Counsel</option>
                  <option value="Frontend Developer">Frontend Developer</option>
                  <option value="Backend Developer">Backend Developer</option>
                  <option value="Full-Stack Developer">Full-Stack Developer</option>
                  <option value="DevOps Engineer">DevOps Engineer</option>
                  <option value="QA Engineer">QA Engineer</option>
                  <option value="UI/UX Designer">UI/UX Designer</option>
                  <option value="Product Manager">Product Manager</option>
                  <option value="Marketing Manager">Marketing Manager</option>
                  <option value="Legal Counsel">Legal Counsel</option>
                  <option value="HR Coordinator">HR Coordinator</option>
                </select>
              </div>

              <div className="input-group">
                <label>Security Passcode</label>
                <input 
                  type="password" 
                  placeholder="Set custom passcode (defaults to 'employee')..." 
                  value={newEmpPasscode} 
                  onChange={(e) => setNewEmpPasscode(e.target.value)} 
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="input-group" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label>Department</label>
                  <select 
                    value={newEmpDept} 
                    onChange={(e) => setNewEmpDept(e.target.value)}
                    style={{
                      background: "var(--bg-input)", border: "1px solid var(--border-color)",
                      borderRadius: "6px", padding: "8px 12px", color: "var(--text-primary)", outline: "none", fontSize: "13px"
                    }}
                  >
                    <option value="Executive (Human)">Executive (Human)</option>
                    <option value="Engineering (AI Agent)">Engineering (AI Agent)</option>
                    <option value="Operations (AI Agent)">Operations (AI Agent)</option>
                    <option value="HR (AI Agent)">HR (AI Agent)</option>
                    <option value="Product (AI Agent)">Product (AI Agent)</option>
                    <option value="Design (AI Agent)">Design (AI Agent)</option>
                    <option value="QA (AI Agent)">QA (AI Agent)</option>
                    <option value="Marketing (AI Agent)">Marketing (AI Agent)</option>
                    <option value="Legal (AI Agent)">Legal (AI Agent)</option>
                  </select>
                </div>

                <div className="input-group" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label>Access Type</label>
                  <select 
                    value={newEmpType} 
                    onChange={(e) => setNewEmpType(e.target.value)}
                    style={{
                      background: "var(--bg-input)", border: "1px solid var(--border-color)",
                      borderRadius: "6px", padding: "8px 12px", color: "var(--text-primary)", outline: "none", fontSize: "13px"
                    }}
                  >
                    <option value="Full-Time">Full-Time</option>
                    <option value="Autonomous">Autonomous</option>
                    <option value="Contractor">Contractor</option>
                    <option value="Part-Time">Part-Time</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="btn" style={{ background: "linear-gradient(135deg, var(--accent-blue), #1d4ed8)", width: "100%", justifyContent: "center", marginTop: "8px" }}>
                <Plus size={16} /> Add Employee to Registry
              </button>
            </form>
          </div>

        </div>
      </div>

      {/* Dispatch Outbox Logs & pipelines */}
      <div className="console-grid">
        
        {/* Active Recruiting Pipelines */}
        <div className="glass-card">
          <h3 className="plan-section-title"><FileUser size={16} /> Registered Candidate Cards</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "16px" }}>
            {candidates.map((cand, idx) => (
              <div key={idx} className="deliverable-card" style={{ padding: "14px 16px", borderColor: "rgba(139, 92, 246, 0.15)", background: "rgba(139, 92, 246, 0.01)" }}>
                <div>
                  <span style={{ fontWeight: "600", fontSize: "14px", display: "block", color: "var(--text-primary)" }}>{cand.name}</span>
                  <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>Email: {cand.email}</span>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block", marginTop: "2px", fontFamily: "var(--font-mono)" }}>
                    Employee ID: {cand.empId}
                  </span>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span className="engine-pill business" style={{ fontSize: "10px", padding: "2px 8px" }}>{cand.stage}</span>
                  <span style={{ display: "block", fontSize: "10px", color: "var(--text-muted)", marginTop: "4px" }}>Status: {cand.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Dispatched Welcome Emails (Outbox) */}
        <div className="glass-card">
          <h3 className="plan-section-title"><Mail size={16} /> AI Dispatched Welcome Mails (Outbox Logs)</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "16px", maxHeight: "250px", overflowY: "auto" }}>
            {dispatchedEmails.map((mail) => (
              <div key={mail.id} className="deliverable-card" style={{ padding: "12px", background: "rgba(16, 185, 129, 0.01)", borderColor: "rgba(16, 185, 129, 0.15)" }}>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-primary)" }}>To: {mail.toName}</span>
                  <span style={{ fontSize: "11px", color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>ID: {mail.empId}</span>
                  <span style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "2px" }}>Sent: {mail.sentTime}</span>
                </div>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <span style={{ fontSize: "10px", color: "var(--accent-green)", background: "rgba(16, 185, 129, 0.08)", padding: "2px 6px", borderRadius: "4px", border: "1px solid rgba(16, 185, 129, 0.2)" }}>
                    DISPATCHED
                  </span>
                  <button 
                    onClick={() => setSelectedMail(mail)} 
                    className="btn btn-secondary" 
                    style={{ padding: "6px 8px", fontSize: "11px" }}
                  >
                    <Eye size={12} style={{ marginRight: "4px" }} /> Preview
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Interactive HR Bot */}
      <div className="glass-card" style={{ display: "flex", flexDirection: "column", height: "300px" }}>
        <h3 className="plan-section-title"><Bot size={16} /> Consult HR Operations Bot</h3>
        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px", margin: "16px 0", paddingRight: "4px" }}>
          {chatLog.map((chat, idx) => {
            const isBot = chat.sender === "bot";
            return (
              <div key={idx} style={{
                alignSelf: isBot ? "flex-start" : "flex-end",
                background: isBot ? "var(--bg-input)" : "rgba(139, 92, 246, 0.1)",
                border: `1px solid ${isBot ? "var(--border-color)" : "rgba(139, 92, 246, 0.3)"}`,
                borderRadius: "8px", padding: "10px 14px", fontSize: "13px", maxWidth: "85%"
              }}>
                <span style={{ fontWeight: "600", fontSize: "10px", color: isBot ? "var(--accent-purple)" : "#a78bfa", display: "block", marginBottom: "4px" }}>
                  {isBot ? "HR Operations Bot (AI Agent)" : "HR Staff"}
                </span>
                {chat.text}
              </div>
            );
          })}
        </div>
        <form onSubmit={handleSendHrBot} style={{ display: "flex", gap: "8px" }}>
          <input 
            type="text" 
            placeholder="Ask HR Operations Bot for onboarding guidelines or parameters..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
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

      {/* Email Preview Modal Overlay */}
      {selectedMail && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "560px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-color)", paddingBottom: "12px" }}>
              <h3 className="modal-title" style={{ gap: "8px" }}>
                <Mail size={18} style={{ color: "var(--accent-cyan)" }} /> Onboarding Mail Preview Simulator
              </h3>
              <button 
                onClick={() => setSelectedMail(null)} 
                className="btn-icon-danger" 
                style={{ padding: "4px", borderRadius: "50%" }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px", color: "var(--text-primary)" }}>
              <div style={{ display: "grid", gridTemplateColumns: "80px 1fr", borderBottom: "1px solid var(--border-color)", paddingBottom: "8px" }}>
                <span style={{ color: "var(--text-secondary)" }}>From:</span>
                <span style={{ fontFamily: "var(--font-mono)" }}>hr_operations_bot@aace-agent.io (HR Operations Bot)</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "80px 1fr", borderBottom: "1px solid var(--border-color)", paddingBottom: "8px" }}>
                <span style={{ color: "var(--text-secondary)" }}>To:</span>
                <span style={{ fontFamily: "var(--font-mono)" }}>{selectedMail.toEmail} &lt;{selectedMail.toName}&gt;</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "80px 1fr", borderBottom: "1px solid var(--border-color)", paddingBottom: "8px" }}>
                <span style={{ color: "var(--text-secondary)" }}>Subject:</span>
                <span style={{ fontWeight: 600, color: "var(--accent-cyan)" }}>{selectedMail.subject}</span>
              </div>
            </div>

            <div style={{
              background: "var(--bg-main)", border: "1px solid var(--border-color)", borderRadius: "8px",
              padding: "20px", color: "var(--text-primary)", fontSize: "13px", lineHeight: 1.6,
              fontFamily: "var(--font-sans)", whiteSpace: "pre-wrap", maxHeight: "280px", overflowY: "auto"
            }}>
              {selectedMail.body}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button 
                onClick={() => setSelectedMail(null)} 
                className="btn" 
                style={{ padding: "8px 24px" }}
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EmailJS Settings Modal Overlay */}
      {showEmailSettings && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "540px", width: "95%" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-color)", paddingBottom: "12px" }}>
              <h3 className="modal-title" style={{ gap: "8px", margin: 0, display: "flex", alignItems: "center" }}>
                <Settings size={18} style={{ color: "var(--accent-cyan)" }} /> EmailJS Integration Setup
              </h3>
              <button 
                onClick={() => setShowEmailSettings(false)} 
                className="btn-icon-danger" 
                style={{ padding: "4px", borderRadius: "50%" }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "16px" }}>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.5, padding: "8px 12px", background: "var(--bg-input)", borderRadius: "6px", border: "1px solid var(--border-color)" }}>
                Configure your service ID, template ID, and public key to route welcome emails to candidate inboxes. 
                <div style={{ marginTop: "6px", fontWeight: "600" }}>Expected Template variables:</div>
                <ul style={{ margin: "4px 0 0 16px", padding: 0 }}>
                  <li><code style={{ color: "var(--accent-cyan)" }}>{"{{name}}"}</code> / <code style={{ color: "var(--accent-cyan)" }}>{"{{to_name}}"}</code>: Candidate Name</li>
                  <li><code style={{ color: "var(--accent-cyan)" }}>{"{{email}}"}</code> / <code style={{ color: "var(--accent-cyan)" }}>{"{{to_email}}"}</code>: Candidate Email</li>
                  <li><code style={{ color: "var(--accent-cyan)" }}>{"{{employee_id}}"}</code>: Newly generated employee ID</li>
                  <li><code style={{ color: "var(--accent-cyan)" }}>{"{{role}}"}</code>: Candidate job role designation</li>
                  <li><code style={{ color: "var(--accent-cyan)" }}>{"{{description}}"}</code>: Custom onboarding description/notes</li>
                  <li><code style={{ color: "var(--accent-cyan)" }}>{"{{activation_link}}"}</code>: Gateway activation URL</li>
                </ul>
              </div>

              <form onSubmit={handleSaveSettings} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div className="input-group">
                  <label style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>EmailJS Service ID</span>
                    <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>
                      {import.meta.env.VITE_EMAILJS_SERVICE_ID ? "Loaded from .env" : "Not set in .env"}
                    </span>
                  </label>
                  <input 
                    type="text" 
                    placeholder="e.g. service_xxxxxx" 
                    value={serviceId} 
                    onChange={(e) => setServiceId(e.target.value)}
                  />
                </div>

                <div className="input-group">
                  <label style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>EmailJS Template ID</span>
                    <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>
                      {import.meta.env.VITE_EMAILJS_TEMPLATE_ID ? "Loaded from .env" : "Not set in .env"}
                    </span>
                  </label>
                  <input 
                    type="text" 
                    placeholder="e.g. template_xxxxxx" 
                    value={templateId} 
                    onChange={(e) => setTemplateId(e.target.value)}
                  />
                </div>

                <div className="input-group">
                  <label style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>EmailJS Public Key</span>
                    <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>
                      {import.meta.env.VITE_EMAILJS_PUBLIC_KEY ? "Loaded from .env" : "Not set in .env"}
                    </span>
                  </label>
                  <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                    <input 
                      type={showPublicKey ? "text" : "password"} 
                      placeholder="e.g. user_xxxxxxxxxxxxx" 
                      value={publicKey} 
                      onChange={(e) => setPublicKey(e.target.value)}
                      style={{ paddingRight: "40px", width: "100%" }}
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPublicKey(!showPublicKey)}
                      style={{
                        position: "absolute", right: "10px", background: "none", border: "none",
                        color: "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center"
                      }}
                    >
                      {showPublicKey ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
                  <button type="submit" className="btn" style={{ flex: 1, background: "var(--accent-purple)", justifyContent: "center" }}>
                    <Check size={14} style={{ marginRight: "4px" }} /> {saveSuccess ? "Saved!" : "Save Settings"}
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={handleClearSettings} style={{ justifyContent: "center" }}>
                    Clear
                  </button>
                </div>
              </form>

              {/* Test Connection Form */}
              <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "12px", marginTop: "4px" }}>
                <span style={{ fontSize: "11px", fontWeight: "600", textTransform: "uppercase", color: "var(--text-secondary)", letterSpacing: "0.05em", display: "block", marginBottom: "8px" }}>
                  Test Integration Mailer
                </span>
                <form onSubmit={handleSendTestEmail} style={{ display: "flex", gap: "8px" }}>
                  <input 
                    type="email" 
                    placeholder="Enter test email recipient..." 
                    value={testEmailRecipient}
                    onChange={(e) => setTestEmailRecipient(e.target.value)}
                    required
                    style={{
                      flex: 1, background: "var(--bg-input)", border: "1px solid var(--border-color)",
                      borderRadius: "6px", padding: "8px 12px", color: "var(--text-primary)", outline: "none", fontSize: "12px"
                    }}
                  />
                  <button 
                    type="submit" 
                    className="btn" 
                    disabled={testSending || !serviceId || !templateId || !publicKey}
                    style={{
                      background: "var(--accent-blue)", padding: "0 14px", fontSize: "12px", height: "34px",
                      opacity: (testSending || !serviceId || !templateId || !publicKey) ? 0.6 : 1,
                      cursor: (testSending || !serviceId || !templateId || !publicKey) ? "not-allowed" : "pointer"
                    }}
                  >
                    {testSending ? "Sending..." : "Send Test"}
                  </button>
                </form>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "16px", borderTop: "1px solid var(--border-color)", paddingTop: "12px" }}>
              <button 
                onClick={() => setShowEmailSettings(false)} 
                className="btn" 
                style={{ padding: "8px 24px" }}
              >
                Close Settings
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
export default HrPortal;
