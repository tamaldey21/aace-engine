"""
AACE Engine - Python Agent Server
Powered by: Pydantic AI + LangGraph + FastAPI
"""

import os
import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="AACE Agent Server",
    description="Powered by Pydantic AI + LangGraph",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Request / Response Models ──────────────────────────────
class Message(BaseModel):
    sender: str
    text: str

class ChatRequest(BaseModel):
    message: str
    history: Optional[list[Message]] = []
    sandbox_path: Optional[str] = "./sandbox"

class CodeFile(BaseModel):
    name: str
    content: str
    language: str

class ChatResponse(BaseModel):
    text: str
    agent_source: str  # "langgraph" | "pydantic_ai" | "fallback"
    files: Optional[list[CodeFile]] = []
    tokens_used: Optional[int] = 0

# ── Health check ───────────────────────────────────────────
@app.get("/")
def root():
    return {
        "status": "online",
        "service": "AACE Agent Server",
        "powered_by": ["Pydantic AI", "LangGraph", "Ruflo"],
        "version": "1.0.0"
    }

@app.get("/health")
def health():
    return {"status": "ok"}

# ── Main chat endpoint ─────────────────────────────────────
@app.post("/agent/chat", response_model=ChatResponse)
async def agent_chat(req: ChatRequest):
    """
    Routes the message through:
    1. LangGraph workflow (plan → code → validate → respond)
    2. Pydantic AI agent for structured code generation
    3. Fallback if API unavailable
    """
    try:
        # Try LangGraph workflow first
        from workflow import run_workflow
        result = await run_workflow(req.message, req.history or [])
        return ChatResponse(
            text=result["text"],
            agent_source="langgraph",
            files=result.get("files", []),
            tokens_used=result.get("tokens_used", 0)
        )
    except ImportError:
        pass
    except Exception as e:
        print(f"LangGraph error: {e}")

    try:
        # Fallback: Pydantic AI direct agent
        from agent import run_agent
        result = await run_agent(req.message, req.history or [])
        return ChatResponse(
            text=result["text"],
            agent_source="pydantic_ai",
            files=result.get("files", []),
            tokens_used=result.get("tokens_used", 0)
        )
    except Exception as e:
        print(f"Pydantic AI error: {e}")

    # Final fallback
    return ChatResponse(
        text=_fallback_response(req.message),
        agent_source="fallback",
        files=[]
    )

def _fallback_response(msg: str) -> str:
    msg_lower = msg.lower()
    if any(k in msg_lower for k in ["calculator", "calc"]):
        return "I'll generate a calculator app for you. [Staged: calculator.html]"
    if any(k in msg_lower for k in ["todo", "task list"]):
        return "I'll generate a todo manager for you. [Staged: todo.html]"
    if any(k in msg_lower for k in ["dashboard", "analytics"]):
        return "I'll generate a dashboard for you. [Staged: dashboard.html]"
    return "Python Agent Server online. LangGraph + Pydantic AI ready. Send me a coding task!"

# ── Run ────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("AGENT_PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
