// AACE Shared API Layer & LocalStorage Database Fallback for React

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
  { name: "Ayush Dey",  role: "frontend developer",       dept: "Engineering (AI Agent)",     empId: "EMP-2026-3254", type: "Full-Time",  passcode: "bb328RTS" },
  { name: "Ankit Roy",  role: "Devop",                    dept: "Executive (Human)",          empId: "EMP-2026-2596", type: "Full-Time",  passcode: "8ballpool" }
];

const DEFAULT_MEMORIES = [
  "Engineering stack parameters are bound to Vite + React + Node.js.",
  "Internal databases are hosted on SQL/NoSQL containers under strict IAM control.",
  "Compliance rules require W-9 and NDA verification for all contract vendors.",
  "Maximum discount thresholds for account representatives is capped at 15%.",
  "Customer support triage paths must always maintain a direct escalation link to human agents."
];

const DEFAULT_CANDIDATES = [
  { name: "Sarah Jenkins", role: "Frontend Developer", email: "s.jenkins@aace-agent.io", empId: "EMP-2026-8942", stage: "Technical Interview", status: "Active" },
  { name: "Marcus Chen", role: "Backend Developer", email: "m.chen@aace-agent.io", empId: "EMP-2026-3105", stage: "Architectural Review", status: "Active" }
];

function initLocalStorageDb() {
  if (typeof window === "undefined") return;
  if (!localStorage.getItem("aace_local_employees")) {
    localStorage.setItem("aace_local_employees", JSON.stringify(DEFAULT_EMPLOYEES));
  }
  if (!localStorage.getItem("aace_local_attendance")) {
    localStorage.setItem("aace_local_attendance", JSON.stringify([]));
  }
  if (!localStorage.getItem("aace_memories")) {
    localStorage.setItem("aace_memories", JSON.stringify(DEFAULT_MEMORIES));
  }
  if (!localStorage.getItem("aace_candidates")) {
    localStorage.setItem("aace_candidates", JSON.stringify(DEFAULT_CANDIDATES));
  }
  if (!localStorage.getItem("aace_chat_logs")) {
    localStorage.setItem("aace_chat_logs", JSON.stringify([]));
  }
  if (!localStorage.getItem("aace_projects")) {
    localStorage.setItem("aace_projects", JSON.stringify([]));
  }
  if (!localStorage.getItem("aace_tasks")) {
    localStorage.setItem("aace_tasks", JSON.stringify([]));
  }
  if (!localStorage.getItem("aace_messages")) {
    localStorage.setItem("aace_messages", JSON.stringify([]));
  }
  if (!localStorage.getItem("aace_api_url") || localStorage.getItem("aace_api_url") === "http://localhost:3001") {
    localStorage.setItem("aace_api_url", "https://aace-engine.onrender.com");
  }
  // Reset offline mode to false on page load/initialization so connection is always re-attempted
  localStorage.setItem("aace_offline_mode", "false");
}
initLocalStorageDb();

export const AaceApi = {
  onModeChange: null,

  getApiBaseUrl() {
    if (typeof window === "undefined") return "https://aace-engine.onrender.com";
    return localStorage.getItem("aace_api_url") || "https://aace-engine.onrender.com";
  },

  setApiBaseUrl(url) {
    if (typeof window === "undefined") return;
    localStorage.setItem("aace_api_url", url);
  },

  isOfflineMode() {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("aace_offline_mode") === "true";
  },

  setOfflineMode(active) {
    if (typeof window === "undefined") return;
    localStorage.setItem("aace_offline_mode", active ? "true" : "false");
    if (this.onModeChange) {
      this.onModeChange(active);
    }
  },

  async request(endpoint, options = {}) {
    const isOffline = this.isOfflineMode();
    const baseUrl = this.getApiBaseUrl();
    
    // Parse path to check if it's absolute or relative
    let url = endpoint;
    if (endpoint.startsWith("/")) {
      url = baseUrl + endpoint;
    }

    if (!isOffline) {
      try {
        const res = await fetch(url, options);
        if (res.ok) {
          return await res.json();
        }
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP error! status: ${res.status}`);
      } catch (err) {
        // Only failover to local database on Network Error
        if (err instanceof TypeError || err.message.includes("Failed to fetch") || err.message.includes("NetworkError")) {
          console.warn(`Connection to API server ${baseUrl} failed. Switching to Browser Local Offline Database.`);
          this.setOfflineMode(true);
          return this.fallbackRequest(endpoint, options);
        }
        throw err;
      }
    } else {
      return this.fallbackRequest(endpoint, options);
    }
  },

  fallbackRequest(endpoint, options = {}) {
    const method = (options.method || "GET").toUpperCase();
    const body = options.body ? JSON.parse(options.body) : {};
    
    // Parse query params for endpoint matching
    const urlObj = new URL(endpoint, "http://local-fallback.aace");
    const pathname = urlObj.pathname;
    
    if (pathname === "/api/login" && method === "POST") {
      const { username, passcode, profileType } = body;
      const emps = JSON.parse(localStorage.getItem("aace_local_employees") || "[]");

      if (profileType === "ceo") {
        const ceo = emps.find(e => e.role === "CEO & Founder");
        if (ceo && ceo.passcode === passcode) {
          return { success: true, user: ceo, offline: true };
        }
        throw new Error("Invalid CEO passcode.");
      } else {
        const emp = emps.find(e => e.empId.toLowerCase() === username.trim().toLowerCase());
        if (!emp) {
          throw new Error(`Employee with ID "${username}" not found.`);
        }
        if (emp.passcode !== passcode) {
          throw new Error("Invalid passcode for employee workspace.");
        }
        // Log attendance locally
        this.logAttendanceLocal(emp);
        return { success: true, user: emp, offline: true };
      }
    }

    if (pathname === "/api/logout" && method === "POST") {
      const { empId } = body;
      const logs = JSON.parse(localStorage.getItem("aace_local_attendance") || "[]");
      const today = new Date().toDateString();
      const log = logs.find(l => l.empId === empId && new Date(l.loginTime).toDateString() === today);
      if (log) {
        log.status = "Left";
        localStorage.setItem("aace_local_attendance", JSON.stringify(logs));
      }
      return { success: true, message: "Logged out locally." };
    }

    if (pathname === "/api/employees") {
      if (method === "GET") {
        return JSON.parse(localStorage.getItem("aace_local_employees") || "[]");
      }
      if (method === "POST") {
        const emps = JSON.parse(localStorage.getItem("aace_local_employees") || "[]");
        // Generate new Emp ID
        const maxId = emps.reduce((max, e) => {
          const m = e.empId.match(/EMP-2026-(\d+)/);
          return m ? Math.max(max, parseInt(m[1])) : max;
        }, 0);
        const nextIdStr = String(maxId + 1).padStart(4, "0");
        const newEmp = {
          ...body,
          empId: body.empId || `EMP-2026-${nextIdStr}`,
          type: body.type || "Full-Time"
        };
        emps.push(newEmp);
        localStorage.setItem("aace_local_employees", JSON.stringify(emps));
        return newEmp;
      }
    }

    if (pathname === "/api/employees/update-type" && method === "POST") {
      const { empId, type } = body;
      const emps = JSON.parse(localStorage.getItem("aace_local_employees") || "[]");
      const emp = emps.find(e => e.empId === empId);
      if (!emp) throw new Error("Employee not found.");
      emp.type = type;
      localStorage.setItem("aace_local_employees", JSON.stringify(emps));
      return { success: true, user: emp };
    }

    if (pathname === "/api/employees/change-passcode" && method === "POST") {
      const { empId, oldPasscode, newPasscode } = body;
      const emps = JSON.parse(localStorage.getItem("aace_local_employees") || "[]");
      const emp = emps.find(e => e.empId === empId);
      if (!emp) throw new Error("Employee not found.");
      if (emp.passcode !== oldPasscode) throw new Error("Incorrect current passcode.");
      emp.passcode = newPasscode;
      localStorage.setItem("aace_local_employees", JSON.stringify(emps));
      
      // Update logged-in session user info
      const activeUser = JSON.parse(localStorage.getItem("aace_user_info") || "null");
      if (activeUser && activeUser.empId === empId) {
        activeUser.passcode = newPasscode;
        localStorage.setItem("aace_user_info", JSON.stringify(activeUser));
      }
      return { success: true, message: "Passcode updated successfully in localStorage." };
    }

    if (pathname === "/api/attendance" && method === "GET") {
      return JSON.parse(localStorage.getItem("aace_local_attendance") || "[]");
    }

    if (pathname === "/api/memories") {
      const memories = JSON.parse(localStorage.getItem("aace_memories") || "[]");
      if (method === "GET") {
        return memories;
      }
      if (method === "POST") {
        const { text } = body;
        if (!memories.includes(text)) {
          memories.push(text);
          localStorage.setItem("aace_memories", JSON.stringify(memories));
        }
        return { success: true, text };
      }
      if (method === "DELETE") {
        const { text } = body;
        const filtered = memories.filter(m => m !== text);
        localStorage.setItem("aace_memories", JSON.stringify(filtered));
        return { success: true };
      }
    }

    if (pathname === "/api/candidates") {
      const candidates = JSON.parse(localStorage.getItem("aace_candidates") || "[]");
      if (method === "GET") {
        return candidates;
      }
      if (method === "POST") {
        const nextId = "EMP-2026-" + Math.floor(1000 + Math.random() * 9000);
        const newCand = {
          ...body,
          empId: body.empId || nextId,
          stage: body.stage || "Applied",
          status: body.status || "Active"
        };
        candidates.unshift(newCand);
        localStorage.setItem("aace_candidates", JSON.stringify(candidates));
        return newCand;
      }
      if (method === "DELETE") {
        const { empId } = body || {};
        const filtered = candidates.filter(c => c.empId !== empId);
        localStorage.setItem("aace_candidates", JSON.stringify(filtered));
        return { success: true, deletedCount: candidates.length - filtered.length };
      }
    }

    if (pathname === "/api/chat-logs") {
      const chatLogs = JSON.parse(localStorage.getItem("aace_chat_logs") || "[]");
      if (method === "GET") {
        const portal = urlObj.searchParams.get("portal") || "ceo";
        return chatLogs.filter(log => log.portal === portal);
      }
      if (method === "POST") {
        const newLog = {
          ...body,
          createdAt: new Date().toISOString()
        };
        chatLogs.push(newLog);
        localStorage.setItem("aace_chat_logs", JSON.stringify(chatLogs));
        return newLog;
      }
    }

    if (pathname === "/api/deploy-file" && method === "POST") {
      const { filename, directive } = body;
      console.log(`[Offline Compiler React] Generating fallback for: "${directive}"`);
      const content = this.generateOfflineHTMLFallback(directive, filename);
      
      // Trigger a browser file download of the compiled page!
      const blob = new Blob([content], { type: "text/html" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      return {
        success: true,
        filename: filename,
        url: link.href, // Blob URL
        offline: true,
        downloadTriggered: true
      };
    }

    if (pathname === "/api/projects/create-autonomous" && method === "POST") {
      const { goal } = body;
      const projects = JSON.parse(localStorage.getItem("aace_projects") || "[]");
      const tasks = JSON.parse(localStorage.getItem("aace_tasks") || "[]");
      const messages = JSON.parse(localStorage.getItem("aace_messages") || "[]");

      const projectId = "PROJ-" + Math.floor(1000 + Math.random() * 9000);
      const newProj = {
        _id: projectId,
        name: goal,
        description: `Autonomous project to realize: ${goal}`,
        status: "Active",
        progress: 0,
        health: 100,
        createdAt: new Date().toISOString()
      };
      projects.unshift(newProj);
      localStorage.setItem("aace_projects", JSON.stringify(projects));

      const defaultTasks = [
        { title: `Define requirements & specifications for ${goal}`, description: "Draft the Product Requirements Document (PRD) and align on project scope.", department: "Product Management", priority: "High", complexity: "Moderate", deadlineOffsetDays: 1 },
        { title: `Design user flows & mockups for ${goal}`, description: "Build high-fidelity wireframes, styling schemas and glassmorphic UI designs.", department: "UI/UX Design", priority: "High", complexity: "Complex", deadlineOffsetDays: 2 },
        { title: `Setup database models for ${goal}`, description: "Define collections, Mongoose schemas, and indexing strategies.", department: "Database Engineering", priority: "Medium", complexity: "Simple", deadlineOffsetDays: 3 },
        { title: `Develop backend APIs for ${goal}`, description: "Build express REST endpoints, middleware controllers and service handlers.", department: "Backend Development", priority: "High", complexity: "Moderate", deadlineOffsetDays: 4 },
        { title: `Implement React user interface for ${goal}`, description: "Build modern glassmorphic dashboard views and tie with APIs.", department: "Frontend Development", priority: "High", complexity: "Complex", deadlineOffsetDays: 5 },
        { title: `Integrate AI reasoning pipeline for ${goal}`, description: "Connect department agents to simulation environment.", department: "AI/ML Department", priority: "Medium", complexity: "Complex", deadlineOffsetDays: 6 },
        { title: `Perform system verification & QA for ${goal}`, description: "Execute unit and integration test scripts and report blockers.", department: "Quality Assurance", priority: "High", complexity: "Moderate", deadlineOffsetDays: 7 },
        { title: `Deploy & launch ${goal}`, description: "Configure production CI/CD deployments and dispatch live event hooks.", department: "DevOps & Infrastructure", priority: "Medium", complexity: "Simple", deadlineOffsetDays: 8 }
      ];

      const savedTasks = [];
      let prevTaskId = null;
      for (let i = 0; i < defaultTasks.length; i++) {
        const gt = defaultTasks[i];
        const deadline = new Date();
        deadline.setDate(deadline.getDate() + gt.deadlineOffsetDays);

        const taskId = "TASK-" + Math.floor(10000 + Math.random() * 90000);
        const newTask = {
          _id: taskId,
          projectId,
          title: gt.title,
          description: gt.description,
          department: gt.department,
          priority: gt.priority,
          complexity: gt.complexity,
          status: "Backlog",
          dependencies: prevTaskId ? [prevTaskId] : [],
          deadline: deadline.toISOString(),
          createdAt: new Date().toISOString()
        };
        tasks.push(newTask);
        savedTasks.push(newTask);
        prevTaskId = taskId;
      }
      localStorage.setItem("aace_tasks", JSON.stringify(tasks));

      const newMsg = {
        _id: "MSG-" + Math.floor(1000 + Math.random() * 9000),
        projectId,
        sender: "CEO Office",
        text: `Hello team, we have initialized a new company objective: "${goal}". I have mapped out the task sequence and assigned tasks to departments. Let's begin autonomous execution immediately!`,
        channel: "#general",
        createdAt: new Date().toISOString()
      };
      messages.push(newMsg);
      localStorage.setItem("aace_messages", JSON.stringify(messages));

      return { project: newProj, tasks: savedTasks, offline: true };
    }

    if (pathname === "/api/projects") {
      const projects = JSON.parse(localStorage.getItem("aace_projects") || "[]");
      if (method === "GET") {
        return projects;
      }
      if (method === "DELETE") {
        const projId = urlObj.searchParams.get("id") || body.id;
        if (!projId) throw new Error("id is required to delete project");

        const filteredProj = projects.filter(p => p._id !== projId);
        localStorage.setItem("aace_projects", JSON.stringify(filteredProj));

        const tasks = JSON.parse(localStorage.getItem("aace_tasks") || "[]");
        const filteredTasks = tasks.filter(t => t.projectId !== projId);
        localStorage.setItem("aace_tasks", JSON.stringify(filteredTasks));

        const messages = JSON.parse(localStorage.getItem("aace_messages") || "[]");
        const filteredMessages = messages.filter(m => m.projectId !== projId);
        localStorage.setItem("aace_messages", JSON.stringify(filteredMessages));

        return { success: true, offline: true };
      }
    }

    if (pathname === "/api/tasks" && method === "GET") {
      const tasks = JSON.parse(localStorage.getItem("aace_tasks") || "[]");
      const projId = urlObj.searchParams.get("projectId");
      if (projId) {
        return tasks.filter(t => t.projectId === projId);
      }
      return tasks;
    }

    if (pathname === "/api/messages") {
      const messages = JSON.parse(localStorage.getItem("aace_messages") || "[]");
      const projId = urlObj.searchParams.get("projectId");
      const chan = urlObj.searchParams.get("channel");
      let filtered = messages;
      if (projId) filtered = filtered.filter(m => m.projectId === projId);
      if (chan) filtered = filtered.filter(m => m.channel === chan);
      return filtered;
    }

    if (pathname === "/api/messages" && method === "POST") {
      const messages = JSON.parse(localStorage.getItem("aace_messages") || "[]");
      const newMsg = {
        ...body,
        _id: "MSG-" + Math.floor(1000 + Math.random() * 9000),
        createdAt: new Date().toISOString()
      };
      messages.push(newMsg);
      localStorage.setItem("aace_messages", JSON.stringify(messages));
      return newMsg;
    }

    if (pathname === "/api/metrics" && method === "GET") {
      const tasks = JSON.parse(localStorage.getItem("aace_tasks") || "[]");
      const active = tasks.filter(t => t.status !== "Completed").length;
      const completed = tasks.filter(t => t.status === "Completed").length;
      const healthScore = Math.max(65, 100 - active * 2);
      const uniqueDepts = new Set(tasks.filter(t => t.status !== "Completed").map(t => t.department));
      const teamUtilization = Math.min(100, Math.round((uniqueDepts.size / 19) * 100));

      return {
        activeTasks: active,
        completedTasks: completed,
        teamUtilization: teamUtilization || 15,
        healthScore: healthScore || 98,
        timestamp: new Date().toISOString(),
        offline: true
      };
    }

    if (pathname === "/api/projects/simulate-chat" && method === "POST") {
      const { projectId } = body;
      const projects = JSON.parse(localStorage.getItem("aace_projects") || "[]");
      const tasks = JSON.parse(localStorage.getItem("aace_tasks") || "[]");
      const messages = JSON.parse(localStorage.getItem("aace_messages") || "[]");

      const project = projects.find(p => p._id === projectId);
      if (!project) throw new Error("Project not found");

      const projTasks = tasks.filter(t => t.projectId === projectId);
      const incompleteTasks = projTasks.filter(t => t.status !== "Completed");

      if (incompleteTasks.length === 0) {
        const compMsg = {
          _id: "MSG-" + Math.floor(1000 + Math.random() * 9000),
          projectId,
          sender: "CEO Office",
          text: `Objective "${project.name}" has been fully completed! Congratulations to all departments on a successful autonomous run.`,
          channel: "#general",
          createdAt: new Date().toISOString()
        };
        messages.push(compMsg);
        localStorage.setItem("aace_messages", JSON.stringify(messages));

        project.status = "Completed";
        project.progress = 100;
        localStorage.setItem("aace_projects", JSON.stringify(projects));

        return { message: compMsg, project, task: null, offline: true };
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

      const taskIndex = tasks.findIndex(t => t._id === activeTask._id);
      if (taskIndex !== -1) {
        tasks[taskIndex].status = nextStatus;
      }
      localStorage.setItem("aace_tasks", JSON.stringify(tasks));

      const updatedProjTasks = tasks.filter(t => t.projectId === projectId);
      const completedCount = updatedProjTasks.filter(t => t.status === "Completed").length;
      const progress = Math.round((completedCount / updatedProjTasks.length) * 100);

      project.progress = progress;
      if (progress === 100) {
        project.status = "Completed";
      }
      localStorage.setItem("aace_projects", JSON.stringify(projects));

      const clean = activeTask.department.toLowerCase();
      let channel = "#general";
      if (clean.includes("frontend") || clean.includes("backend") || clean.includes("database") || clean.includes("engineering") || clean.includes("devops") || clean.includes("cybersecurity") || clean.includes("ml")) {
        channel = "#engineering";
      } else if (clean.includes("product") || clean.includes("ux") || clean.includes("design") || clean.includes("qa")) {
        channel = "#product";
      } else if (clean.includes("coo") || clean.includes("operations") || clean.includes("hr") || clean.includes("finance") || clean.includes("marketing") || clean.includes("sales") || clean.includes("legal") || clean.includes("customer")) {
        channel = "#operations";
      }

      let text = "";
      if (nextStatus === "In-Progress") {
        text = `Analyzing scope for task "${activeTask.title}". We are setting up dependencies and starting implementation today.`;
      } else if (nextStatus === "Review") {
        text = `Draft version of "${activeTask.title}" is complete. We've initiated internally-audited reviews and checks.`;
      } else {
        text = `Task "${activeTask.title}" has been successfully completed and verified. Moving on to subsequent tasks in the queue.`;
      }

      const chatMsg = {
        _id: "MSG-" + Math.floor(1000 + Math.random() * 9000),
        projectId,
        sender: `${activeTask.department} Bot`,
        text,
        channel,
        createdAt: new Date().toISOString()
      };
      messages.push(chatMsg);
      localStorage.setItem("aace_messages", JSON.stringify(messages));

      return { message: chatMsg, project, task: tasks[taskIndex], offline: true };
    }

    throw new Error(`Endpoint ${pathname} (${method}) not supported in offline mode.`);
  },

  logAttendanceLocal(emp) {
    const logs = JSON.parse(localStorage.getItem("aace_local_attendance") || "[]");
    const today = new Date().toDateString();
    let existing = logs.find(l => l.empId === emp.empId && new Date(l.loginTime).toDateString() === today);
    if (!existing) {
      logs.unshift({
        empId: emp.empId,
        name: emp.name,
        role: emp.role,
        status: "Present",
        loginTime: new Date().toISOString()
      });
    } else {
      existing.status = "Present";
      existing.loginTime = new Date().toISOString();
    }
    localStorage.setItem("aace_local_attendance", JSON.stringify(logs));
  },

  generateOfflineHTMLFallback(directive, filename) {
    const cleanTitle = directive.replace(/^(create|make|build|generate|design)\s+/i, "");
    const capitalizedTitle = cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1);
    const lower = directive.toLowerCase();
    let appContent = "";
    
    if (lower.includes("calc") || lower.includes("calculator")) {
      appContent = `
        <div class="glass-card" style="max-width: 360px; margin: 0 auto; text-align: center;">
          <h2 style="margin-bottom: 16px;">Calculator</h2>
          <input type="text" id="display" readonly value="0" style="text-align: right; font-size: 24px; padding: 12px; margin-bottom: 12px; font-family: monospace; color: #06b6d4;">
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px;">
            <button class="btn btn-secondary" onclick="press('7')">7</button>
            <button class="btn btn-secondary" onclick="press('8')">8</button>
            <button class="btn btn-secondary" onclick="press('9')">9</button>
            <button class="btn" style="background:#8b5cf6" onclick="press('/')">/</button>
            
            <button class="btn btn-secondary" onclick="press('4')">4</button>
            <button class="btn btn-secondary" onclick="press('5')">5</button>
            <button class="btn btn-secondary" onclick="press('6')">6</button>
            <button class="btn" style="background:#8b5cf6" onclick="press('*')">*</button>
            
            <button class="btn btn-secondary" onclick="press('1')">1</button>
            <button class="btn btn-secondary" onclick="press('2')">2</button>
            <button class="btn btn-secondary" onclick="press('3')">3</button>
            <button class="btn" style="background:#8b5cf6" onclick="press('-')">-</button>
            
            <button class="btn" style="background:#ef4444" onclick="press('C')">C</button>
            <button class="btn btn-secondary" onclick="press('0')">0</button>
            <button class="btn" style="background:#10b981" onclick="press('=')">=</button>
            <button class="btn" style="background:#8b5cf6" onclick="press('+')">+</button>
          </div>
        </div>
        <script>
          const disp = document.getElementById('display');
          function press(val) {
            if (val === 'C') disp.value = '0';
            else if (val === '=') { try { disp.value = eval(disp.value); } catch { disp.value = 'Error'; } }
            else { if (disp.value === '0' || disp.value === 'Error') disp.value = val; else disp.value += val; }
          }
        </script>
      `;
    } else if (lower.includes("todo") || lower.includes("task") || lower.includes("to-do")) {
      appContent = `
        <div class="glass-card" style="max-width: 440px; margin: 0 auto;">
          <h2>Task Manager</h2>
          <p style="font-size:12px; color:#94a3b8; margin-bottom: 16px;">Local Storage Persistence Active</p>
          <div style="display:flex; gap:8px; margin-bottom: 16px;">
            <input type="text" id="todo-input" placeholder="Enter task..." style="flex:1;">
            <button class="btn" onclick="addTodo()">Add</button>
          </div>
          <div id="todo-list" style="display:flex; flex-direction:column; gap:8px; max-height:220px; overflow-y:auto;"></div>
        </div>
        <script>
          let list = JSON.parse(localStorage.getItem('off_todos')) || [];
          function save() { localStorage.setItem('off_todos', JSON.stringify(list)); render(); }
          function addTodo() {
            const input = document.getElementById('todo-input');
            const val = input.value.trim();
            if (!val) return;
            list.push({ text: val, done: false });
            input.value = '';
            save();
          }
          function toggle(idx) { list[idx].done = !list[idx].done; save(); }
          function del(idx) { list.splice(idx, 1); save(); }
          function render() {
            const box = document.getElementById('todo-list');
            box.innerHTML = '';
            list.forEach((t, i) => {
              const div = document.createElement('div');
              div.style = 'display:flex; justify-content:space-between; align-items:center; background:rgba(0,0,0,0.2); border:1px solid rgba(255,255,255,0.06); padding:10px; border-radius:6px;';
              div.innerHTML = \`
                <div style="display:flex; gap:8px; align-items:center; \${t.done ? 'text-decoration:line-through; opacity:0.6;' : ''}">
                  <input type="checkbox" \${t.done ? 'checked' : ''} onchange="toggle(\${i})">
                  <span>\${t.text}</span>
                </div>
                <span onclick="del(\${i})" style="color:#ef4444; cursor:pointer; font-size:12px;">✕</span>
              \`;
              box.appendChild(div);
            });
          }
          render();
        </script>
      `;
    } else {
      appContent = `
        <div class="glass-card" style="text-align: center; max-width: 500px; margin: 0 auto;">
          <h1 style="color:#06b6d4; margin-bottom: 12px;">${capitalizedTitle}</h1>
          <p style="font-size: 14px; color: #94a3b8; line-height: 1.6; margin-bottom: 24px;">Compiled dynamically by the AACE Frontend Developer Bot. Running client-side standalone.</p>
          <div style="background: rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.06); padding: 16px; border-radius: 8px; font-family: monospace; font-size: 13px; text-align: left; margin-bottom: 20px; color:#8b5cf6;">
            "${directive}"
          </div>
          <button class="btn" onclick="alert('Staging application initialized successfully.')">Initialize Application</button>
        </div>
      `;
    }

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${capitalizedTitle}</title>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-dark: #090b11;
      --card-bg: rgba(18, 22, 37, 0.7);
      --border: rgba(255, 255, 255, 0.08);
      --text-main: #f8fafc;
      --text-muted: #94a3b8;
      --accent-cyan: #06b6d4;
      --accent-blue: #3b82f6;
      --accent-purple: #8b5cf6;
      --accent-green: #10b981;
      --accent-red: #ef4444;
      --font-family: 'Outfit', sans-serif;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: var(--font-family);
      background: var(--bg-dark);
      background-image: radial-gradient(at 10% 10%, rgba(59, 130, 246, 0.08) 0px, transparent 50%);
      color: var(--text-main);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .glass-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 20px;
      padding: 30px;
      backdrop-filter: blur(16px);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    }
    .btn {
      background: linear-gradient(135deg, var(--accent-blue), #1d4ed8);
      color: white;
      border: none;
      padding: 10px 18px;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }
    .btn-secondary {
      background: rgba(255,255,255,0.05);
      border: 1px solid var(--border);
      color: var(--text-main);
    }
    input {
      width: 100%;
      background: rgba(0, 0, 0, 0.2);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 10px 14px;
      color: white;
      outline: none;
      transition: border-color 0.2s;
    }
    input:focus { border-color: var(--accent-blue); }
  </style>
</head>
<body>
  ${appContent}
</body>
</html>`;
  }
};
