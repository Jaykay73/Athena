export interface Workspace {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

export interface ColumnProfile {
  column_name: string;
  data_type: string;
  semantic_type?: string;
  missing_count: number;
  missing_percentage: number;
  unique_count: number;
  sample_values: any[];
  min_value?: string;
  max_value?: string;
  mean_value?: number;
  std_value?: number;
}

export interface QualityWarning {
  code: string;
  column?: string;
  severity: 'high' | 'medium' | 'low';
  message: string;
  explanation: string;
  affected_rows: number;
  suggested_action: string;
}

export interface DatasetProfile {
  row_count: number;
  column_count: number;
  data_quality_score: number;
  date_range?: string;
  memory_usage_mb: number;
  columns: ColumnProfile[];
  warnings: QualityWarning[];
  correlations?: Record<string, Record<string, number>>;
  suspected_primary_keys: string[];
  semantic_types: Record<string, string>;
}

export interface Dataset {
  id: string;
  workspace_id: string;
  name: string;
  description?: string;
  file_type: string;
  file_path: string;
  current_version: number;
  row_count: number;
  column_count: number;
  data_quality_score: number;
  profile_summary?: DatasetProfile;
  quality_warnings?: QualityWarning[];
  created_at: string;
}

export interface EvidenceItem {
  id: string;
  claim: string;
  source_dataset: string;
  relevant_columns: string[];
  computation_type: string;
  query_or_code?: string;
  computed_result: any;
  assumptions: string[];
  verification_status: string;
}

export interface ChartSpec {
  id: string;
  title: string;
  chart_type: 'line' | 'bar' | 'scatter' | 'pie' | 'area';
  x_axis: string;
  y_axis: string;
  series_name?: string;
  data: any[];
  units?: string;
  source?: string;
  date_range?: string;
  highlight_anomalies?: any[];
}

export interface Hypothesis {
  id: string;
  statement: string;
  status: 'supported' | 'refuted' | 'inconclusive' | 'pending';
  tested_with: string;
  evidence_summary: string;
  numeric_impact?: string;
}

export interface LineageNode {
  id: string;
  type: string;
  label: string;
  details?: string;
}

export interface LineageEdge {
  from_node: string;
  to_node: string;
  label?: string;
}

export interface LineageGraph {
  nodes: LineageNode[];
  edges: LineageEdge[];
}

export interface TraceStep {
  step_number: number;
  action: string;
  details?: any;
  timestamp: string;
  duration_ms: number;
}

export interface ChallengeResult {
  status: string;
  original_finding: string;
  tests_conducted: Array<{
    name: string;
    hypothesis: string;
    methodology: string;
    outcome: string;
    findings: string;
  }>;
  verdict_summary: string;
  robustness_score: number;
  key_refinement?: string;
}

export interface Analysis {
  id: string;
  workspace_id: string;
  dataset_id?: string;
  dataset_version: number;
  question: string;
  status: string;
  intent?: string;
  findings_summary?: string;
  detailed_answer?: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  confidence_rationale: string[];
  limitations: string[];
  recommendations: string[];
  execution_duration_ms: number;
  model_name: string;
  is_saved: boolean;
  hypotheses: Hypothesis[];
  metrics: Array<{ name: string; value: any; formatted?: string }>;
  tables: Array<{ title: string; columns: string[]; rows: any[] }>;
  charts: ChartSpec[];
  evidence: EvidenceItem[];
  lineage?: LineageGraph;
  challenge_result?: ChallengeResult;
  steps: TraceStep[];
  created_at: string;
}

export interface InsightFinding {
  id: string;
  category: 'trend' | 'anomaly' | 'margin' | 'churn' | 'quality';
  title: string;
  summary: string;
  severity: 'critical' | 'warning' | 'info' | 'positive';
  metric_change: string;
  evidence: EvidenceItem;
  action_item: string;
}

export interface AutonomousInvestigation {
  dataset_id: string;
  dataset_name: string;
  total_findings: number;
  findings: InsightFinding[];
  scanned_at: string;
}

export interface Report {
  id: string;
  workspace_id: string;
  title: string;
  subtitle?: string;
  date_range?: string;
  executive_summary: string;
  sections: Array<{
    id?: string;
    title: string;
    content: string;
    table?: { columns: string[]; rows: any[][] };
  }>;
  key_metrics: Array<{ label: string; value: string; change: string; status?: string }>;
  risks_and_anomalies: Array<{ risk: string; impact: string; mitigation: string }>;
  recommended_actions: string[];
  methodology_and_limitations: string[];
  data_quality_summary?: any;
  created_at: string;
}

export interface EvaluationCaseResult {
  case_id: string;
  question: string;
  category: string;
  passed: boolean;
  numerical_correctness: boolean;
  sql_correctness: boolean;
  evidence_grounded: boolean;
  hallucination_detected: boolean;
  latency_ms: number;
  expected_output: string;
  actual_output: string;
  error_message?: string;
}

export interface EvaluationRun {
  id: string;
  run_timestamp: string;
  total_cases: number;
  passed_cases: number;
  numerical_accuracy: number;
  evidence_grounding: number;
  sql_success_rate: number;
  hallucination_rate: number;
  average_duration_ms: number;
  category_breakdown: Record<string, { total: number; passed: number; accuracy_pct: number; avg_latency_ms: number }>;
  case_results: EvaluationCaseResult[];
}
