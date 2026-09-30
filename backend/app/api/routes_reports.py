import os
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Response
from fastapi.responses import FileResponse, PlainTextResponse, HTMLResponse
from sqlalchemy.orm import Session
import pandas as pd

from app.core.database import get_db
from app.core.config import REPORTS_DIR
from app.models.domain import Report, Workspace, Dataset
from app.models.schemas import ReportCreateRequest, ReportOut
from app.reports.generator import ReportGenerator
from app.reports.exporters import ReportExporter

router = APIRouter(prefix="/reports", tags=["reports"])

@router.get("", response_model=List[ReportOut])
def list_reports(workspace_id: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Report)
    if workspace_id:
        query = query.filter(Report.workspace_id == workspace_id)
    return query.order_by(Report.created_at.desc()).all()

@router.get("/{report_id}", response_model=ReportOut)
def get_report(report_id: str, db: Session = Depends(get_db)):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report

@router.post("", response_model=ReportOut)
def create_report(req: ReportCreateRequest, db: Session = Depends(get_db)):
    ws = db.query(Workspace).filter(Workspace.id == req.workspace_id).first()
    if not ws:
        raise HTTPException(status_code=404, detail="Workspace not found")

    df = None
    if req.dataset_id:
        ds = db.query(Dataset).filter((Dataset.id == req.dataset_id) | (Dataset.name == req.dataset_id)).first()
        if ds and os.path.exists(ds.file_path):
            df = pd.read_csv(ds.file_path)

    rep_dict = ReportGenerator.generate_executive_report(
        workspace_id=req.workspace_id,
        title=req.title,
        subtitle=req.subtitle or "Executive Business Performance & Risk Assessment",
        period_label=req.period_label or "Q3 2026",
        df=df
    )

    report_rec = Report(
        id=rep_dict["id"],
        workspace_id=req.workspace_id,
        title=rep_dict["title"],
        subtitle=rep_dict["subtitle"],
        date_range=rep_dict["date_range"],
        executive_summary=rep_dict["executive_summary"],
        sections=rep_dict["sections"],
        key_metrics=rep_dict["key_metrics"],
        risks_and_anomalies=rep_dict["risks_and_anomalies"],
        recommended_actions=rep_dict["recommended_actions"],
        methodology_and_limitations=rep_dict["methodology_and_limitations"],
        data_quality_summary=rep_dict["data_quality_summary"]
    )
    db.add(report_rec)
    db.commit()
    db.refresh(report_rec)

    return report_rec

@router.get("/{report_id}/export/{export_format}")
def export_report(report_id: str, export_format: str, db: Session = Depends(get_db)):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    rep_dict = {
        "title": report.title,
        "subtitle": report.subtitle,
        "date_range": report.date_range,
        "created_at": report.created_at.strftime("%Y-%m-%d %H:%M UTC") if report.created_at else "",
        "key_metrics": report.key_metrics,
        "sections": report.sections,
        "risks_and_anomalies": report.risks_and_anomalies,
        "recommended_actions": report.recommended_actions,
        "methodology_and_limitations": report.methodology_and_limitations,
    }

    fmt = export_format.lower()
    if fmt == "markdown" or fmt == "md":
        content = ReportExporter.to_markdown(rep_dict)
        return PlainTextResponse(content, media_type="text/markdown")
    elif fmt == "html":
        content = ReportExporter.to_html(rep_dict)
        return HTMLResponse(content)
    elif fmt == "pdf":
        pdf_filename = f"athena_report_{report.id}.pdf"
        pdf_path = os.path.join(str(REPORTS_DIR), pdf_filename)
        ReportExporter.to_pdf(rep_dict, pdf_path)
        return FileResponse(pdf_path, media_type="application/pdf", filename=f"Athena_Report_{report.title.replace(' ', '_')}.pdf")
    else:
        raise HTTPException(status_code=400, detail=f"Unsupported export format '{fmt}'. Use markdown, html, or pdf.")
