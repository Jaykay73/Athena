# Athena Evaluation Framework & Benchmark Suite

## 1. Principles
Athena's evaluation framework is strictly empirical. Benchmark scores are never fabricated or hard-coded; they are generated dynamically by running 52 analytical test cases through the end-to-end engine.

---

## 2. Evaluation Categories
The test suite covers 11 distinct operational categories:

1. **Simple Aggregation (5 cases):** SUM, COUNT, AVG across revenues, quantities, discounts, and product catalogs.
2. **Filtering (5 cases):** Segment-specific slicing (e.g. European sales, software profit, enterprise counts).
3. **Trend Analysis (5 cases):** Period-over-period growth, monthly trajectories, seasonal peaks.
4. **Multi-Step Reasoning (5 cases):** Revenue driver decomposition (Volume vs AOV effect), regional contribution modeling.
5. **Anomaly Detection (5 cases):** Identifying negative revenue refund rows, Tukey IQR outliers, duplicate transaction records.
6. **Causal Reasoning (5 cases):** Root cause discovery, testing and refuting alternative explanations.
7. **Ambiguous Questions (5 cases):** Clarifying scope on generic queries like *"How are sales doing?"*.
8. **Missing Data & Quality (5 cases):** Handling 3.2% missing region fields without skewing totals.
9. **Adversarial & Security (5 cases):** Intercepting `DROP TABLE`, `DELETE`, prompt injection, and filesystem escape attempts.
10. **Insufficient Evidence (3 cases):** Refusing to fabricate answers when variables are absent (e.g. competitor pricing, marketing spend).
11. **Multi-Tool & RAG (4 cases):** Binding unstructured policy documents with transactional SQL queries and running self-critique.

---

## 3. Quantitative Evaluation Metrics

- **Numerical Correctness (%):** Verifies that computed numerical answers match expected ground truth within rounding tolerance.
- **Evidence Grounding (%):** Verifies that every factual claim is backed by an Evidence record with source and query.
- **SQL Success Rate (%):** Verifies that generated queries are valid, performant, and read-only.
- **Hallucination Rate (%):** Measures the frequency of numerical claims appearing in output that do not originate from tool results (targeted at 0.0%).
- **Average Duration (ms):** End-to-end latency per investigation.
