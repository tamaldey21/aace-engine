import fs from 'fs';
import path from 'path';

async function testAllKeys() {
  console.log("Testing all keys and models...");
  
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

  const keys = Object.keys(env).filter(k => k.startsWith('VITE_API_KEY_'));
  const models = [
    "Kimi-K2.6-azure",
    "gpt-4o",
    "gpt-4o-mini",
    "gpt-3.5-turbo",
    "deepseek-chat",
    "deepseek-coder",
    "moonshot-v1-8k"
  ];

  for (const keyName of keys) {
    const activeKey = env[keyName];
    if (!activeKey) continue;
    console.log(`\n--- Testing key: ${keyName} (${activeKey.substring(0, 10)}...) ---`);
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

        if (response.ok) {
          const data = await response.json();
          console.log(`  Model [${model}] SUCCESS! Reply:`, data.choices?.[0]?.message?.content);
          return; // Stop on first success!
        } else {
          const err = await response.json().catch(() => ({}));
          console.log(`  Model [${model}] failed (${response.status}):`, err.error?.message || JSON.stringify(err));
        }
      } catch (err) {
        console.log(`  Model [${model}] error:`, err.message);
      }
    }
  }
}

testAllKeys();
