"""
Pydantic AI Agent for AACE Engine
Type-safe, structured code generation
"""

import os
from typing import Optional
from dotenv import load_dotenv

load_dotenv()

# ── Pydantic Models ────────────────────────────────────────
try:
    from pydantic import BaseModel as PydanticBase

    class CodeOutput(PydanticBase):
        explanation: str
        filename: str
        language: str
        code: str
        success: bool

except ImportError:
    pass

# ── Agent Runner ───────────────────────────────────────────
async def run_agent(message: str, history: list) -> dict:
    """Run Pydantic AI agent with structured output."""
    try:
        from pydantic_ai import Agent
        from pydantic_ai.models.openai import OpenAIModel

        api_key = os.getenv("LLM_API_KEY", "")
        api_url = os.getenv("LLM_API_URL", "https://api.bluesminds.com")

        if not api_key:
            raise ValueError("No API key configured")

        model = OpenAIModel(
            "gpt-4o-mini",
            base_url=f"{api_url}/v1",
            api_key=api_key
        )

        agent = Agent(
            model,
            result_type=CodeOutput,
            system_prompt="""You are Main Engineer AI — an advanced agentic coding assistant.
Your task is to generate complete, beautiful, production-ready web code.
Always return valid structured output with filename, language, code, and explanation.
Use dark themes, glassmorphism effects, and premium aesthetics.
All code must be fully self-contained (CSS and JS inline in HTML files)."""
        )

        result = await agent.run(message)
        output = result.data

        files = []
        if output.code and output.filename:
            # Write to sandbox
            sandbox_path = os.getenv("SANDBOX_PATH", "./server/sandbox")
            os.makedirs(sandbox_path, exist_ok=True)
            filepath = os.path.join(sandbox_path, output.filename)
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(output.code)
            files.append({
                "name": output.filename,
                "content": output.code,
                "language": output.language
            })

        response_text = f"✅ {output.explanation}\n\n**File:** `{output.filename}`\n**Engine:** Pydantic AI Agent\n\nFile staged in Sandbox. Click **Deploy to Production** when ready."

        return {
            "text": response_text,
            "files": files,
            "tokens_used": result.usage().total_tokens if hasattr(result, 'usage') else 0
        }

    except Exception as e:
        raise RuntimeError(f"Pydantic AI agent error: {e}")
