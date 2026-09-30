# ATHENA
### *Your AI analyst for business data.*

Athena is a production-grade, portfolio-quality AI data analysis platform built to demonstrate serious AI systems engineering around real business data.

Unlike generic ChatGPT wrappers or simple CSV chatbots that feed rows into a prompt and hallucinate numbers, Athena enforces **Computation Over Generation**: Large Language Models plan the investigation and form competing hypotheses, but deterministic numerical engines (**DuckDB**, **Polars**, **NumPy**, **SciPy**, and **Scikit-learn**) execute the queries and computations. Every claim is bound to empirical evidence, verifiable queries, and data lineage.

---

## ⚡ Signature Differentiators

1. **Computation Over Generation:** Numerical claims must originate from real computation. LLMs are prohibited from inventing arithmetic.
2. **Evidence Over Assertion:** Every factual statement in an analysis links back to an Evidence record with source dataset, active columns, exact query/code, and calculated values.
3. **Hypothesis-Driven Investigation:** Decomposes complex causal queries (*"Why did revenue fall in Q3?"*) into competing hypotheses (Volume drop vs AOV drop vs Regional deterioration vs Product mix shifts) and tests each against data.
4. **"Challenge Athena" (Self-Critique Engine):** An adversarial falsification loop where Athena attempts to refute its own conclusions by testing alternative temporal windows, outlier sensitivity (excluding top 1% transactions), and sub-segment divergence.
5. **No-Hallucination Architecture:** A post-processing numerical verification layer scans generated claims and guarantees all numbers, percentages, and dollar figures match computed outputs within rounding tolerance.
6. **Reproducibility & Lineage:** Analyses preserve dataset version hashes, code versions, and full DAG provenance graphs from query to conclusion.

---

## 🛠️ Technology Stack

- **Analytical Engine:** [DuckDB](https://duckdb.org/) (Vectorized analytical SQL engine)
- **Statistical Stack:** Python [NumPy](https://numpy.org/), [SciPy](https://scipy.org/), [Scikit-learn](https://scikit-learn.org/) (Tukey IQR, Z-Score, Isolation Forest)
- **Backend API:** [FastAPI](https://fastapi.tiangolo.com/) with Pydantic V2 and SQLAlchemy
- **Document RAG:** Document chunking with strict prompt-injection isolation wrappers
- **Reporting Engine:** ReportLab (PDF), Markdown, and HTML
- **Frontend UI:** [React 18](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/), [Tailwind CSS](https://tailwindcss.com/), [Recharts](https://recharts.org/), [Lucide Icons](https://lucide.dev/)
- **Model Orchestration:** Multi-provider abstraction (OpenAI, Google Gemini, DeepSeek, OpenRouter) with an out-of-the-box **DeterministicProvider** that guarantees complete offline functionality with zero external dependencies.

---

## 🚀 Quickstart

### 1. Local Development (Windows / macOS / Linux)

#### Backend
```bash
cd backend
pip install -r requirements.txt
python -m app.main
```
*API will run on `http://localhost:8000` (Swagger docs at `/docs`). On startup, Athena automatically seeds golden enterprise datasets, profiles schemas, and loads initial demo investigations.*

#### Frontend
```bash
cd frontend
npm install
npm run dev
```
*Frontend will launch on `http://localhost:5173`.*

---

### 2. Docker Deployment
Run the complete production stack with Docker Compose:
```bash
docker-compose up --build
```
- Web Application: `http://localhost:3000`
- Backend API & OpenAPI: `http://localhost:8000/docs`

---

## 📊 Empirical Evaluation Framework

Athena includes an automated benchmark suite of **52 analytical test cases** spanning 11 categories:
- Simple Aggregations
- Filtering & Slicing
- Trend Analysis & Quarter-over-Quarter
- Multi-Step Reasoning & Driver Decomposition
- Statistical Anomaly Detection (IQR, Z-Score)
- Causal Reasoning
- Ambiguous Queries
- Missing Data Handling
- Adversarial & SQL Injection Defense
- Insufficient Evidence Scenarios
- Document RAG + Transaction Analysis

Benchmark scores are **never fabricated**; they are executed live through the evaluation runner and displayed on the interactive `/evaluations` dashboard.

---

## 🧪 Running Tests

Run the full pytest suite for the backend:
```bash
cd backend
python -m pytest
```

Build the production frontend bundle:
```bash
cd frontend
npm run build
```

---

## 📚 Documentation
- [System Architecture](docs/architecture.md)
- [Agent State Machine & Tools](docs/agent.md)
- [Evaluation Framework](docs/evaluation.md)
- [Security & Prompt Injection Defense](docs/security.md)
- [Data Model & Schema](docs/data-model.md)
- [Deployment Guide](docs/deployment.md)

---

## 📄 License
MIT License.
