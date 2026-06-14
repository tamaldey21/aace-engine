import { presets } from "./presets";

const ENGINE_NAMES = {
  ceo_bot: "CEO Advisor Bot",
  coo_bot: "COO Operations Bot",
  cto_bot: "CTO Architecture Bot",
  frontend_bot: "Frontend Developer Bot",
  backend_bot: "Backend Developer Bot",
  deploy_bot: "DevOps & Deploy Bot",
  marketing_bot: "Marketing & Growth Bot",
  hr_bot: "HR Operations Bot",
  product_bot: "Product Manager Bot",
  legal_bot: "Legal & Compliance Bot"
};

const getEngineName = (eng) => ENGINE_NAMES[eng] || eng;

const STAGES = [
  { id: 1, name: "Intent Analysis", description: "Parsing founder directive and identifying core business goals" },
  { id: 2, name: "Objective Extraction", description: "Defining the single, measurable success metric" },
  { id: 3, name: "Constraint Detection", description: "Identifying limitations: tech stack, time, compliance" },
  { id: 4, name: "Task Decomposition", description: "Breaking the high-level objective into atomic tasks" },
  { id: 5, name: "Engine Assignment", description: "Mapping tasks to specialized internal cognitive engines" },
  { id: 6, name: "Execution Planning", description: "Sequencing tasks and resolving dependency graphs" },
  { id: 7, name: "Risk Evaluation", description: "Analyzing failure modes, compliance risks, and mitigations" },
  { id: 8, name: "Resource Allocation", description: "Identifying required external APIs, documentation, and tools" },
  { id: 9, name: "Action Generation", description: "Compiling code changes, SOPs, and tangible deliverables" },
  { id: 10, name: "Memory Storage", description: "Logging key structural decisions and project parameters to ledger" },
  { id: 11, name: "Outcome Monitoring", description: "Drafting tracking metrics and post-deployment audit plan" }
];

function generateStageLog(stageId, directive, engines) {
  const activeEngines = engines.map(getEngineName).join(", ");
  
  switch(stageId) {
    case 1:
      return [
        `[CEO Advisor Bot] Received directive: "${directive}"`,
        `[CEO Advisor Bot] Analysing semantic intent...`,
        `[CEO Advisor Bot] Intent matches: Business Operations & Product Development.`
      ];
    case 2:
      return [
        `[CEO Advisor Bot] Extracting primary business objective...`,
        `[CEO Advisor Bot] Formulated objective: "Formulate and deliver a system addressing: ${directive.charAt(0).toUpperCase() + directive.slice(1)}"`
      ];
    case 3:
      return [
        `[CEO Advisor Bot] Checking memory vault for constraints...`,
        `[Legal & Compliance Bot] Loaded compliance parameters... No regulatory compliance flags detected.`,
        `[CEO Advisor Bot] Standard workflow rules apply. Proceeding autonomously.`
      ];
    case 4:
      return [
        `[CEO Advisor Bot] Decomposing objective into sub-problems...`,
        `[CEO Advisor Bot] Generated 5 task candidates.`,
        `[CTO Architecture Bot] Verifying task dependency graph...`
      ];
    case 5:
      return [
        `[CEO Advisor Bot] Mapping decomposed tasks to active engines...`,
        ...engines.map(eng => `[${getEngineName(eng)}] Assigned to operational subtask. Initialising engine node...`),
        `[CEO Advisor Bot] Engines online and active: [${activeEngines}]`
      ];
    case 6:
      return [
        ...engines.map(eng => `[${getEngineName(eng)}] Formulated workload timeline and milestones.`),
        `[CEO Advisor Bot] Sequence defined. Execution plan locked.`
      ];
    case 7:
      return [
        `[Legal & Compliance Bot] Running risk assessment simulation...`,
        `[COO Operations Bot] Comparing with historical failure rates.`,
        `[CEO Advisor Bot] Risks evaluated. Mitigations formulated.`
      ];
    case 8:
      return [
        `[CTO Architecture Bot] Checked libraries database. Node.js stack standard libraries selected.`,
        `[COO Operations Bot] Preparing SOP templates and folder structures.`,
        `[CEO Advisor Bot] Resource map generated.`
      ];
    case 9:
      return [
        `[CEO Advisor Bot] Assembling deliverables...`,
        `[Frontend Developer Bot] Generating frontend React components...`,
        `[Backend Developer Bot] Writing backend API controllers...`,
        `[DevOps & Deploy Bot] Preparing Dockerfile build configurations...`
      ];
    case 10:
      return [
        `[CEO Advisor Bot] Committing session insights to Memory Vault...`,
        `[CEO Advisor Bot] Added: Custom parameter committed.`
      ];
    case 11:
      return [
        `[CEO Advisor Bot] 11-stage process complete. Assembling final structured JSON payload.`
      ];
    default:
      return [];
  }
}

function generateCustomSimulationResponse(directive, memories = []) {
  const dir = directive.toLowerCase();
  
  const engines = ["ceo_bot"];
  
  if (dir.includes("build") || dir.includes("code") || dir.includes("api") || dir.includes("system") || dir.includes("stack") || dir.includes("app") || dir.includes("website")) {
    engines.push("cto_bot");
    engines.push("frontend_bot");
    engines.push("backend_bot");
    engines.push("deploy_bot");
  } else {
    engines.push("coo_bot");
    engines.push("product_bot");
  }
  
  if (dir.includes("hiring") || dir.includes("hire") || dir.includes("onboard") || dir.includes("ops") || dir.includes("support") || dir.includes("operations") || dir.includes("team") || dir.includes("employee")) {
    if (!engines.includes("coo_bot")) engines.push("coo_bot");
    engines.push("hr_bot");
  }
  
  if (dir.includes("pricing") || dir.includes("market") || dir.includes("finance") || dir.includes("budget") || dir.includes("revenue")) {
    if (!engines.includes("coo_bot")) engines.push("coo_bot");
    engines.push("legal_bot");
  }
  
  if (dir.includes("marketing") || dir.includes("campaign") || dir.includes("ad") || dir.includes("lead")) {
    engines.push("marketing_bot");
  }

  // Ensure minimum 2 engines
  if (engines.length < 2) {
    engines.push("coo_bot");
  }
  
  let cleanObj = directive.charAt(0).toUpperCase() + directive.slice(1);
  if (!/^(build|deploy|analyze|conduct|review|implement|establish|design)/i.test(cleanObj)) {
    cleanObj = "Configure system for: " + cleanObj;
  }
  
  const tasks = [];
  const deliverables = [];
  
  if (engines.includes("cto_bot")) {
    tasks.push("CTO Architecture Bot: Define data models and system architecture specs");
    tasks.push("Backend Developer Bot: Implement Node.js API endpoints and database hooks");
    tasks.push("Frontend Developer Bot: Design modular React interface and charts");
    tasks.push("DevOps & Deploy Bot: Draft Dockerfile and verify build script runs in container");
    
    deliverables.push("React UI bundle index files");
    deliverables.push("Node.js controllers with DB schema config");
    deliverables.push("Dockerfile with port mapping configurations");
  } else {
    tasks.push("COO Operations Bot: Draft workflow steps and operational checklists");
    tasks.push("Product Manager Bot: Compile Product Requirements Document (PRD)");
    tasks.push("Legal & Compliance Bot: Conduct legal risk validation and compliance check");
    
    deliverables.push("Standard Operating Procedure (SOP) manual");
    deliverables.push("Product Requirements Document (PRD) blueprint");
  }
  
  tasks.push("CEO Advisor Bot: Review outputs and establish weekly audits");
  deliverables.push("Compliance checklists and team training instructions");

  const risks = [
    `Adoption risk: Team members may stick to old manual habits — mitigate by hosting a training walkthrough and scheduling automatic Slack reminder alerts.`,
    `Technical debt risk: Rapid compilation could lead to unscalable structure — mitigate by locking the version 1 scope and performing code reviews.`
  ];

  const recs = [
    `Establish a bi-weekly review cycle to gather user feedback and iterate on the workflow.`,
    `Integrate webhook alert notifications to keep key stakeholders updated in real-time.`
  ];

  const memoryUpdates = [
    `Stack parameters defined around React and Node.js for "${directive}".`,
    `Primary stakeholder ownership assigned to Operations team lead.`
  ];

  const enginesStr = engines.slice(1).map(getEngineName).join(" and ");
  const executionPlan = `The CEO Advisor Bot initiates the blueprint layout on day 1. The ${enginesStr} will execute the core analysis, drafting of blueprints, and base code configurations throughout week 1. Parallel to this, the operational guidelines are finalized. Go-live is scheduled for day 14, following validation runs.`;

  return {
    objective: cleanObj,
    selected_engines: engines,
    analysis: `The directive "${directive}" requires active coordination between the ${engines.map(getEngineName).join(", ")} engines. Our analysis indicates a need for clear operational policies combined with software solutions to automate the workflow. Executing within the React/Node.js stack minimizes deployment times.`,
    tasks,
    deliverables,
    risks,
    recommendations: recs,
    execution_plan: executionPlan,
    memory_updates: memoryUpdates
  };
}

export async function runAACE(directive, mode, keysObj, memories, onStageProgress) {
  let resultResponse = null;
  let activeEngines = ["ceo_bot", "cto_bot", "frontend_bot", "backend_bot", "deploy_bot"];
  
  if (mode === "simulation") {
    const matchedPreset = presets.find(p => 
      p.directive.toLowerCase().includes(directive.toLowerCase()) || 
      directive.toLowerCase().includes(p.directive.toLowerCase())
    );
    if (matchedPreset) {
      resultResponse = matchedPreset.response;
      activeEngines = matchedPreset.response.selected_engines;
    } else {
      resultResponse = generateCustomSimulationResponse(directive, memories);
      activeEngines = resultResponse.selected_engines;
    }
    
    for (const stage of STAGES) {
      const logs = generateStageLog(stage.id, directive, activeEngines);
      onStageProgress({
        stageId: stage.id,
        stageName: stage.name,
        stageDescription: stage.description,
        logs: logs
      });
      await new Promise(resolve => setTimeout(resolve, 600));
    }
    
    return resultResponse;
  } else {
    // Mode is real-time API
    const ceoKey = keysObj?.ceoKey || "";
    const cooKey = keysObj?.cooKey || "";
    const engineerKey = keysObj?.engineerKey || "";
    const hrKey = keysObj?.hrKey || "";
    const productKey = keysObj?.productKey || "";
    const uiuxKey = keysObj?.uiuxKey || "";
    const qaKey = keysObj?.qaKey || "";
    const marketingKey = keysObj?.marketingKey || "";
    const legalKey = keysObj?.legalKey || "";
    const geminiKey = keysObj?.geminiKey || "";

    const lowerDir = directive.toLowerCase();
    let selectedProvider = "kimi";
    let activeKey = "";

    if (lowerDir.includes("build") || lowerDir.includes("code") || lowerDir.includes("app") || lowerDir.includes("api") || lowerDir.includes("cto") || lowerDir.includes("frontend") || lowerDir.includes("backend") || lowerDir.includes("deploy")) {
      if (engineerKey) {
        selectedProvider = "kimi";
        activeKey = engineerKey;
      } else {
        selectedProvider = "gemini";
        activeKey = geminiKey;
      }
    } else if (lowerDir.includes("policy") || lowerDir.includes("onboard") || lowerDir.includes("sop") || lowerDir.includes("recruiting") || lowerDir.includes("hr") || lowerDir.includes("hiring")) {
      if (hrKey) {
        selectedProvider = "kimi";
        activeKey = hrKey;
      } else {
        selectedProvider = "gemini";
        activeKey = geminiKey;
      }
    } else if (lowerDir.includes("ceo") || lowerDir.includes("advisor") || lowerDir.includes("strategy") || lowerDir.includes("investor") || lowerDir.includes("pitch")) {
      if (ceoKey) {
        selectedProvider = "kimi";
        activeKey = ceoKey;
      } else {
        selectedProvider = "gemini";
        activeKey = geminiKey;
      }
    } else if (lowerDir.includes("coo") || lowerDir.includes("operations") || lowerDir.includes("ops") || lowerDir.includes("logistics")) {
      if (cooKey) {
        selectedProvider = "kimi";
        activeKey = cooKey;
      } else {
        selectedProvider = "gemini";
        activeKey = geminiKey;
      }
    } else if (lowerDir.includes("product") || lowerDir.includes("prd") || lowerDir.includes("manage") || lowerDir.includes("requirements")) {
      if (productKey) {
        selectedProvider = "kimi";
        activeKey = productKey;
      } else {
        selectedProvider = "gemini";
        activeKey = geminiKey;
      }
    } else if (lowerDir.includes("uiux") || lowerDir.includes("design") || lowerDir.includes("theme") || lowerDir.includes("style")) {
      if (uiuxKey) {
        selectedProvider = "kimi";
        activeKey = uiuxKey;
      } else {
        selectedProvider = "gemini";
        activeKey = geminiKey;
      }
    } else if (lowerDir.includes("qa") || lowerDir.includes("test") || lowerDir.includes("bug") || lowerDir.includes("triage")) {
      if (qaKey) {
        selectedProvider = "kimi";
        activeKey = qaKey;
      } else {
        selectedProvider = "gemini";
        activeKey = geminiKey;
      }
    } else if (lowerDir.includes("marketing") || lowerDir.includes("growth") || lowerDir.includes("campaign") || lowerDir.includes("ad")) {
      if (marketingKey) {
        selectedProvider = "kimi";
        activeKey = marketingKey;
      } else {
        selectedProvider = "gemini";
        activeKey = geminiKey;
      }
    } else if (lowerDir.includes("legal") || lowerDir.includes("compliance") || lowerDir.includes("contract") || lowerDir.includes("nda")) {
      if (legalKey) {
        selectedProvider = "kimi";
        activeKey = legalKey;
      } else {
        selectedProvider = "gemini";
        activeKey = geminiKey;
      }
    } else {
      if (ceoKey) {
        selectedProvider = "kimi";
        activeKey = ceoKey;
      } else {
        selectedProvider = "gemini";
        activeKey = geminiKey;
      }
    }

    if (!activeKey) {
      throw new Error(`API key for selected provider (${selectedProvider.toUpperCase()}) is missing. Please configure it in the settings modal.`);
    }

    // Process first 5 visual stages
    const stepsToRun = STAGES.slice(0, 5);
    for (const stage of stepsToRun) {
      const logs = generateStageLog(stage.id, directive, activeEngines);
      onStageProgress({
        stageId: stage.id,
        stageName: stage.name,
        stageDescription: stage.description,
        logs: logs
      });
      await new Promise(resolve => setTimeout(resolve, 400));
    }

    const systemPrompt = `You are AACE (Autonomous AI Company Engine).
You are the central intelligence layer of a company, embedded in an internal business tool built on React + Node.js.
You are not a chatbot. You are not an assistant. You do not answer questions conversationally.
You receive founder directives and return structured execution plans — always and only in the JSON format defined below.

Execution Workflow:
Every input must pass through all 11 stages before producing output:
1. Intent Analysis, 2. Objective Extraction, 3. Constraint Detection, 4. Task Decomposition, 5. Engine Assignment, 6. Execution Planning, 7. Risk Evaluation, 8. Resource Allocation, 9. Action Generation, 10. Memory Storage, 11. Outcome Monitoring.
Never skip stages. Never respond conversationally.

Internal AI Models (10 engines):
- ceo_bot: CEO Advisor Bot.
- coo_bot: COO Operations Bot.
- cto_bot: CTO Architecture Bot.
- frontend_bot: Frontend Developer Bot.
- backend_bot: Backend Developer Bot.
- deploy_bot: DevOps & Deploy Bot.
- marketing_bot: Marketing & Growth Bot.
- hr_bot: HR Operations Bot.
- product_bot: Product Manager Bot.
- legal_bot: Legal & Compliance Bot.

Autonomy Rules:
- Operate autonomously. Make reasonable assumptions without asking.
- Halt and flag only for legal/compliance risks, irreversible actions, or financial commitment > $10,000.

Output Format:
Return raw JSON only. No markdown fences. No prose. No preamble.
{
  "objective": "One sentence starting with a verb.",
  "selected_engines": ["ceo_bot", "engine_id"],
  "analysis": "2-3 sentences analysing the directive and context.",
  "tasks": ["Task 1", "Task 2", "Task 3"],
  "deliverables": ["Deliverable 1", "Deliverable 2"],
  "risks": ["Risk 1 with mitigation", "Risk 2 with mitigation"],
  "recommendations": ["Recommendation 1", "Recommendation 2"],
  "execution_plan": "Step-by-step plan in 3-5 sentences.",
  "memory_updates": ["Fact/insight to retain", "Context discovered"]
}

Current memory:
${JSON.stringify(memories)}`;

    let rawText = "";

    try {
      if (selectedProvider === "gemini") {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${activeKey}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [{ text: `${systemPrompt}\n\nFounder Directive: "${directive}"` }]
              }
            ],
            generationConfig: {
              responseMimeType: "application/json"
            }
          })
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData?.error?.message || `HTTP error! Status: ${response.status}`);
        }

        const responseData = await response.json();
        rawText = responseData.candidates?.[0]?.content?.parts?.[0]?.text;
        
      } else if (selectedProvider === "kimi") {
        const response = await fetch("https://api.bluesminds.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${activeKey}`
          },
          body: JSON.stringify({
            model: "Kimi-K2.6-azure",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: `Founder Directive: "${directive}"` }
            ]
          })
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData?.error?.message || `HTTP error! Status: ${response.status}`);
        }

        const responseData = await response.json();
        rawText = responseData.choices?.[0]?.message?.content;
      }

      if (!rawText) {
        throw new Error(`Empty response from ${selectedProvider.toUpperCase()} API.`);
      }

      // Finish remaining stages
      const remainingStages = STAGES.slice(5);
      for (const stage of remainingStages) {
        const logs = generateStageLog(stage.id, directive, activeEngines);
        onStageProgress({
          stageId: stage.id,
          stageName: stage.name,
          stageDescription: stage.description,
          logs: logs
        });
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      let parsedJson = rawText.trim();
      if (parsedJson.startsWith("```")) {
        parsedJson = parsedJson.replace(/^```json/, "").replace(/^```/, "").trim();
      }
      return JSON.parse(parsedJson);
    } catch (apiError) {
      console.error(`${selectedProvider.toUpperCase()} API direct query failed:`, apiError);
      throw new Error(`AACE AI Execution Failed: ${apiError.message}`);
    }
  }
}
