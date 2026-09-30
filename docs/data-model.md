# Athena Data Model & Schema Specifications

## 1. Relational Entities (Application Metadata DB)

```
[ Workspace ]
     │ 1
     ├──< [ Dataset ]
     │         │ 1
     │         ├──< [ DatasetVersion ] (Hash, Row Count, Path)
     │         └──< [ DatasetColumn ] (Semantic Types, Nullability, Stats)
     │
     ├──< [ Analysis ]
     │         │ 1
     │         ├──< [ AnalysisStep ] (Execution Trace Steps)
     │         └──< [ Evidence ] (Query, Source Dataset, Numerical Proof)
     │
     └──< [ Report ] (Executive Sections, Metrics, Recommendations)

[ EvaluationRun ] (Empirical benchmark metrics, 52 case results)
```

---

## 2. Table Specifications

### `datasets`
- `id`: Primary key (UUID string)
- `workspace_id`: Foreign key referencing `workspaces.id`
- `name`: View name in DuckDB
- `file_type`: Format (`csv`, `xlsx`, `parquet`, `json`)
- `current_version`: Integer tracking version changes
- `row_count`, `column_count`: Ingestion counts
- `data_quality_score`: Float between 10.0 and 100.0
- `profile_summary`: Serialized JSON profile including semantic types, correlations, and warnings

### `analyses`
- `id`: Primary key (UUID string)
- `workspace_id`: Foreign key referencing `workspaces.id`
- `dataset_id`: Foreign key referencing `datasets.id`
- `question`: User query string
- `findings_summary`: Verified executive synthesis
- `confidence`: `HIGH`, `MEDIUM`, or `LOW`
- `confidence_rationale`: List of empirical justification bullet points
- `hypotheses`: Serialized JSON array of tested hypotheses
- `lineage`: Serialized DAG nodes and edges
- `challenge_result`: Serialized self-critique outcome and sensitivity tests

### `evidence`
- `id`: Primary key (UUID string)
- `analysis_id`: Foreign key referencing `analyses.id`
- `claim`: Factual statement
- `source_dataset`: Underlying dataset name
- `computation_type`: `SQL`, `Python`, `Driver_Decomposition`, `RAG_Retrieval`
- `query_or_code`: Executed logic
- `computed_result`: Serialized output dictionary
- `assumptions`: Explicit analytical assumptions
