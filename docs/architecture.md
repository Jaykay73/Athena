# Athena System Architecture

## 1. Architectural Philosophy
Athena is designed from the ground up as a serious AI analytical collaborator, built on five non-negotiable principles:
1. **Computation Over Generation:** Large Language Models plan the investigation, but deterministic numerical engines (DuckDB, Pandas, Polars, SciPy, Scikit-learn) execute all queries and calculations.
2. **Evidence Over Assertion:** Every claim links to an explicit Evidence record containing the source dataset, relevant columns, query/code, and calculated numbers.
3. **Investigation Over Q&A:** Athena decomposes ambiguous business queries into competing hypotheses rather than giving immediate superficial chatbot responses.
4. **Self-Critique ("Challenge Athena"):** An adversarial falsification loop that actively stress-tests conclusions against counter-hypotheses and sensitivity shifts.
5. **Full Reproducibility:** Every analysis references a dataset version hash, query log, and execution code.

---

## 2. High-Level System Architecture

```
[ Web Client: React + TypeScript + Tailwind + Recharts ]
                           │
                           ▼ (REST API)
             [ FastAPI Application Server ]
                           │
       ┌───────────────────┼───────────────────┐
       ▼                   ▼                   ▼
 [ Agent FSM ]      [ Data Profiler ]   [ Observability ]
 (Planner/Tools)    (Semantic Infer)    (Trace / Metrics)
       │
       ├───────────────────────────────────────┐
       ▼                                       ▼
[ DuckDB SQL Engine ]               [ Statistical Engine ]
(Vectorized Analytical Execution)   (Period Comp, Drivers, IQR)
       │                                       │
       └───────────────────┬───────────────────┘
                           ▼
             [ Evidence & Lineage DAG ]
                           │
                           ▼
          [ No-Hallucination Numerical Verifier ]
                           │
                           ▼
             [ Structured Analyst Synthesis ]
```

---

## 3. Core Engine Components

### A. Analytical Execution Layer (DuckDB)
- In-memory or file-backed columnar database designed for high-performance analytical processing.
- Zero-copy view registration for CSV, Parquet, JSON, and Pandas DataFrames.
- AST-level SQL validation rejecting destructive operations (`DROP`, `DELETE`, `INSERT`, `ALTER`, filesystem escapes).

### B. Statistical & Machine Learning Layer (SciPy & Scikit-learn)
- **Period-over-Period Decomposition:** Mathematically separates revenue delta into Volume Effect and Average Order Value (AOV) Effect.
- **Anomaly Detection:** Multi-method anomaly scanning using Tukey Interquartile Range (1.5x IQR), Z-Score (>3.0 standard deviations), and Isolation Forest.
- **Customer Behavioral Analytics:** RFM recency & frequency calculations isolating 90-day inactivity trends.

### C. Controlled Agent State Machine
The agent progresses through a deterministic Finite State Machine:
`IDLE` → `UNDERSTAND` → `PLAN` → `EXECUTE` → `VALIDATE` → `SYNTHESIZE` → `COMPLETE`
If empirical validation detects unsupported numbers, the verifier rejects the draft and forces replanning.

### D. Multi-Provider LLM Abstraction with Deterministic Fallback
- Supports OpenAI, Google Gemini, DeepSeek, and OpenRouter through a uniform interface (`LLMProvider`).
- If no paid API key is configured in the environment, Athena switches to its `DeterministicProvider` so the entire platform runs completely offline out-of-the-box.
