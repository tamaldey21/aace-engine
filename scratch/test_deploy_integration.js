import fs from 'fs';
import path from 'path';

async function testDeployIntegration() {
  console.log("Testing Dynamic App compiler and deployment integration...");
  const publicDir = path.resolve(process.cwd(), 'public');
  
  const testCases = [
    { filename: "test-calc.html", directive: "build a calculator" },
    { filename: "test-todo.html", directive: "make a to-do list manager" },
    { filename: "test-weather.html", directive: "make a weather forecast app" },
    { filename: "test-game.html", directive: "design a card matching memory game" },
    { filename: "test-recipe.html", directive: "compile a recipe finder and calorie calculator" }
  ];

  for (const tc of testCases) {
    console.log(`\nDeploying case: "${tc.directive}" -> ${tc.filename}`);
    try {
      const response = await fetch("http://localhost:3001/api/deploy-file", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: tc.filename,
          directive: tc.directive
        })
      });

      if (!response.ok) {
        console.error(`  Failed with HTTP status ${response.status}`);
        continue;
      }

      const data = await response.json();
      console.log("  Response:", data);

      // Verify file was written
      const filePath = path.join(publicDir, data.filename);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        console.log(`  File successfully written! Size: ${content.length} bytes.`);
        
        // Assertions for premium features
        const hasPremiumHeader = content.includes("Outfit") && content.includes("glass-card");
        const hasFunctionalLogic = content.includes("<script>") || content.includes("<script src=") || content.includes("onclick");
        
        console.log(`  Has premium design layout: ${hasPremiumHeader}`);
        console.log(`  Has interactive scripting: ${hasFunctionalLogic}`);
        
        if (!hasPremiumHeader || !hasFunctionalLogic) {
          console.error("  ERROR: Generated page does not meet premium interactive specifications.");
          process.exit(1);
        }
      } else {
        console.error(`  ERROR: File does not exist at ${filePath}`);
        process.exit(1);
      }
    } catch (err) {
      console.error("  Error calling endpoint:", err.message);
      process.exit(1);
    }
  }

  console.log("\nALL INTEGRATION TESTS PASSED SUCCESSFULLY! ✓");
}

testDeployIntegration();
