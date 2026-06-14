import React, { useEffect, useRef } from "react";

export function Terminal({ logs }) {
  const terminalEndRef = useRef(null);

  useEffect(() => {
    // Auto scroll to bottom of terminal when logs are added
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  // Parse engine name from line to assign css class for coloring
  const getLogClass = (line) => {
    if (line.startsWith("[orchestrator]")) return "terminal-line orchestrator";
    if (line.startsWith("[app_builder]")) return "terminal-line app_builder";
    if (line.startsWith("[business]")) return "terminal-line business";
    if (line.startsWith("[operations]")) return "terminal-line operations";
    if (line.startsWith("[document]")) return "terminal-line document";
    if (line.startsWith("[memory]")) return "terminal-line memory";
    if (line.startsWith("[learning]")) return "terminal-line learning";
    return "terminal-line system";
  };

  return (
    <div className="terminal-window">
      <div className="terminal-header">
        <div className="terminal-dots">
          <span className="terminal-dot red"></span>
          <span className="terminal-dot yellow"></span>
          <span className="terminal-dot green"></span>
        </div>
        <div className="terminal-title">AACE_SHELL // internal_engine_logs</div>
      </div>
      <div className="terminal-body">
        {logs.length === 0 ? (
          <div className="terminal-line system">AACE terminal online. Awaiting directive...</div>
        ) : (
          logs.map((log, index) => (
            <div key={index} className={getLogClass(log)}>
              {log}
            </div>
          ))
        )}
        <div ref={terminalEndRef} />
      </div>
    </div>
  );
}
export default Terminal;
