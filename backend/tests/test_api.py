import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.database import engine, Base
from app.seed.init_data import initialize_system

# Ensure DB tables and seed data are present
Base.metadata.create_all(bind=engine)
initialize_system()

client = TestClient(app)

def test_api_health():
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.json()["status"] == "healthy"

def test_api_workspaces_and_datasets():
    res = client.get("/api/workspaces")
    assert res.status_code == 200
    workspaces = res.json()
    assert len(workspaces) >= 1

    ws_id = workspaces[0]["id"]
    res_ds = client.get(f"/api/datasets?workspace_id={ws_id}")
    assert res_ds.status_code == 200
    datasets = res_ds.json()
    assert len(datasets) >= 1

def test_api_evaluations_latest():
    res = client.get("/api/evaluations/latest")
    assert res.status_code == 200
    data = res.json()
    assert data["total_cases"] >= 50
    assert data["numerical_accuracy"] > 80.0
    assert data["sql_success_rate"] > 90.0

def test_api_settings():
    res = client.get("/api/settings")
    assert res.status_code == 200
    settings_data = res.json()
    assert settings_data["project_name"] == "Athena"
