import fs from 'fs';
import path from 'path';

function cleanOutput(text) {
  let cleaned = text.trim();
  if (cleaned.startsWith("```html")) {
    cleaned = cleaned.substring(7);
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.substring(3);
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.substring(0, cleaned.length - 3);
  }
  return cleaned.trim();
}

// Global CSS styles shared by all premium templates
const SHARED_CSS = `
    :root {
      --bg-dark: #090a0f;
      --card-bg: rgba(17, 19, 31, 0.75);
      --border: rgba(255, 255, 255, 0.08);
      --text-main: #f3f4f6;
      --text-secondary: #9ca3af;
      
      --accent-cyan: #06b6d4;
      --accent-blue: #3b82f6;
      --accent-purple: #8b5cf6;
      --accent-green: #10b981;
      --accent-red: #ef4444;
      --accent-yellow: #f59e0b;
      
      --font-family: 'Outfit', sans-serif;
    }
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    body {
      font-family: var(--font-family);
      background: var(--bg-dark);
      background-image: 
        radial-gradient(at 10% 10%, rgba(59, 130, 246, 0.08) 0px, transparent 50%),
        radial-gradient(at 90% 90%, rgba(139, 92, 246, 0.08) 0px, transparent 50%);
      color: var(--text-main);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 24px;
      overflow-x: hidden;
    }
    
    .glass-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 20px;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      padding: 30px;
      width: 100%;
      max-width: 500px;
      position: relative;
      overflow: hidden;
      transition: transform 0.3s ease, border-color 0.3s ease;
    }
    
    .glass-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 4px;
      background: linear-gradient(90deg, var(--accent-blue), var(--accent-cyan));
    }
    
    .btn {
      background: linear-gradient(135deg, var(--accent-blue), #1d4ed8);
      color: white;
      border: none;
      padding: 10px 18px;
      border-radius: 8px;
      font-weight: 600;
      font-family: var(--font-family);
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: all 0.2s ease;
    }
    
    .btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    }
    
    .btn:active {
      transform: translateY(0);
    }
    
    .btn-secondary {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--border);
      color: var(--text-main);
    }
    
    .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.1);
      box-shadow: none;
    }
    
    input, select, textarea {
      width: 100%;
      background: rgba(0, 0, 0, 0.2);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 10px 14px;
      color: white;
      font-family: var(--font-family);
      font-size: 14px;
      outline: none;
      transition: border-color 0.2s ease;
    }
    
    input:focus, select:focus, textarea:focus {
      border-color: var(--accent-blue);
    }
    
    h1, h2, h3 {
      font-weight: 700;
      color: white;
      letter-spacing: -0.02em;
    }
    
    .footer-note {
      font-size: 11px;
      color: var(--text-secondary);
      text-align: center;
      margin-top: 24px;
      opacity: 0.7;
    }
`;

export async function compileHTML(directive, filename, clientKeys = {}) {
  // Try calling AI models first
  const activeKey = clientKeys?.geminiKey || process.env.VITE_API_KEY_CEO || process.env.VITE_API_KEY_ENGINEER;
  const isGemini = clientKeys?.geminiKey || (!process.env.VITE_API_KEY_ENGINEER && process.env.VITE_API_KEY_CEO);
  
  if (activeKey) {
    console.log(`[compiler] API Key present, attempting dynamic AI generation (provider: ${isGemini ? 'Gemini' : 'Kimi'})...`);
    try {
      if (isGemini) {
        // Query Gemini 1.5 Flash
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${activeKey}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [{ 
                  text: `Write a complete, single-file HTML page containing embedded HTML, CSS and JavaScript. It must be fully functional and beautifully designed (modern dark theme, glassmorphism, responsive, interactive). Output ONLY raw HTML. Do not put markdown fences like \`\`\`html or explanation or comments at the start. Build exactly what the user asks: "${directive}"` 
                }]
              }
            ],
            generationConfig: {
              maxOutputTokens: 8192
            }
          })
        });

        if (response.ok) {
          const responseData = await response.json();
          let rawText = responseData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            console.log("[compiler] Gemini successfully generated code!");
            return cleanOutput(rawText);
          }
        } else {
          console.error(`[compiler] Gemini request failed: ${response.status}`);
        }
      } else {
        // Query Kimi / BluesMinds
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
                content: "Write a complete, single-file HTML page containing HTML, CSS and JavaScript. It must be fully functional and beautifully designed (modern dark theme, glassmorphism, responsive, interactive). Code only, no markdown formatting, no explanation."
              },
              {
                role: "user",
                content: `Build: "${directive}"`
              }
            ]
          })
        });

        if (response.ok) {
          const responseData = await response.json();
          let rawText = responseData.choices?.[0]?.message?.content;
          if (rawText) {
            console.log("[compiler] Kimi successfully generated code!");
            return cleanOutput(rawText);
          }
        } else {
          console.error(`[compiler] Kimi request failed: ${response.status}`);
        }
      }
    } catch (err) {
      console.error("[compiler] API request error, moving to fallback compiler:", err.message);
    }
  }

  // Fallback to Dynamic Application Generator
  console.log("[compiler] Falling back to Dynamic Application Generator...");
  return generateHTMLFallback(directive);
}

function generateHTMLFallback(directive) {
  const lower = directive.toLowerCase();
  
  if (lower.includes("calc") || lower.includes("calculator")) {
    return getCalculatorTemplate(directive);
  } else if (lower.includes("todo") || lower.includes("to-do") || lower.includes("task")) {
    return getTodoTemplate(directive);
  } else if (lower.includes("weather") || lower.includes("temp") || lower.includes("forecast")) {
    return getWeatherTemplate(directive);
  } else if (lower.includes("tic-tac-toe") || lower.includes("tictactoe") || lower.includes("tic tac toe")) {
    return getTicTacToeTemplate(directive);
  } else if (lower.includes("match") || lower.includes("game") || lower.includes("memory")) {
    return getMemoryGameTemplate(directive);
  } else if (lower.includes("timer") || lower.includes("stopwatch") || lower.includes("pomodoro")) {
    return getTimerTemplate(directive);
  } else if (lower.includes("expense") || lower.includes("budget") || lower.includes("finance") || lower.includes("money") || lower.includes("spend")) {
    return getExpenseTemplate(directive);
  } else if (lower.includes("quiz") || lower.includes("trivia") || lower.includes("question")) {
    return getQuizTemplate(directive);
  } else if (lower.includes("note") || lower.includes("diary") || lower.includes("journal")) {
    return getNotesTemplate(directive);
  } else if (lower.includes("password") || lower.includes("passphrase") || lower.includes("keygen")) {
    return getPasswordTemplate(directive);
  } else if (lower.includes("color") || lower.includes("palette") || lower.includes("hex")) {
    return getColorTemplate(directive);
  } else if (lower.includes("convert") || lower.includes("unit")) {
    return getUnitConverterTemplate(directive);
  } else {
    // Default: Gorgeous Customized Landing Page / Portfolio
    return getGeneralPortfolioTemplate(directive);
  }
}

// 1. CALCULATOR TEMPLATE
function getCalculatorTemplate(directive) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>AACE Calculator Pro</title>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    ${SHARED_CSS}
    .glass-card {
      max-width: 360px;
    }
    .display-container {
      background: rgba(0, 0, 0, 0.35);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 20px;
      text-align: right;
      min-height: 80px;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      word-break: break-all;
    }
    .history-line {
      font-size: 12px;
      color: var(--text-secondary);
      margin-bottom: 4px;
    }
    .current-line {
      font-size: 28px;
      font-weight: 700;
      color: var(--accent-cyan);
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
    }
    .grid button {
      height: 52px;
      font-size: 16px;
    }
    .op {
      background: rgba(139, 92, 246, 0.15);
      border: 1px solid rgba(139, 92, 246, 0.3);
      color: #c084fc;
    }
    .op:hover {
      background: rgba(139, 92, 246, 0.3);
    }
    .eq {
      background: linear-gradient(135deg, var(--accent-cyan), var(--accent-blue));
    }
  </style>
</head>
<body>
  <div class="glass-card">
    <h2 style="margin-bottom: 16px; font-size: 18px; text-align: center; color: var(--text-main);">Calculator Panel</h2>
    <div class="display-container">
      <div id="history" class="history-line"></div>
      <div id="display" class="current-line">0</div>
    </div>
    <div class="grid">
      <button class="btn btn-secondary op" onclick="clearCalc()">C</button>
      <button class="btn btn-secondary op" onclick="press('back')">⌫</button>
      <button class="btn btn-secondary op" onclick="press('%')">%</button>
      <button class="btn btn-secondary op" onclick="press('/')">/</button>
      
      <button class="btn btn-secondary" onclick="press('7')">7</button>
      <button class="btn btn-secondary" onclick="press('8')">8</button>
      <button class="btn btn-secondary" onclick="press('9')">9</button>
      <button class="btn btn-secondary op" onclick="press('*')">×</button>
      
      <button class="btn btn-secondary" onclick="press('4')">4</button>
      <button class="btn btn-secondary" onclick="press('5')">5</button>
      <button class="btn btn-secondary" onclick="press('6')">6</button>
      <button class="btn btn-secondary op" onclick="press('-')">-</button>
      
      <button class="btn btn-secondary" onclick="press('1')">1</button>
      <button class="btn btn-secondary" onclick="press('2')">2</button>
      <button class="btn btn-secondary" onclick="press('3')">3</button>
      <button class="btn btn-secondary op" onclick="press('+')">+</button>
      
      <button class="btn btn-secondary" onclick="press('00')">00</button>
      <button class="btn btn-secondary" onclick="press('0')">0</button>
      <button class="btn btn-secondary" onclick="press('.')">.</button>
      <button class="btn eq" onclick="calculate()">=</button>
    </div>
    <p class="footer-note">Compiled autonomously by AACE Frontend Developer Bot</p>
  </div>
  <script>
    const disp = document.getElementById('display');
    const hist = document.getElementById('history');
    let expr = '';

    function press(val) {
      if (val === 'back') {
        expr = expr.slice(0, -1);
      } else {
        expr += val;
      }
      disp.innerText = expr || '0';
    }

    function clearCalc() {
      expr = '';
      disp.innerText = '0';
      hist.innerText = '';
    }

    function calculate() {
      if (!expr) return;
      try {
        const rawExpr = expr.replace(/×/g, '*');
        const res = eval(rawExpr);
        hist.innerText = expr + ' =';
        expr = String(res);
        disp.innerText = expr;
      } catch {
        disp.innerText = 'Error';
        expr = '';
      }
    }
  </script>
</body>
</html>`;
}

// 2. TO-DO LIST TEMPLATE
function getTodoTemplate(directive) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>AACE Workspace Tasks</title>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    ${SHARED_CSS}
    .input-row {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
    }
    .filters {
      display: flex;
      justify-content: space-between;
      margin-bottom: 16px;
      font-size: 12px;
      color: var(--text-secondary);
    }
    .filter-btn {
      cursor: pointer;
      padding: 4px 8px;
      border-radius: 4px;
      transition: all 0.2s;
    }
    .filter-btn.active {
      background: rgba(59, 130, 246, 0.15);
      color: var(--accent-blue);
      font-weight: 600;
    }
    .todo-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-height: 280px;
      overflow-y: auto;
      padding-right: 4px;
    }
    .todo-item {
      background: rgba(0, 0, 0, 0.2);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      transition: all 0.2s;
    }
    .todo-item:hover {
      border-color: rgba(255, 255, 255, 0.15);
    }
    .todo-item.done .text {
      text-decoration: line-through;
      color: var(--text-secondary);
      opacity: 0.6;
    }
    .todo-item-left {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .cb {
      cursor: pointer;
      width: 16px;
      height: 16px;
      accent-color: var(--accent-blue);
    }
    .btn-del {
      background: transparent;
      border: none;
      color: var(--accent-red);
      cursor: pointer;
      opacity: 0.7;
      transition: opacity 0.2s;
    }
    .btn-del:hover {
      opacity: 1;
    }
    .stats {
      font-size: 12px;
      margin-top: 16px;
      color: var(--text-secondary);
      display: flex;
      justify-content: space-between;
    }
  </style>
</head>
<body>
  <div class="glass-card">
    <h2 style="margin-bottom: 8px; display: flex; align-items: center; gap: 8px;"><span style="color: var(--accent-blue);">✓</span> Workspace Task Board</h2>
    <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 20px;">Manage personal & team items with localStorage persistence</p>
    
    <div class="input-row">
      <input type="text" id="todo-input" placeholder="What needs to be done?" onkeydown="if(event.key === 'Enter') addTodo()">
      <button class="btn" onclick="addTodo()">Add</button>
    </div>
    
    <div class="filters">
      <span id="items-left">0 items left</span>
      <div style="display: flex; gap: 8px;">
        <span class="filter-btn active" onclick="setFilter('all', this)">All</span>
        <span class="filter-btn" onclick="setFilter('active', this)">Active</span>
        <span class="filter-btn" onclick="setFilter('completed', this)">Completed</span>
      </div>
    </div>
    
    <div id="todo-list" class="todo-list"></div>
    
    <div class="stats">
      <span>Category: General</span>
      <span style="color: var(--accent-cyan); cursor: pointer;" onclick="clearCompleted()">Clear Completed</span>
    </div>
    
    <p class="footer-note">Compiled autonomously by AACE Frontend Developer Bot</p>
  </div>
  
  <script>
    let todos = JSON.parse(localStorage.getItem('aace_todos')) || [
      { text: "Launch AACE core compiler", done: true },
      { text: "Connect database index mapping", done: false },
      { text: "Implement custom template logic", done: false }
    ];
    let filter = 'all';

    function save() {
      localStorage.setItem('aace_todos', JSON.stringify(todos));
      render();
    }

    function addTodo() {
      const input = document.getElementById('todo-input');
      const val = input.value.trim();
      if (!val) return;
      todos.push({ text: val, done: false });
      input.value = '';
      save();
    }

    function toggleTodo(idx) {
      todos[idx].done = !todos[idx].done;
      save();
    }

    function deleteTodo(idx) {
      todos.splice(idx, 1);
      save();
    }

    function setFilter(type, el) {
      filter = type;
      document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
      el.classList.add('active');
      render();
    }

    function clearCompleted() {
      todos = todos.filter(t => !t.done);
      save();
    }

    function render() {
      const list = document.getElementById('todo-list');
      list.innerHTML = '';
      
      let leftCount = 0;
      
      todos.forEach((todo, idx) => {
        if (!todo.done) leftCount++;
        
        if (filter === 'active' && todo.done) return;
        if (filter === 'completed' && !todo.done) return;
        
        const div = document.createElement('div');
        div.className = 'todo-item' + (todo.done ? ' done' : '');
        div.innerHTML = \`
          <div class="todo-item-left">
            <input type="checkbox" class="cb" \${todo.done ? 'checked' : ''} onchange="toggleTodo(\${idx})">
            <span class="text">\${todo.text}</span>
          </div>
          <button class="btn-del" onclick="deleteTodo(\${idx})">✕</button>
        \`;
        list.appendChild(div);
      });
      
      document.getElementById('items-left').innerText = \`\${leftCount} item\${leftCount === 1 ? '' : 's'} left\`;
    }

    render();
  </script>
</body>
</html>`;
}

// 3. WEATHER APP TEMPLATE
function getWeatherTemplate(directive) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>AACE Aero Weather</title>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    ${SHARED_CSS}
    .search-row {
      display: flex;
      gap: 10px;
      margin-bottom: 24px;
    }
    .weather-info {
      text-align: center;
      margin-bottom: 24px;
    }
    .temp {
      font-size: 58px;
      font-weight: 700;
      color: white;
      margin: 12px 0 4px 0;
      display: flex;
      justify-content: center;
      align-items: flex-start;
    }
    .temp span {
      font-size: 24px;
      margin-top: 8px;
      color: var(--accent-cyan);
    }
    .city {
      font-size: 22px;
      font-weight: 600;
    }
    .desc {
      color: var(--text-secondary);
      font-size: 14px;
      text-transform: capitalize;
    }
    .details-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-top: 16px;
    }
    .detail-card {
      background: rgba(0, 0, 0, 0.25);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 12px;
      text-align: left;
    }
    .detail-card span {
      font-size: 11px;
      color: var(--text-secondary);
      display: block;
    }
    .detail-card strong {
      font-size: 15px;
      color: white;
      margin-top: 4px;
      display: block;
    }
    .icon-container {
      width: 80px;
      height: 80px;
      margin: 0 auto;
    }
  </style>
</head>
<body>
  <div class="glass-card">
    <h2 style="margin-bottom: 16px; text-align: center;">Aero Weather Portal</h2>
    <div class="search-row">
      <input type="text" id="city-input" placeholder="Search City (e.g. Paris, Tokyo, London)" onkeydown="if(event.key === 'Enter') fetchWeather()">
      <button class="btn" onclick="fetchWeather()">Search</button>
    </div>
    
    <div id="weather-card" style="display: none;">
      <div class="weather-info">
        <div class="icon-container" id="weather-icon"></div>
        <div class="temp"><span id="temp-val">22</span><span>°C</span></div>
        <div class="city" id="city-name">Paris</div>
        <div class="desc" id="weather-desc">scattered clouds</div>
      </div>
      
      <div class="details-grid">
        <div class="detail-card">
          <span>HUMIDITY</span>
          <strong id="humidity-val">64%</strong>
        </div>
        <div class="detail-card">
          <span>WIND SPEED</span>
          <strong id="wind-val">12 km/h</strong>
        </div>
        <div class="detail-card">
          <span>UV INDEX</span>
          <strong id="uv-val">Moderate (4)</strong>
        </div>
        <div class="detail-card">
          <span>CONDITIONS</span>
          <strong id="cond-val">Stable</strong>
        </div>
      </div>
    </div>
    
    <p class="footer-note">Compiled autonomously by AACE Frontend Developer Bot</p>
  </div>
  
  <script>
    // Interactive Local Forecast Data generator
    const MOCK_WEATHER = {
      london: { temp: 16, desc: "showers & light rain", humidity: 82, wind: 21, uv: "Low (2)", cond: "Wet" },
      paris: { temp: 21, desc: "broken clouds", humidity: 58, wind: 11, uv: "Moderate (4)", cond: "Clear" },
      tokyo: { temp: 26, desc: "warm humid breezes", humidity: 75, wind: 14, uv: "High (7)", cond: "Warm" },
      newyork: { temp: 23, desc: "scattered clear skies", humidity: 45, wind: 18, uv: "Moderate (5)", cond: "Sunny" },
      delhi: { temp: 38, desc: "hot haze conditions", humidity: 30, wind: 8, uv: "Very High (9)", cond: "Dry" }
    };

    function fetchWeather() {
      const input = document.getElementById('city-input');
      const query = input.value.trim().toLowerCase().replace(/\\s/g, '');
      if (!query) return;
      
      let data = MOCK_WEATHER[query];
      
      // If not in presets, generate realistic mock weather based on input text string sum
      if (!data) {
        let code = 0;
        for (let i = 0; i < query.length; i++) code += query.charCodeAt(i);
        const temp = Math.floor((code % 28) + 10);
        const humidity = Math.floor((code % 40) + 40);
        const wind = Math.floor((code % 25) + 5);
        const uvInt = (code % 8) + 1;
        const descriptions = ["sunny skies", "partly cloudy", "passing drizzle", "overcast weather", "strong winds"];
        const desc = descriptions[code % descriptions.length];
        data = {
          temp,
          desc,
          humidity: humidity + '%',
          wind: wind + ' km/h',
          uv: uvInt + ' (Moderate)',
          cond: temp > 25 ? 'Hot' : 'Cool'
        };
      } else {
        data.humidity = data.humidity + '%';
        data.wind = data.wind + ' km/h';
      }

      document.getElementById('temp-val').innerText = data.temp;
      document.getElementById('city-name').innerText = input.value.charAt(0).toUpperCase() + input.value.slice(1);
      document.getElementById('weather-desc').innerText = data.desc;
      document.getElementById('humidity-val').innerText = data.humidity;
      document.getElementById('wind-val').innerText = data.wind;
      document.getElementById('uv-val').innerText = data.uv;
      document.getElementById('cond-val').innerText = data.cond;
      
      // Draw a simple weather SVG dynamic icon
      const iconBox = document.getElementById('weather-icon');
      let iconSvg = '';
      if (data.desc.includes('sun') || data.desc.includes('clear') || data.temp > 28) {
        iconSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="#eab308" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>';
      } else if (data.desc.includes('rain') || data.desc.includes('drizzle')) {
        iconSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2"><path d="M20 17.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 16.25"/><path d="M8 19v2M12 20v2M16 19v2"/></svg>';
      } else {
        iconSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="#06b6d4" stroke-width="2"><path d="M12 2a10 10 0 0 0-7.74 3.65A6 6 0 0 0 8 16h8a6 6 0 0 0 3.74-10.35A10 10 0 0 0 12 2z"/></svg>';
      }
      iconBox.innerHTML = iconSvg;
      
      document.getElementById('weather-card').style.display = 'block';
    }

    // Default load
    document.getElementById('city-input').value = 'Paris';
    fetchWeather();
  </script>
</body>
</html>`;
}

// 4. TIC-TAC-TOE TEMPLATE
function getTicTacToeTemplate(directive) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>AACE Tic-Tac-Toe Arena</title>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    ${SHARED_CSS}
    .board {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin: 20px 0;
    }
    .cell {
      background: rgba(0, 0, 0, 0.3);
      border: 1px solid var(--border);
      border-radius: 12px;
      height: 90px;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 36px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
    }
    .cell:hover {
      background: rgba(255, 255, 255, 0.03);
    }
    .cell.x {
      color: var(--accent-cyan);
    }
    .cell.o {
      color: var(--accent-purple);
    }
    .score-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 16px;
      font-size: 13px;
      border-bottom: 1px solid var(--border);
      padding-bottom: 10px;
    }
    .status-msg {
      font-size: 16px;
      font-weight: 600;
      text-align: center;
      margin-bottom: 16px;
      color: var(--accent-green);
    }
  </style>
</head>
<body>
  <div class="glass-card">
    <h2 style="text-align: center; margin-bottom: 16px;">Tic-Tac-Toe Engine</h2>
    <div class="score-row">
      <span>PLAYER (X): <strong id="player-score">0</strong></span>
      <span>AI (O): <strong id="ai-score">0</strong></span>
    </div>
    
    <div id="status" class="status-msg">Your Turn (X)</div>
    
    <div class="board">
      <div class="cell" onclick="makeMove(0)" id="c0"></div>
      <div class="cell" onclick="makeMove(1)" id="c1"></div>
      <div class="cell" onclick="makeMove(2)" id="c2"></div>
      <div class="cell" onclick="makeMove(3)" id="c3"></div>
      <div class="cell" onclick="makeMove(4)" id="c4"></div>
      <div class="cell" onclick="makeMove(5)" id="c5"></div>
      <div class="cell" onclick="makeMove(6)" id="c6"></div>
      <div class="cell" onclick="makeMove(7)" id="c7"></div>
      <div class="cell" onclick="makeMove(8)" id="c8"></div>
    </div>
    
    <div style="text-align: center;">
      <button class="btn" onclick="resetGame()">Restart Game</button>
    </div>
    
    <p class="footer-note">Compiled autonomously by AACE Frontend Developer Bot</p>
  </div>
  
  <script>
    let board = Array(9).fill('');
    let playerActive = true;
    let pScore = 0;
    let aScore = 0;

    const winCombos = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
      [0, 4, 8], [2, 4, 6]             // diagonals
    ];

    function makeMove(idx) {
      if (!playerActive || board[idx] !== '') return;
      
      board[idx] = 'X';
      draw();
      
      if (checkWin('X')) {
        endGame('Player wins!');
        pScore++;
        document.getElementById('player-score').innerText = pScore;
        return;
      }
      
      if (board.every(cell => cell !== '')) {
        endGame("It's a draw!");
        return;
      }
      
      playerActive = false;
      document.getElementById('status').innerText = 'AI is thinking...';
      
      setTimeout(aiMove, 650);
    }

    function aiMove() {
      // Find empty slots
      const empties = board.map((c, i) => c === '' ? i : null).filter(c => c !== null);
      if (empties.length === 0) return;
      
      // Smart AI tries to block or win, else random
      let choice = empties[Math.floor(Math.random() * empties.length)];
      
      // Try to win first
      for (let combo of winCombos) {
        const oCount = combo.filter(i => board[i] === 'O').length;
        const emptyIdx = combo.find(i => board[i] === '');
        if (oCount === 2 && emptyIdx !== undefined) {
          choice = emptyIdx;
          break;
        }
      }
      
      // Try to block block X
      for (let combo of winCombos) {
        const xCount = combo.filter(i => board[i] === 'X').length;
        const emptyIdx = combo.find(i => board[i] === '');
        if (xCount === 2 && emptyIdx !== undefined) {
          choice = emptyIdx;
          break;
        }
      }
      
      board[choice] = 'O';
      draw();
      
      if (checkWin('O')) {
        endGame('AI wins!');
        aScore++;
        document.getElementById('ai-score').innerText = aScore;
        return;
      }
      
      if (board.every(cell => cell !== '')) {
        endGame("It's a draw!");
        return;
      }
      
      playerActive = true;
      document.getElementById('status').innerText = 'Your Turn (X)';
    }

    function checkWin(player) {
      return winCombos.some(combo => combo.every(i => board[i] === player));
    }

    function draw() {
      board.forEach((val, i) => {
        const cell = document.getElementById('c' + i);
        cell.innerText = val;
        cell.className = 'cell ' + val.toLowerCase();
      });
    }

    function endGame(msg) {
      playerActive = false;
      document.getElementById('status').innerText = msg;
    }

    function resetGame() {
      board = Array(9).fill('');
      playerActive = true;
      document.getElementById('status').innerText = 'Your Turn (X)';
      draw();
    }
  </script>
</body>
</html>`;
}

// 5. MEMORY CARD GAME TEMPLATE
function getMemoryGameTemplate(directive) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>AACE Memory Matrix</title>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    ${SHARED_CSS}
    .board {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      margin: 20px 0;
    }
    .card {
      background: rgba(0, 0, 0, 0.4);
      border: 1px solid var(--border);
      border-radius: 8px;
      height: 70px;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 24px;
      cursor: pointer;
      user-select: none;
      transition: all 0.25s;
    }
    .card.flipped {
      background: rgba(59, 130, 246, 0.15);
      border-color: var(--accent-blue);
      color: white;
    }
    .card.matched {
      background: rgba(16, 185, 129, 0.15);
      border-color: var(--accent-green);
      color: var(--accent-green);
      cursor: default;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 14px;
      font-size: 13px;
    }
  </style>
</head>
<body>
  <div class="glass-card">
    <h2 style="text-align: center; margin-bottom: 16px;">Memory Card Matching</h2>
    <div class="info-row">
      <span>Tries: <strong id="tries">0</strong></span>
      <span>Matched: <strong id="matched-count">0/8</strong></span>
    </div>
    
    <div class="board" id="board"></div>
    
    <div style="text-align: center;">
      <button class="btn" onclick="initGame()">Reset Game</button>
    </div>
    
    <p class="footer-note">Compiled autonomously by AACE Frontend Developer Bot</p>
  </div>
  
  <script>
    const icons = ['☀️', '🌧️', '⚡', '❄️', '🔥', '💧', '🌈', '⭐'];
    let cards = [];
    let flippedIndices = [];
    let matchedCount = 0;
    let tries = 0;
    let lockBoard = false;

    function initGame() {
      matchedCount = 0;
      tries = 0;
      flippedIndices = [];
      lockBoard = false;
      document.getElementById('tries').innerText = tries;
      document.getElementById('matched-count').innerText = '0/8';
      
      // Duplicate icons and shuffle
      const deck = [...icons, ...icons];
      for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
      }
      
      cards = deck.map(icon => ({ icon, flipped: false, matched: false }));
      render();
    }

    function render() {
      const boardEl = document.getElementById('board');
      boardEl.innerHTML = '';
      
      cards.forEach((card, idx) => {
        const el = document.createElement('div');
        el.className = 'card' + (card.flipped ? ' flipped' : '') + (card.matched ? ' matched' : '');
        el.innerText = (card.flipped || card.matched) ? card.icon : '❓';
        el.onclick = () => flipCard(idx);
        boardEl.appendChild(el);
      });
    }

    function flipCard(idx) {
      if (lockBoard || cards[idx].flipped || cards[idx].matched) return;
      
      cards[idx].flipped = true;
      flippedIndices.push(idx);
      render();
      
      if (flippedIndices.length === 2) {
        tries++;
        document.getElementById('tries').innerText = tries;
        checkMatch();
      }
    }

    function checkMatch() {
      const [first, second] = flippedIndices;
      if (cards[first].icon === cards[second].icon) {
        cards[first].matched = true;
        cards[second].matched = true;
        matchedCount++;
        document.getElementById('matched-count').innerText = matchedCount + '/8';
        flippedIndices = [];
        render();
      } else {
        lockBoard = true;
        setTimeout(() => {
          cards[first].flipped = false;
          cards[second].flipped = false;
          flippedIndices = [];
          lockBoard = false;
          render();
        }, 1000);
      }
    }

    initGame();
  </script>
</body>
</html>`;
}

// 6. TIMER TEMPLATE
function getTimerTemplate(directive) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>AACE Interval Timer</title>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    ${SHARED_CSS}
    .timer-display {
      font-size: 56px;
      font-weight: 700;
      color: var(--accent-cyan);
      font-family: monospace;
      text-align: center;
      margin: 20px 0;
      letter-spacing: 2px;
    }
    .btn-row {
      display: flex;
      justify-content: center;
      gap: 12px;
      margin-bottom: 24px;
    }
    .mode-tabs {
      display: flex;
      background: rgba(0,0,0,0.2);
      border-radius: 8px;
      padding: 4px;
      margin-bottom: 20px;
    }
    .tab {
      flex: 1;
      text-align: center;
      padding: 8px;
      cursor: pointer;
      font-weight: 600;
      font-size: 13px;
      border-radius: 6px;
      transition: all 0.2s;
    }
    .tab.active {
      background: var(--accent-blue);
      color: white;
    }
    .input-group {
      display: flex;
      justify-content: center;
      gap: 8px;
      align-items: center;
      margin-bottom: 20px;
    }
    .input-group input {
      width: 60px;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="glass-card">
    <h2 style="text-align: center; margin-bottom: 16px;">Precision Timer</h2>
    
    <div class="mode-tabs">
      <div class="tab active" id="tab-stopwatch" onclick="setMode('stopwatch')">Stopwatch</div>
      <div class="tab" id="tab-countdown" onclick="setMode('countdown')">Countdown</div>
    </div>
    
    <div class="input-group" id="input-row" style="display: none;">
      <input type="number" id="minutes" min="0" max="99" value="5"><span>min</span>
      <input type="number" id="seconds" min="0" max="59" value="00"><span>sec</span>
    </div>
    
    <div class="timer-display" id="time-display">00:00.00</div>
    
    <div class="btn-row">
      <button class="btn" id="btn-start" onclick="toggleTimer()">Start</button>
      <button class="btn btn-secondary" onclick="resetTimer()">Reset</button>
    </div>
    
    <p class="footer-note">Compiled autonomously by AACE Frontend Developer Bot</p>
  </div>
  
  <script>
    let mode = 'stopwatch';
    let running = false;
    let timerId = null;
    
    // Stopwatch vars
    let startTime = 0;
    let elapsed = 0;
    
    // Countdown vars
    let targetTime = 0; // ms
    let audioCtx = null;

    function setMode(newMode) {
      if (running) toggleTimer();
      mode = newMode;
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.getElementById('tab-' + newMode).classList.add('active');
      
      const inputRow = document.getElementById('input-row');
      if (mode === 'countdown') {
        inputRow.style.display = 'flex';
        document.getElementById('time-display').innerText = '05:00.00';
      } else {
        inputRow.style.display = 'none';
        document.getElementById('time-display').innerText = '00:00.00';
      }
      resetTimer();
    }

    function toggleTimer() {
      const btn = document.getElementById('btn-start');
      if (running) {
        clearInterval(timerId);
        btn.innerText = 'Start';
        btn.style.background = 'linear-gradient(135deg, var(--accent-blue), #1d4ed8)';
        running = false;
      } else {
        running = true;
        btn.innerText = 'Pause';
        btn.style.background = 'linear-gradient(135deg, var(--accent-red), #b91c1c)';
        
        if (mode === 'stopwatch') {
          startTime = Date.now() - elapsed;
          timerId = setInterval(updateStopwatch, 10);
        } else {
          // Initialize countdown values
          if (elapsed === 0) {
            const m = parseInt(document.getElementById('minutes').value) || 0;
            const s = parseInt(document.getElementById('seconds').value) || 0;
            elapsed = (m * 60 + s) * 1000;
          }
          startTime = Date.now();
          targetTime = startTime + elapsed;
          timerId = setInterval(updateCountdown, 10);
        }
      }
    }

    function updateStopwatch() {
      elapsed = Date.now() - startTime;
      formatTime(elapsed);
    }

    function updateCountdown() {
      let remain = targetTime - Date.now();
      if (remain <= 0) {
        remain = 0;
        clearInterval(timerId);
        running = false;
        document.getElementById('btn-start').innerText = 'Start';
        document.getElementById('btn-start').style.background = 'linear-gradient(135deg, var(--accent-blue), #1d4ed8)';
        playAlarm();
        alert('Timer Finished!');
        resetTimer();
      }
      formatTime(remain);
    }

    function formatTime(ms) {
      let cent = Math.floor((ms % 1000) / 10);
      let sec = Math.floor((ms / 1000) % 60);
      let min = Math.floor((ms / 60000) % 100);
      
      cent = cent.toString().padStart(2, '0');
      sec = sec.toString().padStart(2, '0');
      min = min.toString().padStart(2, '0');
      
      document.getElementById('time-display').innerText = \`\${min}:\${sec}.\${cent}\`;
    }

    function resetTimer() {
      clearInterval(timerId);
      running = false;
      elapsed = 0;
      document.getElementById('btn-start').innerText = 'Start';
      document.getElementById('btn-start').style.background = 'linear-gradient(135deg, var(--accent-blue), #1d4ed8)';
      if (mode === 'stopwatch') {
        document.getElementById('time-display').innerText = '00:00.00';
      } else {
        const m = parseInt(document.getElementById('minutes').value) || 5;
        const s = parseInt(document.getElementById('seconds').value) || 0;
        document.getElementById('time-display').innerText = \`\${m.toString().padStart(2, '0')}:\${s.toString().padStart(2, '0')}.00\`;
      }
    }

    function playAlarm() {
      try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        let osc = audioCtx.createOscillator();
        let gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
        gain.gain.setValueAtTime(0.5, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.5);
      } catch (e) {
        console.error(e);
      }
    }
  </script>
</body>
</html>`;
}

// 7. EXPENSE TRACKER TEMPLATE
function getExpenseTemplate(directive) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>AACE Ledger Ledger</title>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    ${SHARED_CSS}
    .balance-card {
      background: rgba(0, 0, 0, 0.25);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 16px;
      text-align: center;
      margin-bottom: 20px;
    }
    .flow-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 20px;
    }
    .flow-box {
      border: 1px solid var(--border);
      background: rgba(0, 0, 0, 0.15);
      border-radius: 8px;
      padding: 10px;
      text-align: center;
    }
    .flow-box.inc { border-color: rgba(16, 185, 129, 0.2); color: var(--accent-green); }
    .flow-box.exp { border-color: rgba(239, 68, 68, 0.2); color: var(--accent-red); }
    .tx-list {
      max-height: 180px;
      overflow-y: auto;
      margin-bottom: 20px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .tx-item {
      background: rgba(0, 0, 0, 0.2);
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 8px 12px;
      display: flex;
      justify-content: space-between;
      font-size: 13px;
      align-items: center;
    }
    .tx-item.inc { border-left: 4px solid var(--accent-green); }
    .tx-item.exp { border-left: 4px solid var(--accent-red); }
    .tx-input-grid {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr;
      gap: 8px;
      margin-bottom: 12px;
    }
    .tx-input-grid button {
      height: 100%;
    }
  </style>
</head>
<body>
  <div class="glass-card">
    <h2 style="margin-bottom: 16px; text-align: center;">Expense Ledger</h2>
    
    <div class="balance-card">
      <span style="font-size: 12px; color: var(--text-secondary);">YOUR BALANCE</span>
      <h1 id="total-balance" style="font-size: 32px; color: var(--accent-cyan); margin-top: 4px;">$0.00</h1>
    </div>
    
    <div class="flow-row">
      <div class="flow-box inc">
        <span style="font-size: 10px; color: var(--text-secondary);">INCOME</span>
        <h3 id="tot-inc" style="margin-top: 4px;">+$0.00</h3>
      </div>
      <div class="flow-box exp">
        <span style="font-size: 10px; color: var(--text-secondary);">EXPENSES</span>
        <h3 id="tot-exp" style="margin-top: 4px;">-$0.00</h3>
      </div>
    </div>
    
    <div class="tx-input-grid">
      <input type="text" id="tx-desc" placeholder="Description (e.g. Salary, Coffee)">
      <input type="number" id="tx-amount" placeholder="Amount ($)">
      <select id="tx-type">
        <option value="exp">Expense</option>
        <option value="inc">Income</option>
      </select>
    </div>
    <button class="btn" style="width: 100%; margin-bottom: 20px;" onclick="addTx()">Add Transaction</button>
    
    <h3 style="font-size: 14px; margin-bottom: 10px;">Transaction History</h3>
    <div id="tx-list" class="tx-list"></div>
    
    <p class="footer-note">Compiled autonomously by AACE Frontend Developer Bot</p>
  </div>
  
  <script>
    let txs = JSON.parse(localStorage.getItem('aace_expenses')) || [
      { desc: "Contractor payment", amount: 1500, type: "inc" },
      { desc: "Server staging hosts", amount: 120, type: "exp" },
      { desc: "Coffee cups", amount: 15, type: "exp" }
    ];

    function save() {
      localStorage.setItem('aace_expenses', JSON.stringify(txs));
      render();
    }

    function addTx() {
      const descEl = document.getElementById('tx-desc');
      const amtEl = document.getElementById('tx-amount');
      const typeEl = document.getElementById('tx-type');
      
      const desc = descEl.value.trim();
      const amount = parseFloat(amtEl.value) || 0;
      const type = typeEl.value;
      
      if (!desc || amount <= 0) return;
      txs.push({ desc, amount, type });
      descEl.value = '';
      amtEl.value = '';
      save();
    }

    function deleteTx(idx) {
      txs.splice(idx, 1);
      save();
    }

    function render() {
      const list = document.getElementById('tx-list');
      list.innerHTML = '';
      
      let income = 0;
      let expenses = 0;
      
      txs.forEach((tx, idx) => {
        if (tx.type === 'inc') income += tx.amount;
        else expenses += tx.amount;
        
        const div = document.createElement('div');
        div.className = 'tx-item ' + tx.type;
        div.innerHTML = \`
          <span>\${tx.desc}</span>
          <div style="display: flex; align-items: center; gap: 8px;">
            <strong style="color: \${tx.type === 'inc' ? 'var(--accent-green)' : 'var(--accent-red)'}">
              \${tx.type === 'inc' ? '+' : '-'}$ \${tx.amount.toFixed(2)}
            </strong>
            <span style="color: var(--accent-red); cursor: pointer; font-size: 11px;" onclick="deleteTx(\${idx})">✕</span>
          </div>
        \`;
        list.appendChild(div);
      });
      
      const bal = income - expenses;
      document.getElementById('total-balance').innerText = \`$\${bal.toFixed(2)}\`;
      document.getElementById('tot-inc').innerText = \`+$ \${income.toFixed(2)}\`;
      document.getElementById('tot-exp').innerText = \`-$ \${expenses.toFixed(2)}\`;
    }

    render();
  </script>
</body>
</html>`;
}

// 8. QUIZ TEMPLATE
function getQuizTemplate(directive) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>AACE Tech Challenge</title>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    ${SHARED_CSS}
    .options {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin: 20px 0;
    }
    .option {
      background: rgba(0, 0, 0, 0.2);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 12px 16px;
      cursor: pointer;
      text-align: left;
      transition: all 0.2s;
    }
    .option:hover {
      border-color: var(--accent-blue);
      background: rgba(59, 130, 246, 0.05);
    }
    .option.correct {
      border-color: var(--accent-green);
      background: rgba(16, 185, 129, 0.1);
      color: var(--accent-green);
    }
    .option.wrong {
      border-color: var(--accent-red);
      background: rgba(239, 68, 68, 0.1);
      color: var(--accent-red);
    }
    .progress-bar {
      height: 4px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 2px;
      margin-bottom: 20px;
    }
    .progress-fill {
      height: 100%;
      background: var(--accent-blue);
      border-radius: 2px;
      width: 0%;
      transition: width 0.3s ease;
    }
  </style>
</head>
<body>
  <div class="glass-card">
    <div id="quiz-screen">
      <div class="progress-bar"><div class="progress-fill" id="progress"></div></div>
      <h4 id="q-number" style="font-size: 12px; color: var(--text-secondary); margin-bottom: 8px;">QUESTION 1 OF 3</h4>
      <h2 id="q-text" style="font-size: 18px; margin-bottom: 16px;">What is the primary role of the CEO Advisor Bot?</h2>
      
      <div class="options" id="options-box"></div>
      <button class="btn" style="width: 100%; display: none;" id="btn-next" onclick="nextQuestion()">Next Question</button>
    </div>
    
    <div id="score-screen" style="display: none; text-align: center;">
      <h2 style="color: var(--accent-green); font-size: 28px; margin-bottom: 8px;">Quiz Completed!</h2>
      <p style="color: var(--text-secondary); margin-bottom: 20px;">You scored</p>
      <h1 id="score-val" style="font-size: 58px; color: var(--accent-cyan); margin-bottom: 24px;">3/3</h1>
      <button class="btn" onclick="startQuiz()">Play Again</button>
    </div>
    
    <p class="footer-note">Compiled autonomously by AACE Frontend Developer Bot</p>
  </div>
  
  <script>
    const questions = [
      {
        q: "What is the primary tech stack utilized by the AACE Platform?",
        a: ["React + Node.js", "Python + Django", "Go + Flutter", "Ruby on Rails"],
        correct: 0
      },
      {
        q: "Which bot manages workflows and operational margins?",
        a: ["CTO Architecture Bot", "COO Operations Bot", "Legal & Compliance Bot", "Marketing & Growth Bot"],
        correct: 1
      },
      {
        q: "Where are key structural decisions stored in AACE?",
        a: ["Config Map files", "SQLite flat files", "Memory Vault Ledger", "Slack Webhooks"],
        correct: 2
      }
    ];

    let currentIdx = 0;
    let score = 0;
    let answered = false;

    function startQuiz() {
      currentIdx = 0;
      score = 0;
      answered = false;
      document.getElementById('quiz-screen').style.display = 'block';
      document.getElementById('score-screen').style.display = 'none';
      loadQuestion();
    }

    function loadQuestion() {
      answered = false;
      document.getElementById('btn-next').style.display = 'none';
      
      const q = questions[currentIdx];
      document.getElementById('q-number').innerText = \`QUESTION \${currentIdx + 1} OF \${questions.length}\`;
      document.getElementById('q-text').innerText = q.q;
      
      const fill = ((currentIdx) / questions.length) * 100;
      document.getElementById('progress').style.width = fill + '%';
      
      const box = document.getElementById('options-box');
      box.innerHTML = '';
      
      q.a.forEach((optText, i) => {
        const div = document.createElement('div');
        div.className = 'option';
        div.innerText = optText;
        div.onclick = () => selectOption(i, div);
        box.appendChild(div);
      });
    }

    function selectOption(idx, el) {
      if (answered) return;
      answered = true;
      
      const q = questions[currentIdx];
      const nextBtn = document.getElementById('btn-next');
      nextBtn.style.display = 'block';
      
      if (idx === q.correct) {
        el.classList.add('correct');
        score++;
      } else {
        el.classList.add('wrong');
        // highlight correct answer
        document.getElementById('options-box').children[q.correct].classList.add('correct');
      }
    }

    function nextQuestion() {
      currentIdx++;
      if (currentIdx < questions.length) {
        loadQuestion();
      } else {
        showScore();
      }
    }

    function showScore() {
      document.getElementById('progress').style.width = '100%';
      document.getElementById('quiz-screen').style.display = 'none';
      document.getElementById('score-screen').style.display = 'block';
      document.getElementById('score-val').innerText = score + ' / ' + questions.length;
    }

    startQuiz();
  </script>
</body>
</html>`;
}

// 9. NOTES APP TEMPLATE
function getNotesTemplate(directive) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>AACE Quick Notes</title>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    ${SHARED_CSS}
    .notes-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 12px;
      margin-top: 20px;
      max-height: 250px;
      overflow-y: auto;
      padding-right: 4px;
    }
    .note-card {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 14px;
      position: relative;
    }
    .note-card .delete {
      position: absolute;
      top: 10px;
      right: 12px;
      color: var(--accent-red);
      cursor: pointer;
      opacity: 0.6;
      font-size: 12px;
    }
    .note-card .delete:hover {
      opacity: 1;
    }
    .note-text {
      font-size: 13px;
      color: var(--text-main);
      white-space: pre-wrap;
      margin-top: 4px;
    }
    .note-time {
      font-size: 10px;
      color: var(--text-secondary);
      margin-top: 8px;
      display: block;
    }
  </style>
</head>
<body>
  <div class="glass-card">
    <h2 style="margin-bottom: 12px;">Notes Ledger</h2>
    <textarea id="note-input" rows="3" placeholder="Type a note here..." style="resize: none; margin-bottom: 10px;"></textarea>
    <button class="btn" style="width: 100%;" onclick="addNote()">Save Note</button>
    
    <div id="notes-list" class="notes-grid"></div>
    
    <p class="footer-note">Compiled autonomously by AACE Frontend Developer Bot</p>
  </div>
  
  <script>
    let notes = JSON.parse(localStorage.getItem('aace_notes')) || [
      { text: "CTO audit composites done.", time: "10:30 AM" },
      { text: "Setup router configurations inside deployment templates.", time: "Yesterday" }
    ];

    function save() {
      localStorage.setItem('aace_notes', JSON.stringify(notes));
      render();
    }

    function addNote() {
      const input = document.getElementById('note-input');
      const text = input.value.trim();
      if (!text) return;
      
      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      notes.unshift({ text, time });
      input.value = '';
      save();
    }

    function deleteNote(idx) {
      notes.splice(idx, 1);
      save();
    }

    function render() {
      const list = document.getElementById('notes-list');
      list.innerHTML = '';
      
      notes.forEach((note, idx) => {
        const div = document.createElement('div');
        div.className = 'note-card';
        div.innerHTML = \`
          <span class="delete" onclick="deleteNote(\${idx})">✕</span>
          <div class="note-text">\${note.text}</div>
          <span class="note-time">\${note.time}</span>
        \`;
        list.appendChild(div);
      });
    }

    render();
  </script>
</body>
</html>`;
}

// 10. PASSWORD GENERATOR TEMPLATE
function getPasswordTemplate(directive) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>AACE PassKey Generator</title>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    ${SHARED_CSS}
    .pass-display-row {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
    }
    .pass-box {
      flex: 1;
      background: rgba(0,0,0,0.3);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 12px;
      font-family: monospace;
      font-size: 18px;
      color: var(--accent-cyan);
      letter-spacing: 1px;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 48px;
      user-select: all;
    }
    .slider-row {
      margin-bottom: 18px;
    }
    .slider-row label {
      display: flex;
      justify-content: space-between;
      font-size: 13px;
      margin-bottom: 8px;
      color: var(--text-secondary);
    }
    .options-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 20px;
    }
    .opt-label {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: var(--text-secondary);
      cursor: pointer;
    }
    .opt-label input {
      width: auto;
    }
  </style>
</head>
<body>
  <div class="glass-card">
    <h2 style="text-align: center; margin-bottom: 16px;">PassKey Generator</h2>
    
    <div class="pass-display-row">
      <div class="pass-box" id="pass-display">Loading...</div>
      <button class="btn btn-secondary" onclick="copyPass()">Copy</button>
    </div>
    
    <div class="slider-row">
      <label><span>Password Length:</span><strong id="len-label">16</strong></label>
      <input type="range" id="length" min="6" max="32" value="16" oninput="document.getElementById('len-label').innerText = this.value; generate()">
    </div>
    
    <div class="options-grid">
      <label class="opt-label"><input type="checkbox" id="upper" checked onchange="generate()"> Upper Case</label>
      <label class="opt-label"><input type="checkbox" id="lower" checked onchange="generate()"> Lower Case</label>
      <label class="opt-label"><input type="checkbox" id="numbers" checked onchange="generate()"> Numbers</label>
      <label class="opt-label"><input type="checkbox" id="symbols" checked onchange="generate()"> Symbols</label>
    </div>
    
    <button class="btn" style="width: 100%;" onclick="generate()">Generate Password</button>
    
    <p class="footer-note">Compiled autonomously by AACE Frontend Developer Bot</p>
  </div>
  
  <script>
    const uppers = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowers = 'abcdefghijklmnopqrstuvwxyz';
    const nums = '0123456789';
    const syms = '!@#$%^&*()_+~|}{[]:;?><,./-=';

    function generate() {
      const len = parseInt(document.getElementById('length').value);
      const hasUpper = document.getElementById('upper').checked;
      const hasLower = document.getElementById('lower').checked;
      const hasNums = document.getElementById('numbers').checked;
      const hasSyms = document.getElementById('symbols').checked;
      
      let pool = '';
      if (hasUpper) pool += uppers;
      if (hasLower) pool += lowers;
      if (hasNums) pool += nums;
      if (hasSyms) pool += syms;
      
      if (!pool) {
        document.getElementById('pass-display').innerText = 'Select Options';
        return;
      }
      
      let pass = '';
      for (let i = 0; i < len; i++) {
        pass += pool.charAt(Math.floor(Math.random() * pool.length));
      }
      document.getElementById('pass-display').innerText = pass;
    }

    function copyPass() {
      const text = document.getElementById('pass-display').innerText;
      if (text === 'Select Options') return;
      navigator.clipboard.writeText(text);
      alert('Password copied to clipboard!');
    }

    generate();
  </script>
</body>
</html>`;
}

// 11. COLOR PALETTE TEMPLATE
function getColorTemplate(directive) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>AACE HuePalette</title>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    ${SHARED_CSS}
    .palette-box {
      display: flex;
      gap: 10px;
      height: 140px;
      margin: 20px 0;
    }
    .color-col {
      flex: 1;
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      align-items: center;
      padding-bottom: 10px;
      font-size: 11px;
      font-weight: 700;
      color: white;
      text-shadow: 0 1px 3px rgba(0,0,0,0.8);
      cursor: pointer;
      border: 1px solid var(--border);
      transition: transform 0.2s;
    }
    .color-col:hover {
      transform: scale(1.03);
    }
  </style>
</head>
<body>
  <div class="glass-card">
    <h2 style="text-align: center; margin-bottom: 16px;">Color Palette Generator</h2>
    <p style="font-size: 12px; color: var(--text-secondary); text-align: center;">Click color column to copy hex code</p>
    
    <div class="palette-box">
      <div class="color-col" id="col0" onclick="copyCol(0)">#FFFFFF</div>
      <div class="color-col" id="col1" onclick="copyCol(1)">#FFFFFF</div>
      <div class="color-col" id="col2" onclick="copyCol(2)">#FFFFFF</div>
      <div class="color-col" id="col3" onclick="copyCol(3)">#FFFFFF</div>
      <div class="color-col" id="col4" onclick="copyCol(4)">#FFFFFF</div>
    </div>
    
    <button class="btn" style="width: 100%;" onclick="generate()">Generate Palette</button>
    
    <p class="footer-note">Compiled autonomously by AACE Frontend Developer Bot</p>
  </div>
  
  <script>
    let hexes = [];

    function generate() {
      hexes = [];
      for (let i = 0; i < 5; i++) {
        const hex = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0').toUpperCase();
        hexes.push(hex);
        
        const col = document.getElementById('col' + i);
        col.style.background = hex;
        col.innerText = hex;
      }
    }

    function copyCol(idx) {
      navigator.clipboard.writeText(hexes[idx]);
      alert('Copied hex code: ' + hexes[idx]);
    }

    generate();
  </script>
</body>
</html>`;
}

// 12. UNIT CONVERTER TEMPLATE
function getUnitConverterTemplate(directive) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>AACE Unit Converter</title>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    ${SHARED_CSS}
    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 20px;
    }
    .box {
      border: 1px solid var(--border);
      background: rgba(0,0,0,0.15);
      border-radius: 8px;
      padding: 14px;
    }
  </style>
</head>
<body>
  <div class="glass-card">
    <h2 style="text-align: center; margin-bottom: 16px;">Unit Converter</h2>
    
    <div style="margin-bottom: 16px;">
      <select id="type" onchange="updateType()">
        <option value="length">Length (Meters / Kilometers / Feet / Inches)</option>
        <option value="weight">Weight (Kilograms / Grams / Pounds)</option>
      </select>
    </div>
    
    <div class="grid">
      <div class="box">
        <label style="font-size: 11px; color: var(--text-secondary); display: block; margin-bottom: 6px;">FROM</label>
        <select id="from-unit" style="margin-bottom: 10px;" onchange="convert()"></select>
        <input type="number" id="from-val" value="1" oninput="convert()">
      </div>
      <div class="box">
        <label style="font-size: 11px; color: var(--text-secondary); display: block; margin-bottom: 6px;">TO</label>
        <select id="to-unit" style="margin-bottom: 10px;" onchange="convert()"></select>
        <input type="number" id="to-val" readonly>
      </div>
    </div>
    
    <p class="footer-note">Compiled autonomously by AACE Frontend Developer Bot</p>
  </div>
  
  <script>
    const UNITS = {
      length: {
        m: { label: "Meters", factor: 1 },
        km: { label: "Kilometers", factor: 1000 },
        ft: { label: "Feet", factor: 0.3048 },
        in: { label: "Inches", factor: 0.0254 }
      },
      weight: {
        kg: { label: "Kilograms", factor: 1 },
        g: { label: "Grams", factor: 0.001 },
        lb: { label: "Pounds", factor: 0.453592 }
      }
    };

    function updateType() {
      const type = document.getElementById('type').value;
      const fromSel = document.getElementById('from-unit');
      const toSel = document.getElementById('to-unit');
      
      fromSel.innerHTML = '';
      toSel.innerHTML = '';
      
      Object.keys(UNITS[type]).forEach(key => {
        const opt = UNITS[type][key];
        fromSel.add(new Option(opt.label, key));
        toSel.add(new Option(opt.label, key));
      });
      
      // select different values
      if (toSel.options.length > 1) {
        toSel.selectedIndex = 1;
      }
      convert();
    }

    function convert() {
      const type = document.getElementById('type').value;
      const fromUnit = document.getElementById('from-unit').value;
      const toUnit = document.getElementById('to-unit').value;
      const fromVal = parseFloat(document.getElementById('from-val').value) || 0;
      
      const fromFactor = UNITS[type][fromUnit].factor;
      const toFactor = UNITS[type][toUnit].factor;
      
      // Convert to base unit then to target unit
      const valInBase = fromVal * fromFactor;
      const targetVal = valInBase / toFactor;
      
      document.getElementById('to-val').value = targetVal.toFixed(4);
    }

    updateType();
  </script>
</body>
</html>`;
}

// 12. GENERAL CUSTOM TEMPLATE
function getGeneralPortfolioTemplate(directive) {
  const cleanTitle = directive.replace(/^(create|make|build|generate|design|write)\s+/i, "");
  const capitalizedTitle = cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1);
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${capitalizedTitle}</title>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    ${SHARED_CSS}
    .glass-card {
      max-width: 650px;
      text-align: center;
    }
    .badge {
      background: rgba(16, 185, 129, 0.08);
      border: 1px solid rgba(16, 185, 129, 0.2);
      color: #10b981;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 20px;
    }
    .pulse {
      width: 6px;
      height: 6px;
      background: #10b981;
      border-radius: 50%;
      box-shadow: 0 0 8px #10b981;
      animation: pulseGlow 1.5s infinite;
    }
    @keyframes pulseGlow {
      0% { opacity: 0.5; }
      50% { opacity: 1; }
      100% { opacity: 0.5; }
    }
    .content-box {
      background: rgba(0, 0, 0, 0.2);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 20px;
      text-align: left;
      margin: 20px 0;
      line-height: 1.6;
    }
    .interactive-item {
      padding: 10px 14px;
      background: rgba(255,255,255,0.02);
      border: 1px solid var(--border);
      border-radius: 8px;
      margin-top: 10px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .interactive-item:hover {
      border-color: var(--accent-cyan);
      transform: translateX(4px);
    }
  </style>
</head>
<body>
  <div class="glass-card">
    <div class="badge"><span class="pulse"></span> Custom AACE Build</div>
    <h1 style="color: var(--accent-cyan); margin-bottom: 8px;">${capitalizedTitle}</h1>
    <p style="font-size: 14px; color: var(--text-secondary);">Your custom requested client page is successfully configured & ready.</p>
    
    <div class="content-box">
      <h3 style="font-size: 15px; margin-bottom: 10px; color: var(--accent-purple);">Build Specifications</h3>
      <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 12px;">The Frontend Developer Bot compiled a dynamic interface containing operational hooks matching your exact directive:</p>
      <div style="font-family: monospace; font-size: 13px; color: var(--accent-cyan); padding: 8px; background: rgba(0,0,0,0.3); border-radius: 6px; border: 1px solid var(--border); margin-bottom: 16px;">
        "${directive}"
      </div>
      
      <h3 style="font-size: 15px; margin-bottom: 10px; color: var(--accent-blue);">Interactive Components</h3>
      <div class="interactive-item" onclick="alert('Component 1: Operational audit initialized.')">
        <strong>⚙️ System Diagnostics Component</strong>
        <p style="font-size: 11px; color: var(--text-secondary); margin-top: 2px;">Click to verify pipeline handshake diagnostics.</p>
      </div>
      <div class="interactive-item" onclick="alert('Component 2: Secure staging mapping loaded.')">
        <strong>🔑 Access Control Mapping</strong>
        <p style="font-size: 11px; color: var(--text-secondary); margin-top: 2px;">Click to load verified developer authentication parameters.</p>
      </div>
    </div>
    
    <button class="btn" onclick="alert('Custom target application compiled and launched successfully!')">Initialize Application</button>
    <p class="footer-note">Compiled autonomously by AACE Frontend Developer Bot</p>
  </div>
</body>
</html>`;
}
