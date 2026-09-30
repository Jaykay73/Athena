from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.domain import Workspace
from app.models.schemas import WorkspaceOut, WorkspaceCreate

router = APIRouter(prefix="/workspaces", tags=["workspaces"])

@router.get("", response_model=List[WorkspaceOut])
def list_workspaces(db: Session = Depends(get_db)):
    return db.query(Workspace).order_by(Workspace.created_at.asc()).all()

@router.post("", response_model=WorkspaceOut)
def create_workspace(req: WorkspaceCreate, db: Session = Depends(get_db)):
    ws = Workspace(name=req.name, description=req.description)
    db.add(ws)
    db.commit()
    db.refresh(ws)
    return ws
