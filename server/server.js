import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { dbReady } from "./db.js"; // Initialize connection
import { Candidate, ChatLog, Memory, Employee, Attendance, Project, Task, Message, Metric } from "./db.js";
import { compileHTML } from "./compiler.js";
import { callCodingAssistant } from "./utils/llm.js";

const app = express();
const PORT = process.env.PORT || 3001;

// Centralized n8n Webhook Dispatcher
async function triggerN8nWebhook(event, data) {
  const webhookUrl = process.env.N8N_WEBHOOK_URL;
  if (!webhookUrl || !webhookUrl.trim()) return;

  try {
    const response = await fetch(webhookUrl.trim(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event,
        timestamp: new Date().toISOString(),
        data
      })
    });
    if (!response.ok) {
      console.warn(`[n8n Webhook] Warning: Server returned status ${response.status}`);
    } else {
      console.log(`[n8n Webhook] Dispatched event "${event}" successfully.`);
    }
  } catch (err) {
    console.error(`[n8n Webhook] Dispatch error for event "${event}":`, err.message);
  }
}

app.use(cors());
app.use(express.json());

// Root redirect to Vite Frontend dev server
app.get("/", (req, res) => {
  res.redirect("http://localhost:5173");
});

// API: Get candidates
app.get("/api/candidates", async (req, res) => {
  try {
    const list = await Candidate.find().sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Create candidate
app.post("/api/candidates", async (req, res) => {
  try {
    const { name, email, role, empId, stage, status } = req.body;
    const newCand = new Candidate({ name, email, role, empId, stage, status });
    const saved = await newCand.save();
    triggerN8nWebhook("candidate_onboarded", saved);
    res.json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Delete candidate
app.delete("/api/candidates", async (req, res) => {
  try {
    const { empId } = req.body;
    if (!empId) return res.status(400).json({ error: "empId is required" });
    const result = await Candidate.deleteOne({ empId });
    res.json({ success: true, deletedCount: result.deletedCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Get chat logs
app.get("/api/chat-logs", async (req, res) => {
  try {
    const portal = req.query.portal || "hr";
    const logs = await ChatLog.find({ portal }).sort({ createdAt: 1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Save chat log
app.post("/api/chat-logs", async (req, res) => {
  try {
    const { portal, sender, text } = req.body;
    const newMsg = new ChatLog({ portal, sender, text });
    const saved = await newMsg.save();
    res.json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Get memories
app.get("/api/memories", async (req, res) => {
  try {
    const list = await Memory.find().sort({ createdAt: -1 });
    res.json(list.map(m => m.text));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Save memory
app.post("/api/memories", async (req, res) => {
  try {
    const { text } = req.body;
    const existing = await Memory.findOne({ text });
    if (existing) {
      return res.json(existing);
    }
    const newMem = new Memory({ text });
    const saved = await newMem.save();
    res.json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Delete memory
app.delete("/api/memories", async (req, res) => {
  try {
    const { text } = req.body;
    const result = await Memory.deleteOne({ text });
    res.json({ success: true, deletedCount: result.deletedCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Full default employee roster with empIds and passcodes for all roles
const DEFAULT_EMPLOYEES = [
  { name: "Tamal Dey",  role: "CEO & Founder",           dept: "Executive (Human)",          empId: "EMP-2026-0001", type: "Full-Time",  passcode: "ceo" },
  { name: "clara",      role: "COO Operations Bot",       dept: "Operations (AI Agent)",      empId: "EMP-2026-0002", type: "Autonomous", passcode: "clara" },
  { name: "john",       role: "CTO Architecture Bot",     dept: "Engineering (AI Agent)",     empId: "EMP-2026-0003", type: "Autonomous", passcode: "john" },
  { name: "bill",       role: "Frontend Dev Bot",         dept: "Engineering (AI Agent)",     empId: "EMP-2026-0004", type: "Autonomous", passcode: "bill" },
  { name: "sarah",      role: "HR Operations Bot",        dept: "HR (AI Agent)",              empId: "EMP-2026-0005", type: "Autonomous", passcode: "sarah" },
  { name: "alex",       role: "Lead Product Manager",     dept: "Product (AI Agent)",         empId: "EMP-2026-0006", type: "Autonomous", passcode: "alex" },
  { name: "lisa",       role: "Lead UI/UX Designer",      dept: "Design (AI Agent)",          empId: "EMP-2026-0007", type: "Autonomous", passcode: "lisa" },
  { name: "kevin",      role: "Lead QA Tester",           dept: "QA (AI Agent)",              empId: "EMP-2026-0008", type: "Autonomous", passcode: "kevin" },
  { name: "rachel",     role: "Lead Marketing Manager",   dept: "Marketing (AI Agent)",       empId: "EMP-2026-0009", type: "Autonomous", passcode: "rachel" },
  { name: "harvey",     role: "Lead Legal Counsel",       dept: "Legal (AI Agent)",           empId: "EMP-2026-0010", type: "Autonomous", passcode: "harvey" },
  { name: "antigravity", role: "AI Coding Assistant Bot",  dept: "Antigravity AI (AI Agent)",   empId: "EMP-2026-0011", type: "Autonomous", passcode: "antigravity" }
];

// On startup: seed employees if any have missing empId/passcode or CEO has the default passcode
// On startup: seed default employees if they are missing (preserves existing custom employees and passcode changes)
async function seedEmployees() {
  try {
    console.log("Checking and seeding default employees directory...");
    for (const defEmp of DEFAULT_EMPLOYEES) {
      const existing = await Employee.findOne({ empId: defEmp.empId });
      if (!existing) {
        const newEmp = new Employee(defEmp);
        await newEmp.save();
        console.log(`Seeded default employee: ${defEmp.name} (${defEmp.role})`);
      }
    }

    // Restore deleted custom employee Ayush Dey
    const ayushExist = await Employee.findOne({ empId: "EMP-2026-3254" });
    if (!ayushExist) {
      const ayush = new Employee({
        name: "Ayush Dey",
        role: "frontend developer",
        dept: "Engineering (AI Agent)",
        empId: "EMP-2026-3254",
        type: "Full-Time",
        passcode: "bb328RTS"
      });
      await ayush.save();
      console.log("Restored custom employee: Ayush Dey");
    }

    // Restore deleted custom employee Ankit Roy
    const ankitExist = await Employee.findOne({ empId: "EMP-2026-2596" });
    if (!ankitExist) {
      const ankit = new Employee({
        name: "Ankit Roy",
        role: "Devop",
        dept: "Executive (Human)",
        empId: "EMP-2026-2596",
        type: "Full-Time",
        passcode: "8ballpool"
      });
      await ankit.save();
      console.log("Restored custom employee: Ankit Roy");
    }

    console.log("Employee directory seeding checks completed.");
  } catch (err) {
    console.error("Error seeding employees:", err.message);
  }
}

// API: Get employees
app.get("/api/employees", async (req, res) => {
  try {
    const list = await Employee.find().sort({ createdAt: 1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Get attendance logs
app.get("/api/attendance", async (req, res) => {
  try {
    const list = await Attendance.find().sort({ loginTime: -1 }).limit(100);
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Lookup a single employee by role keyword (used for sidebar profile display)
app.get("/api/employees/by-role", async (req, res) => {
  try {
    const { role } = req.query; // e.g. ?role=ceo
    if (!role) return res.status(400).json({ error: "role query param required" });

    const roleMap = {
      ceo:       "CEO & Founder",
      coo:       "COO Operations Bot",
      cto:       "CTO Architecture Bot",
      hr:        "HR Operations Bot",
      product:   "Lead Product Manager",
      uiux:      "Lead UI/UX Designer",
      qa:        "Lead QA Tester",
      marketing: "Lead Marketing Manager",
      legal:     "Lead Legal Counsel",
    };

    const targetRole = roleMap[role.toLowerCase()];
    if (!targetRole) return res.status(404).json({ error: "Unknown role" });

    const emp = await Employee.findOne({ role: targetRole });
    if (!emp) return res.status(404).json({ error: "Employee not found" });

    res.json({ name: emp.name, empId: emp.empId, role: emp.role, dept: emp.dept, type: emp.type });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Login verification
app.post("/api/login", async (req, res) => {
  try {
    const { username, passcode, profileType } = req.body;
    if (!passcode) {
      return res.status(400).json({ error: "Passcode is required" });
    }

    const trimmedPasscode = passcode.trim();

    if (profileType === "ceo") {
      const ceo = await Employee.findOne({ role: "CEO & Founder" });
      if (!ceo) {
        return res.status(404).json({ error: "CEO profile not found in database." });
      }
      if (ceo.passcode && ceo.passcode.trim().toLowerCase() === trimmedPasscode.toLowerCase()) {
        return res.json({ success: true, user: ceo });
      } else {
        return res.status(401).json({ error: "Invalid CEO passcode." });
      }
    } else {
      if (!username || !username.trim()) {
        return res.status(400).json({ error: "Employee ID is required for employee login." });
      }
      const trimmedId = username.trim();
      const emp = await Employee.findOne({ empId: new RegExp(`^${trimmedId}$`, "i") });
      if (!emp) {
        return res.status(404).json({ error: `Staff member with Employee ID "${username}" not found.` });
      }
      if (emp.passcode && emp.passcode.trim().toLowerCase() === trimmedPasscode.toLowerCase()) {
        // Log auto attendance (once per day)
        try {
          const startOfToday = new Date();
          startOfToday.setHours(0, 0, 0, 0);

          const endOfToday = new Date();
          endOfToday.setHours(23, 59, 59, 999);

          const existingLog = await Attendance.findOne({
            empId: emp.empId,
            loginTime: { $gte: startOfToday, $lte: endOfToday }
          });

          if (!existingLog) {
            const attendance = new Attendance({
              empId: emp.empId,
              name: emp.name,
              role: emp.role,
              status: "Present",
              loginTime: new Date()
            });
            const savedLog = await attendance.save();
            triggerN8nWebhook("employee_clock_in", savedLog);
          } else {
            existingLog.status = "Present";
            existingLog.loginTime = new Date();
            const savedLog = await existingLog.save();
            triggerN8nWebhook("employee_clock_in", savedLog);
          }
        } catch (attErr) {
          console.error("Error creating/updating attendance log:", attErr);
        }
        return res.json({ success: true, user: emp });
      } else {
        return res.status(401).json({ error: "Invalid passcode for employee workspace." });
      }
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Create employee (auto-generate empId and passcode if not provided)
app.post("/api/employees", async (req, res) => {
  try {
    const { name, role, dept, type, empId, passcode } = req.body;
    if (!name || !role || !dept) {
      return res.status(400).json({ error: "Missing required fields: name, role, dept" });
    }
    const generatedEmpId = empId || ("EMP-" + new Date().getFullYear() + "-" + Math.floor(1000 + Math.random() * 9000));
    const generatedPasscode = passcode || "employee";
    const newEmp = new Employee({ 
      name, 
      role, 
      dept, 
      type: type || "Full-Time", 
      empId: generatedEmpId,
      passcode: generatedPasscode
    });
    const saved = await newEmp.save();
    triggerN8nWebhook("employee_created", saved);
    res.json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Change employee passcode
app.post("/api/employees/change-passcode", async (req, res) => {
  try {
    const { empId, oldPasscode, newPasscode } = req.body;
    if (!empId || !oldPasscode || !newPasscode) {
      return res.status(400).json({ error: "Missing required fields: empId, oldPasscode, newPasscode" });
    }

    const emp = await Employee.findOne({ empId });
    if (!emp) {
      return res.status(404).json({ error: "Employee profile not found." });
    }

    if (emp.passcode !== oldPasscode.trim()) {
      return res.status(401).json({ error: "Current passcode is incorrect." });
    }

    emp.passcode = newPasscode.trim();
    await emp.save();

    res.json({ success: true, message: "Passcode updated successfully." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Update employee type (AI vs Human)
app.post("/api/employees/update-type", async (req, res) => {
  try {
    const { empId, type } = req.body;
    if (!empId || !type) {
      return res.status(400).json({ error: "Missing required fields: empId, type" });
    }

    const emp = await Employee.findOne({ empId });
    if (!emp) {
      return res.status(404).json({ error: "Employee profile not found." });
    }

    emp.type = type.trim();
    await emp.save();

    res.json({ success: true, message: "Employee type updated successfully.", user: emp });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Logout attendance update
app.post("/api/logout", async (req, res) => {
  try {
    const { empId } = req.body;
    if (!empId) {
      return res.status(400).json({ error: "empId is required" });
    }

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const existingLog = await Attendance.findOne({
      empId: empId,
      loginTime: { $gte: startOfToday, $lte: endOfToday }
    });

    if (existingLog) {
      existingLog.status = "Left";
      const savedLog = await existingLog.save();
      triggerN8nWebhook("employee_clock_out", savedLog);
      return res.json({ success: true, message: "Attendance status updated to Left." });
    }

    res.json({ success: true, message: "No attendance log found to update." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Helper for Goal Planning and Dialogue Simulation
async function callAI(systemPrompt, userPrompt) {
  const activeKey = process.env.VITE_API_KEY_ENGINEER || process.env.VITE_API_KEY_CEO;
  const isGemini = !process.env.VITE_API_KEY_ENGINEER && process.env.VITE_API_KEY_CEO;

  if (!activeKey) {
    console.log("[server] No API key configured, using mock fallback.");
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
          generationConfig: { maxOutputTokens: 2048 }
        })
      });
      if (response.ok) {
        const resJson = await response.json();
        return resJson.candidates?.[0]?.content?.parts?.[0]?.text;
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
        return resJson.choices?.[0]?.message?.content;
      }
    }
  } catch (err) {
    console.error("[server] AI API call failed:", err);
  }
  return null;
}

function getChannelForDept(dept) {
  const clean = dept.toLowerCase();
  if (clean.includes("frontend") || clean.includes("backend") || clean.includes("database") || clean.includes("engineering") || clean.includes("devops") || clean.includes("cybersecurity") || clean.includes("ml") || clean.includes("antigravity")) {
    return "#engineering";
  }
  if (clean.includes("product") || clean.includes("ux") || clean.includes("design") || clean.includes("qa")) {
    return "#product";
  }
  if (clean.includes("coo") || clean.includes("operations") || clean.includes("hr") || clean.includes("finance") || clean.includes("marketing") || clean.includes("sales") || clean.includes("legal") || clean.includes("customer")) {
    return "#operations";
  }
  return "#general";
}

// API: Create Autonomous Project & Route Tasks
app.post("/api/projects/create-autonomous", async (req, res) => {
  try {
    const { goal } = req.body;
    if (!goal) {
      return res.status(400).json({ error: "goal is required" });
    }

    const newProject = new Project({
      name: goal,
      description: `Autonomous project to realize: ${goal}`,
      status: "Active",
      progress: 0,
      health: 100
    });
    const project = await newProject.save();

    const systemPrompt = `You are an AI Project Manager. Decompose the user's high-level goal into a list of 6 to 10 structured tasks assigned to different departments.
Available departments: CEO Office, COO Operations, CTO Engineering, Product Management, UI/UX Design, Frontend Development, Backend Development, Database Engineering, DevOps & Infrastructure, AI/ML Department, Quality Assurance, Cybersecurity, Finance, HR, Marketing, Sales, Legal & Compliance, Customer Support, Research & Strategy, Antigravity AI.
You must output ONLY a raw JSON array of task objects (no markdown fences, no explanations).
Each task object must have:
- "title": concise task name
- "description": description of work
- "department": exact name of assigned department (must match one of the available departments)
- "priority": "Low", "Medium", or "High"
- "complexity": "Simple", "Moderate", or "Complex"
- "deadlineOffsetDays": integer representing how many days from now this task should be completed (e.g. 1, 2, 3)
`;

    let generatedTasks = [];
    const aiResponse = await callAI(systemPrompt, goal);
    if (aiResponse) {
      try {
        let cleanText = aiResponse.trim();
        if (cleanText.startsWith("```")) {
          cleanText = cleanText.replace(/^```json\s*/, "").replace(/^```\s*/, "").replace(/\s*```$/, "");
        }
        generatedTasks = JSON.parse(cleanText);
      } catch (err) {
        console.error("[server] Failed to parse AI response JSON, using mock fallback.", err);
      }
    }

    if (!generatedTasks || generatedTasks.length === 0) {
      generatedTasks = [
        { title: `Define requirements & specifications for ${goal}`, description: "Draft the Product Requirements Document (PRD) and align on project scope.", department: "Product Management", priority: "High", complexity: "Moderate", deadlineOffsetDays: 1 },
        { title: `Design user flows & mockups for ${goal}`, description: "Build high-fidelity wireframes, styling schemas and glassmorphic UI designs.", department: "UI/UX Design", priority: "High", complexity: "Complex", deadlineOffsetDays: 2 },
        { title: `Setup database models for ${goal}`, description: "Define collections, Mongoose schemas, and indexing strategies.", department: "Database Engineering", priority: "Medium", complexity: "Simple", deadlineOffsetDays: 3 },
        { title: `Develop backend APIs for ${goal}`, description: "Build express REST endpoints, middleware controllers and service handlers.", department: "Backend Development", priority: "High", complexity: "Moderate", deadlineOffsetDays: 4 },
        { title: `Implement React user interface for ${goal}`, description: "Build modern glassmorphic dashboard views and tie with APIs.", department: "Frontend Development", priority: "High", complexity: "Complex", deadlineOffsetDays: 5 },
        { title: `Integrate AI reasoning pipeline for ${goal}`, description: "Connect department agents to simulation environment.", department: "AI/ML Department", priority: "Medium", complexity: "Complex", deadlineOffsetDays: 6 },
        { title: `Perform system verification & QA for ${goal}`, description: "Execute unit and integration test scripts and report blockers.", department: "Quality Assurance", priority: "High", complexity: "Moderate", deadlineOffsetDays: 7 },
        { title: `Deploy & launch ${goal}`, description: "Configure production CI/CD deployments and dispatch live event hooks.", department: "DevOps & Infrastructure", priority: "Medium", complexity: "Simple", deadlineOffsetDays: 8 }
      ];
    }

    const savedTasks = [];
    let prevTaskId = null;

    for (let i = 0; i < generatedTasks.length; i++) {
      const gt = generatedTasks[i];
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + (gt.deadlineOffsetDays || 1));

      const newTask = new Task({
        projectId: project._id,
        title: gt.title,
        description: gt.description || "",
        department: gt.department || "COO Operations",
        priority: gt.priority || "Medium",
        complexity: gt.complexity || "Moderate",
        status: "Backlog",
        dependencies: prevTaskId ? [prevTaskId] : [],
        deadline
      });

      const saved = await newTask.save();
      savedTasks.push(saved);
      prevTaskId = saved._id.toString();
    }

    const announceMsg = new Message({
      projectId: project._id,
      sender: "CEO Office",
      text: `Hello team, we have initialized a new company objective: "${goal}". I have mapped out the task sequence and assigned tasks to departments. Let's begin autonomous execution immediately!`,
      channel: "#general"
    });
    await announceMsg.save();

    triggerN8nWebhook("project_created", { project, tasks: savedTasks });

    res.json({ project, tasks: savedTasks });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Get projects
app.get("/api/projects", async (req, res) => {
  try {
    const list = await Project.find().sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Delete project
app.delete("/api/projects", async (req, res) => {
  try {
    const projectId = req.query.id || req.body.id || req.query.projectId || req.body.projectId;
    if (!projectId) {
      return res.status(400).json({ error: "id is required" });
    }
    await Project.deleteOne({ _id: projectId });
    await Task.deleteOne({ projectId });
    await Message.deleteOne({ projectId });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Get tasks
app.get("/api/tasks", async (req, res) => {
  try {
    const { projectId } = req.query;
    const filter = projectId ? { projectId } : {};
    const list = await Task.find(filter).sort({ createdAt: 1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Get project messages
app.get("/api/messages", async (req, res) => {
  try {
    const { projectId, channel } = req.query;
    const filter = {};
    if (projectId) filter.projectId = projectId;
    if (channel) filter.channel = channel;
    const list = await Message.find(filter).sort({ createdAt: 1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Send manual message
app.post("/api/messages", async (req, res) => {
  try {
    const { projectId, sender, text, channel } = req.body;
    if (!projectId || !sender || !text || !channel) {
      return res.status(400).json({ error: "projectId, sender, text, and channel are required" });
    }
    const newMsg = new Message({ projectId, sender, text, channel });
    const saved = await newMsg.save();
    res.json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Get company metrics
app.get("/api/metrics", async (req, res) => {
  try {
    const tasks = await Task.find();
    const active = tasks.filter(t => t.status !== "Completed").length;
    const completed = tasks.filter(t => t.status === "Completed").length;
    
    const healthScore = Math.max(65, 100 - active * 2);
    
    const uniqueDepts = new Set(tasks.filter(t => t.status !== "Completed").map(t => t.department));
    const teamUtilization = Math.min(100, Math.round((uniqueDepts.size / 19) * 100));
    
    res.json({
      activeTasks: active,
      completedTasks: completed,
      teamUtilization: teamUtilization || 15,
      healthScore: healthScore || 98,
      timestamp: new Date()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Simulate chat dialogue & advance task progress
app.post("/api/projects/simulate-chat", async (req, res) => {
  try {
    const { projectId } = req.body;
    if (!projectId) {
      return res.status(400).json({ error: "projectId is required" });
    }

    const project = await Project.findOne({ _id: projectId });
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    const tasks = await Task.find({ projectId });
    const incompleteTasks = tasks.filter(t => t.status !== "Completed");

    if (incompleteTasks.length === 0) {
      const compMsg = new Message({
        projectId,
        sender: "CEO Office",
        text: `Objective "${project.name}" has been fully completed! Congratulations to all departments on a successful autonomous run.`,
        channel: "#general"
      });
      const savedMsg = await compMsg.save();

      project.status = "Completed";
      project.progress = 100;
      await project.save();

      triggerN8nWebhook("project_completed", { project });

      return res.json({ message: savedMsg, project, task: null });
    }

    const activeTask = incompleteTasks[0];
    const prevStatus = activeTask.status;
    let nextStatus = "In-Progress";

    if (prevStatus === "Backlog") {
      nextStatus = "In-Progress";
    } else if (prevStatus === "In-Progress") {
      nextStatus = "Review";
    } else if (prevStatus === "Review") {
      nextStatus = "Completed";
    }

    activeTask.status = nextStatus;
    const updatedTask = await activeTask.save();

    const updatedTasks = await Task.find({ projectId });
    const completedCount = updatedTasks.filter(t => t.status === "Completed").length;
    const progress = Math.round((completedCount / updatedTasks.length) * 100);

    project.progress = progress;
    if (progress === 100) {
      project.status = "Completed";
    }
    await project.save();

    const sysPrompt = `You are the AI bot representing the "${activeTask.department}" department in a company messaging room.
You are working on the project "${project.name}".
Your current task is: "${activeTask.title}" (${activeTask.description}).
You are updating the status of this task from "${prevStatus}" to "${nextStatus}".
If your task involves implementing code, UI design layouts, schemas, or configurations, you must write the file content wrapped inside:
<create_file path="FILENAME">
FILE_CONTENT
</create_file>
Write a concise, professional message (under 3 lines) to post in the channel explaining your progress, next steps, or that you've finished the task.
Output ONLY the raw message content. Do not include quotes or emojis.`;

    let dialogueText = null;
    const aiResponse = await callAI(sysPrompt, `Task: ${activeTask.title}, moving from ${prevStatus} to ${nextStatus}.`);
    if (aiResponse) {
      dialogueText = aiResponse.trim();
      
      // Parse any created files in simulation
      const sandboxDir = path.join(process.cwd(), "../sandbox");
      if (!fs.existsSync(sandboxDir)) {
        fs.mkdirSync(sandboxDir, { recursive: true });
      }
      
      const fileRegex = /<create_file\s+path=["']([^"']+)["']\s*>([\s\S]*?)<\/create_file>/g;
      let match;
      fileRegex.lastIndex = 0;
      while ((match = fileRegex.exec(aiResponse)) !== null) {
        const filepath = match[1].replace(/[^a-zA-Z0-9_.-]/g, "");
        const content = match[2].trim();
        if (filepath) {
          fs.writeFileSync(path.join(sandboxDir, filepath), content, "utf8");
        }
      }
      
      dialogueText = dialogueText.replace(fileRegex, (m, filepath) => {
        return `[Staged File: ${filepath}]`;
      });
    }

    if (!dialogueText) {
      if (nextStatus === "In-Progress") {
        dialogueText = `Analyzing scope for task "${activeTask.title}". We are setting up dependencies and starting implementation today.`;
      } else if (nextStatus === "Review") {
        dialogueText = `Draft version of "${activeTask.title}" is complete. We've initiated internally-audited reviews and checks.`;
      } else {
        dialogueText = `Task "${activeTask.title}" has been successfully completed and verified. Moving on to subsequent tasks in the queue.`;
      }
    }

    const channel = getChannelForDept(activeTask.department);

    const chatMsg = new Message({
      projectId,
      sender: `${activeTask.department} Bot`,
      text: dialogueText,
      channel
    });
    const savedMsg = await chatMsg.save();

    triggerN8nWebhook("simulation_step", {
      projectId,
      message: savedMsg,
      task: updatedTask,
      projectProgress: progress
    });

    res.json({ message: savedMsg, project, task: updatedTask });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Antigravity direct chat endpoint
app.post("/api/antigravity/chat", async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message) {
      return res.status(400).json({ error: "message is required" });
    }

    const aiResponse = await callCodingAssistant(message, history);
    
    // Parse files staged inside <create_file path="...">...</create_file>
    const sandboxDir = path.join(process.cwd(), "../sandbox");
    if (!fs.existsSync(sandboxDir)) {
      fs.mkdirSync(sandboxDir, { recursive: true });
    }

    const fileRegex = /<create_file\s+path=["']([^"']+)["']\s*>([\s\S]*?)<\/create_file>/g;
    let match;
    const stagedFiles = [];

    // Reset regex index
    fileRegex.lastIndex = 0;
    while ((match = fileRegex.exec(aiResponse)) !== null) {
      const filepath = match[1].replace(/[^a-zA-Z0-9_.-]/g, ""); // sanitize
      const content = match[2].trim();
      
      if (filepath) {
        fs.writeFileSync(path.join(sandboxDir, filepath), content, "utf8");
        stagedFiles.push({ filename: filepath });
      }
    }

    // Clean XML blocks from the text sent back to chat
    const cleanedText = aiResponse.replace(fileRegex, (m, filepath) => {
      return `[Staged File: ${filepath}]`;
    });

    res.json({ text: cleanedText, stagedFiles });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Get sandbox files
app.get("/api/antigravity/sandbox", async (req, res) => {
  try {
    const sandboxDir = path.join(process.cwd(), "../sandbox");
    if (!fs.existsSync(sandboxDir)) {
      return res.json([]);
    }

    const files = fs.readdirSync(sandboxDir);
    const result = [];

    for (const file of files) {
      const filePath = path.join(sandboxDir, file);
      const stat = fs.statSync(filePath);
      if (stat.isFile()) {
        const content = fs.readFileSync(filePath, "utf8");
        result.push({ name: file, content });
      }
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Merge sandbox file to production public/ folder
app.post("/api/antigravity/merge", async (req, res) => {
  try {
    const { filename } = req.body;
    if (!filename) {
      return res.status(400).json({ error: "filename is required" });
    }

    const cleanName = filename.replace(/[^a-zA-Z0-9_.-]/g, "");
    const sandboxPath = path.join(process.cwd(), "../sandbox", cleanName);
    const productionPath = path.join(process.cwd(), "../public", cleanName);

    if (!fs.existsSync(sandboxPath)) {
      return res.status(404).json({ error: `File "${cleanName}" not found in sandbox.` });
    }

    const content = fs.readFileSync(sandboxPath, "utf8");
    fs.writeFileSync(productionPath, content, "utf8");

    res.json({ success: true, url: `http://localhost:5173/${cleanName}`, filename: cleanName });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Dynamic File Deployment
app.post("/api/deploy-file", async (req, res) => {
  try {
    const { filename, directive, keys } = req.body;
    if (!filename || !directive) {
      return res.status(400).json({ error: "filename and directive are required" });
    }

    // Clean up filename to be safe
    let cleanName = filename.replace(/[^a-zA-Z0-9_.-]/g, "");
    if (!cleanName.endsWith(".html") && !cleanName.endsWith(".js") && !cleanName.endsWith(".css")) {
      cleanName += ".html";
    }

    const publicDir = path.join(process.cwd(), "../public");
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    const filePath = path.join(publicDir, cleanName);
    
    // Call compileHTML function to perform AI generation or dynamic fallback
    const generatedContent = await compileHTML(directive, cleanName, keys);

    fs.writeFileSync(filePath, generatedContent, "utf8");
    res.json({ success: true, url: `http://localhost:5173/${cleanName}`, filename: cleanName });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, async () => {
  console.log(`AACE Full-Stack API server is running on http://localhost:${PORT}`);
  await dbReady;  // Wait for MongoDB to connect before seeding
  await seedEmployees();
});