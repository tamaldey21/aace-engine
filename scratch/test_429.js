import fs from 'fs';
import path from 'path';

async function test429() {
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

  const activeKey = env.VITE_API_KEY_ENGINEER;
  const models = ["deepseek-chat", "moonshot-v1-8k"];

  for (const model of models) {
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
            { role: "user", content: "hi" }
          ]
        })
      });

      console.log(`Model [${model}] status:`, response.status);
      const text = await response.text();
      console.log(`Model [${model}] response text:`, text);
    } catch (err) {
      console.error(`Model [${model}] error:`, err);
    }
  }
}

test429();
