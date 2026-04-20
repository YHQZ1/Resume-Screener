# Resume Screener — AI-Powered ATS & Career Coach

An intelligent resume screening and coaching tool built with NLP, FastAPI, and React. It uses a hybrid scoring system (TF-IDF + SBERT) and an autonomous AI Agent (Ollama/Llama 3.1) to provide deep-dive career coaching and skill gap analysis.

---

## Project Structure

```text
.
├── Dockerfile              # Backend & NLP container definition
├── docker-compose.yaml      # Multi-container orchestration (Backend + Ollama)
├── .env                    # Environment variables
├── backend/
│   ├── main.py             # FastAPI entry point
│   ├── routes/
│   │   ├── analyze.py      # Resume parsing & scoring logic
│   │   └── coach.py        # AI Agent coaching endpoint
│   └── models/schemas.py   # Pydantic data models
├── nlp/
│   ├── agent.py            # AI Coaching Agent logic (Ollama)
│   ├── scorer.py           # Hybrid (TF-IDF + SBERT) scoring engine
│   ├── skill_analyzer.py   # Skill extraction & mapping
│   ├── preprocessor.py     # Text cleaning (spaCy)
│   └── extractor.py        # PDF/Docx text extraction
└── frontend/               # React + Vite + Tailwind CSS
```

---

## How It Works

1. **Extraction & Scoring**:
   - Extracts text from `.pdf`, `.docx`, or `.txt`.
   - Calculates a **Hybrid Score**: `(0.3 × TF-IDF) + (0.3 × SBERT) + (0.4 × Skill Coverage)`.
2. **AI Coaching Agent**:
   - The system simulates adding missing skills to see how they impact your score.
   - **Ollama (Llama 3.1)** analyzes the semantic gap and provides concrete "Action Items" to improve the resume narrative.

---

## Tech Stack

| Layer        | Technology                                     |
| ------------ | ---------------------------------------------- |
| **AI/NLP**   | Ollama (Llama 3.1), spaCy, SBERT, Scikit-learn |
| **Backend**  | FastAPI, Uvicorn, Pydantic                     |
| **Frontend** | React 18, TypeScript, Tailwind CSS, Vite       |
| **DevOps**   | Docker, Docker Compose                         |

---

## Getting Started (Docker - Recommended)

### 1. Setup Environment

Create a `.env` file in the root directory:

```env
FRONTEND_URL=http://localhost:5173
OLLAMA_BASE_URL=http://ollama:11434/v1
```

### 2. Launch Services

```bash
docker-compose up -d --build
```

### 3. Initialize AI Model

The first time you run the app, you must pull the Llama model into the Ollama container:

```bash
docker exec -it resumescreener-ollama-1 ollama pull llama3.1
```

---

## Manual Setup (Local Dev)

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python -m spacy download en_core_web_sm
uvicorn main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## API Reference

### `POST /analyze`

Analyzes one or more resumes against a Job Description.

- **Payload**: `resumes` (files), `job_description_text` (string)
- **Returns**: `AnalyzeResponse[]` (scores, matched/missing skills)

### `POST /agent/coach`

Runs the AI Agent to provide a coaching report.

- **Payload**: `resume_result` (from /analyze), `threshold` (float)
- **Returns**: `verdict`, `projected_score`, `action_items`, `reasoning`

---

## Scoring Components

| Component  | Weight | Purpose                                   |
| ---------- | ------ | ----------------------------------------- |
| **TF-IDF** | 30%    | Hard keyword matching (exact terms)       |
| **SBERT**  | 30%    | Contextual/Semantic similarity (concepts) |
| **Skills** | 40%    | Percentage of JD-required skills matched  |
