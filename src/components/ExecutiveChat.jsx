import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, Send, Hash, Search, RefreshCw, Bot, Cpu } from "lucide-react";
import { AaceApi } from "../utils/api";

export function ExecutiveChat() {
  const [channels] = useState(["#general", "#engineering", "#product", "#operations"]);
  const [activeChannel, setActiveChannel] = useState("#general");
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const messageEndRef = useRef(null);

  // Load active projects
  useEffect(() => {
    fetchProjects();
  }, []);

  // Fetch messages when channel or project selection changes
  useEffect(() => {
    if (selectedProjectId) {
      fetchMessages();
    } else {
      setMessages([]);
    }
  }, [activeChannel, selectedProjectId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchProjects = async () => {
    try {
      const data = await AaceApi.request("/api/projects");
      setProjects(data || []);
      if (data && data.length > 0) {
        setSelectedProjectId(data[0]._id);
      }
    } catch (err) {
      console.error("Failed to load projects for chat:", err);
    }
  };

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const data = await AaceApi.request(`/api/messages?projectId=${selectedProjectId}&channel=${encodeURIComponent(activeChannel)}`);
      setMessages(data || []);
    } catch (err) {
      console.error("Failed to load messages:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedProjectId || sending) return;
    setSending(true);

    const activeUser = JSON.parse(localStorage.getItem("aace_user_info") || '{"name":"Founder (Human)","role":"CEO & Founder"}');

    try {
      const saved = await AaceApi.request("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: selectedProjectId,
          sender: activeUser.name || "CEO (Human)",
          text: inputText.trim(),
          channel: activeChannel
        })
      });

      if (saved) {
        setMessages(prev => [...prev, saved]);
        setInputText("");
      }
    } catch (err) {
      console.error("Failed to post message:", err);
    } finally {
      setSending(false);
    }
  };

  // Filter messages based on search query
  const filteredMessages = messages.filter(msg => {
    const query = searchQuery.toLowerCase();
    return msg.text.toLowerCase().includes(query) || msg.sender.toLowerCase().includes(query);
  });

  return (
    <div className="console-grid" style={{ gridTemplateColumns: "250px 1fr", gap: "20px", height: "calc(100vh - 200px)", minHeight: "500px" }}>
      
      {/* Sidebar Channel List & Project Selector */}
      <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "16px" }}>
        
        {/* Project Selector */}
        <div>
          <label style={{ fontSize: "10px", color: "var(--text-secondary)", fontFamily: "var(--font-mono)", fontWeight: "bold" }}>TARGET OBJECTIVE</label>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            style={{
              padding: "8px",
              background: "rgba(0,0,0,0.5)",
              border: "1px solid var(--border-color)",
              borderRadius: "6px",
              color: "white",
              width: "100%",
              marginTop: "4px",
              fontSize: "12px",
              outline: "none"
            }}
          >
            {projects.map(p => (
              <option key={p._id} value={p._id}>{p.name}</option>
            ))}
            {projects.length === 0 && (
              <option value="">-- No projects active --</option>
            )}
          </select>
        </div>

        {/* Channels */}
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: "10px", color: "var(--text-secondary)", fontFamily: "var(--font-mono)", fontWeight: "bold", display: "block", marginBottom: "8px" }}>CHANNELS</label>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {channels.map(chan => (
              <button
                key={chan}
                onClick={() => setActiveChannel(chan)}
                className={`nav-item ${activeChannel === chan ? "active" : ""}`}
                style={{
                  width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: "8px", 
                  padding: "8px 12px", borderRadius: "6px", border: "none", cursor: "pointer",
                  background: activeChannel === chan ? "rgba(0, 240, 255, 0.08)" : "transparent",
                  color: activeChannel === chan ? "white" : "var(--text-secondary)"
                }}
              >
                <Hash size={14} style={{ color: activeChannel === chan ? "var(--accent-cyan)" : "var(--text-muted)" }} />
                <span style={{ fontSize: "13px" }}>{chan.replace("#", "")}</span>
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Message Area */}
      <div className="glass-card" style={{ display: "flex", flexDirection: "column", height: "100%", padding: 0, overflow: "hidden" }}>
        
        {/* Chat header with Search */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-color)", background: "rgba(0,0,0,0.2)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Hash size={16} style={{ color: "var(--accent-cyan)" }} />
            <h3 style={{ margin: 0, fontSize: "15px", fontWeight: "bold" }}>{activeChannel.replace("#", "")} channel</h3>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ position: "relative" }}>
              <input
                type="text"
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  padding: "6px 12px 6px 30px", background: "rgba(0,0,0,0.3)", border: "1px solid var(--border-color)",
                  borderRadius: "20px", color: "white", fontSize: "12px", outline: "none", width: "180px"
                }}
              />
              <Search size={12} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            </div>

            <button onClick={fetchMessages} className="btn-icon" style={{ padding: "6px", borderRadius: "50%" }}>
              <RefreshCw size={14} className={loading ? "spin" : ""} />
            </button>
          </div>
        </div>

        {/* Message history */}
        <div style={{ flex: 1, padding: "20px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "16px" }}>
          {filteredMessages.length === 0 ? (
            <div style={{ margin: "auto", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
              {searchQuery ? "No messages matching search query found." : "No channel logs in this channel yet."}
            </div>
          ) : (
            filteredMessages.map(msg => {
              const isAi = msg.sender.includes("Bot") || msg.sender.includes("Office") || msg.sender.includes("Operations");
              return (
                <div key={msg._id} style={{ display: "flex", gap: "12px", maxWidth: "80%", alignSelf: "flex-start" }}>
                  <div style={{
                    width: "36px", height: "36px", borderRadius: "50%",
                    background: isAi ? "rgba(0, 240, 255, 0.1)" : "rgba(167, 139, 250, 0.1)",
                    border: `1px solid ${isAi ? "rgba(0, 240, 255, 0.2)" : "rgba(167, 139, 250, 0.2)"}`,
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                  }}>
                    {isAi ? <Bot size={16} style={{ color: "var(--accent-cyan)" }} /> : <Cpu size={16} style={{ color: "#a78bfa" }} />}
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                      <span style={{ fontSize: "12px", fontWeight: "bold", color: "white" }}>{msg.sender}</span>
                      <span style={{ fontSize: "9px", color: "var(--text-muted)" }}>{new Date(msg.createdAt).toLocaleTimeString()}</span>
                    </div>
                    <div className="glass-card" style={{
                      padding: "10px 14px", marginTop: "4px", fontSize: "13px", lineHeight: 1.4,
                      background: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(255,255,255,0.05)",
                      borderRadius: "0 12px 12px 12px", color: "var(--text-primary)"
                    }}>
                      {msg.text}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messageEndRef} />
        </div>

        {/* Input bar */}
        <form onSubmit={handleSendMessage} style={{ display: "flex", gap: "10px", padding: "16px 20px", borderTop: "1px solid var(--border-color)", background: "rgba(0,0,0,0.2)" }}>
          <input
            type="text"
            placeholder={selectedProjectId ? `Post to ${activeChannel}...` : "Select a target objective first"}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={!selectedProjectId || sending}
            style={{
              flex: 1, padding: "10px 16px", background: "rgba(0,0,0,0.3)", border: "1px solid var(--border-color)",
              borderRadius: "6px", color: "white", fontSize: "13px", outline: "none"
            }}
          />
          <button
            type="submit"
            disabled={!selectedProjectId || !inputText.trim() || sending}
            className="btn"
            style={{ background: "linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))", padding: "10px 16px" }}
          >
            {sending ? <RefreshCw size={14} className="spin" /> : <Send size={14} />}
          </button>
        </form>

      </div>

    </div>
  );
}

export default ExecutiveChat;
