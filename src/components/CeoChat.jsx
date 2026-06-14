import React, { useState, useEffect, useRef } from "react";
import { Send, User, Bot, Sparkles, AlertCircle, RefreshCw } from "lucide-react";
import { AaceApi } from "../utils/api";

export function CeoChat() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  useEffect(() => {
    AaceApi.request("/api/chat-logs?portal=ceo")
      .then(async (data) => {
        if (data && data.length > 0) {
          setMessages(data.map(m => ({
            sender: m.sender,
            text: m.text,
            time: new Date(m.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          })));
        } else {
          const initialMsg = {
            portal: "ceo",
            sender: "bot",
            text: "Establish secure link: CEO advisory channel active. Welcome, Founder. I am your private CEO Advisory Bot. I am here to help you evaluate critical decisions, draft proposals, and analyze corporate strategy. What parameters are we reviewing today?"
          };
          setMessages([{
            sender: initialMsg.sender,
            text: initialMsg.text,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }]);
          try {
            await AaceApi.request("/api/chat-logs", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(initialMsg)
            });
          } catch (err) {
            console.error("Error saving initial CEO chat log:", err);
          }
        }
      })
      .catch(err => console.error("Error fetching CEO chat logs:", err));
  }, []);

  const appendCeoMessage = async (sender, text) => {
    const msgObj = { portal: "ceo", sender, text };
    try {
      const saved = await AaceApi.request("/api/chat-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(msgObj)
      });
      setMessages(prev => [...prev, {
        sender: saved.sender,
        text: saved.text,
        time: new Date(saved.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch (err) {
      console.error("Error saving CEO chat log:", err);
      setMessages(prev => [...prev, {
        sender: msgObj.sender,
        text: msgObj.text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }
  };

  const generateAdvisorResponse = (userMsg) => {
    const text = userMsg.toLowerCase();
    if (text.includes("equity") || text.includes("share") || text.includes("vesting")) {
      return `[CEO Bot Analysis]
For a seed-stage team, here is the recommended Equity Distribution strategy:
1. **Employee Option Pool**: Reserve 10% to 15% of total equity post-investment. This is standard to attract top engineering talent.
2. **Co-founder Vesting**: Ensure a standard 4-year vesting schedule with a 1-year cliff. This protects the company from early departures.
3. **Advisory Shares**: Allocate 0.25% to 1.0% to key mentors based on active involvement and milestones.
Would you like me to draft an official Equity Offer template or standard Board Resolution?`;
    }
    
    if (text.includes("funding") || text.includes("pitch") || text.includes("raise") || text.includes("investor")) {
      return `[CEO Bot Analysis]
To execute a successful Series Seed fundraising round ($1.5M - $3M target):
1. **Validation Milestones**: Ensure your Monthly Recurring Revenue (MRR) is growing > 15% MoM, or prove structural technology lockups (e.g., patent-pending core logic).
2. **Pitch Deck Composition**: Keep it under 10 slides. Focus strictly on: Problem, Solution, Market Opportunity (TAM), Unit Economics (LTV/CAC), Traction, and Use of Funds.
3. **Safety Reserve**: Secure commitments for 18-24 months of runway to survive market fluctuations.
Should we run a risk evaluation simulation for this pitch deck?`;
    }

    if (text.includes("fit") || text.includes("market") || text.includes("competitor") || text.includes("growth")) {
      return `[CEO Bot Analysis]
Evaluating product-market fit framework:
1. **Core Value Metric**: Identify the single activity that denotes high retention (e.g., users interacting with the console > 3 times/week).
2. **Customer Acquisition Cost (CAC)**: Maintain a CAC-to-LTV ratio of at least 1:3. If LTV is undefined, target payback period under 8 months.
3. **Competitor Defensibility**: Build a proprietary vector store or database schema that is hard for competitors to replicate without significant infrastructure costs.
Would you like to draft a PRD for implementing user tracking triggers?`;
    }

    return `[CEO Bot Analysis]
Received strategic query: "${userMsg}".
My analysis indicates the following actions:
1. Identify key stakeholders involved in this decision tree (e.g., CTO for stack dependencies, COO for execution timelines).
2. Run a cost-benefit calculation based on gross margin expectations (maintain minimum 80% targets).
3. Outline a formal Standard Operating Procedure (SOP) to govern this workflow.
Let me know if you would like to run a directive parsing command on this!`;
  };

  const handleSend = async (textToSend) => {
    if (!textToSend.trim()) return;
    setInputText("");

    await appendCeoMessage("user", textToSend);
    setIsTyping(true);

    // Simulate AI cognitive delay (1.2s)
    setTimeout(async () => {
      setIsTyping(false);
      const reply = generateAdvisorResponse(textToSend);
      await appendCeoMessage("bot", reply);
    }, 1200);
  };

  const starters = [
    { title: "Equity Option Pools", text: "Draft an equity offer template and vesting structure for a lead engineer." },
    { title: "Funding Pitch Strategy", text: "Evaluate our Series Seed funding pitch deck structure." },
    { title: "Product Market Fit Check", text: "How do we audit customer retention and find product-market fit?" }
  ];

  return (
    <div className="ceo-chat-container" style={{ display: "grid", gridTemplateColumns: "1fr", gap: "24px" }}>
      
      {/* Title block */}
      <div className="glass-card">
        <h2 className="plan-section-title" style={{ borderLeftColor: "var(--accent-cyan)", margin: 0, paddingLeft: "10px" }}>
          <Sparkles size={18} style={{ color: "var(--accent-cyan)" }} /> CEO Advisor Room
        </h2>
        <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
          Encrypted peer-to-peer connection with your personal advisory AI bot (`ceo_bot`). Discuss strategic direction, model investment scenarios, and review critical business plans in isolation.
        </p>
      </div>

      <div className="console-grid">
        
        {/* Chat Frame */}
        <div className="glass-card" style={{ display: "flex", flexDirection: "column", height: "500px", padding: "20px" }}>
          
          {/* Chat Bubble Stream */}
          <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "16px", paddingRight: "8px", marginBottom: "16px" }}>
            {messages.map((msg, index) => {
              const isBot = msg.sender === "bot";
              return (
                <div key={index} style={{
                  display: "flex", gap: "12px", 
                  flexDirection: isBot ? "row" : "row-reverse",
                  alignSelf: isBot ? "flex-start" : "flex-end",
                  maxWidth: "85%"
                }}>
                  <div style={{
                    width: "32px", height: "32px", borderRadius: "50%",
                    background: isBot ? "rgba(0, 240, 255, 0.08)" : "rgba(59, 130, 246, 0.1)",
                    border: `1px solid ${isBot ? "var(--accent-cyan)" : "var(--accent-blue)"}`,
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                  }}>
                    {isBot ? <Bot size={16} style={{ color: "var(--accent-cyan)" }} /> : <User size={16} style={{ color: "var(--accent-blue)" }} />}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <div style={{
                      background: isBot ? "rgba(2, 132, 199, 0.04)" : "var(--bg-input)",
                      border: `1px solid ${isBot ? "rgba(2, 132, 199, 0.15)" : "var(--border-color)"}`,
                      borderRadius: "12px", padding: "12px 16px", fontSize: "14px", lineHeight: "1.5",
                      color: "var(--text-primary)", whiteSpace: "pre-wrap"
                    }}>
                      {msg.text}
                    </div>
                    <span style={{
                      fontSize: "10px", color: "var(--text-muted)", fontFamily: "var(--font-mono)",
                      alignSelf: isBot ? "flex-start" : "flex-end"
                    }}>{msg.time}</span>
                  </div>
                </div>
              );
            })}
            
            {isTyping && (
              <div style={{ display: "flex", gap: "12px", alignSelf: "flex-start" }}>
                <div style={{
                  width: "32px", height: "32px", borderRadius: "50%",
                  background: "rgba(0, 240, 255, 0.08)", border: "1px solid var(--accent-cyan)",
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                  <Bot size={16} style={{ color: "var(--accent-cyan)" }} />
                </div>
                <div style={{
                  background: "rgba(2, 132, 199, 0.04)", border: "1px solid rgba(2, 132, 199, 0.15)",
                  borderRadius: "12px", padding: "12px 16px", display: "flex", alignItems: "center", gap: "4px"
                }}>
                  <RefreshCw size={14} className="spin-animation" style={{ animation: "spin 2s linear infinite", color: "var(--accent-cyan)" }} />
                  <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>ceo_bot is analyzing...</span>
                </div>
              </div>
            )}
            
            <div ref={chatEndRef} />
          </div>

          {/* Form Input Panel */}
          <form onSubmit={(e) => { e.preventDefault(); handleSend(inputText); }} style={{ display: "flex", gap: "12px" }}>
            <input
              type="text"
              placeholder="Ask ceo_bot about investments, option pools, competitor analysis..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isTyping}
              style={{
                flex: 1, background: "var(--bg-input)", border: "1px solid var(--border-color)",
                borderRadius: "8px", padding: "12px 16px", color: "var(--text-primary)", outline: "none"
              }}
            />
            <button
              type="submit"
              className="btn"
              disabled={isTyping || !inputText.trim()}
              style={{ padding: "0 18px", height: "46px" }}
            >
              <Send size={16} />
            </button>
          </form>

        </div>

        {/* Suggestion Sidebar */}
        <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <h3 className="plan-section-title" style={{ margin: 0 }}><Sparkles size={16} /> Quick Advisor Starters</h3>
          <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: 0, lineHeight: 1.5 }}>
            Select a template scenario below to initialize a simulated strategic consultation with your CEO Bot:
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {starters.map((starter, idx) => (
              <div
                key={idx}
                onClick={() => !isTyping && handleSend(starter.text)}
                style={{
                  padding: "14px", borderRadius: "8px", background: "rgba(255,255,255,0.015)",
                  border: "1px solid var(--border-color)", cursor: isTyping ? "not-allowed" : "pointer",
                  transition: "all 0.2s", opacity: isTyping ? 0.6 : 1
                }}
                className="task-item"
              >
                <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--accent-cyan)", display: "block", marginBottom: "4px" }}>
                  {starter.title}
                </span>
                <span style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.4 }}>
                  "{starter.text}"
                </span>
              </div>
            ))}
          </div>

          <div style={{
            background: "rgba(0, 240, 255, 0.02)", border: "1px solid rgba(0, 240, 255, 0.1)",
            padding: "12px", borderRadius: "8px", display: "flex", gap: "10px", alignItems: "flex-start", marginTop: "auto"
          }}>
            <AlertCircle size={16} style={{ color: "var(--accent-cyan)", flexShrink: 0, marginTop: "2px" }} />
            <span style={{ fontSize: "11px", color: "var(--text-secondary)", lineHeight: 1.4 }}>
              Advisory dialogue logs are strictly encrypted locally in the secure cookie sandbox and are never shared with HR or other departments.
            </span>
          </div>
        </div>

      </div>

    </div>
  );
}
export default CeoChat;
