import fs from 'fs';
import path from 'path';

async function testKimiModels() {
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
  const models = [
    "kimi-k2.6",
    "Kimi-K2.6",
    "kimi-k2.6-azure",
    "moonshot-v1-8k",
    "moonshot-v1-32k",
    "moonshot-v1-128k",
    "kimi-latest",
    "kimi-api"
  ];

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
          ],
          max_tokens: 5
        })
      });

      console.log(`Model [${model}] status:`, response.status);
      const text = await response.text();
      console.log(`Model [${model}] response:`, text);
    } catch (err) {
      console.error(`Model [${model}] error:`, err.message);
    }
  }
}

testKimiModels();
