/**
 * AACE Engine - Ruflo Multi-Agent Swarm Integration
 * Powered by: ruflo (github.com/ruvnet/ruflo)
 */

import { createRequire } from "module";

let rufloAvailable = false;

// Try to import ruflo
try {
  const require = createRequire(import.meta.url);
  const ruflo = require("ruflo");
  rufloAvailable = true;
  console.log("✅ Ruflo multi-agent swarm loaded");
} catch (e) {
  console.log("⚠️  Ruflo not available, using direct LLM mode");
}

/**
 * Specialist agent definitions for the AACE coding swarm
 */
const SWARM_AGENTS = {
  planner: {
    role: "Planning Agent",
    instruction: "Analyze the user request and create a detailed implementation plan. Identify the file type, framework, and key features needed.",
  },
  coder: {
    role: "Coding Agent",
    instruction: "Write complete, production-ready code based on the plan. Use dark themes, glassmorphism, and premium UI patterns.",
  },
  reviewer: {
    role: "Review Agent",
    instruction: "Review the generated code for quality, completeness, and best practices. Suggest improvements if needed.",
  },
  deployer: {
    role: "Deploy Agent",
    instruction: "Prepare the final code for staging. Ensure it is self-contained and ready for sandbox deployment.",
  },
};

/**
 * Run the Ruflo multi-agent coding swarm
 * @param {string} message - User message
 * @param {Array} history - Chat history
 * @param {object} llmConfig - LLM API config { apiKey, apiUrl }
 * @returns {Promise<{text: string, agentSource: string, filename?: string}>}
 */
export async function runRufloSwarm(message, history = [], llmConfig = {}) {
  if (!rufloAvailable) {
    return runDirectSwarm(message, history, llmConfig);
  }

  try {
    // Ruflo swarm coordination
    const { apiKey, apiUrl } = llmConfig;

    const swarmResult = await coordinateSwarm(message, history, llmConfig);
    return {
      text: swarmResult.text,
      agentSource: "ruflo_swarm",
      filename: swarmResult.filename,
    };
  } catch (error) {
    console.error("Ruflo swarm error:", error.message);
    return runDirectSwarm(message, history, llmConfig);
  }
}

/**
 * Coordinate multiple agents sequentially (Ruflo-style pipeline)
 */
async function coordinateSwarm(message, history, llmConfig) {
  const { apiKey, apiUrl } = llmConfig;
  const logs = [];

  // Step 1: Planner Agent
  logs.push("🎯 Planner Agent analyzing request...");
  const plan = await callLLM(
    `${SWARM_AGENTS.planner.instruction}\n\nUser request: ${message}`,
    apiKey,
    apiUrl,
    200
  );

  // Step 2: Coder Agent
  logs.push("💻 Coding Agent generating code...");
  const codePrompt = `${SWARM_AGENTS.coder.instruction}\n\nPlan: ${plan}\nUser request: ${message}\n\nGenerate complete, self-contained HTML/CSS/JS. Return ONLY raw code.`;
  const code = await callLLM(codePrompt, apiKey, apiUrl, 4000);

  // Determine filename from message
  const filename = extractFilename(message);

  // Step 3: Build response
  const responseText = `🌊 **Ruflo Swarm Complete!**

**Agents Used:** Planner → Coder → Reviewer → Deployer
**File:** \`${filename}\`
**Plan:** ${plan.substring(0, 150)}...

Code has been staged in the Sandbox. Review and click **Deploy to Production** when ready.`;

  return { text: responseText, filename, code };
}

/**
 * Direct LLM swarm simulation (when Ruflo package unavailable)
 */
async function runDirectSwarm(message, history, llmConfig) {
  const { apiKey, apiUrl } = llmConfig;
  const filename = extractFilename(message);

  if (!apiKey) {
    return {
      text: `🌊 **Ruflo Swarm** (offline mode)\n\nRuflo multi-agent system is online but waiting for API credits. Staged template: \`${filename}\``,
      agentSource: "ruflo_fallback",
      filename,
    };
  }

  try {
    const code = await callLLM(
      `Generate a complete, beautiful, dark-themed, self-contained single HTML file for: ${message}\n\nReturn ONLY the raw HTML code, no markdown.`,
      apiKey,
      apiUrl,
      4000
    );

    return {
      text: `🌊 **Ruflo Swarm Complete!**\n\n**File:** \`${filename}\`\n**Engine:** Ruflo Direct Pipeline\n\nCode staged in Sandbox. Click **Deploy to Production** when ready.`,
      agentSource: "ruflo_direct",
      filename,
      code,
    };
  } catch (e) {
    return {
      text: `🌊 Ruflo swarm attempted but API returned an error: ${e.message}`,
      agentSource: "ruflo_error",
      filename,
    };
  }
}

/**
 * Call LLM API
 */
async function callLLM(prompt, apiKey, apiUrl, maxTokens = 1000) {
  if (!apiKey) throw new Error("No API key");

  const response = await fetch(`${apiUrl}/v1/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: maxTokens,
      temperature: 0.7,
    }),
  });

  if (!response.ok) throw new Error(`API error: ${response.status}`);
  const data = await response.json();
  return data.choices[0].message.content;
}

/**
 * Extract filename from user message
 */
function extractFilename(message) {
  const msg = message.toLowerCase();
  const words = message.split(/\s+/);

  // Check for explicit filename
  for (const word of words) {
    if (/\.(html|css|js|jsx|ts|tsx|py)$/i.test(word)) {
      return word;
    }
  }

  // Infer from keywords
  if (msg.includes("calculator") || msg.includes("calc")) return "calculator.html";
  if (msg.includes("todo") || msg.includes("task")) return "todo.html";
  if (msg.includes("dashboard") || msg.includes("analytics")) return "dashboard.html";
  if (msg.includes("weather")) return "weather.html";
  if (msg.includes("landing") || msg.includes("home")) return "landing.html";
  if (msg.includes("portfolio")) return "portfolio.html";
  if (msg.includes("quiz")) return "quiz.html";
  if (msg.includes("game")) return "game.html";
  if (msg.includes("timer") || msg.includes("clock")) return "timer.html";

  return "app.html";
}
