import uuid
from datetime import datetime
from typing import Dict, Any, List, Optional
from sqlalchemy import Column, String, Integer, Float, Boolean, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

class Workspace(Base):
    __tablename__ = "workspaces"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    datasets = relationship("Dataset", back_populates="workspace", cascade="all, delete-orphan")
    analyses = relationship("Analysis", back_populates="workspace", cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="workspace", cascade="all, delete-orphan")

class Dataset(Base):
    __tablename__ = "datasets"

    id = Column(String, primary_key=True, default=generate_uuid)
    workspace_id = Column(String, ForeignKey("workspaces.id"), nullable=False)
    name = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    file_type = Column(String(20), nullable=False)  # csv, xlsx, json, parquet
    file_path = Column(String(500), nullable=False)
    current_version = Column(Integer, default=1)
    
    row_count = Column(Integer, default=0)
    column_count = Column(Integer, default=0)
    data_quality_score = Column(Float, default=100.0)
    
    # Serialized JSON profile data
    profile_summary = Column(JSON, nullable=True)
    quality_warnings = Column(JSON, nullable=True)
    semantic_types = Column(JSON, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    workspace = relationship("Workspace", back_populates="datasets")
    versions = relationship("DatasetVersion", back_populates="dataset", cascade="all, delete-orphan")
    columns = relationship("DatasetColumn", back_populates="dataset", cascade="all, delete-orphan")

class DatasetVersion(Base):
    __tablename__ = "dataset_versions"

    id = Column(String, primary_key=True, default=generate_uuid)
    dataset_id = Column(String, ForeignKey("datasets.id"), nullable=False)
    version_number = Column(Integer, nullable=False)
    file_path = Column(String(500), nullable=False)
    file_hash = Column(String(64), nullable=False)
    row_count = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    change_summary = Column(Text, nullable=True)

    dataset = relationship("Dataset", back_populates="versions")

class DatasetColumn(Base):
    __tablename__ = "dataset_columns"

    id = Column(String, primary_key=True, default=generate_uuid)
    dataset_id = Column(String, ForeignKey("datasets.id"), nullable=False)
    column_name = Column(String(100), nullable=False)
    data_type = Column(String(50), nullable=False)
    semantic_type = Column(String(50), nullable=True)
    missing_count = Column(Integer, default=0)
    missing_percentage = Column(Float, default=0.0)
    unique_count = Column(Integer, default=0)
    sample_values = Column(JSON, nullable=True)
    min_value = Column(String, nullable=True)
    max_value = Column(String, nullable=True)
    mean_value = Column(Float, nullable=True)

    dataset = relationship("Dataset", back_populates="columns")

class Analysis(Base):
    __tablename__ = "analyses"

    id = Column(String, primary_key=True, default=generate_uuid)
    workspace_id = Column(String, ForeignKey("workspaces.id"), nullable=False)
    dataset_id = Column(String, ForeignKey("datasets.id"), nullable=True)
    dataset_version = Column(Integer, default=1)
    question = Column(Text, nullable=False)
    
    status = Column(String(30), default="completed")  # planning, executing, validated, completed, failed
    intent = Column(String(100), nullable=True)
    
    # Structured synthesis & results
    findings_summary = Column(Text, nullable=True)
    detailed_answer = Column(Text, nullable=True)
    confidence = Column(String(20), default="MEDIUM")  # HIGH, MEDIUM, LOW
    confidence_rationale = Column(JSON, nullable=True)
    limitations = Column(JSON, nullable=True)
    recommendations = Column(JSON, nullable=True)
    
    execution_duration_ms = Column(Float, default=0.0)
    model_name = Column(String(50), default="athena-v1")
    is_saved = Column(Boolean, default=False)
    
    # Multi-step reasoning data
    hypotheses = Column(JSON, nullable=True)
    metrics = Column(JSON, nullable=True)
    tables = Column(JSON, nullable=True)
    charts = Column(JSON, nullable=True)
    lineage = Column(JSON, nullable=True)
    challenge_result = Column(JSON, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    workspace = relationship("Workspace", back_populates="analyses")
    evidence = relationship("Evidence", back_populates="analysis", cascade="all, delete-orphan")
    steps = relationship("AnalysisStep", back_populates="analysis", cascade="all, delete-orphan")

class AnalysisStep(Base):
    __tablename__ = "analysis_steps"

    id = Column(String, primary_key=True, default=generate_uuid)
    analysis_id = Column(String, ForeignKey("analyses.id"), nullable=False)
    step_number = Column(Integer, nullable=False)
    action = Column(String(100), nullable=False)
    details = Column(JSON, nullable=True)
    duration_ms = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    analysis = relationship("Analysis", back_populates="steps")

class Evidence(Base):
    __tablename__ = "evidence"

    id = Column(String, primary_key=True, default=generate_uuid)
    analysis_id = Column(String, ForeignKey("analyses.id"), nullable=False)
    claim = Column(Text, nullable=False)
    source_dataset = Column(String(150), nullable=False)
    relevant_columns = Column(JSON, nullable=True)
    computation_type = Column(String(50), nullable=False)  # SQL, Python, Stat, Profiler
    query_or_code = Column(Text, nullable=True)
    computed_result = Column(JSON, nullable=True)
    assumptions = Column(JSON, nullable=True)
    verification_status = Column(String(30), default="verified")  # verified, unverified, failed

    analysis = relationship("Analysis", back_populates="evidence")

class Report(Base):
    __tablename__ = "reports"

    id = Column(String, primary_key=True, default=generate_uuid)
    workspace_id = Column(String, ForeignKey("workspaces.id"), nullable=False)
    title = Column(String(200), nullable=False)
    subtitle = Column(String(250), nullable=True)
    date_range = Column(String(100), nullable=True)
    executive_summary = Column(Text, nullable=False)
    sections = Column(JSON, nullable=False)  # List of {title, content, metrics, charts, evidence}
    key_metrics = Column(JSON, nullable=True)
    risks_and_anomalies = Column(JSON, nullable=True)
    recommended_actions = Column(JSON, nullable=True)
    methodology_and_limitations = Column(JSON, nullable=True)
    data_quality_summary = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    workspace = relationship("Workspace", back_populates="reports")

class EvaluationRun(Base):
    __tablename__ = "evaluation_runs"

    id = Column(String, primary_key=True, default=generate_uuid)
    run_timestamp = Column(DateTime, default=datetime.utcnow)
    total_cases = Column(Integer, default=0)
    passed_cases = Column(Integer, default=0)
    numerical_accuracy = Column(Float, default=0.0)
    evidence_grounding = Column(Float, default=0.0)
    sql_success_rate = Column(Float, default=0.0)
    hallucination_rate = Column(Float, default=0.0)
    average_duration_ms = Column(Float, default=0.0)
    category_breakdown = Column(JSON, nullable=True)
    case_results = Column(JSON, nullable=True)
