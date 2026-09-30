import os
import shutil
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
import pandas as pd

from app.core.database import get_db
from app.core.config import DATA_DIR
from app.core.security import validate_uploaded_file, sanitize_filename
from app.models.domain import Dataset, DatasetVersion, DatasetColumn, Workspace
from app.models.schemas import DatasetOut, DatasetProfileSummary
from app.engine.profiler import DataProfiler
from app.engine.duckdb_engine import analytics_engine

router = APIRouter(prefix="/datasets", tags=["datasets"])

@router.get("", response_model=List[DatasetOut])
def list_datasets(workspace_id: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Dataset)
    if workspace_id:
        query = query.filter(Dataset.workspace_id == workspace_id)
    return query.order_by(Dataset.created_at.desc()).all()

@router.get("/{dataset_id}", response_model=DatasetOut)
def get_dataset(dataset_id: str, db: Session = Depends(get_db)):
    ds = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if not ds:
        # Check by name
        ds = db.query(Dataset).filter(Dataset.name == dataset_id).first()
    if not ds:
        raise HTTPException(status_code=404, detail="Dataset not found")
    return ds

@router.get("/{dataset_id}/profile")
def get_dataset_profile(dataset_id: str, db: Session = Depends(get_db)):
    ds = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if not ds:
        ds = db.query(Dataset).filter(Dataset.name == dataset_id).first()
    if not ds:
        raise HTTPException(status_code=404, detail="Dataset not found")
    return ds.profile_summary or {}

@router.get("/{dataset_id}/preview")
def get_dataset_preview(dataset_id: str, limit: int = 20, db: Session = Depends(get_db)):
    ds = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if not ds:
        ds = db.query(Dataset).filter(Dataset.name == dataset_id).first()
    if not ds:
        raise HTTPException(status_code=404, detail="Dataset not found")

    res = analytics_engine.execute_query(f"SELECT * FROM {ds.name} LIMIT {limit}")
    return res

@router.post("/upload", response_model=DatasetOut)
async def upload_dataset(
    file: UploadFile = File(...),
    workspace_id: str = Form(...),
    dataset_name: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    ws = db.query(Workspace).filter(Workspace.id == workspace_id).first()
    if not ws:
        raise HTTPException(status_code=404, detail="Workspace not found")

    clean_filename = sanitize_filename(file.filename or "uploaded_dataset.csv")
    ext = os.path.splitext(clean_filename)[1].lower()

    # Save to disk
    target_path = os.path.join(str(DATA_DIR), clean_filename)
    with open(target_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    file_size = os.path.getsize(target_path)
    is_valid, err = validate_uploaded_file(clean_filename, file_size)
    if not is_valid:
        os.remove(target_path)
        raise HTTPException(status_code=400, detail=err)

    # Load dataframe for profiling
    try:
        if ext == ".csv":
            df = pd.read_csv(target_path)
        elif ext in [".xlsx", ".xls"]:
            df = pd.read_excel(target_path)
        elif ext == ".parquet":
            df = pd.read_parquet(target_path)
        elif ext == ".json":
            df = pd.read_json(target_path)
        else:
            raise ValueError("Unsupported format")
    except Exception as e:
        if os.path.exists(target_path):
            os.remove(target_path)
        raise HTTPException(status_code=400, detail=f"Failed to parse file: {str(e)}")

    name = dataset_name or os.path.splitext(clean_filename)[0]
    clean_view_name = name.lower().replace(" ", "_").replace("-", "_")

    # Profile dataset
    profile_data = DataProfiler.profile(df, dataset_name=clean_view_name)
    analytics_engine.register_dataframe(clean_view_name, df)

    ds = Dataset(
        workspace_id=workspace_id,
        name=clean_view_name,
        description=description or f"Uploaded {ext.upper()} dataset: {clean_filename}",
        file_type=ext.replace(".", ""),
        file_path=target_path,
        current_version=1,
        row_count=profile_data["row_count"],
        column_count=profile_data["column_count"],
        data_quality_score=profile_data["data_quality_score"],
        profile_summary=profile_data,
        quality_warnings=profile_data["warnings"],
        semantic_types=profile_data["semantic_types"]
    )
    db.add(ds)
    db.commit()
    db.refresh(ds)

    ver = DatasetVersion(
        dataset_id=ds.id,
        version_number=1,
        file_path=target_path,
        file_hash=f"hash_{ds.id}_v1",
        row_count=profile_data["row_count"],
        change_summary="Initial upload"
    )
    db.add(ver)

    for col in profile_data["columns"]:
        dcol = DatasetColumn(
            dataset_id=ds.id,
            column_name=col["column_name"],
            data_type=col["data_type"],
            semantic_type=col["semantic_type"],
            missing_count=col["missing_count"],
            missing_percentage=col["missing_percentage"],
            unique_count=col["unique_count"],
            sample_values=col["sample_values"],
            min_value=col["min_value"],
            max_value=col["max_value"],
            mean_value=col["mean_value"]
        )
        db.add(dcol)
    db.commit()

    return ds
