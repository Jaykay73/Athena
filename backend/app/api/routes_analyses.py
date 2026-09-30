import os
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import pandas as pd

from app.core.database import get_db
from app.models.domain import Analysis, Dataset, Workspace, AnalysisStep, Evidence
from app.models.schemas import AnalysisRequest, AnalysisOut, ChallengeRequest
from app.agent.investigator import AgentInvestigator
from app.agent.tools import ToolRegistry
from app.agent.challenge import ChallengeEngine

router = APIRouter(prefix="/analyses", tags=["analyses"])

@router.get("", response_model=List[AnalysisOut])
def list_analyses(workspace_id: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Analysis)
    if workspace_id:
        query = query.filter(Analysis.workspace_id == workspace_id)
    return query.order_by(Analysis.created_at.desc()).all()

@router.get("/{analysis_id}", response_model=AnalysisOut)
def get_analysis(analysis_id: str, db: Session = Depends(get_db)):
    analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return analysis

@router.post("", response_model=AnalysisOut)
def create_analysis(req: AnalysisRequest, db: Session = Depends(get_db)):
    ws = db.query(Workspace).filter(Workspace.id == req.workspace_id).first()
    if not ws:
        raise HTTPException(status_code=404, detail="Workspace not found")

    ds_name = req.dataset_id or "sales_transactions"
    ds = db.query(Dataset).filter((Dataset.id == ds_name) | (Dataset.name == ds_name)).first()
    
    df = None
    if ds and os.path.exists(ds.file_path):
        if ds.file_type == "csv":
            df = pd.read_csv(ds.file_path)
        elif ds.file_type in ["xlsx", "xls"]:
            df = pd.read_excel(ds.file_path)
        elif ds.file_type == "parquet":
            df = pd.read_parquet(ds.file_path)

    # Prepare tool registry
    active_dfs = {ds.name if ds else "sales_transactions": df} if df is not None else {}
    tools = ToolRegistry(active_dfs)
    investigator = AgentInvestigator(tools)

    res = investigator.investigate(
        question=req.question,
        dataset_name=ds.name if ds else "sales_transactions",
        df=df,
        workspace_id=req.workspace_id,
        context_filters=req.context_filters
    )

    # Save to database
    analysis_rec = Analysis(
        id=res["id"],
        workspace_id=req.workspace_id,
        dataset_id=ds.id if ds else None,
        dataset_version=ds.current_version if ds else 1,
        question=res["question"],
        status="completed",
        intent=res["intent"],
        findings_summary=res["findings_summary"],
        detailed_answer=res["detailed_answer"],
        confidence=res["confidence"],
        confidence_rationale=res["confidence_rationale"],
        limitations=res["limitations"],
        recommendations=res["recommendations"],
        execution_duration_ms=res["execution_duration_ms"],
        model_name=res["model_name"],
        is_saved=False,
        hypotheses=res["hypotheses"],
        metrics=res["metrics"],
        tables=res["tables"],
        charts=res["charts"],
        lineage=res["lineage"]
    )
    db.add(analysis_rec)

    # Save evidence records
    for ev in res["evidence"]:
        ev_rec = Evidence(
            analysis_id=res["id"],
            claim=ev["claim"],
            source_dataset=ev["source_dataset"],
            relevant_columns=ev["relevant_columns"],
            computation_type=ev["computation_type"],
            query_or_code=ev["query_or_code"],
            computed_result=ev["computed_result"],
            assumptions=ev["assumptions"],
            verification_status=ev["verification_status"]
        )
        db.add(ev_rec)

    # Save trace steps
    for st in res["steps"]:
        st_rec = AnalysisStep(
            analysis_id=res["id"],
            step_number=st["step_number"],
            action=st["action"],
            details=st.get("details"),
            duration_ms=st.get("duration_ms", 0.0)
        )
        db.add(st_rec)

    db.commit()
    db.refresh(analysis_rec)

    return analysis_rec

@router.post("/{analysis_id}/challenge")
def challenge_analysis(analysis_id: str, db: Session = Depends(get_db)):
    analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")

    result = ChallengeEngine.challenge_analysis(
        original_analysis={
            "findings_summary": analysis.findings_summary,
            "metrics": analysis.metrics
        }
    )

    analysis.challenge_result = result
    db.commit()
    return result

@router.post("/{analysis_id}/save")
def toggle_save_analysis(analysis_id: str, db: Session = Depends(get_db)):
    analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")

    analysis.is_saved = not analysis.is_saved
    db.commit()
    return {"id": analysis.id, "is_saved": analysis.is_saved}

@router.post("/{analysis_id}/rerun", response_model=AnalysisOut)
def rerun_analysis(analysis_id: str, db: Session = Depends(get_db)):
    analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")

    # Rerun with the exact original parameters
    req = AnalysisRequest(
        workspace_id=analysis.workspace_id,
        dataset_id=analysis.dataset_id,
        question=analysis.question
    )
    return create_analysis(req, db)
