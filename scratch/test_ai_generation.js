import fs from 'fs';
import path from 'path';

async function testAIGenerator() {
  console.log("Testing AI Code Generator using Kimi API Key...");
  
  // Parse .env manually
  const envPath = path.resolve(process.cwd(), '.env');
  console.log("Reading env from:", envPath);
  const envContent = fs.readFileSync(envPath, 'utf8');
  const env = {};
  envContent.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join('=').trim();
      env[key] = val;
    }
  });

  const activeKey = env.VITE_API_KEY_ENGINEER || env.VITE_API_KEY_CEO;
  console.log("Active Key present:", !!activeKey);
  
  if (!activeKey) {
    console.error("Error: No key found in environment.");
    process.exit(1);
  }

  try {
    const response = await fetch("https://api.bluesminds.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${activeKey}`
      },
      body: JSON.stringify({
        model: "Kimi-K2.6-azure",
        messages: [
          {
            role: "system",
            content: "Output a simple HTML page with hello world text. No markdown fences. Only HTML."
          },
          {
            role: "user",
            content: "Make it now."
          }
        ]
      })
    });

    if (!response.ok) {
      console.error(`HTTP Error: ${response.status}`);
      const err = await response.text();
      console.error(err);
      process.exit(1);
    }

    const data = await response.json();
    console.log("Response data choices:", data.choices?.[0]?.message);
  } catch (err) {
    console.error("Failed to connect:", err);
    process.exit(1);
  }
}

testAIGenerator();
