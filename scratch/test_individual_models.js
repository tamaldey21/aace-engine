async function testAllAvailableModels() {
  const activeKey = "sk-hpTmhzZhQj4T8a4q19M0uUpoRqsXrMagwbLmcuqypdNdii3h";
  const models = [
    "gpt-4o-mini",
    "gpt-4o",
    "kimi-k2.5",
    "moonshotai/kimi-k2.6",
    "gemini-3-flash-preview",
    "stepfun-ai/step-3.5-flash",
    "grok-4.20-fast"
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
      console.log(`Model [${model}] response (first 200 chars):`, text.substring(0, 200));
    } catch (err) {
      console.error(`Model [${model}] failed:`, err.message);
    }
  }
}

testAllAvailableModels();
