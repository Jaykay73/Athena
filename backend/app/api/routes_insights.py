import os
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
import pandas as pd

from app.core.database import get_db
from app.models.domain import Dataset
from app.agent.autonomous import AutonomousInvestigator
from app.models.schemas import AutonomousInvestigationOut

router = APIRouter(prefix="/insights", tags=["insights"])

@router.post("/scan", response_model=AutonomousInvestigationOut)
def scan_dataset_for_insights(dataset_id: str = Query(...), db: Session = Depends(get_db)):
    ds = db.query(Dataset).filter((Dataset.id == dataset_id) | (Dataset.name == dataset_id)).first()
    if not ds:
        raise HTTPException(status_code=404, detail="Dataset not found")

    if not os.path.exists(ds.file_path):
        raise HTTPException(status_code=404, detail="Dataset file missing on disk")

    if ds.file_type == "csv":
        df = pd.read_csv(ds.file_path)
    elif ds.file_type in ["xlsx", "xls"]:
        df = pd.read_excel(ds.file_path)
    elif ds.file_type == "parquet":
        df = pd.read_parquet(ds.file_path)
    else:
        df = pd.read_csv(ds.file_path)

    result = AutonomousInvestigator.scan_dataset(df, dataset_id=ds.id, dataset_name=ds.name)
    return result
