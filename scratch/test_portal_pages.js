import fs from 'fs';
import path from 'path';

function verifyPortalPages() {
  console.log("Verifying static HTML portal files in /public...");
  const publicDir = path.resolve(process.cwd(), 'public');
  
  const pages = ["front.html", "login.html", "ceo.html", "employee.html"];
  
  for (const page of pages) {
    const filePath = path.join(publicDir, page);
    if (!fs.existsSync(filePath)) {
      console.error(`ERROR: Missing file: ${filePath}`);
      process.exit(1);
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    console.log(`File [${page}] exists, size: ${content.length} bytes.`);
    
    // Check links and API links
    if (page === 'front.html') {
      if (!content.includes('login.html')) {
        console.error("ERROR: front.html does not link to login.html");
        process.exit(1);
      }
    } else if (page === 'login.html') {
      if (!content.includes('api/login') || !content.includes('ceo.html') || !content.includes('employee.html')) {
        console.error("ERROR: login.html misses core API or redirect targets");
        process.exit(1);
      }
    } else if (page === 'ceo.html') {
      if (!content.includes('api/employees') || !content.includes('api/attendance') || !content.includes('api/deploy-file')) {
        console.error("ERROR: ceo.html misses core API routes");
        process.exit(1);
      }
    } else if (page === 'employee.html') {
      if (!content.includes('api/logout') || !content.includes('api/deploy-file')) {
        console.error("ERROR: employee.html misses core API routes");
        process.exit(1);
      }
    }
  }
  
  console.log("ALL STATIC PORTAL PAGES VERIFIED SUCCESSFULLY! ✓");
}

verifyPortalPages();
