import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base
from app.seed.init_data import initialize_system
from app.api.routes_datasets import router as datasets_router
from app.api.routes_analyses import router as analyses_router
from app.api.routes_insights import router as insights_router
from app.api.routes_reports import router as reports_router
from app.api.routes_evaluations import router as evaluations_router
from app.api.routes_workspaces import router as workspaces_router
from app.api.routes_settings import router as settings_router

logger = logging.getLogger("athena")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure tables and golden seed data are populated
    logger.info("Initializing Athena analytical platform...")
    Base.metadata.create_all(bind=engine)
    try:
        initialize_system()
        logger.info("Athena initialized successfully.")
    except Exception as e:
        logger.error(f"Error during initialization: {e}")
    yield
    logger.info("Shutting down Athena...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Athena: Production AI analyst for business data. Deterministic computation, evidence grounding, and autonomous investigation.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(datasets_router, prefix=settings.API_V1_STR)
app.include_router(analyses_router, prefix=settings.API_V1_STR)
app.include_router(insights_router, prefix=settings.API_V1_STR)
app.include_router(reports_router, prefix=settings.API_V1_STR)
app.include_router(evaluations_router, prefix=settings.API_V1_STR)
app.include_router(workspaces_router, prefix=settings.API_V1_STR)
app.include_router(settings_router, prefix=settings.API_V1_STR)

@app.get("/api/health")
def healthcheck():
    return {
        "status": "healthy",
        "service": "Athena AI Analyst API",
        "version": "1.0.0",
        "engine": "DuckDB + Python Statistical Stack"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
