import pytest
import pandas as pd
from app.agent.tools import ToolRegistry
from app.agent.investigator import AgentInvestigator
from app.agent.challenge import ChallengeEngine

def test_investigation_orchestrator():
    # Mini dataset mimicking golden patterns
    df = pd.DataFrame({
        "order_id": ["ORD-1", "ORD-2", "ORD-3", "ORD-4"],
        "order_date": ["2026-05-01", "2026-05-15", "2026-08-01", "2026-08-15"],
        "region": ["North America", "Europe", "North America", "Europe"],
        "revenue": [5000.0, 3000.0, 3000.0, 2900.0],
        "quantity": [5, 3, 3, 3]
    })

    tools = ToolRegistry({"sales_transactions": df})
    investigator = AgentInvestigator(tools)

    res = investigator.investigate(
        question="Why did revenue decline in Q3 compared to Q2?",
        dataset_name="sales_transactions",
        df=df,
        workspace_id="ws-test"
    )

    assert res["status"] == "completed"
    assert len(res["hypotheses"]) > 0
    assert len(res["evidence"]) > 0
    assert res["lineage"] is not None
    assert len(res["steps"]) >= 4

    # Test Challenge Athena
    challenge = ChallengeEngine.challenge_analysis(res)
    assert challenge["status"] in ["CONFIRMED_ROBUST", "CONFIRMED_WITH_NUANCE"]
    assert len(challenge["tests_conducted"]) >= 3
