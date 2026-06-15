import React, { useState, useEffect, useRef } from "react";
import { Send, Bot, User, Terminal, FileCode, CheckCircle, AlertCircle, Cpu, Zap, Code2, RefreshCw, ChevronRight } from "lucide-react";
import { AaceApi } from "../utils/api";

const QUICK_PROMPTS = [
  { icon: "🧮", label: "Calculator App", query: "Generate a premium dark-themed calculator app called calculator.html" },
  { icon: "📋", label: "Todo Manager", query: "Build a modern glassmorphism todo manager app called todo.html" },
  { icon: "🌦️", label: "Weather UI", query: "Create a beautiful weather dashboard UI called weather.html" },
  { icon: "📊", label: "Dashboard", query: "Build a sleek analytics dashboard with dark theme called dashboard.html" },
];

export default function MainEngineerChat() {
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "System link established. Main Engineer AI is online.\n\nI am your advanced agentic coding assistant. Send me any directive — I will write, stage, and deploy code directly into your sandbox. Use the quick actions below to get started instantly.",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [stagedFiles, setStagedFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [mergeMessage, setMergeMessage] = useState("");
  const [mergeError, setMergeError] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const chatEndRef = useRef(null);

  const loadSandbox = async () => {
    try {
      const files = await AaceApi.getSandboxFiles();
      setStagedFiles(files || []);
      if (files && files.length > 0) {
        if (selectedFile) {
          const fresh = files.find(f => f.name === selectedFile.name);
          setSelectedFile(fresh || files[0]);
        } else {
          setSelectedFile(files[0]);
        }
      } else {
        setSelectedFile(null);
      }
    } catch (err) {
      console.error("Failed to load sandbox:", err);
    }
  };

  const refreshSandbox = async () => {
    setIsRefreshing(true);
    await loadSandbox();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  useEffect(() => { loadSandbox(); }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = async (text) => {
    if (!text.trim()) return;
    const userMsg = text.trim();
    setInputText("");
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setMessages(prev => [...prev, { sender: "user", text: userMsg, time }]);
    setIsTyping(true);
    const history = messages.map(m => ({ sender: m.sender, text: m.text }));
    try {
      const res = await AaceApi.mainEngineerChat(userMsg, history);
      setIsTyping(false);
      const botTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      setMessages(prev => [...prev, { sender: "bot", text: res.text, time: botTime }]);
      await loadSandbox();
    } catch (err) {
      setIsTyping(false);
      const botTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      setMessages(prev => [...prev, {
        sender: "bot",
        text: `Connection error: ${err.message}. Switching to local fallback mode.`,
        time: botTime,
        isError: true
      }]);
    }
  };

  const handleSubmit = (e) => { e.preventDefault(); sendMessage(inputText); };

  const handleMerge = async () => {
    if (!selectedFile) return;
    setMergeMessage(""); setMergeError("");
    try {
      const res = await AaceApi.mergeSandboxFile(selectedFile.name);
      if (res.success) setMergeMessage(`Deployed to production: ${selectedFile.name}`);
      else setMergeError(res.error || "Deploy failed.");
    } catch (err) {
      setMergeError(err.message || "Error deploying file.");
    }
  };

  const getFileExt = (name) => name?.split(".").pop()?.toUpperCase() || "FILE";
  const getFileColor = (name) => {
    const ext = name?.split(".").pop();
    if (ext === "html") return "#f97316";
    if (ext === "css") return "#3b82f6";
    if (ext === "js") return "#eab308";
    return "#8b5cf6";
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 120px)", gap: "16px" }}>

      {/* ── Header ── */}
      <div style={{
        background: "linear-gradient(135deg, rgba(0,240,255,0.06), rgba(99,102,241,0.06))",
        border: "1px solid rgba(0,240,255,0.15)",
        borderRadius: "12px", padding: "16px 20px",
        display: "flex", alignItems: "center", justifyContent: "space-between"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "40px", height: "40px", borderRadius: "10px",
            background: "linear-gradient(135deg, rgba(0,240,255,0.2), rgba(99,102,241,0.2))",
            border: "1px solid rgba(0,240,255,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <Cpu size={20} style={{ color: "var(--accent-cyan)" }} />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <h2 style={{ margin: 0, fontSize: "15px", fontWeight: "700", color: "var(--text-primary)", fontFamily: "var(--font-heading)" }}>
                Main Engineer AI
              </h2>
              <span style={{
                fontSize: "9px", fontWeight: "700", padding: "2px 7px", borderRadius: "20px",
                background: "rgba(16,185,129,0.15)", border: "1px solid var(--accent-green)", color: "var(--accent-green)",
                letterSpacing: "0.5px", textTransform: "uppercase"
              }}>ONLINE</span>
            </div>
            <p style={{ margin: 0, fontSize: "11px", color: "var(--text-secondary)", marginTop: "1px" }}>
              Agentic Coding Assistant · Sandbox Compiler · DeepMind Engine
            </p>
          </div>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          {[
            { label: "Gemini", color: "#4285f4" },
            { label: "Kimi", color: "#00f0ff" },
            { label: "GPT-4o", color: "#10b981" },
          ].map(m => (
            <span key={m.label} style={{
              fontSize: "9px", fontWeight: "600", padding: "3px 8px", borderRadius: "20px",
              background: `${m.color}18`, border: `1px solid ${m.color}40`, color: m.color,
              letterSpacing: "0.3px"
            }}>{m.label}</span>
          ))}
        </div>
      </div>

      {/* ── Main Grid ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1.9fr", gap: "16px", flex: 1, minHeight: 0 }}>

        {/* ── LEFT: Chat Panel ── */}
        <div style={{
          background: "var(--bg-card)", border: "1px solid var(--border-color)",
          borderRadius: "12px", display: "flex", flexDirection: "column", overflow: "hidden"
        }}>
          {/* Chat Header */}
          <div style={{
            padding: "10px 16px", borderBottom: "1px solid var(--border-color)",
            display: "flex", alignItems: "center", gap: "8px",
            background: "rgba(0,0,0,0.15)"
          }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981", boxShadow: "0 0 6px #10b981" }} />
            <span style={{ fontSize: "10px", fontWeight: "700", color: "var(--text-secondary)", letterSpacing: "1px", textTransform: "uppercase" }}>Chat Shell v2.0</span>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "14px" }}>
            {messages.map((msg, i) => {
              const isBot = msg.sender === "bot";
              return (
                <div key={i} style={{ display: "flex", gap: "8px", flexDirection: isBot ? "row" : "row-reverse", alignSelf: isBot ? "flex-start" : "flex-end", maxWidth: "92%" }}>
                  <div style={{
                    width: "26px", height: "26px", flexShrink: 0, borderRadius: "8px",
                    background: isBot ? "rgba(0,240,255,0.1)" : "rgba(99,102,241,0.1)",
                    border: `1px solid ${isBot ? "rgba(0,240,255,0.3)" : "rgba(99,102,241,0.3)"}`,
                    display: "flex", alignItems: "center", justifyContent: "center"
                  }}>
                    {isBot ? <Bot size={13} style={{ color: "var(--accent-cyan)" }} /> : <User size={13} style={{ color: "#818cf8" }} />}
                  </div>
                  <div>
                    <div style={{
                      background: isBot
                        ? "linear-gradient(135deg, rgba(0,240,255,0.04), rgba(0,0,0,0.2))"
                        : "linear-gradient(135deg, rgba(99,102,241,0.12), rgba(99,102,241,0.06))",
                      border: `1px solid ${isBot ? "rgba(0,240,255,0.12)" : "rgba(99,102,241,0.2)"}`,
                      borderRadius: isBot ? "4px 12px 12px 12px" : "12px 4px 12px 12px",
                      padding: "10px 13px", fontSize: "12.5px", lineHeight: "1.6",
                      color: msg.isError ? "var(--accent-red)" : "var(--text-primary)",
                      whiteSpace: "pre-wrap", fontFamily: "var(--font-sans)"
                    }}>
                      {msg.text}
                    </div>
                    <span style={{ fontSize: "9px", color: "var(--text-muted)", marginTop: "3px", display: "block", textAlign: isBot ? "left" : "right", fontFamily: "var(--font-mono)" }}>
                      {msg.time}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Typing indicator */}
            {isTyping && (
              <div style={{ display: "flex", gap: "8px", alignSelf: "flex-start" }}>
                <div style={{
                  width: "26px", height: "26px", borderRadius: "8px", flexShrink: 0,
                  background: "rgba(0,240,255,0.1)", border: "1px solid rgba(0,240,255,0.3)",
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                  <Bot size={13} style={{ color: "var(--accent-cyan)" }} />
                </div>
                <div style={{
                  background: "rgba(0,240,255,0.04)", border: "1px solid rgba(0,240,255,0.12)",
                  borderRadius: "4px 12px 12px 12px", padding: "12px 16px",
                  display: "flex", alignItems: "center", gap: "5px"
                }}>
                  {[0, 1, 2].map(j => (
                    <span key={j} style={{
                      width: "6px", height: "6px", borderRadius: "50%", background: "var(--accent-cyan)",
                      display: "inline-block",
                      animation: `pulse 1.2s ease-in-out ${j * 0.2}s infinite`
                    }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick prompts */}
          <div style={{ padding: "10px 12px", borderTop: "1px solid var(--border-color)", display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {QUICK_PROMPTS.map(p => (
              <button
                key={p.label}
                onClick={() => sendMessage(p.query)}
                style={{
                  fontSize: "10px", padding: "4px 9px", borderRadius: "20px",
                  background: "rgba(0,240,255,0.05)", border: "1px solid rgba(0,240,255,0.15)",
                  color: "var(--text-secondary)", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px",
                  transition: "all 0.2s"
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(0,240,255,0.1)"; e.currentTarget.style.color = "var(--accent-cyan)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(0,240,255,0.05)"; e.currentTarget.style.color = "var(--text-secondary)"; }}
              >
                <span>{p.icon}</span> {p.label}
              </button>
            ))}
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} style={{ padding: "12px", borderTop: "1px solid var(--border-color)", display: "flex", gap: "8px" }}>
            <input
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder="e.g. Build a landing page called home.html"
              style={{
                flex: 1, fontSize: "12px", padding: "9px 13px", borderRadius: "8px",
                background: "var(--bg-input)", border: "1px solid var(--border-color)",
                color: "var(--text-primary)", outline: "none",
                transition: "border-color 0.2s"
              }}
              onFocus={e => e.target.style.borderColor = "rgba(0,240,255,0.4)"}
              onBlur={e => e.target.style.borderColor = "var(--border-color)"}
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isTyping}
              style={{
                padding: "9px 14px", borderRadius: "8px", border: "none", cursor: "pointer",
                background: inputText.trim() && !isTyping
                  ? "linear-gradient(135deg, var(--accent-cyan), #0284c7)"
                  : "rgba(255,255,255,0.05)",
                color: inputText.trim() && !isTyping ? "#000" : "var(--text-muted)",
                display: "flex", alignItems: "center", gap: "5px",
                fontSize: "12px", fontWeight: "600", transition: "all 0.2s"
              }}
            >
              <Send size={13} /> Send
            </button>
          </form>
        </div>

        {/* ── RIGHT: Sandbox Inspector ── */}
        <div style={{
          background: "var(--bg-card)", border: "1px solid var(--border-color)",
          borderRadius: "12px", display: "flex", flexDirection: "column", overflow: "hidden"
        }}>
          {/* Sandbox Header */}
          <div style={{
            padding: "10px 16px", borderBottom: "1px solid var(--border-color)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            background: "rgba(0,0,0,0.15)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Code2 size={13} style={{ color: "var(--accent-cyan)" }} />
              <span style={{ fontSize: "10px", fontWeight: "700", color: "var(--text-secondary)", letterSpacing: "1px", textTransform: "uppercase" }}>
                Sandbox Staging · {stagedFiles.length} file{stagedFiles.length !== 1 ? "s" : ""}
              </span>
            </div>
            <button
              onClick={refreshSandbox}
              title="Refresh sandbox"
              style={{
                background: "transparent", border: "none", cursor: "pointer",
                color: "var(--text-muted)", padding: "3px", borderRadius: "4px",
                display: "flex", alignItems: "center"
              }}
            >
              <RefreshCw size={12} style={{ animation: isRefreshing ? "spin 0.6s linear infinite" : "none" }} />
            </button>
          </div>

          <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
            {/* File list sidebar */}
            <div style={{
              width: "160px", flexShrink: 0, borderRight: "1px solid var(--border-color)",
              overflowY: "auto", padding: "10px 8px", display: "flex", flexDirection: "column", gap: "4px"
            }}>
              <span style={{ fontSize: "9px", fontWeight: "700", color: "var(--text-muted)", letterSpacing: "1px", textTransform: "uppercase", padding: "0 4px", marginBottom: "4px" }}>
                Staged Files
              </span>

              {stagedFiles.length === 0 ? (
                <div style={{ textAlign: "center", marginTop: "30px", color: "var(--text-muted)" }}>
                  <FileCode size={24} style={{ opacity: 0.3, marginBottom: "6px" }} />
                  <p style={{ fontSize: "10px", margin: 0 }}>No files yet</p>
                  <p style={{ fontSize: "9px", margin: "4px 0 0", opacity: 0.6 }}>Ask to generate code</p>
                </div>
              ) : (
                stagedFiles.map(file => {
                  const isSelected = selectedFile?.name === file.name;
                  const color = getFileColor(file.name);
                  return (
                    <button
                      key={file.name}
                      onClick={() => setSelectedFile(file)}
                      style={{
                        display: "flex", alignItems: "center", gap: "8px",
                        padding: "7px 8px", borderRadius: "6px", border: "none", cursor: "pointer",
                        background: isSelected ? `${color}15` : "transparent",
                        outline: isSelected ? `1px solid ${color}35` : "none",
                        textAlign: "left", width: "100%", transition: "all 0.15s"
                      }}
                    >
                      <span style={{
                        fontSize: "7px", fontWeight: "800", padding: "2px 4px", borderRadius: "3px",
                        background: `${color}25`, color: color, letterSpacing: "0.3px", flexShrink: 0
                      }}>
                        {getFileExt(file.name)}
                      </span>
                      <span style={{
                        fontSize: "11px", color: isSelected ? color : "var(--text-secondary)",
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "var(--font-mono)"
                      }}>
                        {file.name}
                      </span>
                    </button>
                  );
                })
              )}
            </div>

            {/* Code preview */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, minHeight: 0 }}>
              {selectedFile ? (
                <>
                  {/* File action bar */}
                  <div style={{
                    padding: "8px 14px", borderBottom: "1px solid var(--border-color)",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    background: "rgba(0,0,0,0.1)", gap: "10px"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <ChevronRight size={11} style={{ color: "var(--text-muted)" }} />
                      <span style={{ fontSize: "11px", fontFamily: "var(--font-mono)", color: getFileColor(selectedFile.name), fontWeight: "600" }}>
                        {selectedFile.name}
                      </span>
                      <span style={{ fontSize: "9px", color: "var(--text-muted)" }}>
                        · {selectedFile.content?.length || 0} chars
                      </span>
                    </div>
                    <button
                      onClick={handleMerge}
                      style={{
                        padding: "5px 12px", borderRadius: "6px", border: "none", cursor: "pointer",
                        background: "linear-gradient(135deg, #10b981, #059669)",
                        color: "#fff", fontSize: "10px", fontWeight: "700",
                        display: "flex", alignItems: "center", gap: "5px",
                        letterSpacing: "0.3px", transition: "opacity 0.2s"
                      }}
                      onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
                      onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                    >
                      <Zap size={10} /> Deploy to Production
                    </button>
                  </div>

                  {/* Status messages */}
                  {mergeMessage && (
                    <div style={{
                      margin: "8px 12px", padding: "7px 12px", borderRadius: "6px",
                      background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.3)",
                      display: "flex", alignItems: "center", gap: "8px", fontSize: "11px", color: "var(--accent-green)"
                    }}>
                      <CheckCircle size={12} />
                      <span>{mergeMessage}</span>
                    </div>
                  )}
                  {mergeError && (
                    <div style={{
                      margin: "8px 12px", padding: "7px 12px", borderRadius: "6px",
                      background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)",
                      display: "flex", alignItems: "center", gap: "8px", fontSize: "11px", color: "var(--accent-red)"
                    }}>
                      <AlertCircle size={12} />
                      <span>{mergeError}</span>
                    </div>
                  )}

                  {/* Code content */}
                  <pre style={{
                    flex: 1, margin: "10px 12px 12px", padding: "14px",
                    background: "rgba(0,0,0,0.3)", borderRadius: "8px",
                    border: "1px solid var(--border-color)",
                    fontSize: "11px", lineHeight: "1.65", color: "var(--text-primary)",
                    fontFamily: "var(--font-mono)", overflowY: "auto",
                    whiteSpace: "pre-wrap", wordBreak: "break-all"
                  }}>
                    {selectedFile.content}
                  </pre>
                </>
              ) : (
                <div style={{
                  flex: 1, display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: "12px",
                  color: "var(--text-muted)"
                }}>
                  <div style={{
                    width: "56px", height: "56px", borderRadius: "14px",
                    background: "rgba(0,240,255,0.05)", border: "1px solid rgba(0,240,255,0.1)",
                    display: "flex", alignItems: "center", justifyContent: "center"
                  }}>
                    <FileCode size={26} style={{ opacity: 0.3 }} />
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <p style={{ fontSize: "13px", margin: "0 0 4px", fontWeight: "600", color: "var(--text-secondary)" }}>No file selected</p>
                    <p style={{ fontSize: "11px", margin: 0, opacity: 0.6 }}>Ask Main Engineer AI to generate code,<br />or select a staged file from the sidebar.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
