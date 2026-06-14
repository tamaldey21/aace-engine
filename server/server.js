import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { dbReady } from "./db.js"; // Initialize connection
import { Candidate, ChatLog, Memory, Employee, Attendance } from "./db.js";
import { compileHTML } from "./compiler.js";

const app = express();
const PORT = process.env.PORT || 3001;

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
            await attendance.save();
          } else {
            existingLog.status = "Present";
            existingLog.loginTime = new Date();
            await existingLog.save();
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
      await existingLog.save();
      return res.json({ success: true, message: "Attendance status updated to Left." });
    }

    res.json({ success: true, message: "No attendance log found to update." });
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