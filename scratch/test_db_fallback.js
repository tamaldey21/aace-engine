async function testDbFallback() {
  console.log("Starting verification of Local JSON Database Fallback APIs...");

  // 1. Get employees
  try {
    const res = await fetch("http://localhost:3001/api/employees");
    if (!res.ok) throw new Error(`HTTP status ${res.status}`);
    const list = await res.json();
    console.log(`✓ GET /api/employees: Received ${list.length} profiles successfully.`);
    if (list.length !== 12) {
      console.error(`ERROR: Expected 12 employees, found ${list.length}`);
      process.exit(1);
    }
  } catch (err) {
    console.error("GET /api/employees failed:", err.message);
    process.exit(1);
  }

  // 2. CEO Login
  try {
    const res = await fetch("http://localhost:3001/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        profileType: "ceo",
        passcode: "ceo"
      })
    });
    if (!res.ok) throw new Error(`HTTP status ${res.status}`);
    const data = await res.json();
    console.log("✓ POST /api/login (CEO): Authorized successfully. User:", data.user?.name);
  } catch (err) {
    console.error("CEO login failed:", err.message);
    process.exit(1);
  }

  // 3. Employee Login (john)
  try {
    const res = await fetch("http://localhost:3001/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        profileType: "employee",
        username: "EMP-2026-0003",
        passcode: "john"
      })
    });
    if (!res.ok) throw new Error(`HTTP status ${res.status}`);
    const data = await res.json();
    console.log("✓ POST /api/login (Employee john): Authorized & clocked-in successfully. User:", data.user?.name);
  } catch (err) {
    console.error("Employee login failed:", err.message);
    process.exit(1);
  }

  // 4. Get attendance logs
  try {
    const res = await fetch("http://localhost:3001/api/attendance");
    if (!res.ok) throw new Error(`HTTP status ${res.status}`);
    const list = await res.json();
    console.log(`✓ GET /api/attendance: Found ${list.length} check-in logs.`);
    const johnLog = list.find(l => l.empId === "EMP-2026-0003");
    if (!johnLog) {
      console.error("ERROR: No attendance record found for john!");
      process.exit(1);
    }
    console.log("  John attendance status:", johnLog.status);
  } catch (err) {
    console.error("GET /api/attendance failed:", err.message);
    process.exit(1);
  }

  // 5. Employee Logout (john)
  try {
    const res = await fetch("http://localhost:3001/api/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        empId: "EMP-2026-0003"
      })
    });
    if (!res.ok) throw new Error(`HTTP status ${res.status}`);
    const data = await res.json();
    console.log("✓ POST /api/logout: Marked employee status as Left. Response:", data.message);
  } catch (err) {
    console.error("Employee logout failed:", err.message);
    process.exit(1);
  }

  // 6. Verify status update on attendance
  try {
    const res = await fetch("http://localhost:3001/api/attendance");
    const list = await res.json();
    const johnLog = list.find(l => l.empId === "EMP-2026-0003");
    console.log("✓ Verified updated status after logout:", johnLog?.status);
    if (johnLog?.status !== "Left") {
      console.error("ERROR: Status did not update to 'Left'!");
      process.exit(1);
    }
  } catch (err) {
    console.error("Status re-check failed:", err.message);
    process.exit(1);
  }

  console.log("\nALL HYBRID DATABASE INTEGRATION TESTS PASSED SUCCESSFULLY! ✓");
}

testDbFallback();
