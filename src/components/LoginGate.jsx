import React, { useState, useEffect } from "react";
import { Lock, Key, Cpu, ShieldCheck, UserCheck, Shield, User, ArrowRight, X, Users } from "lucide-react";
import { AaceApi } from "../utils/api";

export function WireframeCube({ style, theme = "dark" }) {
  return (
    <div className="cube-wrapper" style={style}>
      <div className="cube">
        <div className={`cube-face front ${theme === "lime" ? "lime-theme" : "dark-theme"}`}></div>
        <div className={`cube-face back ${theme === "lime" ? "lime-theme" : "dark-theme"}`}></div>
        <div className={`cube-face right ${theme === "lime" ? "lime-theme" : "dark-theme"}`}></div>
        <div className={`cube-face left ${theme === "lime" ? "lime-theme" : "dark-theme"}`}></div>
        <div className={`cube-face top ${theme === "lime" ? "lime-theme" : "dark-theme"}`}></div>
        <div className={`cube-face bottom ${theme === "lime" ? "lime-theme" : "dark-theme"}`}></div>
      </div>
    </div>
  );
}

export function TiltCard({ children, style, className }) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: x * 15, y: -y * 15 });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
  };

  return (
    <div
      className={className}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        ...style,
        transform: `perspective(1000px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg) ${isHovered ? "translateY(-5px) translateZ(20px)" : "translateZ(0px)"}`,
        transition: isHovered ? "transform 0.05s ease-out" : "transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)",
        transformStyle: "preserve-3d",
        position: "relative",
      }}
    >
      <div style={{ transform: isHovered ? "translateZ(25px)" : "translateZ(0px)", transition: "transform 0.3s ease", width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        {children}
      </div>
    </div>
  );
}

export function LoginGate({ onLogin }) {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [profileType, setProfileType] = useState("ceo"); // ceo | employee
  const [employeeName, setEmployeeName] = useState("");
  const [passcode, setPasscode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState("");
  const [activeArticle, setActiveArticle] = useState(null);

  const [scrolled, setScrolled] = useState(false);
  const [scrollPercent, setScrollPercent] = useState(0);
  const [time, setTime] = useState(0);

  useEffect(() => {
    let animFrameId;
    const update = () => {
      setTime(prev => prev + 0.025);
      animFrameId = requestAnimationFrame(update);
    };
    animFrameId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animFrameId);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0;
      setScrollPercent(pct);
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // IntersectionObserver for scroll-reveal animations (making text/headlines slowly arrive)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
          }
        });
      },
      {
        threshold: 0.05,
        rootMargin: "0px 0px -50px 0px"
      }
    );

    const elements = document.querySelectorAll(".scroll-reveal");
    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, [activeArticle]);

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setError("");

    if (profileType === "employee" && !employeeName.trim()) {
      setError("Corporate Employee ID required.");
      return;
    }

    if (!passcode) {
      setError("Passcode required.");
      return;
    }

    setIsVerifying(true);

    try {
      const data = await AaceApi.request("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: employeeName,
          passcode: passcode,
          profileType: profileType
        })
      });
      setIsVerifying(false);

      if (data.success) {
        // Map the employee's role/department to the frontend userRole
        const roleDept = data.user.dept.toLowerCase();
        const roleTitle = data.user.role.toLowerCase();
        
        let targetRole = "employee";
        if (roleTitle.includes("ceo")) {
          targetRole = "ceo";
        } else if (roleDept.includes("hr")) {
          targetRole = "hr";
        } else if (
          roleDept.includes("engineering") || 
          roleDept.includes("tech") || 
          roleDept.includes("developer") ||
          roleTitle.includes("cto") || 
          roleTitle.includes("dev") || 
          roleTitle.includes("engineer") || 
          roleTitle.includes("programmer") || 
          roleTitle.includes("coder") ||
          roleTitle.includes("architect")
        ) {
          targetRole = "cto";
        } else if (roleDept.includes("operations") || roleTitle.includes("coo") || roleTitle.includes("ops")) {
          targetRole = "coo";
        } else if (roleDept.includes("product") || roleTitle.includes("pm") || roleTitle.includes("product")) {
          targetRole = "product";
        } else if (roleDept.includes("design") || roleDept.includes("uiux") || roleTitle.includes("designer") || roleTitle.includes("ui") || roleTitle.includes("ux")) {
          targetRole = "uiux";
        } else if (roleDept.includes("qa") || roleDept.includes("testing") || roleTitle.includes("tester") || roleTitle.includes("qa")) {
          targetRole = "qa";
        } else if (roleDept.includes("marketing") || roleTitle.includes("marketing") || roleTitle.includes("growth")) {
          targetRole = "marketing";
        } else if (roleDept.includes("legal") || roleTitle.includes("legal") || roleTitle.includes("counsel") || roleTitle.includes("law")) {
          targetRole = "legal";
        }

        // Save userInfo to local storage
        localStorage.setItem("aace_user_info", JSON.stringify(data.user));
        onLogin(targetRole, data.user);
      } else {
        setError(data.error || "Access Denied. Check credentials.");
      }
    } catch (err) {
      setIsVerifying(false);
      setError(err.message || "Network error connecting to auth server.");
      console.error("Login fetch error:", err);
    }
  };

  const handleQuickFill = (name) => {
    const idMap = {
      clara: "EMP-2026-0002",
      john: "EMP-2026-0003",
      bill: "EMP-2026-0004",
      sarah: "EMP-2026-0005",
      alex: "EMP-2026-0006",
      lisa: "EMP-2026-0007",
      kevin: "EMP-2026-0008",
      rachel: "EMP-2026-0009",
      harvey: "EMP-2026-0010"
    };
    const id = idMap[name.toLowerCase()] || "EMP-2026-0002";
    setEmployeeName(id);
    setPasscode(name.toLowerCase());
  };

  if (activeArticle) {
    return (
      <div className="article-reader-view" style={{ minHeight: "100vh", background: "#f5f2eb", padding: "0px 0px 120px 0px", fontFamily: "var(--font-sans)", color: "#111827", display: "flex", flexDirection: "column", alignItems: "center" }}>
        
        {/* Header */}
        <header className="landing-header" style={{ maxWidth: "1250px", margin: "0 auto", width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "24px 40px" }}>
          <div className="landing-logo" onClick={() => { setActiveArticle(null); window.scrollTo({ top: 0 }); }} style={{ fontFamily: "var(--font-serif)", fontSize: "24px", fontWeight: "900", color: "#111827", letterSpacing: "-0.5px", cursor: "pointer" }}>
            AACE.
          </div>
          <nav className="landing-nav" style={{ display: "flex", gap: "24px", alignItems: "center" }}>
            <a href="#" className="landing-nav-link active" onClick={(e) => { e.preventDefault(); }}>Article</a>
            <a href="#" className="landing-nav-link" onClick={(e) => { e.preventDefault(); setActiveArticle(null); setTimeout(() => document.getElementById("platform")?.scrollIntoView({ behavior: "smooth" }), 100); }}>Platform</a>
            <a href="#" className="landing-nav-link" onClick={(e) => { e.preventDefault(); setActiveArticle(null); setTimeout(() => document.getElementById("manifesto")?.scrollIntoView({ behavior: "smooth" }), 100); }}>Manifesto</a>
            <a href="#" className="landing-nav-link" onClick={(e) => { e.preventDefault(); setActiveArticle(null); setTimeout(() => document.getElementById("perks")?.scrollIntoView({ behavior: "smooth" }), 100); }}>Perks</a>
          </nav>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <span style={{ fontSize: "11px", color: "#8c8c8c", fontFamily: "var(--font-mono)", fontWeight: "600" }}>V1.0 &mdash; BETA</span>
            <button 
              onClick={() => window.open("https://tamaldey21.netlify.app", "_blank")} 
              className="btn-signin"
              style={{ background: "#111827", color: "#ffffff", border: "1.5px solid #111827", padding: "8px 20px", fontWeight: "bold", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}
            >
              Get Access
            </button>
          </div>
        </header>

        {/* Content Body Grid */}
        <div style={{ maxWidth: "1250px", width: "100%", padding: "60px 40px 0 40px", textAlign: "left" }}>
          
          <button 
            onClick={() => { setActiveArticle(null); window.scrollTo({ top: 0 }); }} 
            style={{ background: "transparent", border: "1.5px solid #111827", padding: "8px 16px", borderRadius: "30px", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "8px", fontWeight: "600", fontSize: "12px", marginBottom: "50px", fontFamily: "var(--font-heading)" }}
          >
            <span>← Back to landing page</span>
          </button>

          {/* Two-Column split screen grid */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "60px" }}>
            
            {/* Left Column (Sidebar contents) */}
            <div style={{ flex: "1 1 280px", maxWidth: "320px", display: "flex", flexDirection: "column", gap: "32px" }}>
              <div>
                <span style={{ fontSize: "11px", fontFamily: "var(--font-mono)", color: "#8c8c8c", fontWeight: "bold", letterSpacing: "1px", display: "block", marginBottom: "12px" }}>
                  ISSUE 081 / 2026
                </span>
                <h2 style={{ fontSize: "28px", fontWeight: "900", fontFamily: "var(--font-serif)", lineHeight: "1.15", color: "#111827", margin: 0 }}>
                  Why we built a company that builds companies.
                </h2>
              </div>

              {/* Navigation Checklist Links */}
              <div style={{ display: "flex", flexDirection: "column", gap: "14px", borderLeft: "1.5px solid rgba(0,0,0,0.06)", paddingLeft: "16px" }}>
                <span 
                  onClick={() => document.getElementById("article-problem")?.scrollIntoView({ behavior: "smooth" })}
                  style={{ fontSize: "13px", fontWeight: "500", color: "#4b5563", cursor: "pointer", transition: "color 0.2s" }}
                  onMouseEnter={(e) => e.currentTarget.style.color = "#111827"}
                  onMouseLeave={(e) => e.currentTarget.style.color = "#4b5563"}
                >
                  The problem we saw
                </span>
                <span 
                  onClick={() => document.getElementById("article-what")?.scrollIntoView({ behavior: "smooth" })}
                  style={{ fontSize: "13px", fontWeight: "500", color: "#4b5563", cursor: "pointer", transition: "color 0.2s" }}
                  onMouseEnter={(e) => e.currentTarget.style.color = "#111827"}
                  onMouseLeave={(e) => e.currentTarget.style.color = "#4b5563"}
                >
                  What AACE actually is
                </span>
                <span 
                  onClick={() => document.getElementById("article-how")?.scrollIntoView({ behavior: "smooth" })}
                  style={{ fontSize: "13px", fontWeight: "500", color: "#4b5563", cursor: "pointer", transition: "color 0.2s" }}
                  onMouseEnter={(e) => e.currentTarget.style.color = "#111827"}
                  onMouseLeave={(e) => e.currentTarget.style.color = "#4b5563"}
                >
                  How it works internally
                </span>
                <span 
                  onClick={() => document.getElementById("article-next")?.scrollIntoView({ behavior: "smooth" })}
                  style={{ fontSize: "13px", fontWeight: "500", color: "#4b5563", cursor: "pointer", transition: "color 0.2s" }}
                  onMouseEnter={(e) => e.currentTarget.style.color = "#111827"}
                  onMouseLeave={(e) => e.currentTarget.style.color = "#4b5563"}
                >
                  The road ahead
                </span>
              </div>

              {/* Tag Pills */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "12px" }}>
                <span style={{ fontSize: "11px", fontWeight: "500", color: "#4b5563", border: "1px solid rgba(0,0,0,0.15)", padding: "4px 10px", borderRadius: "4px", background: "rgba(0,0,0,0.02)" }}>Strategy</span>
                <span style={{ fontSize: "11px", fontWeight: "500", color: "#4b5563", border: "1px solid rgba(0,0,0,0.15)", padding: "4px 10px", borderRadius: "4px", background: "rgba(0,0,0,0.02)" }}>AI</span>
                <span style={{ fontSize: "11px", fontWeight: "500", color: "#4b5563", border: "1px solid rgba(0,0,0,0.15)", padding: "4px 10px", borderRadius: "4px", background: "rgba(0,0,0,0.02)" }}>Product</span>
                <span style={{ fontSize: "11px", fontWeight: "500", color: "#4b5563", border: "1px solid rgba(0,0,0,0.15)", padding: "4px 10px", borderRadius: "4px", background: "rgba(0,0,0,0.02)" }}>Operations</span>
              </div>
            </div>

            {/* Right Column (Main content block) */}
            <div style={{ flex: "2 2 600px", minWidth: "300px" }}>
              <h1 style={{ fontSize: "clamp(32px, 5vw, 48px)", fontWeight: "900", fontFamily: "var(--font-serif)", lineHeight: "1.1", color: "#111827", margin: "0 0 24px 0", letterSpacing: "-1.5px" }}>
                We built an AI that doesn't just answer — it executes.
              </h1>
              <p style={{ fontSize: "17px", color: "#4b5563", lineHeight: 1.6, fontWeight: "500", marginBottom: "40px" }}>
                Every founder has the same frustration: AI tools are remarkable at generating content and useless at running a company. AACE was built to close that gap — permanently.
              </p>
              
              <hr style={{ border: "none", borderTop: "1px solid rgba(0,0,0,0.08)", margin: "40px 0" }} />

              {/* Section 1 */}
              <h3 id="article-problem" style={{ fontSize: "22px", fontWeight: "700", color: "#111827", fontFamily: "var(--font-serif)", margin: "0 0 16px 0" }}>
                The problem we saw
              </h3>
              <p style={{ fontSize: "15px", color: "#4b5563", lineHeight: 1.7, marginBottom: "32px" }}>
                AI has become extraordinary at producing outputs — emails, code snippets, strategy memos, product specs. But outputs without execution are expensive drafts. A company isn't a collection of documents. It's a living system of decisions, workflows, infrastructure, and people pulling in one direction.
              </p>
              <p style={{ fontSize: "15px", color: "#4b5563", lineHeight: 1.7, marginBottom: "32px" }}>
                The tools available to founders today either help them <strong style={{ color: "#111827" }}>think</strong> or help them <strong style={{ color: "#111827" }}>build</strong>. None of them help them <strong style={{ color: "#111827" }}>run the whole company</strong>. AACE was built to do exactly that.
              </p>

              {/* Custom Quote Block */}
              <div style={{ background: "#f0efe9", borderLeft: "4px solid #111827", padding: "24px", margin: "40px 0" }}>
                <p style={{ fontSize: "16px", fontWeight: "600", fontStyle: "italic", margin: 0, color: "#111827", lineHeight: 1.5, fontFamily: "var(--font-serif)" }}>
                  "The question was never whether AI could generate a business plan. It was whether AI could execute one."
                </p>
              </div>

              {/* Section 2 */}
              <h3 id="article-what" style={{ fontSize: "22px", fontWeight: "700", color: "#111827", fontFamily: "var(--font-serif)", margin: "40px 0 16px 0" }}>
                What AACE actually is
              </h3>
              <p style={{ fontSize: "15px", color: "#4b5563", lineHeight: 1.7, marginBottom: "32px" }}>
                AACE is an autonomous business operating system. It's not a chatbot you interrogate for answers. It's an engine you direct — and it handles the rest. You say "launch an AI CRM" and AACE produces the market research, the architecture, the PRD, the database schema, the frontend and backend plans, the deployment strategy, and the go-to-market playbook — not as a single document, but as a sequenced execution plan with owners, dependencies, and success metrics.
              </p>
              <p style={{ fontSize: "15px", color: "#4b5563", lineHeight: 1.7, marginBottom: "32px" }}>
                Internally, AACE runs seven specialised engines: Orchestrator, App Builder, Business Mind, Document Engine, Operations, Memory, and Learning. Each has a defined scope and quality standard. The Orchestrator coordinates them all.
              </p>

              {/* Section 3 */}
              <h3 id="article-how" style={{ fontSize: "22px", fontWeight: "700", color: "#111827", fontFamily: "var(--font-serif)", margin: "40px 0 16px 0" }}>
                How it works internally
              </h3>
              <p style={{ fontSize: "15px", color: "#4b5563", lineHeight: 1.7, marginBottom: "32px" }}>
                Every founder input passes through an 11-stage execution pipeline: from intent analysis through to outcome monitoring. The system makes reasonable assumptions, flags risks, and only halts when a legal, compliance, or irreversible action is detected. For everything else — it executes.
              </p>
              <p style={{ fontSize: "15px", color: "#4b5563", lineHeight: 1.7, marginBottom: "32px" }}>
                The Memory Engine ensures context is never lost. The Learning Engine measures every outcome and improves future recommendations. Over time, AACE becomes a more accurate reflection of your company's preferences, constraints, and goals.
              </p>

              {/* Section 4 */}
              <h3 id="article-next" style={{ fontSize: "22px", fontWeight: "700", color: "#111827", fontFamily: "var(--font-serif)", margin: "40px 0 16px 0" }}>
                The road ahead
              </h3>
              <p style={{ fontSize: "15px", color: "#4b5563", lineHeight: 1.7, marginBottom: "32px" }}>
                We're building AACE as a React + Node.js internal business tool with deep integration into the Google Antigravity SDK. Multi-agent coordination, real MCP server connectivity to CRMs and project trackers, and live deployment pipelines are all on the roadmap. The goal is simple: a founder should be able to run a company from a single text input.
              </p>
              <p style={{ fontSize: "15px", color: "#4b5563", lineHeight: 1.7, marginBottom: "50px" }}>
                We believe the next generation of companies won't be defined by headcount. They'll be defined by execution velocity. AACE is how you get there.
              </p>

              <div style={{ display: "flex", gap: "12px", borderTop: "1px solid rgba(0,0,0,0.08)", paddingTop: "40px" }}>
                <button 
                  onClick={() => { setActiveArticle(null); window.scrollTo({ top: 0 }); }} 
                  style={{ background: "#111827", border: "none", color: "#ffffff", padding: "12px 28px", borderRadius: "30px", cursor: "pointer", fontWeight: "600", fontSize: "13px", fontFamily: "var(--font-heading)", transition: "opacity 0.2s ease" }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = 0.9}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = 1}
                >
                  Return to Console
                </button>
                <button 
                  onClick={() => { setActiveArticle(null); window.scrollTo({ top: 0 }); }} 
                  style={{ background: "transparent", border: "1.5px solid #111827", color: "#111827", padding: "12px 28px", borderRadius: "30px", cursor: "pointer", fontWeight: "600", fontSize: "13px", fontFamily: "var(--font-heading)", transition: "background 0.2s ease" }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "rgba(0,0,0,0.02)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                >
                  Back to Landing Page
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="landing-wrapper">
      
      {/* Scroll Progress Bar */}
      <div className="scroll-progress-bar" style={{ width: `${scrollPercent}%` }} />

      <header className={`landing-header ${scrolled ? "scrolled" : ""}`} style={{ maxWidth: "1200px", margin: "0 auto", width: "100%" }}>
        <div className="landing-logo" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} style={{ fontFamily: "var(--font-serif)", fontSize: "24px", fontWeight: "900", color: "#111827", letterSpacing: "-0.5px" }}>
          AACE.
        </div>
        <nav className="landing-nav">
          <a href="#" className="landing-nav-link" onClick={(e) => { e.preventDefault(); document.getElementById("articles")?.scrollIntoView({ behavior: "smooth" }); }}>Article</a>
          <a href="#" className="landing-nav-link" onClick={(e) => { e.preventDefault(); document.getElementById("platform")?.scrollIntoView({ behavior: "smooth" }); }}>Platform</a>
          <a href="#" className="landing-nav-link" onClick={(e) => { e.preventDefault(); document.getElementById("manifesto")?.scrollIntoView({ behavior: "smooth" }); }}>Manifesto</a>
          <a href="#" className="landing-nav-link" onClick={(e) => { e.preventDefault(); document.getElementById("perks")?.scrollIntoView({ behavior: "smooth" }); }}>Perks</a>
          <a href="#" className="landing-nav-link" onClick={(e) => { e.preventDefault(); setShowLoginModal(true); }} style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--accent-green)", fontWeight: 600 }}>
            <span className="live-dot" style={{ display: "inline-block", width: "6px", height: "6px", borderRadius: "50%", background: "var(--accent-green)", animation: "pulse-green 1.5s infinite" }} />
            <span>Console</span>
          </a>
        </nav>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button 
            onClick={() => window.open("https://tamaldey21.netlify.app", "_blank")} 
            className="btn-signin"
            style={{ background: "#ffffff", color: "#111827", border: "1.5px solid #111827", boxShadow: "2px 2px 0px 0px #111827" }}
          >
            Get Access
          </button>
          <button onClick={() => { setError(""); setShowLoginModal(true); }} className="btn-signin">Sign in</button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="landing-hero" style={{ minHeight: "95vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "120px 24px 80px 24px", maxWidth: "1200px", margin: "0 auto", width: "100%", position: "relative" }}>
        
        {/* Halftone SVG Wave background */}
        <div className="dot-wave-bg">
          <svg viewBox="0 0 1000 500" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <g fill="#000000" opacity="0.65">
              {/* Left wave cluster */}
              {Array.from({ length: 16 }).map((_, rowIdx) => {
                const y = 120 + rowIdx * 16;
                return Array.from({ length: 22 }).map((_, colIdx) => {
                  const x = 20 + colIdx * 18;
                  const distanceToLeft = x;
                  const waveFactor = Math.sin(x * 0.015 + y * 0.012 + time) * Math.cos(y * 0.02 - x * 0.008 - time * 0.5);
                  const baseSize = 0.5 + (waveFactor + 1) * 1.5;
                  const size = Math.max(0.4, baseSize * (1 - distanceToLeft / 480));
                  const opacityVal = Math.max(0.04, 0.7 - distanceToLeft / 450);
                  
                  return (
                    <circle key={`l-${rowIdx}-${colIdx}`} cx={x} cy={y} r={size} opacity={opacityVal * (waveFactor + 1.2) * 0.5} />
                  );
                });
              })}

              {/* Right wave cluster */}
              {Array.from({ length: 16 }).map((_, rowIdx) => {
                const y = 120 + rowIdx * 16;
                return Array.from({ length: 22 }).map((_, colIdx) => {
                  const x = 600 + colIdx * 18;
                  const distanceToRight = 1000 - x;
                  const waveFactor = Math.sin(x * 0.015 - y * 0.012 + time) * Math.cos(y * 0.02 + x * 0.008 - time * 0.5);
                  const baseSize = 0.5 + (waveFactor + 1) * 1.5;
                  const size = Math.max(0.4, baseSize * (1 - distanceToRight / 480));
                  const opacityVal = Math.max(0.04, 0.7 - distanceToRight / 450);
                  
                  return (
                    <circle key={`r-${rowIdx}-${colIdx}`} cx={x} cy={y} r={size} opacity={opacityVal * (waveFactor + 1.2) * 0.5} />
                  );
                });
              })}
            </g>
          </svg>
        </div>

        <WireframeCube style={{ top: "15%", left: "8%", opacity: 0.15, transform: "scale(0.8)" }} theme="dark" />
        <WireframeCube style={{ bottom: "20%", right: "8%", opacity: 0.15, transform: "scale(0.8)" }} theme="dark" />

        {/* Headline details */}
        <h1 className="hero-title" style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(54px, 9.5vw, 108px)", fontWeight: "900", lineHeight: "1.02", letterSpacing: "-2.5px", margin: "0 0 32px 0", textTransform: "none", width: "100%", textAlign: "center" }}>
          <span className="hero-line-1">The</span>
          <span className="hero-line-2">Company</span>
          <span className="hero-line-3">That</span>
          <span className="hero-line-4">Runs Itself.</span>
        </h1>
        <p className="hero-subtitle scroll-reveal" style={{ textAlign: "center", margin: "0 auto 40px auto", maxWidth: "520px", fontSize: "16px", color: "#4b5563", lineHeight: "1.65" }}>
          AACE is the central intelligence layer of a company. You give direction. AACE executes — from strategy to deployment, documentation to operations. We're not building another platform. We're building a place where people belong.
        </p>
        <div className="rainbow-btn-wrapper" style={{ margin: "0 auto" }}>
          <button onClick={() => { setError(""); setShowLoginModal(true); }} className="rainbow-glow-btn">
            <span>Join our World</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* Scrollable Section 1: Platform (Dark Theme) */}
      <section className="landing-section" id="platform" style={{ background: "#0b0b0b", color: "#f5f2eb", padding: "100px 40px", borderTop: "1px solid rgba(255, 255, 255, 0.1)", position: "relative", overflow: "hidden" }}>
        
        {/* Floating Background Cube */}
        <WireframeCube style={{ top: "12%", right: "8%", opacity: 0.12, transform: "scale(0.95)" }} theme="lime" />
        <WireframeCube style={{ bottom: "8%", left: "4%", opacity: 0.08, transform: "scale(0.7)" }} theme="lime" />

        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "60px", marginBottom: "80px", alignItems: "start", position: "relative", zIndex: 3 }} className="perks-header-grid">
          {/* Left Column: Title */}
          <div>
            <h2 className="scroll-reveal" style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(38px, 4.5vw, 64px)",
              fontWeight: "900",
              lineHeight: "1.08",
              letterSpacing: "-2px",
              margin: 0
            }}>
              <span style={{ display: "block", color: "#ffffff" }}>One platform.</span>
              <span style={{ display: "block", color: "#c5f82a", fontStyle: "italic", fontWeight: "400" }}>Seven engines.</span>
              <span style={{ display: "block", color: "#ffffff" }}>Zero friction.</span>
            </h2>
          </div>

          {/* Right Column: Descriptions */}
          <div className="scroll-reveal" style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "520px" }}>
            <p style={{ fontSize: "16px", color: "#ffffff", lineHeight: "1.6", fontWeight: "500", margin: 0 }}>
              AACE routes every directive through its internal engine network. Each engine has a defined scope, quality standard, and output format. <strong style={{ color: "#c5f82a" }}>The Orchestrator coordinates everything.</strong>
            </p>
            <p style={{ fontSize: "14px", color: "#8c8c8c", lineHeight: "1.65", margin: 0 }}>
              Built on React + Node.js with deep Antigravity SDK integration. Connects to your CRMs, project trackers, and databases via MCP servers.
            </p>
          </div>
        </div>

        {/* 7 Columns Grid */}
        <div style={{ 
          maxWidth: "1200px", 
          margin: "0 auto 80px auto", 
          display: "grid", 
          gridTemplateColumns: "repeat(7, 1fr)", 
          borderLeft: "1px solid rgba(255, 255, 255, 0.15)",
          borderRight: "1px solid rgba(255, 255, 255, 0.15)",
          position: "relative",
          zIndex: 3
        }} className="platform-engines-grid scroll-reveal">
          {/* Engine 1 */}
          <TiltCard className="engine-column" style={{ padding: "30px 20px", borderRight: "1px solid rgba(255, 255, 255, 0.15)", display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ color: "#ffffff", opacity: 0.85 }}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12,2 22,7 22,17 12,22 2,17 2,7"/></svg>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: "bold", color: "#8c8c8c", letterSpacing: "1px" }}>ORCHESTRATOR</span>
              <p style={{ fontSize: "12.5px", color: "rgba(255, 255, 255, 0.75)", lineHeight: "1.55", margin: 0 }}>Master coordinator. Routes, resolves conflicts, tracks dependencies.</p>
            </div>
          </TiltCard>
          {/* Engine 2 */}
          <TiltCard className="engine-column" style={{ padding: "30px 20px", borderRight: "1px solid rgba(255, 255, 255, 0.15)", display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ color: "#ffffff", opacity: 0.85 }}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 17l6-6-6-6M12 19h8"/></svg>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: "bold", color: "#8c8c8c", letterSpacing: "1px" }}>APP BUILDER</span>
              <p style={{ fontSize: "12.5px", color: "rgba(255, 255, 255, 0.75)", lineHeight: "1.55", margin: 0 }}>Architecture, schemas, APIs, frontend & backend at Staff Eng level.</p>
            </div>
          </TiltCard>
          {/* Engine 3 */}
          <TiltCard className="engine-column" style={{ padding: "30px 20px", borderRight: "1px solid rgba(255, 255, 255, 0.15)", display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ color: "#ffffff", opacity: 0.85 }}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12,2 22,12 12,22 2,12"/></svg>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: "bold", color: "#8c8c8c", letterSpacing: "1px" }}>BUSINESS MIND</span>
              <p style={{ fontSize: "12.5px", color: "rgba(255, 255, 255, 0.75)", lineHeight: "1.55", margin: 0 }}>CEO/COO/CFO logic. Strategy, pricing, market analysis, decisions.</p>
            </div>
          </TiltCard>
          {/* Engine 4 */}
          <TiltCard className="engine-column" style={{ padding: "30px 20px", borderRight: "1px solid rgba(255, 255, 255, 0.15)", display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ color: "#ffffff", opacity: 0.85 }}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: "bold", color: "#8c8c8c", letterSpacing: "1px" }}>DOCUMENTS</span>
              <p style={{ fontSize: "12.5px", color: "rgba(255, 255, 255, 0.75)", lineHeight: "1.55", margin: 0 }}>PRDs, SOPs, decks & reports at McKinsey/BCG quality standard.</p>
            </div>
          </TiltCard>
          {/* Engine 5 */}
          <TiltCard className="engine-column" style={{ padding: "30px 20px", borderRight: "1px solid rgba(255, 255, 255, 0.15)", display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ color: "#ffffff", opacity: 0.85 }}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: "bold", color: "#8c8c8c", letterSpacing: "1px" }}>OPERATIONS</span>
              <p style={{ fontSize: "12.5px", color: "rgba(255, 255, 255, 0.75)", lineHeight: "1.55", margin: 0 }}>Runs HR, Finance, Marketing, Sales & Support autonomously.</p>
            </div>
          </TiltCard>
          {/* Engine 6 */}
          <TiltCard className="engine-column" style={{ padding: "30px 20px", borderRight: "1px solid rgba(255, 255, 255, 0.15)", display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ color: "#ffffff", opacity: 0.85 }}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: "bold", color: "#8c8c8c", letterSpacing: "1px" }}>MEMORY</span>
              <p style={{ fontSize: "12.5px", color: "rgba(255, 255, 255, 0.75)", lineHeight: "1.55", margin: 0 }}>Persistent organisational intelligence. Never loses context.</p>
            </div>
          </TiltCard>
          {/* Engine 7 */}
          <TiltCard className="engine-column" style={{ padding: "30px 20px", display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ color: "#ffffff", opacity: 0.85 }}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: "bold", color: "#8c8c8c", letterSpacing: "1px" }}>LEARNING</span>
              <p style={{ fontSize: "12.5px", color: "rgba(255, 255, 255, 0.75)", lineHeight: "1.55", margin: 0 }}>Measures outcomes, identifies gaps, improves every future run.</p>
            </div>
          </TiltCard>
        </div>

        {/* Bottom Metrics Grid */}
        <div style={{ 
          maxWidth: "1200px", 
          margin: "0 auto", 
          borderTop: "1px solid rgba(255, 255, 255, 0.15)",
          paddingTop: "60px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "40px",
          position: "relative",
          zIndex: 3
        }} className="platform-metrics-grid scroll-reveal">
          {/* Metric 1 */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "#8c8c8c", letterSpacing: "1.5px", textTransform: "uppercase" }}>01 - Pipeline</span>
            <h4 style={{ fontFamily: "var(--font-serif)", fontSize: "24px", color: "#ffffff", margin: 0, fontWeight: "700" }}>11-Stage Execution</h4>
            <p style={{ fontSize: "13.5px", color: "#a3a3a3", lineHeight: "1.6", margin: 0 }}>Intent analysis → objective extraction → constraints → decomposition → engine assignment → planning → risk evaluation → allocation → action generation → memory → monitoring. Every stage, every time.</p>
          </div>
          {/* Metric 2 */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "#8c8c8c", letterSpacing: "1.5px", textTransform: "uppercase" }}>02 - Integration</span>
            <h4 style={{ fontFamily: "var(--font-serif)", fontSize: "24px", color: "#ffffff", margin: 0, fontWeight: "700" }}>Antigravity SDK Native</h4>
            <p style={{ fontSize: "13.5px", color: "#a3a3a3", lineHeight: "1.6", margin: 0 }}>MCP server connections to CRMs, project trackers, and databases. Tool policies with ask_user gates for irreversible actions. Streaming thoughts and tool-call visibility in real time.</p>
          </div>
          {/* Metric 3 */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "#8c8c8c", letterSpacing: "1.5px", textTransform: "uppercase" }}>03 - Quality</span>
            <h4 style={{ fontFamily: "var(--font-serif)", fontSize: "24px", color: "#ffffff", margin: 0, fontWeight: "700" }}>Senior-Level Outputs</h4>
            <p style={{ fontSize: "13.5px", color: "#a3a3a3", lineHeight: "1.6", margin: 0 }}>Every engine holds to a professional standard: Staff Engineer architecture, McKinsey-grade documentation, CEO-level strategy. No filler. No vague outputs. Everything is specific and actionable.</p>
          </div>
        </div>
      </section>

      {/* Scrollable Section 2: Manifesto */}
      <section className="landing-section" id="manifesto" style={{ background: "#f5f2eb", color: "#111827", padding: "100px 40px", borderTop: "1px solid rgba(0,0,0,0.05)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          
          {/* Title */}
          <h2 className="scroll-reveal" style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(42px, 5.5vw, 72px)",
            fontWeight: "900",
            lineHeight: "1.06",
            letterSpacing: "-2px",
            textAlign: "center",
            margin: "0 auto 80px auto",
            maxWidth: "900px"
          }}>
            <span style={{ display: "block", color: "#111827" }}>Companies should run</span>
            <span style={{ 
              display: "block", 
              color: "transparent", 
              WebkitTextStroke: "1.5px #111827", 
              fontStyle: "italic",
              fontWeight: "400" 
            }}>on intelligence,</span>
            <span style={{ display: "block", color: "#7f7f7f", fontStyle: "italic", fontWeight: "400" }}>not headcount.</span>
          </h2>

          {/* Principles 2-Column Grid */}
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "1fr 1fr", 
            gap: "60px 80px", 
            maxWidth: "1000px", 
            margin: "0 auto" 
          }} className="manifesto-principles-grid scroll-reveal">
            
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <h4 style={{ fontFamily: "var(--font-serif)", fontSize: "28px", fontWeight: "700", color: "#111827", margin: 0, lineHeight: "1.25" }}>
                Execution beats conversation.
              </h4>
              <p style={{ fontSize: "15px", color: "#4b5563", lineHeight: "1.65", margin: 0 }}>
                AI that answers questions is a tool. AI that executes plans is a business partner. Every AACE input results in a structured execution plan, not a response to read and then re-do yourself.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <h4 style={{ fontFamily: "var(--font-serif)", fontSize: "28px", fontWeight: "700", color: "#111827", margin: 0, lineHeight: "1.25" }}>
                Founders give direction. Systems handle scale.
              </h4>
              <p style={{ fontSize: "15px", color: "#4b5563", lineHeight: "1.65", margin: 0 }}>
                Your job is vision and judgment. Everything downstream — planning, documentation, architecture, operations — should be handled by systems designed to do nothing but execute.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <h4 style={{ fontFamily: "var(--font-serif)", fontSize: "28px", fontWeight: "700", color: "#111827", margin: 0, lineHeight: "1.25" }}>
                Context is the most valuable company asset.
              </h4>
              <p style={{ fontSize: "15px", color: "#4b5563", lineHeight: "1.65", margin: 0 }}>
                Every decision, preference, and lesson learned is capital. Losing that to interfaces that forget everything is a compounding tax on every future decision. AACE doesn't forget.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <h4 style={{ fontFamily: "var(--font-serif)", fontSize: "28px", fontWeight: "700", color: "#111827", margin: 0, lineHeight: "1.25" }}>
                Autonomy with accountability.
              </h4>
              <p style={{ fontSize: "15px", color: "#4b5563", lineHeight: "1.65", margin: 0 }}>
                AACE halts for legal risks, compliance concerns, and irreversible actions. It requests approval before financial commitments above threshold. Autonomy is not recklessness — it's speed with guardrails.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <h4 style={{ fontFamily: "var(--font-serif)", fontSize: "28px", fontWeight: "700", color: "#111827", margin: 0, lineHeight: "1.25" }}>
                Quality is non-negotiable at every level.
              </h4>
              <p style={{ fontSize: "15px", color: "#4b5563", lineHeight: "1.65", margin: 0 }}>
                Staff Engineer architecture. McKinsey-level documentation. CEO-grade strategy. The output of every AACE engine meets the highest professional standard in that domain. Always.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <h4 style={{ fontFamily: "var(--font-serif)", fontSize: "28px", fontWeight: "700", color: "#111827", margin: 0, lineHeight: "1.25" }}>
                Execution velocity is the new competitive moat.
              </h4>
              <p style={{ fontSize: "15px", color: "#4b5563", lineHeight: "1.65", margin: 0 }}>
                The companies defining the next decade won't have the most resources. They'll make better decisions faster. AACE exists to compound that advantage — one execution at a time.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Perks Section */}
      <section className="landing-section" id="perks" style={{ background: "#f5f2eb", color: "#111827", padding: "100px 40px", borderTop: "1px solid rgba(0,0,0,0.05)", position: "relative", overflow: "hidden" }}>
        
        {/* Floating Background Cubes */}
        <WireframeCube style={{ top: "10%", left: "5%", opacity: 0.08, transform: "scale(0.8)" }} theme="dark" />
        <WireframeCube style={{ bottom: "15%", right: "8%", opacity: 0.08, transform: "scale(0.8)" }} theme="dark" />

        {/* Header Grid */}
        <div style={{ maxWidth: "1200px", margin: "0 auto 60px auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "60px", alignItems: "start", position: "relative", zIndex: 3 }} className="perks-header-grid">
          {/* Left Column: Title */}
          <div>
            <h2 className="scroll-reveal" style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(38px, 4.5vw, 64px)",
              fontWeight: "900",
              lineHeight: "1.08",
              letterSpacing: "-2px",
              margin: 0
            }}>
              <span style={{ display: "block", color: "#111827" }}>Built for founders</span>
              <span style={{ display: "block", color: "#7f7f7f", fontStyle: "italic", fontWeight: "400" }}>who move fast.</span>
            </h2>
          </div>

          {/* Right Column: Descriptions */}
          <div className="scroll-reveal" style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "520px" }}>
            <p style={{ fontSize: "16px", color: "#111827", lineHeight: "1.6", fontWeight: "500", margin: 0 }}>
              Every capability in AACE is designed to eliminate the distance between your vision and its execution. No re-explaining context. No vague outputs. No blocked on waiting.
            </p>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", fontWeight: "bold", color: "#8c8c8c", letterSpacing: "1.5px", textTransform: "uppercase", display: "block" }}>
              08 CORE CAPABILITIES INCLUDED
            </span>
          </div>
        </div>

        {/* 8 Cards Grid */}
        <div className="perks-cards-grid scroll-reveal" style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "24px",
          maxWidth: "1200px",
          margin: "0 auto",
          position: "relative",
          zIndex: 3
        }}>
          
          {/* Card 1 */}
          <TiltCard style={{ background: "#ffffff", border: "1.5px solid #111827", padding: "32px", display: "flex", flexDirection: "column", gap: "20px", boxShadow: "3px 3px 0px 0px #111827" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "#8c8c8c", letterSpacing: "1px" }}>PERK — 01</span>
            <div style={{ fontSize: "28px" }}>⚡</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <h4 style={{ fontFamily: "var(--font-serif)", fontSize: "19px", fontWeight: "700", color: "#111827", margin: 0 }}>Instant Execution Plans</h4>
              <p style={{ fontSize: "13px", color: "#4b5563", lineHeight: "1.6", margin: 0 }}>Any founder directive returns a fully structured execution plan in seconds — tasks, deliverables, risks, dependencies, timelines, and engine assignments all included.</p>
            </div>
          </TiltCard>

          {/* Card 2 */}
          <TiltCard style={{ background: "#ffffff", border: "1.5px solid #111827", padding: "32px", display: "flex", flexDirection: "column", gap: "20px", boxShadow: "3px 3px 0px 0px #111827" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "#8c8c8c", letterSpacing: "1px" }}>PERK — 02</span>
            <div style={{ fontSize: "28px" }}>🧠</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <h4 style={{ fontFamily: "var(--font-serif)", fontSize: "19px", fontWeight: "700", color: "#111827", margin: 0 }}>Persistent Memory</h4>
              <p style={{ fontSize: "13px", color: "#4b5563", lineHeight: "1.6", margin: 0 }}>AACE retains your preferences, past decisions, product history, and strategic context across every session. No re-onboarding. No re-explaining. Ever.</p>
            </div>
          </TiltCard>

          {/* Card 3 */}
          <TiltCard style={{ background: "#ffffff", border: "1.5px solid #111827", padding: "32px", display: "flex", flexDirection: "column", gap: "20px", boxShadow: "3px 3px 0px 0px #111827" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "#8c8c8c", letterSpacing: "1px" }}>PERK — 03</span>
            <div style={{ fontSize: "28px" }}>🏗️</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <h4 style={{ fontFamily: "var(--font-serif)", fontSize: "19px", fontWeight: "700", color: "#111827", margin: 0 }}>Staff-Level Architecture</h4>
              <p style={{ fontSize: "13px", color: "#4b5563", lineHeight: "1.6", margin: 0 }}>The App Builder Engine produces production-ready system architecture, database schemas, and API specs that meet senior engineer review standards from day one.</p>
            </div>
          </TiltCard>

          {/* Card 4 */}
          <TiltCard style={{ background: "#ffffff", border: "1.5px solid #111827", padding: "32px", display: "flex", flexDirection: "column", gap: "20px", boxShadow: "3px 3px 0px 0px #111827" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "#8c8c8c", letterSpacing: "1px" }}>PERK — 04</span>
            <div style={{ fontSize: "28px" }}>📋</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <h4 style={{ fontFamily: "var(--font-serif)", fontSize: "19px", fontWeight: "700", color: "#111827", margin: 0 }}>Consulting-Grade Docs</h4>
              <p style={{ fontSize: "13px", color: "#4b5563", lineHeight: "1.6", margin: 0 }}>PRDs, SOPs, investor decks, and business plans generated at McKinsey/BCG structure — ready to share with investors, partners, and your team immediately.</p>
            </div>
          </TiltCard>

          {/* Card 5 */}
          <TiltCard style={{ background: "#ffffff", border: "1.5px solid #111827", padding: "32px", display: "flex", flexDirection: "column", gap: "20px", boxShadow: "3px 3px 0px 0px #111827" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "#8c8c8c", letterSpacing: "1px" }}>PERK — 05</span>
            <div style={{ fontSize: "28px" }}>🔒</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <h4 style={{ fontFamily: "var(--font-serif)", fontSize: "19px", fontWeight: "700", color: "#111827", margin: 0 }}>Smart Approval Gates</h4>
              <p style={{ fontSize: "13px", color: "#4b5563", lineHeight: "1.6", margin: 0 }}>AACE flags legal risks, compliance issues, and irreversible actions before they happen. Halts and requests human approval. Autonomous execution with a safety floor.</p>
            </div>
          </TiltCard>

          {/* Card 6 */}
          <TiltCard style={{ background: "#ffffff", border: "1.5px solid #111827", padding: "32px", display: "flex", flexDirection: "column", gap: "20px", boxShadow: "3px 3px 0px 0px #111827" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "#8c8c8c", letterSpacing: "1px" }}>PERK — 06</span>
            <div style={{ fontSize: "28px" }}>📈</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <h4 style={{ fontFamily: "var(--font-serif)", fontSize: "19px", fontWeight: "700", color: "#111827", margin: 0 }}>Continuous Learning</h4>
              <p style={{ fontSize: "13px", color: "#4b5563", lineHeight: "1.6", margin: 0 }}>After every execution: outcome measured, predictions compared, gaps identified, lessons stored. Every session AACE becomes more accurate, more aligned, more useful.</p>
            </div>
          </TiltCard>

          {/* Card 7 */}
          <TiltCard style={{ background: "#ffffff", border: "1.5px solid #111827", padding: "32px", display: "flex", flexDirection: "column", gap: "20px", boxShadow: "3px 3px 0px 0px #111827" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "#8c8c8c", letterSpacing: "1px" }}>PERK — 07</span>
            <div style={{ fontSize: "28px" }}>🔌</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <h4 style={{ fontFamily: "var(--font-serif)", fontSize: "19px", fontWeight: "700", color: "#111827", margin: 0 }}>MCP Integrations</h4>
              <p style={{ fontSize: "13px", color: "#4b5563", lineHeight: "1.6", margin: 0 }}>Connect your CRM, project tracker, database, and Slack via the Antigravity SDK's MCP server protocol. AACE operates inside your real production stack — not around it.</p>
            </div>
          </TiltCard>

          {/* Card 8 */}
          <TiltCard style={{ background: "#ffffff", border: "1.5px solid #111827", padding: "32px", display: "flex", flexDirection: "column", gap: "20px", boxShadow: "3px 3px 0px 0px #111827" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "#8c8c8c", letterSpacing: "1px" }}>PERK — 08</span>
            <div style={{ fontSize: "28px" }}>🌐</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <h4 style={{ fontFamily: "var(--font-serif)", fontSize: "19px", fontWeight: "700", color: "#111827", margin: 0 }}>React + Node.js Native</h4>
              <p style={{ fontSize: "13px", color: "#4b5563", lineHeight: "1.6", margin: 0 }}>Drop AACE into your existing internal tooling stack. The system prompt, API layer, engine routing, and full UI are all designed to integrate cleanly from day one.</p>
            </div>
          </TiltCard>

        </div>
      </section>

      {/* Articles Section */}
      <section className="landing-section" id="articles" style={{ borderTop: "1px solid rgba(0,0,0,0.05)", background: "#f5f2eb", padding: "80px 20px" }}>
        <div className="scroll-reveal" style={{ maxWidth: "1100px", margin: "0 auto", textAlign: "center", marginBottom: "40px" }}>
          <span style={{ fontSize: "11px", fontWeight: "bold", color: "var(--accent-cyan)", letterSpacing: "1.5px", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>
            COMPANY JOURNAL
          </span>
          <h2 style={{ fontSize: "36px", fontWeight: 700, letterSpacing: "-1px", margin: "0 0 16px 0", color: "#111827", fontFamily: "var(--font-heading)" }}>
            Industry Insights & Engineering Practices
          </h2>
          <p style={{ fontSize: "15px", color: "#666666", maxWidth: "600px", margin: "0 auto", lineHeight: 1.6 }}>
            Read articles and tutorials authored by the founders and staff on the frontlines of human-AI collaboration.
          </p>
        </div>

        <div className="pinterest-grid scroll-reveal">
          <TiltCard className="pinterest-card">
            <span className="pinterest-card-meta" style={{ color: "var(--accent-cyan)" }}>Architecture</span>
            <h4 className="pinterest-card-title">The Human-AI Hybrid Workspace Blueprint</h4>
            <p className="pinterest-card-desc">
              Analyzing how AACE binds autonomous LLM reasoning engines to structured dashboards where human specialists guide and validate output parameters.
            </p>
            <div className="pinterest-card-footer">
              <span className="pinterest-tag">8 min read</span>
              <button className="pinterest-action-btn" onClick={() => { setActiveArticle(true); window.scrollTo({ top: 0 }); }}>Read Article</button>
            </div>
          </TiltCard>

          <TiltCard className="pinterest-card">
            <span className="pinterest-card-meta" style={{ color: "var(--accent-purple)" }}>Design System</span>
            <h4 className="pinterest-card-title">High-Contrast Contrast Legibility on Light Cards</h4>
            <p className="pinterest-card-desc">
              Lisa, Lead UI/UX Designer, discusses the advantages of using thin black borders and solid offset shadows over heavy gradient drop-shadows for high readability in corporate portals.
            </p>
            <div className="pinterest-card-footer">
              <span className="pinterest-tag">5 min read</span>
              <button className="pinterest-action-btn" onClick={() => { setActiveArticle(true); window.scrollTo({ top: 0 }); }}>Read Article</button>
            </div>
          </TiltCard>

          <TiltCard className="pinterest-card">
            <span className="pinterest-card-meta" style={{ color: "var(--accent-blue)" }}>Databases</span>
            <h4 className="pinterest-card-title">Prisma Schema Indexing and Query Optimizations</h4>
            <p className="pinterest-card-desc">
              A deep dive into indexing strategies, schema modeling, and Prisma transaction configurations to maximize database response times.
            </p>
            <div className="pinterest-card-footer">
              <span className="pinterest-tag">12 min read</span>
              <button className="pinterest-action-btn" onClick={() => { setActiveArticle(true); window.scrollTo({ top: 0 }); }}>Read Article</button>
            </div>
          </TiltCard>

          <TiltCard className="pinterest-card">
            <span className="pinterest-card-meta" style={{ color: "var(--accent-red)" }}>Quality Assurance</span>
            <h4 className="pinterest-card-title">Continuous Verification and Automation Loops</h4>
            <p className="pinterest-card-desc">
              QA specialist Kevin outlines how running test suites inside automated pre-push hooks helps capture UI and schema drift before staging deployment.
            </p>
            <div className="pinterest-card-footer">
              <span className="pinterest-tag">6 min read</span>
              <button className="pinterest-action-btn" onClick={() => { setActiveArticle(true); window.scrollTo({ top: 0 }); }}>Read Article</button>
            </div>
          </TiltCard>

          <TiltCard className="pinterest-card">
            <span className="pinterest-card-meta" style={{ color: "var(--accent-yellow)" }}>Compliance</span>
            <h4 className="pinterest-card-title">Drafting Intellectual Property & NDA Agreements</h4>
            <p className="pinterest-card-desc">
              Legal Counsel Harvey shares a legal template guide for onboarding remote developers while keeping project files bound to the corporate memory ledger.
            </p>
            <div className="pinterest-card-footer">
              <span className="pinterest-tag">9 min read</span>
              <button className="pinterest-action-btn" onClick={() => { setActiveArticle(true); window.scrollTo({ top: 0 }); }}>Read Article</button>
            </div>
          </TiltCard>

          <TiltCard className="pinterest-card">
            <span className="pinterest-card-meta" style={{ color: "var(--accent-green)" }}>API Integration</span>
            <h4 className="pinterest-card-title">External LLM API Live Mode Integration Map</h4>
            <p className="pinterest-card-desc">
              A comprehensive directory mapping Google Gemini, DeepSeek Reasoner, and OpenAI keys to AACE's live routing engines.
            </p>
            <div className="pinterest-card-footer">
              <span className="pinterest-tag">4 min read</span>
              <button className="pinterest-action-btn" onClick={() => { setActiveArticle(true); window.scrollTo({ top: 0 }); }}>Read Article</button>
            </div>
          </TiltCard>
        </div>
      </section>

      {/* Call to Action Section (Dark Banner on Beige) */}
      <section style={{ background: "#f5f2eb", padding: "40px 20px 100px 20px" }}>
        <div style={{
          maxWidth: "1200px",
          margin: "0 auto",
          background: "#0b0b0b",
          padding: "60px 48px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "40px",
          flexWrap: "wrap",
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.15)"
        }} className="cta-banner-container scroll-reveal">
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxWidth: "600px" }}>
            <h3 style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(28px, 3.5vw, 44px)",
              fontWeight: "900",
              lineHeight: "1.2",
              letterSpacing: "-1px",
              color: "#ffffff",
              margin: 0
            }}>
              Ready to run your company on <span style={{ color: "#c5f82a", fontStyle: "italic", fontWeight: "400" }}>intelligence?</span>
            </h3>
            <p style={{ fontSize: "14.5px", color: "#8c8c8c", lineHeight: "1.5", margin: 0 }}>
              Join the early access waitlist. No commitment required.
            </p>
          </div>
          <div>
            <button 
              onClick={() => window.open("https://tamaldey21.netlify.app", "_blank")}
              style={{
                background: "#c5f82a",
                color: "#0b0b0b",
                border: "none",
                padding: "16px 32px",
                fontWeight: "bold",
                fontSize: "13px",
                fontFamily: "var(--font-mono)",
                letterSpacing: "0.5px",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
              className="btn-cta-early-access"
              onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.03)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
            >
              REQUEST EARLY ACCESS →
            </button>
          </div>
        </div>
      </section>

      {/* Floating Bottom Action Badge */}
      {scrolled && (
        <div className="floating-bottom-badge" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          <ArrowRight size={14} style={{ transform: "rotate(-90deg)" }} />
          <span>Top of Page</span>
        </div>
      )}

      {/* Brand Logos Footer Bar */}
      <footer className="landing-footer" style={{ borderTop: "1.5px solid #111827", padding: "20px 40px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", justifyContent: "center", alignItems: "center", width: "100%", fontSize: "11px", fontWeight: "bold", fontFamily: "var(--font-mono)", color: "#111827", letterSpacing: "1px", textTransform: "uppercase" }}>
          <span>AUTONOMOUS AI COMPANY ENGINE</span>
          <span>&middot;</span>
          <span>7 INTERNAL ENGINES</span>
          <span>&middot;</span>
          <span>11-STAGE EXECUTION PIPELINE</span>
          <span>&middot;</span>
          <span>REACT + NODE.JS NATIVE</span>
          <span>&middot;</span>
          <span>ANTIGRAVITY SDK</span>
          <span>&middot;</span>
          <span>PERSISTENT MEMORY</span>
        </div>
      </footer>

      {/* Login Modal Overlay */}
      {showLoginModal && (
        <div className="modal-overlay-light">
          <div className="modal-card-light">
            
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(0,0,0,0.05)", paddingBottom: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Cpu size={18} style={{ color: "var(--accent-blue)" }} />
                <span style={{ fontWeight: "bold", fontSize: "14px", letterSpacing: "0.5px" }}>AACE AUTHORIZATION GATE</span>
              </div>
              <button 
                onClick={() => setShowLoginModal(false)}
                style={{ background: "transparent", border: "none", cursor: "pointer", color: "#666666" }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Profile select cards */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <div 
                onClick={() => { setProfileType("ceo"); setError(""); }}
                className={`light-select-card ${profileType === "ceo" ? "active-ceo" : ""}`}
              >
                <Shield size={18} style={{ color: profileType === "ceo" ? "var(--accent-cyan)" : "#666666", margin: "0 auto 6px auto" }} />
                <span style={{ fontSize: "12px", fontWeight: "600", display: "block" }}>Human Founder</span>
              </div>
              
              <div 
                onClick={() => { setProfileType("employee"); setEmployeeName(""); setError(""); }}
                className={`light-select-card ${profileType === "employee" ? "active-emp" : ""}`}
              >
                <UserCheck size={18} style={{ color: profileType === "employee" ? "var(--accent-blue)" : "#666666", margin: "0 auto 6px auto" }} />
                <span style={{ fontSize: "12px", fontWeight: "600", display: "block" }}>Human Employee</span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {profileType === "employee" && (
                <div className="light-input-group">
                  <label>Corporate Employee ID</label>
                  <input
                    type="text"
                    placeholder="e.g. EMP-2026-0005"
                    value={employeeName}
                    onChange={(e) => setEmployeeName(e.target.value)}
                    disabled={isVerifying}
                  />
                </div>
              )}

              <div className="light-input-group">
                <label>Security Passcode</label>
                <input
                  type="password"
                  placeholder="Enter secure passcode..."
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  disabled={isVerifying}
                />
              </div>

              {error && (
                <div style={{
                  background: "rgba(239, 68, 68, 0.05)", border: "1px solid rgba(239, 68, 68, 0.15)",
                  color: "var(--accent-red)", fontSize: "12px", padding: "8px 12px", borderRadius: "6px",
                  display: "flex", alignItems: "center", gap: "8px"
                }}>
                  <ShieldCheck size={14} style={{ transform: "rotate(180deg)", flexShrink: 0 }} />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                className="btn-black"
                disabled={isVerifying}
                style={{ height: "42px" }}
              >
                {isVerifying ? "Verifying..." : "Establish Secure Link"}
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
export default LoginGate;
