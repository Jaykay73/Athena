from typing import Dict, Any
from fastapi import APIRouter
from app.core.config import settings
from app.llm.providers import get_llm_provider

router = APIRouter(prefix="/settings", tags=["settings"])

@router.get("")
def get_settings() -> Dict[str, Any]:
    active_prov = get_llm_provider()
    return {
        "project_name": settings.PROJECT_NAME,
        "subtitle": settings.SUBTITLE,
        "active_provider": settings.ATHENA_MODEL_PROVIDER,
        "active_model": settings.ATHENA_MODEL,
        "fallback_provider": settings.ATHENA_FALLBACK_PROVIDER,
        "is_llm_available": active_prov.is_available(),
        "openai_configured": bool(settings.OPENAI_API_KEY),
        "gemini_configured": bool(settings.GEMINI_API_KEY),
        "deepseek_configured": bool(settings.DEEPSEEK_API_KEY),
        "openrouter_configured": bool(settings.OPENROUTER_API_KEY),
        "max_iterations": settings.MAX_AGENT_ITERATIONS,
        "timeout_seconds": settings.EXECUTION_TIMEOUT_SECONDS
    }
