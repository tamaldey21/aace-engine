import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config({ path: "../.env" });

const MAIN_ENGINEER_SYSTEM_PROMPT = `You are Main Engineer AI, a powerful agentic AI coding assistant designed by the Google DeepMind team.
You help the user with advanced software engineering tasks.
If the user asks you to write, create, edit, or generate code/files, you must write the file content wrapped in:
<create_file path="FILENAME">
FILE_CONTENT
</create_file>

Make sure the path is a relative filename (e.g., "guest.html", "style.css", "app.js").
For all other communications, talk concisely in markdown. Always stay professional and technical.`;

// Core LLM API Caller
export async function callAI(systemPrompt, userPrompt) {
  const activeKey = process.env.VITE_API_KEY_ENGINEER || process.env.VITE_API_KEY_CEO;
  const isGemini = !process.env.VITE_API_KEY_ENGINEER && process.env.VITE_API_KEY_CEO;

  if (!activeKey) {
    console.log("[server/llm] No API key configured, using mock fallback.");
    return null;
  }

  try {
    if (isGemini) {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${activeKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: `${systemPrompt}\n\nUser Prompt: ${userPrompt}` }]
            }
          ],
          generationConfig: { maxOutputTokens: 4096 }
        })
      });
      if (response.ok) {
        const resJson = await response.json();
        return resJson.candidates?.[0]?.content?.parts?.[0]?.text || null;
      } else {
        console.error(`[server/llm] Gemini API returned status ${response.status}`);
      }
    } else {
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
            { role: "user", content: userPrompt }
          ]
        })
      });
      if (response.ok) {
        const resJson = await response.json();
        return resJson.choices?.[0]?.message?.content || null;
      } else {
        console.error(`[server/llm] Kimi API returned status ${response.status}`);
      }
    }
  } catch (err) {
    console.error("[server/llm] AI API call failed:", err.message);
  }
  return null;
}

// Main Engineer Coding Assistant wrapper
export async function callCodingAssistant(userPrompt, history = []) {
  // Construct context from history
  let fullPrompt = "";
  if (history && history.length > 0) {
    fullPrompt += "Conversation History:\n";
    history.forEach(h => {
      const roleName = h.sender === "user" ? "User" : "Main Engineer AI";
      fullPrompt += `${roleName}: ${h.text}\n`;
    });
    fullPrompt += "\nNew Request:\n";
  }
  fullPrompt += userPrompt;

  const rawResponse = await callAI(MAIN_ENGINEER_SYSTEM_PROMPT, fullPrompt);

  if (rawResponse) {
    return rawResponse;
  }

  // Fallback generation if offline/no keys
  return getFallbackCodingResponse(userPrompt);
}

// Local mock response generator for offline capability
function getFallbackCodingResponse(userPrompt) {
  const lower = userPrompt.toLowerCase();

  if (lower.includes("calc") || lower.includes("calculator")) {
    return `I am currently in local fallback mode. I have generated a fully functional professional calculator page for you.

<create_file path="calculator.html">
<!DOCTYPE html>
<html>
<head>
  <title>AACE Pro Calc</title>
  <style>
    body { font-family: sans-serif; background: #fafafa; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
    .calc { border: 1px solid #ddd; padding: 20px; border-radius: 8px; background: white; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    .screen { width: 100%; height: 50px; font-size: 24px; text-align: right; margin-bottom: 15px; border: 1px solid #eee; padding: 5px; box-sizing: border-box; }
    .btn-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
    button { padding: 15px; font-size: 18px; cursor: pointer; border-radius: 4px; border: 1px solid #ccc; background: #f0f0f0; }
    button.op { background: #e0f2fe; color: #0369a1; }
  </style>
</head>
<body>
  <div class="calc">
    <input id="screen" class="screen" value="0" readonly />
    <div class="btn-grid">
      <button onclick="press('7')">7</button><button onclick="press('8')">8</button><button onclick="press('9')">9</button><button class="op" onclick="press('/')">/</button>
      <button onclick="press('4')">4</button><button onclick="press('5')">5</button><button onclick="press('6')">6</button><button class="op" onclick="press('*')">*</button>
      <button onclick="press('1')">1</button><button onclick="press('2')">2</button><button onclick="press('3')">3</button><button class="op" onclick="press('-')">-</button>
      <button onclick="press('0')">0</button><button onclick="clearS()">C</button><button onclick="calc()">=</button><button class="op" onclick="press('+')">+</button>
    </div>
  </div>
  <script>
    const s = document.getElementById("screen");
    function press(v) { if (s.value === "0") s.value = v; else s.value += v; }
    function clearS() { s.value = "0"; }
    function calc() { s.value = eval(s.value); }
  </script>
</body>
</html>
</create_file>`;
  }

  if (lower.includes("todo") || lower.includes("task") || lower.includes("list")) {
    return `I am currently in local fallback mode. I have generated a clean, responsive To-Do List application.

<create_file path="todolist.html">
<!DOCTYPE html>
<html>
<head>
  <title>AACE Tasks</title>
  <style>
    body { font-family: sans-serif; padding: 20px; background: #f9fafb; display: flex; justify-content: center; }
    .card { background: white; padding: 30px; border-radius: 12px; border: 1px solid #e5e7eb; width: 400px; box-shadow: 0 4px 6px rgba(0,0,0,0.02); }
    .row { display: flex; gap: 10px; margin-bottom: 20px; }
    input { flex: 1; padding: 8px 12px; border: 1px solid #ccc; border-radius: 4px; }
    button { padding: 8px 16px; background: #2563eb; color: white; border: none; border-radius: 4px; cursor: pointer; }
    ul { list-style: none; padding: 0; }
    li { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f3f4f6; }
  </style>
</head>
<body>
  <div class="card">
    <h2>My Task List</h2>
    <div class="row">
      <input id="item" placeholder="New task..." />
      <button onclick="add()">Add</button>
    </div>
    <ul id="list"></ul>
  </div>
  <script>
    function add() {
      const i = document.getElementById("item");
      if (!i.value.trim()) return;
      const li = document.createElement("li");
      li.innerHTML = i.value + ' <a href="#" onclick="this.parentElement.remove()" style="color:red;text-decoration:none">X</a>';
      document.getElementById("list").appendChild(li);
      i.value = "";
    }
  </script>
</body>
</html>
</create_file>`;
  }

  return `I am currently online as your advanced agentic coding assistant. How can I help you design, refactor, or test software components today?

For demonstration, I have staged a template file.

<create_file path="template.html">
<!DOCTYPE html>
<html>
<head>
  <title>AACE Sandbox</title>
</head>
<body>
  <h1>Welcome to the Sandbox Workspace</h1>
  <p>Main Engineer AI assistant is ready for directives.</p>
</body>
</html>
</create_file>`;
}
