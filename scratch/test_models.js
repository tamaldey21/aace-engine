import fs from 'fs';
import path from 'path';

async function testModels() {
  console.log("Testing available models on BluesMinds API Gateway...");
  
  // Parse .env manually
  const envPath = path.resolve(process.cwd(), '.env');
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
  
  if (!activeKey) {
    console.error("Error: No key found in environment.");
    process.exit(1);
  }

  // 1. Try listing models
  try {
    const res = await fetch("https://api.bluesminds.com/v1/models", {
      headers: {
        "Authorization": `Bearer ${activeKey}`
      }
    });
    console.log("Models list status:", res.status);
    const data = await res.json();
    console.log("Models:", JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Failed to list models:", err);
  }

  // 2. Try common models in chat completions
  const candidateModels = ["gpt-4o", "gpt-4o-mini", "Kimi-K2.6-azure", "gpt-3.5-turbo"];
  for (const model of candidateModels) {
    console.log(`Testing chat completion with model: ${model}...`);
    try {
      const response = await fetch("https://api.bluesminds.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${activeKey}`
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: "user", content: "Hello, list 1 word reply." }
          ]
        })
      });

      console.log(`Model ${model} response status:`, response.status);
      const data = await response.json();
      if (response.ok) {
        console.log(`Model ${model} SUCCESS:`, data.choices?.[0]?.message?.content);
      } else {
        console.log(`Model ${model} FAILED:`, data.error?.message || JSON.stringify(data));
      }
    } catch (err) {
      console.error(`Model ${model} error:`, err.message);
    }
  }
}

testModels();
