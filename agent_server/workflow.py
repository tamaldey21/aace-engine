"""
LangGraph Workflow for AACE Agent Server
State machine: plan → code → validate → respond
"""

import os
from typing import TypedDict, Optional, List
from dotenv import load_dotenv

load_dotenv()

# ── State Definition ───────────────────────────────────────
class AgentState(TypedDict):
    message: str
    history: list
    plan: Optional[str]
    code: Optional[str]
    filename: Optional[str]
    language: Optional[str]
    validated: bool
    response: Optional[str]
    tokens_used: int
    error: Optional[str]

# ── Node Functions ─────────────────────────────────────────
def planner_node(state: AgentState) -> AgentState:
    """Analyzes the user message and creates a coding plan."""
    msg = state["message"].lower()

    # Determine what to build
    if any(k in msg for k in ["calculator", "calc"]):
        plan = "Build a dark-themed calculator with CSS grid layout"
        filename = "calculator.html"
        language = "html"
    elif any(k in msg for k in ["todo", "task"]):
        plan = "Build a glassmorphism todo manager with local storage"
        filename = "todo.html"
        language = "html"
    elif any(k in msg for k in ["dashboard", "analytics"]):
        plan = "Build a dark analytics dashboard with charts"
        filename = "dashboard.html"
        language = "html"
    elif any(k in msg for k in ["landing", "home page", "homepage"]):
        plan = "Build a modern landing page with hero section"
        filename = "landing.html"
        language = "html"
    elif any(k in msg for k in ["weather"]):
        plan = "Build a weather dashboard UI"
        filename = "weather.html"
        language = "html"
    else:
        # Extract filename if mentioned
        words = msg.split()
        filename = None
        for word in words:
            if word.endswith(".html") or word.endswith(".css") or word.endswith(".js"):
                filename = word
                language = word.split(".")[-1]
                break
        if not filename:
            filename = "app.html"
            language = "html"
        plan = f"Build the requested application: {state['message']}"

    return {
        **state,
        "plan": plan,
        "filename": filename,
        "language": language
    }

def coder_node(state: AgentState) -> AgentState:
    """Generates code based on the plan. Uses API if available."""
    import os, httpx

    api_key = os.getenv("LLM_API_KEY", "")
    api_url = os.getenv("LLM_API_URL", "https://api.bluesminds.com")

    if api_key and api_url:
        try:
            prompt = f"""You are an expert web developer. Generate complete, beautiful, production-ready code.

Plan: {state['plan']}
User request: {state['message']}
Output filename: {state['filename']}

Requirements:
- Dark theme with premium aesthetics
- Glassmorphism effects where appropriate
- Fully self-contained single file (all CSS/JS inline)
- No external dependencies
- Responsive design
- Smooth animations

Return ONLY the raw code, no markdown fences, no explanation."""

            response = httpx.post(
                f"{api_url}/v1/chat/completions",
                headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
                json={
                    "model": "gpt-4o-mini",
                    "messages": [{"role": "user", "content": prompt}],
                    "max_tokens": 4000,
                    "temperature": 0.7
                },
                timeout=30.0
            )
            if response.status_code == 200:
                data = response.json()
                code = data["choices"][0]["message"]["content"]
                tokens = data.get("usage", {}).get("total_tokens", 0)
                return {**state, "code": code, "tokens_used": tokens}
        except Exception as e:
            print(f"API error in coder_node: {e}")

    # Fallback: generate template code
    code = _generate_template(state["plan"], state["filename"])
    return {**state, "code": code, "tokens_used": 0}

def _generate_template(plan: str, filename: str) -> str:
    name = filename.replace(".html", "").replace(".css", "").replace(".js", "").title()
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{name} — AACE Engine</title>
<style>
  * {{ margin: 0; padding: 0; box-sizing: border-box; }}
  body {{
    font-family: 'Inter', system-ui, sans-serif;
    background: linear-gradient(135deg, #0a0a0f 0%, #0d1117 50%, #0a0f1a 100%);
    min-height: 100vh; display: flex; align-items: center; justify-content: center;
    color: #e2e8f0;
  }}
  .container {{
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(0,240,255,0.15);
    border-radius: 16px; padding: 40px;
    max-width: 600px; width: 90%;
    backdrop-filter: blur(20px);
    box-shadow: 0 0 40px rgba(0,240,255,0.05);
  }}
  h1 {{
    font-size: 28px; font-weight: 800;
    background: linear-gradient(135deg, #00f0ff, #818cf8);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    margin-bottom: 12px;
  }}
  p {{ color: #94a3b8; line-height: 1.6; }}
  .badge {{
    display: inline-block; margin-top: 20px;
    padding: 6px 14px; border-radius: 20px;
    background: rgba(0,240,255,0.1); border: 1px solid rgba(0,240,255,0.3);
    color: #00f0ff; font-size: 11px; font-weight: 700; letter-spacing: 0.5px;
  }}
</style>
</head>
<body>
  <div class="container">
    <h1>{name}</h1>
    <p>{plan}</p>
    <p>Generated by AACE Engine · Powered by LangGraph + Pydantic AI</p>
    <span class="badge">🤖 AI Generated</span>
  </div>
</body>
</html>"""

def validator_node(state: AgentState) -> AgentState:
    """Validates the generated code."""
    code = state.get("code", "")
    # Basic validation
    if len(code) > 50:
        return {**state, "validated": True}
    return {**state, "validated": False, "error": "Generated code too short"}

def responder_node(state: AgentState) -> AgentState:
    """Writes the file to sandbox and builds the response message."""
    import os

    sandbox_path = os.getenv("SANDBOX_PATH", "./server/sandbox")
    os.makedirs(sandbox_path, exist_ok=True)

    filename = state.get("filename", "output.html")
    code = state.get("code", "")

    if code and state.get("validated"):
        filepath = os.path.join(sandbox_path, filename)
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(code)
        response = f"✅ Code generated and staged successfully!\n\n**File:** `{filename}`\n**Plan:** {state.get('plan','')}\n**Engine:** LangGraph Workflow → Pydantic AI\n\nYou can review the file in the Sandbox panel on the right, then click **Deploy to Production** to go live."
    else:
        response = f"⚠️ Code generation encountered an issue: {state.get('error', 'Unknown error')}. Please try again."

    return {**state, "response": response}

# ── Build LangGraph ────────────────────────────────────────
def build_graph():
    try:
        from langgraph.graph import StateGraph, END

        graph = StateGraph(AgentState)
        graph.add_node("planner", planner_node)
        graph.add_node("coder", coder_node)
        graph.add_node("validator", validator_node)
        graph.add_node("responder", responder_node)

        graph.set_entry_point("planner")
        graph.add_edge("planner", "coder")
        graph.add_edge("coder", "validator")
        graph.add_edge("validator", "responder")
        graph.add_edge("responder", END)

        return graph.compile()
    except Exception as e:
        print(f"LangGraph build error: {e}")
        return None

_graph = None

def get_graph():
    global _graph
    if _graph is None:
        _graph = build_graph()
    return _graph

# ── Public function ────────────────────────────────────────
async def run_workflow(message: str, history: list) -> dict:
    graph = get_graph()
    if graph is None:
        raise RuntimeError("LangGraph not available")

    initial_state = AgentState(
        message=message,
        history=history,
        plan=None, code=None, filename=None,
        language=None, validated=False,
        response=None, tokens_used=0, error=None
    )

    result = graph.invoke(initial_state)

    files = []
    if result.get("code") and result.get("filename"):
        files.append({
            "name": result["filename"],
            "content": result["code"],
            "language": result.get("language", "html")
        })

    return {
        "text": result.get("response", "Workflow completed."),
        "files": files,
        "tokens_used": result.get("tokens_used", 0)
    }
