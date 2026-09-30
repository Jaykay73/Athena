import os
from pathlib import Path
from typing import List
from pydantic_settings import BaseSettings

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_DIR = BASE_DIR / "storage" / "datasets"
REPORTS_DIR = BASE_DIR / "storage" / "reports"
DOCS_DIR = BASE_DIR / "storage" / "documents"

DATA_DIR.mkdir(parents=True, exist_ok=True)
REPORTS_DIR.mkdir(parents=True, exist_ok=True)
DOCS_DIR.mkdir(parents=True, exist_ok=True)

class Settings(BaseSettings):
    PROJECT_NAME: str = "Athena"
    SUBTITLE: str = "Your AI analyst for business data."
    API_V1_STR: str = "/api"
    
    # Storage & DB
    DATABASE_URL: str = f"sqlite:///{BASE_DIR}/storage/athena.db"
    DUCKDB_PATH: str = str(BASE_DIR / "storage" / "athena_analytics.duckdb")
    STORAGE_DATASETS_DIR: str = str(DATA_DIR)
    STORAGE_REPORTS_DIR: str = str(REPORTS_DIR)
    STORAGE_DOCS_DIR: str = str(DOCS_DIR)

    # LLM Settings
    ATHENA_MODEL_PROVIDER: str = os.getenv("ATHENA_MODEL_PROVIDER", "deterministic")  # deterministic fallback works out-of-the-box
    ATHENA_MODEL: str = os.getenv("ATHENA_MODEL", "gpt-4o")
    ATHENA_FALLBACK_PROVIDER: str = "deterministic"
    
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    DEEPSEEK_API_KEY: str = os.getenv("DEEPSEEK_API_KEY", "")
    OPENROUTER_API_KEY: str = os.getenv("OPENROUTER_API_KEY", "")
    
    # Guardrails & Budgets
    MAX_AGENT_ITERATIONS: int = 8
    MAX_TOOL_CALLS_PER_ANALYSIS: int = 15
    EXECUTION_TIMEOUT_SECONDS: int = 30
    MAX_FILE_SIZE_MB: int = 100
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ]

    model_config = {
        "case_sensitive": True,
        "env_file": ".env",
        "extra": "allow"
    }

settings = Settings()
