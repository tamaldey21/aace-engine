async function testNewKey() {
  const activeKey = "sk-hpTmhzZhQj4T8a4q19M0uUpoRqsXrMagwbLmcuqypdNdii3h";
  console.log("Testing new key...");
  
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
          { role: "user", content: "say hello" }
        ],
        max_tokens: 10
      })
    });

    console.log("Status:", response.status);
    const data = await response.json();
    console.log("Response data:", JSON.stringify(data));
  } catch (err) {
    console.error("Test failed:", err);
  }
}

testNewKey();
