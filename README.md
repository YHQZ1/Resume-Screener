# Resume Screener — AI-Powered ATS & Career Coach

An intelligent resume screening and coaching tool built with NLP, FastAPI, and React. Resumes are ranked against a job description using a three-component hybrid scoring system — TF-IDF keyword matching, SBERT semantic embeddings, and weighted skill coverage — and an autonomous AI Agent (Ollama) provides per-candidate coaching reports with projected score improvements and concrete action items.

---

## Project Structure

```text
.
├── Dockerfile              # Multi-stage build: backend, frontend build, nginx
├── docker-compose.yaml     # Orchestrates backend, frontend, and Ollama
├── nginx.conf              # Nginx config: SPA routing + API proxy to backend
├── .env                    # Environment variables (not committed)
├── backend/
│   ├── main.py             # FastAPI app, CORS, lifespan SBERT warmup
│   ├── requirements.txt
│   ├── routes/
│   │   ├── analyze.py      # POST /analyze — extraction, scoring, skill analysis
│   │   └── coach.py        # POST /agent/coach — AI Agent threshold evaluation
│   └── models/
│       └── schemas.py      # Pydantic request/response models
├── nlp/
│   ├── extractor.py        # PDF (+ OCR fallback), DOCX, TXT text extraction
│   ├── preprocessor.py     # spaCy lemmatization and text cleaning
│   ├── scorer.py           # TF-IDF, SBERT, and hybrid score computation
│   ├── skill_analyzer.py   # Weighted skill extraction and gap analysis
│   ├── agent.py            # Simulation loop + Ollama LLM coaching report
│   └── skills.json         # Skill taxonomy with weights and aliases
└── frontend/               # React 18 + TypeScript + Tailwind CSS + Vite
    ├── src/
    │   ├── api/client.ts
    │   ├── pages/
    │   │   ├── UploadPage.tsx
    │   │   ├── BatchPage.tsx
    │   │   └── ResultPage.tsx
    │   └── components/
    │       ├── Nav.tsx
    │       ├── ScoreRing.tsx
    │       ├── ScoreRadar.tsx
    │       └── SectionLabel.tsx
    └── ...
```

---

## How It Works

### 1. Extraction

Resumes are accepted as `.pdf`, `.docx`, or `.txt`. PDFs are parsed with `pdfplumber` using layout-aware extraction to preserve multi-column structure and tables. If a PDF has no text layer (scanned document), the pipeline automatically falls back to OCR via `pytesseract` + `pdf2image`. DOCX extraction pulls both paragraph and table cell content.

### 2. Hybrid Scoring

Each resume is scored against the job description across three independent components:

| Component  | Weight | Method                                                                                                           |
| ---------- | ------ | ---------------------------------------------------------------------------------------------------------------- |
| **TF-IDF** | 20%    | Bigram TF-IDF cosine similarity on lemmatized, stop-word-filtered text                                           |
| **SBERT**  | 50%    | Sentence embeddings via `all-MiniLM-L6-v2`; resume chunked into 500-char windows, max-pooled against JD chunks   |
| **Skills** | 30%    | Weighted coverage: matched skill weights ÷ total JD skill weights, using a canonical skill taxonomy with aliases |

**Hybrid Score** = `(0.2 × TF-IDF) + (0.5 × SBERT) + (0.3 × Skill Coverage)`

The JD embedding is computed once per request and reused across all resumes in a batch.

### 3. AI Coaching Agent

The agent runs a **simulation loop** over missing skills, sorted by weight. It greedily adds skills one-by-one and projects the resulting score, stopping when the threshold is reached or a **plateau is detected** (two consecutive additions each improving the score by less than 2%). A plateau signals that the gap is semantic — the candidate's vocabulary doesn't match the JD's — and no amount of skill-adding will fix it.

After simulation, an **Ollama-hosted LLM** receives the resume excerpt, JD excerpt, and simulation results and returns a structured JSON coaching report with:

- `reasoning` — a one-paragraph verdict referencing the candidate specifically
- `action_items` — concrete steps tied to actual resume content
- `semantic_gap_reason` — explanation of vocabulary/narrative mismatch vs the JD

If the LLM call fails, a deterministic fallback report is generated from the simulation data.

---

## Tech Stack

| Layer        | Technology                                                                 |
| ------------ | -------------------------------------------------------------------------- |
| **AI / NLP** | Ollama, spaCy (`en_core_web_sm`), SBERT (`all-MiniLM-L6-v2`), Scikit-learn |
| **Backend**  | FastAPI, Uvicorn, Pydantic                                                 |
| **Frontend** | React 18, TypeScript, Tailwind CSS, Vite                                   |
| **DevOps**   | Docker, Docker Compose, Nginx                                              |

---

## Getting Started

### Prerequisites

- Docker and Docker Compose installed
- ~4GB disk space for model weights and Docker images

### 1. Configure Environment

Create a `.env` file in the project root:

```env
FRONTEND_URL=http://localhost
OLLAMA_BASE_URL=http://ollama:11434/v1
OLLAMA_MODEL=qwen3:0.6b
```

`OLLAMA_MODEL` defaults to `qwen3:0.6b` if not set. Any model available in your Ollama instance can be used.

### 2. Build and Launch

```bash
docker-compose up -d --build
```

This starts three services:

- **backend** on port `8000`
- **frontend** (nginx) on port `80`
- **ollama** on port `11434`

### 3. Pull the AI Model

On first run, pull the LLM into the Ollama container:

```bash
docker exec -it resumescreener-ollama-1 ollama pull qwen3:0.6b
```

### 4. Open the App

Navigate to [http://localhost](http://localhost).

---

## Manual Setup (Local Dev)

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
python -m spacy download en_core_web_sm
uvicorn main:app --reload
```

Requires `tesseract` installed locally for OCR fallback:

- macOS: `brew install tesseract poppler`
- Ubuntu: `apt-get install tesseract-ocr poppler-utils`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Set `VITE_API_URL=http://localhost:8000` in `frontend/.env.local` for local dev. The Docker setup uses nginx to proxy requests internally so this variable is not needed there.

---

## API Reference

### `POST /analyze`

Analyzes one or more resumes against a job description.

**Request** — `multipart/form-data`:

| Field                  | Type                              | Required         |
| ---------------------- | --------------------------------- | ---------------- |
| `resumes`              | File(s) — `.pdf`, `.docx`, `.txt` | Yes              |
| `job_description_text` | string                            | One of these two |
| `job_description_file` | File                              | One of these two |

**Response** — `AnalyzeResponse[]`, sorted by `hybrid_score` descending:

```json
{
  "filename": "john_doe.pdf",
  "email": "john@example.com",
  "phone": "555-1234",
  "hybrid_score": 0.742,
  "tfidf_score": 0.381,
  "sbert_score": 0.894,
  "skill_coverage": 0.6,
  "matched_skills": ["python", "fastapi", "docker"],
  "missing_skills": ["kubernetes", "terraform"],
  "suggestions": ["..."],
  "jd_raw": "...",
  "resume_raw": "..."
}
```

### `POST /agent/coach`

Runs the AI Agent threshold evaluation on a previously analyzed resume.

**Request**:

```json
{
  "resume_result": { "...AnalyzeResponse fields..." },
  "threshold": 0.75
}
```

**Response**:

```json
{
  "filename": "john_doe.pdf",
  "initial_score": 0.742,
  "projected_score": 0.781,
  "threshold": 0.75,
  "verdict": "hireable",
  "recommended_skills": ["kubernetes"],
  "plateau_detected": false,
  "score_progression": [0.742, 0.769, 0.781],
  "iterations": 2,
  "reasoning": "...",
  "action_items": ["...", "..."],
  "semantic_gap_reason": "..."
}
```

**Verdict values**: `hireable` (≥ threshold) · `borderline` (within 0.1 below threshold) · `not_hireable`

---

## Scoring Deep Dive

**Why a hybrid?** TF-IDF catches exact keyword requirements — if a JD says "Kubernetes", the resume needs that word. SBERT catches conceptual alignment — "distributed systems" and "microservices architecture" are semantically close even without shared vocabulary. Skill coverage captures domain knowledge completeness weighted by skill importance. Each component catches what the others miss.

**Why SBERT at 50% weight?** Resumes written in different styles but describing equivalent experience should rank similarly. Over-weighting TF-IDF punishes vocabulary variation; over-weighting skills punishes breadth.

**Why max-pool SBERT chunks instead of encoding the full resume?** `all-MiniLM-L6-v2` has a 256-token limit (~500 characters). A full resume is 500–2000 tokens. Chunking and taking the maximum cosine similarity across all chunk pairs finds the best-matching section of the resume against the JD, preserving signal that would be lost if the resume were truncated to fit the model's context window.

**Plateau detection** is the key indicator of semantic gap. When the simulation loop stops improving despite adding skills, the bottleneck is that the candidate's writing doesn't use JD-aligned terminology. The agent surfaces this explicitly as `semantic_gap_reason` so the candidate knows to rewrite their narrative, not just add bullet points.

---

## Environment Variables

| Variable          | Default                     | Description                                               |
| ----------------- | --------------------------- | --------------------------------------------------------- |
| `FRONTEND_URL`    | `http://localhost:5173`     | CORS allowed origin (set to `http://localhost` in Docker) |
| `OLLAMA_BASE_URL` | `http://localhost:11434/v1` | Ollama OpenAI-compatible API endpoint                     |
| `OLLAMA_MODEL`    | `qwen3:0.6b`                | LLM model name to use for coaching reports                |
