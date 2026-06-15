import React, { useState, useEffect, useRef } from "react";
import { Send, User, Bot, Sparkles, Terminal, FileCode, CheckCircle, AlertCircle, Play } from "lucide-react";
import { AaceApi } from "../utils/api";

export default function AntigravityChat() {
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Secure link established: Antigravity AI Engine online.\nWelcome, Founder. I am Antigravity, your advanced AI coding assistant. I can write files, construct UI views, and stage layouts for you. Any files I generate will appear in the Sandbox Staging area on the right. You can review and merge them into production at your command.\nHow can I assist you in coding today?",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [stagedFiles, setStagedFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [mergeMessage, setMergeMessage] = useState("");
  const [mergeError, setMergeError] = useState("");
  const chatEndRef = useRef(null);

  const loadSandbox = async () => {
    try {
      const files = await AaceApi.getSandboxFiles();
      setStagedFiles(files || []);
      if (files && files.length > 0) {
        // If a file was already selected, keep it selected with fresh content
        if (selectedFile) {
          const fresh = files.find(f => f.name === selectedFile.name);
          if (fresh) {
            setSelectedFile(fresh);
          } else {
            setSelectedFile(files[0]);
          }
        } else {
          setSelectedFile(files[0]);
        }
      } else {
        setSelectedFile(null);
      }
    } catch (err) {
      console.error("Failed to load sandbox files:", err);
    }
  };

  useEffect(() => {
    loadSandbox();
  }, []);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg = inputText.trim();
    setInputText("");

    // Append user message
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [...prev, { sender: "user", text: userMsg, time }]);
    setIsTyping(true);

    // Prepare history format
    const history = messages.map(m => ({
      sender: m.sender,
      text: m.text
    }));

    try {
      const res = await AaceApi.antigravityChat(userMsg, history);
      setIsTyping(false);
      
      const botTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setMessages(prev => [...prev, { sender: "bot", text: res.text, time: botTime }]);
      
      // Reload sandbox files to show any newly generated ones
      await loadSandbox();
    } catch (err) {
      setIsTyping(false);
      const botTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setMessages(prev => [...prev, { 
        sender: "bot", 
        text: `Error communicating with AI core: ${err.message}. Running fallback mode.`, 
        time: botTime 
      }]);
    }
  };

  const handleMerge = async () => {
    if (!selectedFile) return;
    setMergeMessage("");
    setMergeError("");

    try {
      const res = await AaceApi.mergeSandboxFile(selectedFile.name);
      if (res.success) {
        setMergeMessage(`Merged successfully! File deployed to: `);
      } else {
        setMergeError(res.error || "Failed to merge file.");
      }
    } catch (err) {
      setMergeError(err.message || "Error merging file to production.");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", height: "calc(100vh - 120px)" }}>
      {/* Header Panel */}
      <div className="glass-card" style={{ padding: "16px 20px" }}>
        <h2 className="plan-section-title" style={{ borderLeftColor: "var(--accent-cyan)", margin: 0, paddingLeft: "10px", display: "flex", alignItems: "center", gap: "8px" }}>
          <Terminal size={18} style={{ color: "var(--accent-cyan)" }} /> Antigravity AI Engineering Assistant
        </h2>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px", marginContent: 0 }}>
          Interactive development terminal. Ask Antigravity to build templates, mockups, or write customized scripting files. Inspect drafts in sandbox staging, and deploy them directly to public folder.
        </p>
      </div>

      {/* Main Workspace split */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1.8fr", gap: "20px", flex: 1, minHeight: 0 }}>
        
        {/* Left column: Chat */}
        <div className="glass-card" style={{ display: "flex", flexDirection: "column", padding: "16px", minHeight: 0 }}>
          <div style={{ fontSize: "11px", fontWeight: "bold", color: "var(--text-secondary)", paddingBottom: "10px", borderBottom: "1px solid var(--border-color)", display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--accent-cyan)" }}></span>
            CHAT SHELL v1.0.0
          </div>

          {/* Bubble Stream */}
          <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "16px", padding: "12px 4px", minHeight: 0 }}>
            {messages.map((msg, index) => {
              const isBot = msg.sender === "bot";
              return (
                <div key={index} style={{
                  display: "flex", gap: "10px",
                  flexDirection: isBot ? "row" : "row-reverse",
                  alignSelf: isBot ? "flex-start" : "flex-end",
                  maxWidth: "90%"
                }}>
                  <div style={{
                    width: "28px", height: "28px", borderRadius: "50%",
                    background: isBot ? "rgba(0, 240, 255, 0.08)" : "rgba(59, 130, 246, 0.1)",
                    border: `1px solid ${isBot ? "var(--accent-cyan)" : "var(--accent-blue)"}`,
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                  }}>
                    {isBot ? <Bot size={14} style={{ color: "var(--accent-cyan)" }} /> : <User size={14} style={{ color: "var(--accent-blue)" }} />}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <div style={{
                      background: isBot ? "rgba(2, 132, 199, 0.03)" : "var(--bg-input)",
                      border: `1px solid ${isBot ? "rgba(2, 132, 199, 0.12)" : "var(--border-color)"}`,
                      borderRadius: "8px", padding: "10px 14px", fontSize: "13px", lineHeight: "1.5",
                      color: "var(--text-primary)", whiteSpace: "pre-wrap", fontFamily: "var(--font-sans)"
                    }}>
                      {msg.text}
                    </div>
                    <span style={{
                      fontSize: "9px", color: "var(--text-muted)", fontFamily: "var(--font-mono)",
                      alignSelf: isBot ? "flex-start" : "flex-end"
                    }}>{msg.time}</span>
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div style={{ display: "flex", gap: "10px", alignSelf: "flex-start" }}>
                <div style={{
                  width: "28px", height: "28px", borderRadius: "50%",
                  background: "rgba(0, 240, 255, 0.08)", border: "1px solid var(--accent-cyan)",
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                  <Bot size={14} style={{ color: "var(--accent-cyan)" }} />
                </div>
                <div style={{
                  background: "rgba(2, 132, 199, 0.03)", border: "1px solid rgba(2, 132, 199, 0.12)",
                  borderRadius: "8px", padding: "10px 14px", display: "flex", alignItems: "center", gap: "4px"
                }}>
                  <span className="dot pulse" style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--accent-cyan)" }}></span>
                  <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Antigravity compiles...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Form Input */}
          <form onSubmit={handleSend} style={{ display: "flex", gap: "8px", paddingTop: "10px", borderTop: "1px solid var(--border-color)" }}>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="e.g. Generate a calculator app called calc.html"
              style={{
                flex: 1,
                fontSize: "13px",
                background: "var(--bg-input)",
                border: "1px solid var(--border-color)",
                borderRadius: "6px",
                padding: "8px 12px",
                color: "var(--text-primary)"
              }}
            />
            <button type="submit" className="btn" style={{ padding: "8px 14px", borderRadius: "6px", display: "flex", gap: "6px" }}>
              <Send size={13} /> Send
            </button>
          </form>
        </div>

        {/* Right column: Sandbox File Staging & Inspector */}
        <div style={{ display: "grid", gridTemplateRows: "1fr", gap: "20px", minHeight: 0 }}>
          <div className="glass-card" style={{ display: "flex", flexDirection: "column", padding: "16px", minHeight: 0 }}>
            <div style={{ fontSize: "11px", fontWeight: "bold", color: "var(--text-secondary)", paddingBottom: "10px", borderBottom: "1px solid var(--border-color)", display: "flex", alignItems: "center", gap: "6px" }}>
              <FileCode size={13} style={{ color: "var(--accent-cyan)" }} />
              SANDBOX STAGING ENVIRONMENT
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: "16px", flex: 1, minHeight: 0, marginTop: "12px" }}>
              {/* File list */}
              <div style={{ borderRight: "1px solid var(--border-color)", paddingRight: "8px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "6px" }}>
                <span style={{ fontSize: "10px", fontWeight: "bold", color: "var(--text-muted)", marginBottom: "4px" }}>STAGED FILES</span>
                {stagedFiles.length === 0 ? (
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", fontStyle: "italic", textAlign: "center", marginTop: "20px" }}>
                    No files staged.
                  </div>
                ) : (
                  stagedFiles.map(file => {
                    const isSelected = selectedFile && selectedFile.name === file.name;
                    return (
                      <div
                        key={file.name}
                        onClick={() => setSelectedFile(file)}
                        style={{
                          display: "flex", alignItems: "center", gap: "8px", padding: "8px", borderRadius: "4px",
                          cursor: "pointer", fontSize: "12px",
                          background: isSelected ? "rgba(0, 240, 255, 0.05)" : "transparent",
                          color: isSelected ? "var(--accent-cyan)" : "var(--text-secondary)",
                          border: `1px solid ${isSelected ? "rgba(0, 240, 255, 0.15)" : "transparent"}`
                        }}
                      >
                        <FileCode size={12} />
                        <span style={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>{file.name}</span>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Code Viewer Panel */}
              <div style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
                {selectedFile ? (
                  <>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <span style={{ fontSize: "11px", fontWeight: "bold", fontFamily: "var(--font-mono)", color: "var(--accent-cyan)" }}>
                        {selectedFile.name} (Preview)
                      </span>
                      <button 
                        onClick={handleMerge}
                        className="btn" 
                        style={{ padding: "4px 8px", fontSize: "11px", borderRadius: "4px", display: "flex", gap: "4px", background: "linear-gradient(135deg, var(--accent-cyan), #0284c7)" }}
                      >
                        <CheckCircle size={11} /> Deploy to Production
                      </button>
                    </div>

                    {/* Notification Messages */}
                    {mergeMessage && (
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "11px", background: "rgba(16, 185, 129, 0.08)", border: "1px solid var(--accent-green)", color: "var(--accent-green)", padding: "6px 10px", borderRadius: "4px", marginBottom: "8px" }}>
                        <CheckCircle size={12} />
                        <span>
                          {mergeMessage} 
                          <a href={`http://localhost:5173/${selectedFile.name}`} target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent-cyan)", fontWeight: "bold", textDecoration: "underline", marginLeft: "2px" }}>
                            http://localhost:5173/{selectedFile.name}
                          </a>
                        </span>
                      </div>
                    )}
                    {mergeError && (
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "11px", background: "rgba(239, 68, 68, 0.08)", border: "1px solid var(--accent-red)", color: "var(--accent-red)", padding: "6px 10px", borderRadius: "4px", marginBottom: "8px" }}>
                        <AlertCircle size={12} />
                        <span>{mergeError}</span>
                      </div>
                    )}

                    <pre style={{
                      flex: 1,
                      margin: 0,
                      background: "rgba(0,0,0,0.25)",
                      border: "1px solid var(--border-color)",
                      borderRadius: "6px",
                      padding: "12px",
                      overflow: "auto",
                      fontSize: "11px",
                      lineHeight: "1.5",
                      color: "var(--text-primary)",
                      fontFamily: "var(--font-mono)",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-all"
                    }}>
                      {selectedFile.content}
                    </pre>
                  </>
                ) : (
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", gap: "8px" }}>
                    <FileCode size={24} style={{ opacity: 0.3 }} />
                    <span style={{ fontSize: "12px" }}>Select a file in the sidebar to inspect its code.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
