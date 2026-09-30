# Athena Deployment Guide

## 1. Local Development Quickstart

### Prerequisites
- Python 3.11+
- Node.js 18+ & npm

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
python -m app.main
```
The FastAPI server will start on `http://localhost:8000`. It automatically creates database tables, generates golden datasets, profiles schemas, and loads initial investigations.

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
The Vite development server will start on `http://localhost:5173`.

---

## 2. Docker Compose Deployment

Run the complete multi-container stack with a single command:
```bash
docker-compose up --build
```
- **Frontend:** Accessible at `http://localhost:3000` (proxies `/api` to backend)
- **Backend API & Swagger Docs:** Accessible at `http://localhost:8000/docs`

---

## 3. Environment Variables

| Variable | Default | Purpose |
|---|---|---|
| `ATHENA_MODEL_PROVIDER` | `deterministic` | Selected model provider (`openai`, `gemini`, `deepseek`, `openrouter`, `deterministic`) |
| `ATHENA_MODEL` | `gpt-4o` | Model identifier |
| `OPENAI_API_KEY` | `""` | OpenAI API Key (optional) |
| `GEMINI_API_KEY` | `""` | Google Gemini API Key (optional) |
| `DATABASE_URL` | `sqlite:///storage/athena.db` | Application metadata database (supports PostgreSQL) |
| `MAX_AGENT_ITERATIONS`| `8` | Maximum execution iterations before safety halt |
