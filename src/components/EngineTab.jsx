import React, { useState, useEffect } from "react";
import { Cpu, Briefcase, Server, Code, Database, Play, Target, Users, Layers, ShieldCheck, Activity, X, Send, MessageSquare, Brain, Check, Bot, User, Calendar, Clock, Lock, CheckCircle2, ShieldAlert } from "lucide-react";
import { AaceApi } from "../utils/api";

export const ENGINES_INFO = [
  {
    id: "ceo_bot",
    name: "CEO Office",
    role: "Strategic decisions, investor relations, corporate vision, and high-level advisory.",
    icon: Cpu,
    color: "var(--accent-cyan)",
    gradientId: "grad-ceo_bot",
    meta: "Model: DeepSeek-R1 | Priority: Critical"
  },
  {
    id: "coo_bot",
    name: "COO Operations",
    role: "Operational efficiency, automated company workflows, Gantt tracking, and daily logistics.",
    icon: Briefcase,
    color: "var(--accent-blue)",
    gradientId: "grad-coo_bot",
    meta: "Model: GPT-4o | Integrations: Slack, Linear"
  },
  {
    id: "cto_bot",
    name: "CTO Engineering",
    role: "Technical architecture design, system scalability, security protocols, and infrastructure overview.",
    icon: Server,
    color: "var(--accent-purple)",
    gradientId: "grad-cto_bot",
    meta: "Model: Gemini 1.5 Pro | Stack: Microservices"
  },
  {
    id: "product_bot",
    name: "Product Management",
    role: "Product Requirements Documents (PRD), feature mapping, backlog prioritization, and agile roadmaps.",
    icon: Layers,
    color: "#38bdf8",
    gradientId: "grad-product_bot",
    meta: "Model: ProductGPT-Pro | Method: Scrum"
  },
  {
    id: "uiux_bot",
    name: "UI/UX Design",
    role: "User experience wireframes, interactive glassmorphic prototypes, and styling tokens.",
    icon: Bot,
    color: "#f472b6",
    gradientId: "grad-uiux_bot",
    meta: "Model: Midjourney-v6 | Engine: Figma API"
  },
  {
    id: "frontend_bot",
    name: "Frontend Development",
    role: "Builds web UI: Vite React components, layout code, CSS animations, and theme systems.",
    icon: Code,
    color: "var(--text-secondary)",
    gradientId: "grad-frontend_bot",
    meta: "Model: CodeGen-2.5 | Framework: React Tailwind"
  },
  {
    id: "backend_bot",
    name: "Backend Development",
    role: "Implements server routes, logic controllers, authentication middleware, and Webhooks.",
    icon: Database,
    color: "#60a5fa",
    gradientId: "grad-backend_bot",
    meta: "Model: CodeGen-2.5 | Runtime: Node 24 Express"
  },
  {
    id: "db_bot",
    name: "Database Engineering",
    role: "Data persistence schemas, MongoDB Atlas connections, optimization indexes, and hybrid failovers.",
    icon: Server,
    color: "#10b981",
    gradientId: "grad-db_bot",
    meta: "Model: DbGPT-Core | Store: MongoDB Atlas"
  },
  {
    id: "devops_bot",
    name: "DevOps & Infrastructure",
    role: "CI/CD automated deployment pipelines, Docker container builds, server monitors, and cloud metrics.",
    icon: Play,
    color: "var(--accent-green)",
    gradientId: "grad-devops_bot",
    meta: "Model: CloudOps-v2 | Host: Render & Netlify"
  },
  {
    id: "aiml_bot",
    name: "AI/ML Department",
    role: "Deep learning model tuning, neural agents, natural language routers, and inference pipelines.",
    icon: Brain,
    color: "#a78bfa",
    gradientId: "grad-aiml_bot",
    meta: "Model: Gemini Flash | GPU: NVIDIA H100 Cluster"
  },
  {
    id: "qa_bot",
    name: "Quality Assurance",
    role: "Auto-generated test runs, end-to-end user path validations, and error reporting.",
    icon: Check,
    color: "#a3e635",
    gradientId: "grad-qa_bot",
    meta: "Model: TestGPT-3 | Type: E2E Cypress"
  },
  {
    id: "cyber_bot",
    name: "Cybersecurity",
    role: "Penetration tests, network port checks, access control rules, and vulnerability scanners.",
    icon: ShieldCheck,
    color: "var(--accent-red)",
    gradientId: "grad-cyber_bot",
    meta: "Model: SecGPT-Enterprise | Standard: SOC2"
  },
  {
    id: "finance_bot",
    name: "Finance",
    role: "Profitability reports, payroll trackers, transaction logs, and margin optimization.",
    icon: Briefcase,
    color: "#fbbf24",
    gradientId: "grad-finance_bot",
    meta: "Model: LedgerGPT-Fintech | Target: EBITDA 45%"
  },
  {
    id: "hr_bot",
    name: "HR",
    role: "Employee roster management, attendance logging, onboarding paths, and contract reviews.",
    icon: Users,
    color: "#ec4899",
    gradientId: "grad-hr_bot",
    meta: "Model: HRIS-GPT-Custom | Flow: Auto-Clock"
  },
  {
    id: "marketing_bot",
    name: "Marketing",
    role: "SEO optimization campaigns, newsletter copywriting, social ad sets, and CTR/CAC stats.",
    icon: Target,
    color: "var(--accent-yellow)",
    gradientId: "grad-marketing_bot",
    meta: "Model: Copywriter-XL | Channel: Multi"
  },
  {
    id: "sales_bot",
    name: "Sales",
    role: "Lead generation, pipeline conversion tools, contract signings, and demo booking assistants.",
    icon: Target,
    color: "#f59e0b",
    gradientId: "grad-sales_bot",
    meta: "Model: SalesGPT-v4 | CRM: Salesforce Sync"
  },
  {
    id: "legal_bot",
    name: "Legal & Compliance",
    role: "Non-Disclosure Agreements (NDA), corporate compliance reviews, and risk audits.",
    icon: ShieldCheck,
    color: "#ef4444",
    gradientId: "grad-legal_bot",
    meta: "Model: LawGPT-3.5 | Audit SLA: 100%"
  },
  {
    id: "support_bot",
    name: "Customer Support",
    role: "Inbound ticket resolutions, troubleshooting guidelines, customer onboarding, and feedback loops.",
    icon: Bot,
    color: "#06b6d4",
    gradientId: "grad-support_bot",
    meta: "Model: SupportGPT-Direct | CSAT Target: 99.4%"
  },
  {
    id: "strategy_bot",
    name: "Research & Strategy",
    role: "Competitive intelligence analysis, market studies, and long-term tech roadmap trends.",
    icon: Cpu,
    color: "#6366f1",
    gradientId: "grad-strategy_bot",
    meta: "Model: ScholarGPT-Pro | Source: arXiv / OLS"
  },
  {
    id: "main_engineer_bot",
    name: "Main Engineer AI",
    role: "Advanced AI coding assistant, direct codebase refactoring, sandbox compiler integrations, and dynamic staging deployment.",
    icon: Code,
    color: "var(--accent-cyan)",
    gradientId: "grad-main_engineer_bot",
    meta: "Model: Main-Engineer-v1 | Engine: DeepMind Agentic Coding"
  }
];

const getConsultPresetStarters = (botId) => {
  switch (botId) {
    case "main_engineer_bot":
      return [
        { label: "Refactor React component props", query: "Optimize a React component to use typescript types and dynamic styles" },
        { label: "Draft a clean Express backend router", query: "Create an Express backend router that supports CRUD operations for tasks" }
      ];
    case "ceo_bot":
      return [
        { label: "Analyze seed equity option pool splits", query: "Optimize our standard co-founder and early hire equity vesting models" },
        { label: "Audit CAC-to-LTV product validation ratios", query: "Calculate optimal CAC payback threshold for our enterprise pricing tiers" }
      ];
    case "coo_bot":
      return [
        { label: "Draft employee equipment onboarding SOP", query: "Create standard onboarding checklist for corporate laptops and Slack credentials" },
        { label: "Optimize Q4 ops cost margins", query: "Audit our current SaaS tool allocations to cut waste and maintain 85% gross margins" }
      ];
    case "cto_bot":
      return [
        { label: "Prisma schema database index design", query: "Write a composite index recommendation for projects status queries inside Prisma schema" },
        { label: "Verify JWT security protocol parameters", query: "Show recommended token lifetime and decryption rules for API endpoints" }
      ];
    case "frontend_bot":
      return [
        { label: "Build React engine diagnostic grid component", query: "Draft React UI code using SVGs to render dynamic ripple load lines" },
        { label: "Add micro-interaction animations", query: "Write CSS animation parameters for a pulsing active-state dot widget" }
      ];
    case "backend_bot":
      return [
        { label: "Write Express CRUD router logic", query: "Draft standard Node.js Express router endpoints for handling project metadata" },
        { label: "Implement bcrypt hash security middleware", query: "Write an Express authentication middleware verifying JWT signatures in request headers" }
      ];
    case "deploy_bot":
      return [
        { label: "Optimize alpine Docker base configuration", query: "Write a multi-stage Dockerfile utilizing node:20-alpine image targets" },
        { label: "Draft local dry-run shell script", query: "Create a bash execution flow compiling Vite assets and testing database handshakes" }
      ];
    case "marketing_bot":
      return [
        { label: "Write LinkedIn enterprise outreach ad copy", query: "Draft three LinkedIn ad variations targeting VP Engineering with value props" },
        { label: "Design ad campaign budget forecast", query: "Calculate conversion parameters and forecast cost-per-acquisition metrics" }
      ];
    case "hr_bot":
      return [
        { label: "Write Lead Frontend Developer job description", query: "Compile primary requirements, tech stack specs, and benefits for Lead Developer role" },
        { label: "Draft NDA and welcome greeting templates", query: "Write welcome onboarding script containing new candidate corporate employee ID instructions" }
      ];
    case "product_bot":
      return [
        { label: "Draft vendor dashboard product PRD specs", query: "Compile feature specifications and user story checklists for the vendor portal v1" },
        { label: "Outline user retention triggers roadmap", query: "Map out weekly product milestones focusing on daily active user metrics" }
      ];
    case "legal_bot":
      return [
        { label: "Draft contractor intellectual property NDA template", query: "Write a standard proprietary NDA structure safeguarding corporate repository keys" },
        { label: "Audit vendor regulatory compliance risk checks", query: "Formulate standard verification steps and vendor questionnaire checklists" }
      ];
    default:
      return [
        { label: "Analyze current department tasks", query: "What are the priority objectives and active bottlenecks in this department?" },
        { label: "Draft department compliance checklist", query: "Create standard operational protocol for our weekly status review." }
      ];
  }
};

const generateDynamicFrontendCode = (query) => {
  const cleanTitle = query.replace(/^(create|make|build|generate|design)\s+/i, "");
  const componentName = cleanTitle
    .split(/[\s_-]+/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join("")
    .replace(/[^a-zA-Z0-9]/g, "") || "CustomComponent";

  const lower = query.toLowerCase();

  if (lower.includes("portfolio") || lower.includes("profile") || lower.includes("website") || lower.includes("page")) {
    return `export function DeveloperPortfolio() {
  const projects = [
    { title: "AACE Engine", desc: "Autonomous Business Operating System", tech: "React, Node.js" },
    { title: "Terminal Console", desc: "Interactive CLI prototype widget", tech: "Vite, HTML5" }
  ];
  return (
    <div className="p-8 max-w-4xl mx-auto bg-slate-900 text-white rounded-2xl border border-slate-800">
      <header className="flex justify-between items-center border-b border-slate-800 pb-6 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Alex Rivera</h1>
          <p className="text-slate-400 text-sm mt-1">Lead Frontend Engineer</p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-semibold text-emerald-400">Available for hire</span>
        </div>
      </header>
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4">Core Repositories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((proj, idx) => (
            <div key={idx} className="p-5 bg-slate-950 border border-slate-800 rounded-xl hover:border-violet-500/50 transition-colors">
              <h3 className="font-semibold text-lg">{proj.title}</h3>
              <p className="text-slate-400 text-sm mt-1 mb-3">{proj.desc}</p>
              <span className="px-2 py-1 text-xs font-mono bg-violet-500/10 border border-violet-500/20 text-violet-400 rounded">{proj.tech}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}`;
  }

  // Generic dynamic fallback
  return `export function ${componentName}() {
  return (
    <div className="p-6 max-w-md mx-auto bg-slate-900 text-white rounded-xl shadow-md border border-slate-800">
      <div className="flex items-center gap-4">
        <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
          <span className="text-sm font-semibold uppercase">Widget</span>
        </div>
        <div>
          <h2 className="text-lg font-bold">${cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1)}</h2>
          <p className="text-slate-400 text-xs mt-0.5">Compiled dynamically by AACE Frontend Developer Bot.</p>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-slate-800">
        <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 transition-colors text-sm font-medium rounded-lg">
          Action Trigger
        </button>
      </div>
    </div>
  );
}`;
};

const generateDynamicBackendCode = (query) => {
  const cleanTitle = query.replace(/^(create|make|build|generate|design|write)\s+/i, "");
  const routeName = cleanTitle.toLowerCase().replace(/[^a-z0-9]/g, "-") || "resource";
  return `// src/routes/${routeName}.js - Express Route Handler
import express from 'express';
const router = express.Router();

// GET /api/${routeName}
router.get('/', async (req, res) => {
  try {
    const list = await req.db.models.${routeName.charAt(0).toUpperCase() + routeName.slice(1)}.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.json({ success: true, count: list.length, data: list });
  } catch (err) {
    res.status(500).json({ error: 'DATABASE_QUERY_ERROR', details: err.message });
  }
});

export default router;`;
};

const executeBotTask = (botId, query) => {
  switch (botId) {
    case "ceo_bot":
      return `[CEO Advisor Bot Task Execution]
Objective: Analyze options pool structure and CAC thresholds.

Core Recommendation Blueprint:
1. Standardize employee option pool allocations at exactly 12% to preserve runway.
2. Structure founder vesting using standard 4-year linear schedules with a 1-year cliff.
3. Lock maximum discount ratios for account executives to 15% to maintain CAC targets under $14.20.

Memory Insight: "CEO Advisor Bot verified Series Seed options pool standard target parameter: 12%."`;

    case "coo_bot":
      return `[COO Operations Bot Task Execution]
Objective: Compile Standard Operating Procedures (SOP) and operational audit checklist.

SOP Deliverables:
1. Hardware Provisioning: Dispatch MacBook configurations with secure hardware key token locks.
2. Email verification: Log automated dispatch templates inside welcome mail registers.
3. SaaS Audits: Trim redundant monitoring layers to target 85% operational profit margins.

Memory Insight: "COO Operations Bot compiled hardware provisioning SOP and SaaS audit checklists."`;

    case "cto_bot":
      return `[CTO Architecture Bot Task Execution]
Objective: Audit schema indexing designs and JWT parameters.

Database Recommendations:
1. Composite Index: Add @@index([project_id, status]) inside Prisma schema Project model to minimize lookup latencies.
2. Token Lifecycle: Set access tokens to expire in exactly 1 hour; use secure environment variables for HS256 encryption keys.

Memory Insight: "CTO Architecture Bot validated database composite indexes on Project tables."`;

    case "frontend_bot":
      const componentCode = generateDynamicFrontendCode(query);
      const cleanQuery = query.replace(/^(create|make|build|generate|design)\s+/i, "");
      return `[Frontend Developer Bot Task Execution]
Objective: Compile modular React components and micro-interaction styling for "${cleanQuery}".

React Component Code Snippet:
\`\`\`jsx
${componentCode}
\`\`\`

Memory Insight: "Frontend Developer Bot drafted React components for ${cleanQuery}."`;

    case "backend_bot":
      const routeCode = generateDynamicBackendCode(query);
      const cleanQueryBack = query.replace(/^(create|make|build|generate|design|write)\s+/i, "");
      return `[Backend Developer Bot Task Execution]
Objective: Compile Express CRUD controller endpoints and routing paths for "${cleanQueryBack}".

Node.js Express Route Code:
\`\`\`javascript
${routeCode}
\`\`\`

Memory Insight: "Backend Developer Bot compiled Express route handlers for ${cleanQueryBack}."`;

    case "deploy_bot":
      return `[DevOps & Deploy Bot Task Execution]
Objective: Optimize alpine Dockerfile layers and dry-run shell commands.

Dockerfile:
\`\`\`dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
RUN npm ci --only=production
EXPOSE 8080
CMD ["npm", "start"]
\`\`\`

Memory Insight: "DevOps & Deploy Bot completed multi-stage Node:20-alpine Docker configurations."`;

    case "marketing_bot":
      return `[Marketing & Growth Bot Task Execution]
Objective: Write LinkedIn outreach copies and model CPA funnel ratios.

LinkedIn Ad Variations:
- Headline: "Rebooting the Creative Connection."
- Body copy: "Specialized AI Co-founders that execute. No overhead. Build, recruit, and deploy at the speed of thought."
- Target: VP Engineering & CTOs in mid-market startups.

Memory Insight: "Marketing & Growth Bot compiled Q4 LinkedIn ad campaigns and CPA targets."`;

    case "hr_bot":
      return `[HR Operations Bot Task Execution]
Objective: Compile Lead Developer job requirements and NDA greetings.

Job Description Criteria:
1. Experience: 5+ years building modular web applications in React & Vite.
2. Compliance: Require signed non-disclosure agreements (NDAs) prior to repository onboarding.
3. System IDs: Onboarded employees must receive pre-allocated EMP-2026 codes.

Memory Insight: "HR Operations Bot generated standard candidate screening specifications."`;

    case "product_bot":
      return `[Product Manager Bot Task Execution]
Objective: Compile Product Requirements Document (PRD) blueprints and tracking specifications.

PRD Specifications:
- Target Feature: Secure Vendor Upload Portal.
- Success Metric: Drop document submission failure rate to under 2%.
- User Stories: As a compliance manager, I want automatic email reminders sent every 48 hours to non-compliant vendors.

Memory Insight: "Product Manager Bot compiled secure vendor upload portal PRD blueprints."`;

    case "legal_bot":
      return `[Legal & Compliance Bot Task Execution]
Objective: Draft contractor NDAs and standard IP assignment provisions.

IP Assignment Provision:
"All work product, code scripts, designs, data structures, and assets created under the scope of this engagement are strictly assigned to AACE Company Core Engine as proprietary assets."

Memory Insight: "Legal & Compliance Bot drafted contractor intellectual property and NDA clauses."`;

    default:
      return `[AI Agent Consultation Complete]
Executed requested query: "${query}".
All operations completed successfully. Let me know if you wish to record this insight.`;
  }
};

const extractMemoryInsight = (text) => {
  const match = text.match(/Memory Insight:\s*"([^"]+)"/);
  return match ? match[1] : text.split('\n')[0];
};

export function EngineTab() {
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [workloads, setWorkloads] = useState({});

  useEffect(() => {
    Promise.all([
      AaceApi.request("/api/employees"),
      AaceApi.request("/api/attendance").catch(() => [])
    ])
      .then(([empData, attData]) => {
        setEmployees(empData || []);
        setAttendance(attData || []);
        
        const humans = (empData || []).filter(e => e.type !== "Autonomous");
        const initialWorkloads = {};
        humans.forEach(h => {
          initialWorkloads[h.empId] = Array.from({ length: 15 }, () => Math.floor(Math.random() * 4) + 5);
        });
        setWorkloads(initialWorkloads);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load employee diagnostics:", err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setWorkloads(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(empId => {
          if (updated[empId]) {
            const points = [...updated[empId]];
            points.shift();
            points.push(Math.floor(Math.random() * 5) + 5);
            updated[empId] = points;
          }
        });
        return updated;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [employees]);

  const humans = employees.filter(e => e.type !== "Autonomous");

  const getEmployeeStatus = (empId) => {
    const today = new Date().toDateString();
    const activeLog = attendance.find(log => 
      log.empId === empId && 
      new Date(log.loginTime || log.createdAt || Date.now()).toDateString() === today && 
      (log.status === "Present" || log.status === "Checked In")
    );
    return activeLog ? "ON DUTY" : "OFFLINE";
  };

  const getEmployeeLogs = (empId) => {
    return attendance.filter(log => log.empId === empId).sort((a, b) => new Date(b.loginTime || b.createdAt) - new Date(a.loginTime || a.createdAt));
  };

  const generatePath = (points) => {
    if (!points || points.length === 0) return "";
    const stepX = 300 / (points.length - 1);
    let path = `M 0 ${60 - points[0] * 5}`;
    for (let i = 1; i < points.length; i++) {
      const x = i * stepX;
      const y = 60 - points[i] * 5;
      path += ` L ${x} ${y}`;
    }
    return path;
  };

  const generateAreaPath = (points, gradientId) => {
    if (!points || points.length === 0) return "";
    const linePath = generatePath(points);
    return `${linePath} L 300 60 L 0 60 Z`;
  };

  const getRoleIcon = (role) => {
    const r = role.toLowerCase();
    if (r.includes("ceo") || r.includes("founder")) return User;
    if (r.includes("dev") || r.includes("code") || r.includes("software")) return Code;
    if (r.includes("design") || r.includes("ux") || r.includes("ui")) return Layers;
    if (r.includes("qa") || r.includes("test")) return CheckCircle2;
    if (r.includes("coo") || r.includes("ops") || r.includes("operations")) return Briefcase;
    return Users;
  };

  const getRoleColor = (role) => {
    const r = role.toLowerCase();
    if (r.includes("ceo") || r.includes("founder")) return "var(--accent-cyan)";
    if (r.includes("dev") || r.includes("code")) return "var(--accent-blue)";
    if (r.includes("coo") || r.includes("ops")) return "var(--accent-yellow)";
    return "var(--accent-purple)";
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "300px" }}>
        <p style={{ color: "var(--text-secondary)" }}>Loading employee directory...</p>
      </div>
    );
  }

  return (
    <div className="engine-tab-container" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      
      <div className="glass-card">
        <h2 className="plan-section-title" style={{ borderLeftColor: "var(--accent-cyan)", margin: 0, paddingLeft: "10px" }}>
          <Users size={18} style={{ color: "var(--accent-cyan)" }} /> Human Roster & Diagnostics Matrix
        </h2>
        <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
          Operational status, workload logs, and security parameters of AACE's human staff. Click any card to inspect dossier profiles and audit clock-in records.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px" }}>
          {humans.map(emp => {
            const IconComponent = getRoleIcon(emp.role);
            const empColor = getRoleColor(emp.role);
            const status = getEmployeeStatus(emp.empId);
            const wavePoints = workloads[emp.empId] || [];
            const currentHours = wavePoints[wavePoints.length - 1] || 0;
            const gradientId = `grad-${emp.empId}`;

            return (
              <div 
                key={emp.empId} 
                className="glass-card engine-card"
                onClick={() => setSelectedEmp(emp)}
                style={{ 
                  cursor: "pointer", 
                  transition: "all 0.2s ease"
                }}
              >
                <div className="engine-header-row">
                  <div className="engine-identity">
                    <div className="engine-avatar" style={{ 
                      background: "rgba(0, 0, 0, 0.04)",
                      color: empColor
                    }}>
                      <IconComponent size={18} />
                    </div>
                    <div className="engine-details-meta">
                      <h4 style={{ color: "var(--text-main)", margin: 0, fontSize: "14px", fontWeight: "600" }}>{emp.name}</h4>
                      <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>{emp.empId} &bull; {emp.type}</span>
                    </div>
                  </div>
                  <span className={`engine-badge-status ${status === "ON DUTY" ? "active" : ""}`} style={{
                    borderColor: status === "ON DUTY" ? "var(--accent-green)" : "var(--border-color)",
                    color: status === "ON DUTY" ? "var(--accent-green)" : "var(--text-secondary)"
                  }}>
                    {status}
                  </span>
                </div>
                
                <div className="engine-desc" style={{ minHeight: "36px", fontSize: "12px", color: "var(--text-secondary)", marginTop: "8px" }}>
                  Assigned Department: <strong style={{ color: "var(--text-primary)" }}>{emp.dept}</strong><br/>
                  Designated Role: <strong style={{ color: "var(--text-primary)" }}>{emp.role}</strong>
                </div>

                <div className="chart-wrapper" style={{ marginTop: "12px" }}>
                  <div className="chart-label" style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "var(--text-muted)", marginBottom: "4px" }}>
                    <span>DAILY WORK HOURS</span>
                    <span style={{ color: empColor, fontWeight: "bold", fontFamily: "var(--font-mono)" }}>
                      {currentHours} hrs today
                    </span>
                  </div>
                  
                  <svg viewBox="0 0 300 60" style={{ width: "100%", height: "60px", background: "rgba(0, 0, 0, 0.01)", border: "1px solid var(--border-color)", borderRadius: "6px" }}>
                    <defs>
                      <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={empColor} stopOpacity="0.2" />
                        <stop offset="100%" stopColor={empColor} stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    
                    <line x1="0" y1="20" x2="300" y2="20" stroke="rgba(0, 0, 0, 0.03)" strokeWidth="1" />
                    <line x1="0" y1="40" x2="300" y2="40" stroke="rgba(0, 0, 0, 0.03)" strokeWidth="1" />
                    
                    <path d={generateAreaPath(wavePoints, gradientId)} fill={`url(#${gradientId})`} />
                    <path d={generatePath(wavePoints)} fill="none" stroke={empColor} strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Employee Dossier Modal */}
      {selectedEmp && (
        <div className="modal-overlay" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="modal-content" style={{ maxWidth: "600px", width: "90%", display: "flex", flexDirection: "column", height: "480px", padding: "20px" }}>
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-color)", paddingBottom: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{
                  width: "36px", height: "36px", borderRadius: "50%",
                  background: "rgba(0, 240, 255, 0.04)", border: "1px solid var(--accent-cyan)",
                  display: "flex", alignItems: "center", justifyContent: "center", color: getRoleColor(selectedEmp.role)
                }}>
                  {React.createElement(getRoleIcon(selectedEmp.role), { size: 18 })}
                </div>
                <div>
                  <h3 className="modal-title" style={{ margin: 0, fontSize: "16px", fontWeight: "600", color: "var(--text-primary)" }}>
                    Employee Dossier: {selectedEmp.name}
                  </h3>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "2px" }}>
                    <span className="live-dot" style={{ display: "inline-block", width: "6px", height: "6px", borderRadius: "50%", background: getEmployeeStatus(selectedEmp.empId) === "ON DUTY" ? "var(--accent-green)" : "var(--text-muted)", animation: getEmployeeStatus(selectedEmp.empId) === "ON DUTY" ? "pulse-green 1.5s infinite" : "none" }} />
                    <span style={{ fontSize: "10px", color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>
                      {selectedEmp.empId} &bull; {getEmployeeStatus(selectedEmp.empId)}
                    </span>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={() => setSelectedEmp(null)}
                style={{ 
                  background: "transparent", border: "none", cursor: "pointer", 
                  color: "var(--text-secondary)", padding: "6px", borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}
                className="btn-icon-danger"
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "16px", margin: "16px 0", paddingRight: "6px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", background: "var(--bg-input)", border: "1px solid var(--border-color)", padding: "14px", borderRadius: "8px" }}>
                <div style={{ fontSize: "12px" }}>
                  <span style={{ color: "var(--text-muted)", display: "block" }}>DEPARTMENT</span>
                  <strong style={{ color: "var(--text-primary)" }}>{selectedEmp.dept}</strong>
                </div>
                <div style={{ fontSize: "12px" }}>
                  <span style={{ color: "var(--text-muted)", display: "block" }}>ROLE</span>
                  <strong style={{ color: "var(--text-primary)" }}>{selectedEmp.role}</strong>
                </div>
                <div style={{ fontSize: "12px" }}>
                  <span style={{ color: "var(--text-muted)", display: "block" }}>EMPLOYEE ID</span>
                  <strong style={{ color: "var(--text-primary)" }}>{selectedEmp.empId}</strong>
                </div>
                <div style={{ fontSize: "12px" }}>
                  <span style={{ color: "var(--text-muted)", display: "block" }}>EMPLOYMENT TYPE</span>
                  <strong style={{ color: "var(--text-primary)" }}>{selectedEmp.type}</strong>
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: "600", marginBottom: "8px", textTransform: "uppercase" }}>
                  Recent Attendance Logs
                </h4>
                {getEmployeeLogs(selectedEmp.empId).length === 0 ? (
                  <div style={{ fontSize: "12px", color: "var(--text-muted)", fontStyle: "italic", textAlign: "center", padding: "16px", background: "rgba(0,0,0,0.05)", border: "1px solid var(--border-color)", borderRadius: "6px" }}>
                    No attendance logs recorded.
                  </div>
                ) : (
                  <div style={{ overflowX: "auto", border: "1px solid var(--border-color)", borderRadius: "6px" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", textAlign: "left" }}>
                      <thead>
                        <tr style={{ background: "var(--bg-input)", borderBottom: "1px solid var(--border-color)" }}>
                          <th style={{ padding: "8px 12px", color: "var(--text-secondary)" }}>Date</th>
                          <th style={{ padding: "8px 12px", color: "var(--text-secondary)" }}>Clock In</th>
                          <th style={{ padding: "8px 12px", color: "var(--text-secondary)" }}>Clock Out</th>
                          <th style={{ padding: "8px 12px", color: "var(--text-secondary)" }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getEmployeeLogs(selectedEmp.empId).slice(0, 5).map((log, index) => {
                          const date = new Date(log.loginTime || log.createdAt).toLocaleDateString();
                          const inTime = new Date(log.loginTime || log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                          const outTime = log.logoutTime ? new Date(log.logoutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "—";
                          return (
                            <tr key={index} style={{ borderBottom: index < 4 ? "1px solid var(--border-color)" : "none", color: "var(--text-primary)" }}>
                              <td style={{ padding: "8px 12px" }}>{date}</td>
                              <td style={{ padding: "8px 12px" }}>{inTime}</td>
                              <td style={{ padding: "8px 12px" }}>{outTime}</td>
                              <td style={{ padding: "8px 12px" }}>
                                <span style={{ 
                                  fontSize: "10px", padding: "2px 6px", borderRadius: "10px", fontWeight: "bold",
                                  background: log.status === "Left" ? "rgba(239, 68, 68, 0.08)" : "rgba(16, 185, 129, 0.08)",
                                  color: log.status === "Left" ? "var(--accent-red)" : "var(--accent-green)",
                                  border: `1px solid ${log.status === "Left" ? "rgba(239, 68, 68, 0.15)" : "rgba(16, 185, 129, 0.15)"}`
                                }}>
                                  {log.status === "Left" ? "LEFT" : "ON DUTY"}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", borderTop: "1px solid var(--border-color)", paddingTop: "14px" }}>
              <button onClick={() => setSelectedEmp(null)} className="btn btn-secondary" style={{ padding: "8px 16px", borderRadius: "6px" }}>
                Close Profile
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
export default EngineTab;
