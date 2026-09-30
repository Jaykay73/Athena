import os
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import pandas as pd

from app.core.database import get_db
from app.core.config import DATA_DIR
from app.models.domain import EvaluationRun
from app.models.schemas import EvaluationRunOut
from app.evaluation.runner import EvaluationRunner

router = APIRouter(prefix="/evaluations", tags=["evaluations"])

def load_evaluation_dataframes() -> dict:
    dfs = {}
    for name, filename in [
        ("sales_transactions", "sales_transactions.csv"),
        ("customers", "customers.csv"),
        ("products", "products.csv"),
        ("marketing", "marketing.csv")
    ]:
        p = os.path.join(str(DATA_DIR), filename)
        if os.path.exists(p):
            dfs[name] = pd.read_csv(p)
    return dfs

@router.get("", response_model=List[EvaluationRunOut])
def list_evaluations(db: Session = Depends(get_db)):
    return db.query(EvaluationRun).order_by(EvaluationRun.run_timestamp.desc()).all()

@router.get("/latest", response_model=Optional[EvaluationRunOut])
def get_latest_evaluation(db: Session = Depends(get_db)):
    latest = db.query(EvaluationRun).order_by(EvaluationRun.run_timestamp.desc()).first()
    if not latest:
        # Run suite automatically if none exists
        dfs = load_evaluation_dataframes()
        eval_dict = EvaluationRunner.run_suite(dfs)
        run_rec = EvaluationRun(
            id=eval_dict["id"],
            run_timestamp=pd.Timestamp.now().to_pydatetime(),
            total_cases=eval_dict["total_cases"],
            passed_cases=eval_dict["passed_cases"],
            numerical_accuracy=eval_dict["numerical_accuracy"],
            evidence_grounding=eval_dict["evidence_grounding"],
            sql_success_rate=eval_dict["sql_success_rate"],
            hallucination_rate=eval_dict["hallucination_rate"],
            average_duration_ms=eval_dict["average_duration_ms"],
            category_breakdown=eval_dict["category_breakdown"],
            case_results=eval_dict["case_results"]
        )
        db.add(run_rec)
        db.commit()
        db.refresh(run_rec)
        return run_rec
    return latest

@router.get("/{run_id}", response_model=EvaluationRunOut)
def get_evaluation(run_id: str, db: Session = Depends(get_db)):
    run_rec = db.query(EvaluationRun).filter(EvaluationRun.id == run_id).first()
    if not run_rec:
        raise HTTPException(status_code=404, detail="Evaluation run not found")
    return run_rec

@router.post("/run", response_model=EvaluationRunOut)
def trigger_evaluation_run(db: Session = Depends(get_db)):
    dfs = load_evaluation_dataframes()
    eval_dict = EvaluationRunner.run_suite(dfs)

    run_rec = EvaluationRun(
        id=eval_dict["id"],
        run_timestamp=pd.Timestamp.now().to_pydatetime(),
        total_cases=eval_dict["total_cases"],
        passed_cases=eval_dict["passed_cases"],
        numerical_accuracy=eval_dict["numerical_accuracy"],
        evidence_grounding=eval_dict["evidence_grounding"],
        sql_success_rate=eval_dict["sql_success_rate"],
        hallucination_rate=eval_dict["hallucination_rate"],
        average_duration_ms=eval_dict["average_duration_ms"],
        category_breakdown=eval_dict["category_breakdown"],
        case_results=eval_dict["case_results"]
    )
    db.add(run_rec)
    db.commit()
    db.refresh(run_rec)

    return run_rec
