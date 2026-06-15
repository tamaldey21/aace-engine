import React, { useState, useEffect } from "react";
import { Cpu, Briefcase, Server, Code, Database, Play, Target, Users, Layers, ShieldCheck, Activity, X, Send, MessageSquare, Brain, Check, Bot } from "lucide-react";
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
    id: "antigravity_bot",
    name: "Antigravity AI",
    role: "Advanced AI coding assistant, direct codebase refactoring, sandbox compiler integrations, and dynamic staging deployment.",
    icon: Code,
    color: "var(--accent-cyan)",
    gradientId: "grad-antigravity_bot",
    meta: "Model: Antigravity-v2 | Engine: DeepMind Agentic Coding"
  }
];

const getConsultPresetStarters = (botId) => {
  switch (botId) {
    case "antigravity_bot":
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

export function EngineTab({ memories = [], onAddMemory }) {
  const [engineMetrics, setEngineMetrics] = useState({});
  const [activeConsultBot, setActiveConsultBot] = useState(null);
  const [chatLog, setChatLog] = useState([]);
  const [taskInput, setTaskInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [committedMsgs, setCommittedMsgs] = useState({});
  const [deployingId, setDeployingId] = useState(null);

  useEffect(() => {
    const initial = {};
    ENGINES_INFO.forEach(eng => {
      initial[eng.id] = Array.from({ length: 15 }, () => Math.floor(Math.random() * 30) + 15);
    });
    setEngineMetrics(initial);

    const interval = setInterval(() => {
      setEngineMetrics(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(id => {
          const points = [...updated[id]];
          points.shift();
          points.push(Math.floor(Math.random() * 32) + 14);
          updated[id] = points;
        });
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const generatePath = (points) => {
    if (!points || points.length === 0) return "";
    const stepX = 300 / (points.length - 1);
    let path = `M 0 ${60 - points[0]}`;
    for (let i = 1; i < points.length; i++) {
      const x = i * stepX;
      const y = 60 - points[i];
      path += ` L ${x} ${y}`;
    }
    return path;
  };

  const generateAreaPath = (points) => {
    if (!points || points.length === 0) return "";
    const linePath = generatePath(points);
    return `${linePath} L 300 60 L 0 60 Z`;
  };

  const handleOpenConsult = (eng) => {
    setActiveConsultBot(eng);
    setChatLog([
      {
        id: "greeting-" + Date.now(),
        sender: "bot",
        text: `[${eng.name}] Active. I am tuned to help you execute tasks regarding: ${eng.role}\n\nSelect a preset starter scenario or describe a task below, and I will execute it.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setTaskInput("");
    setIsTyping(false);
  };

  const handleSendTask = (textToSend) => {
    const query = textToSend || taskInput;
    if (!query.trim() || isTyping) return;

    const userMsg = {
      id: "user-" + Date.now(),
      sender: "user",
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatLog(prev => [...prev, userMsg]);
    setTaskInput("");
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const outputText = executeBotTask(activeConsultBot.id, query);
      const botMsg = {
        id: "bot-" + Date.now(),
        sender: "bot",
        text: outputText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isCommitable: outputText.includes("Memory Insight:"),
        insightText: extractMemoryInsight(outputText),
        isDeployable: activeConsultBot.id === "frontend_bot",
        deployQuery: query
      };
      setChatLog(prev => [...prev, botMsg]);
    }, 1200);
  };

  const handleCommitInsight = (msgId, insightText) => {
    if (onAddMemory) {
      onAddMemory(insightText);
      setCommittedMsgs(prev => ({ ...prev, [msgId]: true }));
    }
  };

  const handleDeployApp = (msgId, queryText) => {
    setDeployingId(msgId);
    const cleanTitle = queryText.replace(/^(create|make|build|generate|design|write)\s+/i, "");
    let filename = cleanTitle.toLowerCase().replace(/[^a-z0-9]/g, "-") || "custom-app";
    if (!filename.endsWith(".html")) {
      filename += ".html";
    }

    const ceoKey = localStorage.getItem("aace_ceo_key") || "";
    const cooKey = localStorage.getItem("aace_coo_key") || "";
    const engineerKey = localStorage.getItem("aace_engineer_key") || "";
    const hrKey = localStorage.getItem("aace_hr_key") || "";
    const productKey = localStorage.getItem("aace_product_key") || "";
    const uiuxKey = localStorage.getItem("aace_uiux_key") || "";
    const qaKey = localStorage.getItem("aace_qa_key") || "";
    const marketingKey = localStorage.getItem("aace_marketing_key") || "";
    const legalKey = localStorage.getItem("aace_legal_key") || "";
    const geminiKey = localStorage.getItem("aace_gemini_key") || "";

    AaceApi.request("/api/deploy-file", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filename,
        directive: queryText,
        keys: {
          ceoKey,
          cooKey,
          engineerKey,
          hrKey,
          productKey,
          uiuxKey,
          qaKey,
          marketingKey,
          legalKey,
          geminiKey
        }
      })
    })
      .then(data => {
        setDeployingId(null);
        if (data.success) {
          if (data.offline) {
            alert(`[Offline Local Mode] API Server down. File "${data.filename}" compiled client-side and downloaded directly to your local computer!`);
          } else {
            if (confirm(`[DevOps & Deploy Bot] File "${data.filename}" has been successfully built and deployed to the workspace public directory!\n\nWould you like to open it now?`)) {
              window.open(data.url, "_blank");
            }
          }
        } else {
          alert(`Deploy failed: ${data.error}`);
        }
      })
      .catch(err => {
        setDeployingId(null);
        console.error("Deploy error:", err);
        alert(`Deploy error: Could not contact build server.`);
      });
  };

  return (
    <div className="engine-tab-container" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      
      <div className="glass-card">
        <h2 className="plan-section-title" style={{ borderLeftColor: "var(--accent-cyan)", margin: 0, paddingLeft: "10px" }}>
          <Activity size={18} style={{ color: "var(--accent-cyan)" }} /> Neural Engine Monitoring Room (10 Active AI Models)
        </h2>
        <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
          Diagnostic view of AACE's exactly 10 specialized agent bots. Click any engine card to consult the bot, assign tasks, and write results directly to the Memory Vault.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px" }}>
          {ENGINES_INFO.map(eng => {
            const IconComponent = eng.icon;
            const wavePoints = engineMetrics[eng.id] || [];
            const currentLoad = wavePoints[wavePoints.length - 1] || 0;
            const status = currentLoad > 30 ? "PROCESSING" : "IDLE";
            
            return (
              <div 
                key={eng.id} 
                className="glass-card engine-card"
                onClick={() => handleOpenConsult(eng)}
                style={{ 
                  cursor: "pointer", 
                  transition: "all 0.2s ease",
                  hoverBorderColor: "var(--accent-cyan)"
                }}
              >
                <div className="engine-header-row">
                  <div className="engine-identity">
                    <div className="engine-avatar" style={{ 
                      background: "rgba(0, 0, 0, 0.04)",
                      color: eng.color
                    }}>
                      <IconComponent size={18} />
                    </div>
                    <div className="engine-details-meta">
                      <h4 style={{ color: "var(--text-main)", margin: 0, fontSize: "14px", fontWeight: "600" }}>{eng.name}</h4>
                      <span>{eng.meta}</span>
                    </div>
                  </div>
                  <span className={`engine-badge-status ${status === "PROCESSING" ? "active" : ""}`} style={{
                    borderColor: status === "PROCESSING" ? eng.color : "var(--border-color)",
                    color: status === "PROCESSING" ? eng.color : "var(--text-secondary)"
                  }}>
                    {status}
                  </span>
                </div>
                
                <div className="engine-desc" style={{ minHeight: "36px" }}>
                  {eng.role}
                </div>

                <div className="chart-wrapper">
                  <div className="chart-label">
                    <span>WORKLOAD CAPACITY</span>
                    <span style={{ color: eng.color, fontWeight: "bold", fontFamily: "var(--font-mono)" }}>
                      {Math.round((currentLoad / 60) * 100)}% LOAD
                    </span>
                  </div>
                  
                  <svg viewBox="0 0 300 60" style={{ width: "100%", height: "60px", background: "rgba(0, 0, 0, 0.01)", border: "1px solid var(--border-color)", borderRadius: "6px" }}>
                    <defs>
                      <linearGradient id={eng.gradientId} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={eng.color} stopOpacity="0.2" />
                        <stop offset="100%" stopColor={eng.color} stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    
                    <line x1="0" y1="20" x2="300" y2="20" stroke="rgba(0, 0, 0, 0.03)" strokeWidth="1" />
                    <line x1="0" y1="40" x2="300" y2="40" stroke="rgba(0, 0, 0, 0.03)" strokeWidth="1" />
                    
                    <path d={generateAreaPath(wavePoints)} fill={`url(#${eng.gradientId})`} />
                    <path d={generatePath(wavePoints)} fill="none" stroke={eng.color} strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Consultation Modal Dialog */}
      {activeConsultBot && (
        <div className="modal-overlay" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="modal-content" style={{ maxWidth: "680px", width: "90%", display: "flex", flexDirection: "column", height: "560px", padding: "20px" }}>
            
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-color)", paddingBottom: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{
                  width: "36px", height: "36px", borderRadius: "50%",
                  background: "rgba(0, 240, 255, 0.04)", border: "1px solid var(--accent-cyan)",
                  display: "flex", alignItems: "center", justifyContent: "center", color: activeConsultBot.color
                }}>
                  {React.createElement(activeConsultBot.icon, { size: 18 })}
                </div>
                <div>
                  <h3 className="modal-title" style={{ margin: 0, fontSize: "16px", fontWeight: "600", color: "var(--text-primary)" }}>
                    Consult: {activeConsultBot.name}
                  </h3>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "2px" }}>
                    <span className="live-dot" style={{ display: "inline-block", width: "6px", height: "6px", borderRadius: "50%", background: "var(--accent-green)", animation: "pulse-green 1.5s infinite" }} />
                    <span style={{ fontSize: "10px", color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>
                      {activeConsultBot.meta}
                    </span>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={() => setActiveConsultBot(null)}
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

            {/* Chat Bubble Stream */}
            <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "14px", margin: "16px 0", paddingRight: "6px" }}>
              {chatLog.map((chat) => {
                const isBot = chat.sender === "bot";
                const isCommitted = committedMsgs[chat.id];
                
                return (
                  <div key={chat.id} style={{
                    alignSelf: isBot ? "flex-start" : "flex-end",
                    display: "flex", gap: "10px", flexDirection: isBot ? "row" : "row-reverse",
                    maxWidth: "85%"
                  }}>
                    <div style={{
                      width: "28px", height: "28px", borderRadius: "50%",
                      background: isBot ? "rgba(0, 240, 255, 0.05)" : "var(--bg-input)",
                      border: `1px solid ${isBot ? "var(--accent-cyan)" : "var(--border-color)"}`,
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                    }}>
                      {isBot ? <Bot size={14} style={{ color: "var(--accent-cyan)" }} /> : <Users size={14} style={{ color: "var(--text-secondary)" }} />}
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <div style={{
                        background: isBot ? "rgba(2, 132, 199, 0.03)" : "var(--bg-input)",
                        border: `1px solid ${isBot ? "rgba(2, 132, 199, 0.12)" : "var(--border-color)"}`,
                        borderRadius: "10px", padding: "12px 14px", fontSize: "13px", lineHeight: "1.5",
                        color: "var(--text-primary)", whiteSpace: "pre-wrap", fontFamily: "var(--font-sans)"
                      }}>
                        {chat.text}
                        
                        {/* Action buttons */}
                        {isBot && (chat.isCommitable || chat.isDeployable) && (
                          <div style={{ marginTop: "10px", borderTop: "1px solid var(--border-color)", paddingTop: "8px", display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                            {chat.isCommitable && (
                              <button
                                onClick={() => handleCommitInsight(chat.id, chat.insightText)}
                                disabled={isCommitted}
                                className="btn btn-secondary"
                                style={{ 
                                  padding: "4px 10px", fontSize: "11px", gap: "4px",
                                  background: isCommitted ? "rgba(16, 185, 129, 0.08)" : "var(--bg-main)",
                                  borderColor: isCommitted ? "rgba(16, 185, 129, 0.2)" : "var(--border-color)",
                                  color: isCommitted ? "var(--accent-green)" : "var(--accent-cyan)"
                                }}
                              >
                                {isCommitted ? (
                                  <>
                                    <Check size={12} strokeWidth={3} /> Committed to Vault
                                  </>
                                ) : (
                                  <>
                                    <Brain size={12} /> Commit to Memory Vault
                                  </>
                                )}
                              </button>
                            )}

                            {chat.isDeployable && (
                              <button
                                onClick={() => handleDeployApp(chat.id, chat.deployQuery)}
                                disabled={deployingId === chat.id}
                                className="btn btn-secondary"
                                style={{ 
                                  padding: "4px 10px", fontSize: "11px", gap: "4px",
                                  color: "var(--accent-blue)"
                                }}
                              >
                                {deployingId === chat.id ? "Deploying..." : "🚀 Deploy to Workspace"}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                      <span style={{ fontSize: "9px", color: "var(--text-muted)", fontFamily: "var(--font-mono)", alignSelf: isBot ? "flex-start" : "flex-end" }}>
                        {chat.time}
                      </span>
                    </div>
                  </div>
                );
              })}

              {isTyping && (
                <div style={{ display: "flex", gap: "10px", alignSelf: "flex-start" }}>
                  <div style={{
                    width: "28px", height: "28px", borderRadius: "50%",
                    background: "rgba(0, 240, 255, 0.05)", border: "1px solid var(--accent-cyan)",
                    display: "flex", alignItems: "center", justifyContent: "center"
                  }}>
                    <Bot size={14} style={{ color: "var(--accent-cyan)" }} />
                  </div>
                  <div style={{
                    background: "rgba(2, 132, 199, 0.03)", border: "1px solid rgba(2, 132, 199, 0.12)",
                    borderRadius: "10px", padding: "10px 14px", display: "flex", alignItems: "center", gap: "6px"
                  }}>
                    <X size={12} className="spin-animation" style={{ animation: "spin 2s linear infinite", color: "var(--accent-cyan)" }} />
                    <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>
                      {activeConsultBot.name} is compiling task...
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Starters Section */}
            <div style={{ marginBottom: "12px" }}>
              <span style={{ fontSize: "10px", fontWeight: "bold", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
                SUGGESTED TASK BLUEPRINTS
              </span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {getConsultPresetStarters(activeConsultBot.id).map((starter, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendTask(starter.query)}
                    className="light-helper-btn"
                    style={{ fontSize: "11px", padding: "5px 10px" }}
                    disabled={isTyping}
                  >
                    🚀 {starter.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Form Input Panel */}
            <form onSubmit={(e) => { e.preventDefault(); handleSendTask(); }} style={{ display: "flex", gap: "10px" }}>
              <input
                type="text"
                placeholder={`Describe a task for ${activeConsultBot.name} to execute...`}
                value={taskInput}
                onChange={(e) => setTaskInput(e.target.value)}
                disabled={isTyping}
                style={{
                  flex: 1, background: "var(--bg-input)", border: "1px solid var(--border-color)",
                  borderRadius: "8px", padding: "10px 14px", color: "var(--text-primary)", outline: "none", fontSize: "13px"
                }}
              />
              <button
                type="submit"
                disabled={isTyping || !taskInput.trim()}
                className="btn"
                style={{ padding: "0 16px", height: "40px", background: "var(--accent-cyan)" }}
              >
                <Send size={15} />
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
export default EngineTab;
