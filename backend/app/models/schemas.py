from typing import Dict, Any, List, Optional, Union
from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime

# Workspace schemas
class WorkspaceBase(BaseModel):
    name: str
    description: Optional[str] = None

class WorkspaceCreate(WorkspaceBase):
    pass

class WorkspaceOut(WorkspaceBase):
    id: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# Dataset Column & Quality schemas
class ColumnProfile(BaseModel):
    column_name: str
    data_type: str
    semantic_type: Optional[str] = None
    missing_count: int
    missing_percentage: float
    unique_count: int
    sample_values: List[Any] = []
    min_value: Optional[str] = None
    max_value: Optional[str] = None
    mean_value: Optional[float] = None
    std_value: Optional[float] = None

class QualityWarning(BaseModel):
    code: str
    column: Optional[str] = None
    severity: str  # high, medium, low
    message: str
    explanation: str
    affected_rows: int = 0
    suggested_action: str

class DatasetProfileSummary(BaseModel):
    row_count: int
    column_count: int
    data_quality_score: float
    date_range: Optional[str] = None
    memory_usage_mb: float = 0.0
    columns: List[ColumnProfile]
    warnings: List[QualityWarning]
    correlations: Optional[Dict[str, Dict[str, float]]] = None
    suspected_primary_keys: List[str] = []
    suspected_foreign_keys: List[Dict[str, str]] = []

class DatasetOut(BaseModel):
    id: str
    workspace_id: str
    name: str
    description: Optional[str] = None
    file_type: str
    file_path: str
    current_version: int
    row_count: int
    column_count: int
    data_quality_score: float
    profile_summary: Optional[Dict[str, Any]] = None
    quality_warnings: Optional[List[Dict[str, Any]]] = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# Analysis & Evidence schemas
class EvidenceItem(BaseModel):
    id: Optional[str] = None
    claim: str
    source_dataset: str
    relevant_columns: Optional[List[str]] = []
    computation_type: str  # SQL, Python, Stat, Profiler
    query_or_code: Optional[str] = None
    computed_result: Optional[Any] = None
    assumptions: Optional[List[str]] = []
    verification_status: str = "verified"
    model_config = ConfigDict(from_attributes=True)

class ChartSpec(BaseModel):
    id: str
    title: str
    chart_type: str  # line, bar, area, scatter, histogram, pie
    x_axis: str
    y_axis: str
    series_name: Optional[str] = None
    data: List[Dict[str, Any]] = []
    units: Optional[str] = None
    source: Optional[str] = None
    date_range: Optional[str] = None
    filters: Optional[str] = None
    highlight_anomalies: Optional[List[Any]] = None
    model_config = ConfigDict(from_attributes=True)

class Hypothesis(BaseModel):
    id: str
    statement: str
    status: str  # supported, refuted, inconclusive
    tested_with: str
    evidence_summary: str
    numeric_impact: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class LineageNode(BaseModel):
    id: str
    type: str  # question, dataset, column, query, metric, chart, conclusion
    label: str
    details: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class LineageEdge(BaseModel):
    from_node: str
    to_node: str
    label: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class LineageGraph(BaseModel):
    nodes: List[LineageNode]
    edges: List[LineageEdge]
    model_config = ConfigDict(from_attributes=True)

class AnalysisRequest(BaseModel):
    workspace_id: str
    dataset_id: Optional[str] = None
    question: str
    enable_challenge: bool = False
    context_filters: Optional[Dict[str, Any]] = None

class ChallengeRequest(BaseModel):
    analysis_id: str

class AnalysisStepOut(BaseModel):
    id: Optional[str] = None
    step_number: int
    action: str
    details: Optional[Any] = None
    duration_ms: float = 0.0
    created_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class AnalysisOut(BaseModel):
    id: str
    workspace_id: str
    dataset_id: Optional[str] = None
    dataset_version: int = 1
    question: str
    status: str
    intent: Optional[str] = None
    findings_summary: Optional[str] = None
    detailed_answer: Optional[str] = None
    confidence: str = "MEDIUM"
    confidence_rationale: Optional[List[str]] = []
    limitations: Optional[List[str]] = []
    recommendations: Optional[List[str]] = []
    execution_duration_ms: float = 0.0
    model_name: str = "athena-v1"
    is_saved: bool = False
    hypotheses: Optional[List[Dict[str, Any]]] = []
    metrics: Optional[List[Dict[str, Any]]] = []
    tables: Optional[List[Dict[str, Any]]] = []
    charts: Optional[List[Dict[str, Any]]] = []
    evidence: List[EvidenceItem] = []
    lineage: Optional[Union[LineageGraph, Dict[str, Any]]] = None
    challenge_result: Optional[Dict[str, Any]] = None
    steps: List[AnalysisStepOut] = []
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# Autonomous Insights schemas
class InsightFinding(BaseModel):
    id: str
    category: str  # trend, anomaly, margin, churn, quality
    title: str
    summary: str
    severity: str  # critical, warning, info, positive
    metric_change: str
    evidence: EvidenceItem
    chart: Optional[ChartSpec] = None
    action_item: str

class AutonomousInvestigationOut(BaseModel):
    dataset_id: str
    dataset_name: str
    total_findings: int
    findings: List[InsightFinding]
    scanned_at: datetime

# Report schemas
class ReportCreateRequest(BaseModel):
    workspace_id: str
    title: str
    subtitle: Optional[str] = None
    dataset_id: Optional[str] = None
    analysis_ids: Optional[List[str]] = None
    period_label: Optional[str] = "Q3 2026"

class ReportOut(BaseModel):
    id: str
    workspace_id: str
    title: str
    subtitle: Optional[str] = None
    date_range: Optional[str] = None
    executive_summary: str
    sections: List[Dict[str, Any]]
    key_metrics: List[Dict[str, Any]] = []
    risks_and_anomalies: List[Dict[str, Any]] = []
    recommended_actions: List[str] = []
    methodology_and_limitations: List[str] = []
    data_quality_summary: Optional[Dict[str, Any]] = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# Evaluation schemas
class EvaluationCaseResult(BaseModel):
    case_id: str
    question: str
    category: str
    passed: bool
    numerical_correctness: bool
    sql_correctness: bool
    evidence_grounded: bool
    hallucination_detected: bool
    latency_ms: float
    expected_output: str
    actual_output: str
    error_message: Optional[str] = None

class EvaluationRunOut(BaseModel):
    id: str
    run_timestamp: datetime
    total_cases: int
    passed_cases: int
    numerical_accuracy: float
    evidence_grounding: float
    sql_success_rate: float
    hallucination_rate: float
    average_duration_ms: float
    category_breakdown: Dict[str, Dict[str, Any]]
    case_results: List[EvaluationCaseResult]
    model_config = ConfigDict(from_attributes=True)
