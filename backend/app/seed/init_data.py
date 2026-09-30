import os
from pathlib import Path
import pandas as pd
from app.core.config import settings, DATA_DIR
from app.core.database import engine, Base, SessionLocal
from app.models.domain import Workspace, Dataset, DatasetVersion, DatasetColumn, Analysis, Report
from app.seed.synthetic_data import generate_golden_datasets
from app.engine.profiler import DataProfiler
from app.engine.duckdb_engine import analytics_engine
from app.engine.rag_engine import rag_engine
from app.agent.investigator import AgentInvestigator
from app.agent.tools import ToolRegistry
from app.reports.generator import ReportGenerator

def initialize_system():
    """Initializes tables, default workspace, synthetic data, profiles, and demo investigations."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Generate synthetic data files
    generate_golden_datasets(str(DATA_DIR))

    # Check or create default workspace
    ws = db.query(Workspace).filter_by(name="Acme Corp").first()
    if not ws:
        ws = Workspace(
            id="ws-acme-default",
            name="Acme Corp",
            description="Global enterprise technology and subscription hardware sales workspace."
        )
        db.add(ws)
        db.commit()
        db.refresh(ws)

    # Ingest golden datasets
    datasets_to_load = [
        {"name": "sales_transactions", "file": "sales_transactions.csv", "desc": "Enterprise sales transactions covering Q1-Q3 2026."},
        {"name": "customers", "file": "customers.csv", "desc": "Customer accounts, tiers, and acquisition channels."},
        {"name": "products", "file": "products.csv", "desc": "Product catalog, standard pricing, and COGS benchmarks."},
        {"name": "marketing", "file": "marketing.csv", "desc": "Daily multi-channel acquisition campaigns and conversions."}
    ]

    loaded_dfs = {}
    for item in datasets_to_load:
        file_path = os.path.join(str(DATA_DIR), item["file"])
        if not os.path.exists(file_path):
            continue

        df = pd.read_csv(file_path)
        loaded_dfs[item["name"]] = df
        analytics_engine.register_dataframe(item["name"], df)

        existing_ds = db.query(Dataset).filter_by(workspace_id=ws.id, name=item["name"]).first()
        if not existing_ds:
            profile_data = DataProfiler.profile(df, dataset_name=item["name"])
            
            ds = Dataset(
                workspace_id=ws.id,
                name=item["name"],
                description=item["desc"],
                file_type="csv",
                file_path=file_path,
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

            # Add dataset version
            ver = DatasetVersion(
                dataset_id=ds.id,
                version_number=1,
                file_path=file_path,
                file_hash=f"hash_{item['name']}_v1",
                row_count=profile_data["row_count"],
                change_summary="Initial golden baseline ingestion"
            )
            db.add(ver)

            # Add column profiles
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

    # Index policy document in RAG
    policy_path = os.path.join(str(DATA_DIR), "pricing_and_discount_policy.md")
    if os.path.exists(policy_path):
        rag_engine.index_file("doc-policy-01", policy_path)

    # Seed an initial demo investigation
    existing_analysis = db.query(Analysis).filter_by(workspace_id=ws.id).first()
    if not existing_analysis and "sales_transactions" in loaded_dfs:
        tool_reg = ToolRegistry(loaded_dfs)
        investigator = AgentInvestigator(tool_reg)
        res = investigator.investigate(
            question="Why did revenue decline in Q3 compared to Q2?",
            dataset_name="sales_transactions",
            df=loaded_dfs["sales_transactions"],
            workspace_id=ws.id
        )

        analysis_rec = Analysis(
            id=res["id"],
            workspace_id=ws.id,
            dataset_id="sales_transactions",
            dataset_version=1,
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
            is_saved=True,
            hypotheses=res["hypotheses"],
            metrics=res["metrics"],
            tables=res["tables"],
            charts=res["charts"],
            lineage=res["lineage"]
        )
        db.add(analysis_rec)
        db.commit()

    # Seed an initial executive report
    existing_report = db.query(Report).filter_by(workspace_id=ws.id).first()
    if not existing_report:
        rep_dict = ReportGenerator.generate_executive_report(ws.id, df=loaded_dfs.get("sales_transactions"))
        rep_rec = Report(
            id=rep_dict["id"],
            workspace_id=ws.id,
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
        db.add(rep_rec)
        db.commit()

    db.close()
    print("Athena initialization and data seeding completed successfully.")

if __name__ == "__main__":
    initialize_system()
