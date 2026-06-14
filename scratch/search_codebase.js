import fs from 'fs';
import path from 'path';

function searchDirectory(dir, query) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== 'dist') {
        searchDirectory(fullPath, query);
      }
    } else {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.toLowerCase().includes(query.toLowerCase())) {
        console.log(`MATCH FOUND: ${fullPath}`);
        const lines = content.split('\n');
        lines.forEach((line, idx) => {
          if (line.toLowerCase().includes(query.toLowerCase())) {
            console.log(`  Line ${idx + 1}: ${line.trim()}`);
          }
        });
      }
    }
  }
}

const query = process.argv[2] || "Kimi";
console.log(`Searching codebase for '${query}'...`);
searchDirectory("C:/Users/Tamal Dey/OneDrive/Desktop/AI Virtual co", query);
console.log("Search complete.");
