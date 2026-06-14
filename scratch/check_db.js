import { Employee, dbReady } from "../server/db.js";

async function run() {
  await dbReady;
  const emps = await Employee.find({});
  console.log("Current Employee Records in DB:");
  emps.forEach(e => {
    console.log(`- ID: ${e.empId}, Name: ${e.name}, Role: ${e.role}, Dept: ${e.dept}, Passcode: ${e.passcode}`);
  });
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
