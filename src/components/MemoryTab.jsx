import React, { useState } from "react";
import { Brain, Search, Plus, Trash2, Database, AlertCircle } from "lucide-react";

export function MemoryTab({ memories, onAddMemory, onDeleteMemory }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [newMemory, setNewMemory] = useState("");

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newMemory.trim()) return;
    onAddMemory(newMemory.trim());
    setNewMemory("");
  };

  const filteredMemories = memories.filter(m => 
    m.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="memory-tab-container" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      
      {/* Vault Header and Stats */}
      <div className="glass-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h2 className="plan-section-title" style={{ borderLeftColor: "var(--accent-green)", margin: 0, paddingLeft: "10px" }}>
              <Brain size={18} style={{ color: "var(--accent-green)" }} /> Memory Vault Ledger
            </h2>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
              AACE's persistent business context storage. Memories represent constraints, preferences, stack parameters, and historical decisions injected into all directives.
            </p>
          </div>
          <div style={{ background: "rgba(16, 185, 129, 0.08)", border: "1px solid rgba(16, 185, 129, 0.3)", padding: "10px 16px", borderRadius: "8px", textAlign: "right" }}>
            <span style={{ fontSize: "11px", color: "var(--text-secondary)", fontFamily: "var(--font-mono)", display: "block" }}>TOTAL RECORDS</span>
            <span style={{ fontSize: "20px", fontWeight: "bold", color: "var(--accent-green)", fontFamily: "var(--font-mono)" }}>{memories.length}</span>
          </div>
        </div>
      </div>

      {/* Control Actions Form & Search */}
      <div className="glass-card" style={{ padding: "20px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          
          {/* Add Form */}
          <form onSubmit={handleAdd} style={{ display: "flex", gap: "12px", width: "100%", alignItems: "center", flexWrap: "wrap" }}>
            <div className="input-group" style={{ flex: 1, minWidth: "250px" }}>
              <input
                type="text"
                placeholder="Commit new parameter to memory (e.g. 'Engineering uses Azure Devops' or 'CFO limit is $15k')..."
                value={newMemory}
                onChange={(e) => setNewMemory(e.target.value)}
                style={{ width: "100%", boxSizing: "border-box" }}
              />
            </div>
            <button type="submit" disabled={!newMemory.trim()} className="btn" style={{ background: "linear-gradient(135deg, var(--accent-green), #059669)", height: "42px", padding: "0 20px" }}>
              <Plus size={16} /> Add Parameter
            </button>
          </form>

          {/* Search bar */}
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <div className="search-box">
              <Search size={16} style={{ color: "var(--text-secondary)" }} />
              <input
                type="text"
                placeholder="Search ledger..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

        </div>
      </div>

      {/* Grid of memory list */}
      <div className="memory-ledger">
        {filteredMemories.length === 0 ? (
          <div className="glass-card" style={{ gridColumn: "span 2", textAlign: "center", padding: "40px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
            <Database size={32} style={{ color: "var(--text-muted)" }} />
            <span style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
              {searchQuery ? "No matching records found in ledger." : "Ledger is empty. Add a parameter above to build context."}
            </span>
          </div>
        ) : (
          filteredMemories.map((mem, index) => (
            <div key={index} className="memory-node-card">
              <div className="memory-node-body">
                <Database size={16} className="memory-node-icon" />
                <span className="memory-node-text">{mem}</span>
              </div>
              <div className="memory-node-actions">
                <button
                  onClick={() => onDeleteMemory(mem)}
                  className="btn-icon-danger"
                  title="Delete memory parameter"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Warning Box */}
      <div className="glass-card" style={{ background: "rgba(245, 158, 11, 0.02)", borderColor: "rgba(245, 158, 11, 0.15)", display: "flex", gap: "14px", alignItems: "flex-start" }}>
        <AlertCircle size={18} style={{ color: "var(--accent-yellow)", flexShrink: 0, marginTop: "2px" }} />
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.5, margin: 0 }}>
          <strong style={{ color: "var(--text-primary)" }}>Ledger Safety Note:</strong> Altering memory updates modifies the system prompt injection payload. Adding incorrect constraints will bias AACE output decisions. Deleting records is irreversible.
        </p>
      </div>

    </div>
  );
}
export default MemoryTab;
