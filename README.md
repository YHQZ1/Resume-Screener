# ATS Scanner — AI-Based Applicant Tracking System

An intelligent resume screening tool built with NLP, FastAPI, and React.
Compares a candidate's resume against a job description and produces a
semantic match score, skill gap analysis, and improvement suggestions.

---

## Project Structure

```
ats-scanner/
├── nlp/
│   ├── __init__.py
│   ├── extractor.py          # Text extraction from PDF, DOCX, TXT
│   ├── preprocessor.py       # spaCy-based cleaning & lemmatization
│   ├── scorer.py             # TF-IDF + SBERT + hybrid scoring
│   └── skill_analyzer.py     # Matched / missing skill detection
│
├── backend/
│   ├── __init__.py
│   ├── main.py               # App entry point, CORS, model preload
│   ├── routes/
│   │   ├── __init__.py
│   │   └── analyze.py        # POST /analyze endpoint
│   ├── models/
│   │   ├── __init__.py
│   │   └── schemas.py        # Pydantic request/response schemas
│   ├── requirements.txt
│   └── .env                  # Environment variables (never commit)
│
└── frontend/
    ├── src/
    │   ├── App.tsx
    │   ├── main.tsx
    │   ├── index.css
    │   ├── components/
    │   │   ├── UploadForm.tsx
    │   │   ├── ResultDashboard.tsx
    │   │   ├── ScoreGauge.tsx
    │   │   ├── SkillsCard.tsx
    │   │   └── RadarChart.tsx
    │   └── api/
    │       └── client.ts
    ├── index.html
    ├── vite.config.ts
    └── tsconfig.json
```

---

## How It Works

```
Resume (PDF/DOCX/TXT) ──┐
                         ├──► Text Extraction ──► Preprocessing (spaCy)
Job Description (text) ──┘              │
                                         ▼
                              ┌─── TF-IDF Score (lexical)
                              ├─── SBERT Score  (semantic)
                              └─── Hybrid Score = (0.4 × TF-IDF) + (0.6 × SBERT)
                                              │
                                              ▼
                              Matched Skills · Missing Skills · Suggestions
```

**Why hybrid scoring?**

- TF-IDF catches exact keyword matches like `Python`, `Docker`, `AWS`
- SBERT understands meaning — so `ML Engineer` ≈ `Machine Learning Developer`
- 60/40 weighting favors semantics over simple keyword repetition

---

## Tech Stack

| Layer      | Technology                                        |
|------------|---------------------------------------------------|
| NLP        | spaCy, sentence-transformers, scikit-learn        |
| Backend    | FastAPI, Uvicorn, PyMuPDF, python-docx            |
| Frontend   | React 18, TypeScript, Tailwind CSS v4, Vite       |
| Deployment | AWS EC2 (backend) · Vercel (frontend)             |

---

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+

---

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
python -m spacy download en_core_web_sm
uvicorn main:app --reload
```

Backend runs on `http://localhost:8000`

---

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

---

## Environment Variables

Create `backend/.env`:

```env
FRONTEND_URL=http://localhost:5173
```

For production:

```env
FRONTEND_URL=https://your-app.vercel.app
```

---

## API Reference

### `POST /analyze`

Accepts a `multipart/form-data` request.

**Request fields:**

| Field                  | Type   | Description                          |
|------------------------|--------|--------------------------------------|
| `resume`               | file   | Resume file — PDF, DOCX, or TXT      |
| `job_description`      | string | Job description as plain text        |
| `job_description_file` | file   | Job description as .txt file upload  |

> Either `job_description` (text) or `job_description_file` (file) is required. If both are provided, the file takes priority.

**Response:**

```json
{
  "hybrid_score": 0.74,
  "tfidf_score": 0.61,
  "sbert_score": 0.82,
  "matched_skills": ["Python", "Docker", "REST"],
  "missing_skills": ["AWS", "Kubernetes"],
  "suggestions": [
    "Consider adding AWS experience to strengthen your application.",
    "Kubernetes is listed as a requirement — explore it via the official docs or a short course."
  ]
}
```

---

## Scoring Formula

```
Hybrid Score = (0.4 × TF-IDF Score) + (0.6 × SBERT Score)
```

| Component | Weight | What it measures                          |
|-----------|--------|-------------------------------------------|
| TF-IDF    | 40%    | Keyword presence and term frequency       |
| SBERT     | 60%    | Semantic meaning and contextual fit       |

Scores are expressed as decimals (0.0 – 1.0) from the API and converted to percentages on the frontend.

---

## Supported File Formats

| Input            | Supported Formats         |
|------------------|---------------------------|
| Resume           | `.pdf`, `.docx`, `.txt`   |
| Job Description  | Plain text or `.txt` file |

---

## Deployment

### Backend — AWS EC2

> Lambda is not recommended due to cold-start latency with SBERT (~90MB model).

Recommended: **EC2 t3.small** or higher.

```bash
# On EC2 instance
git clone https://github.com/your-repo/ats-scanner.git
cd ats-scanner/backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python -m spacy download en_core_web_sm
uvicorn main:app --host 0.0.0.0 --port 8000
```

Use `nginx` as a reverse proxy and `systemd` or `pm2` to keep it running.

### Frontend — Vercel

```bash
cd frontend
vercel deploy
```

Set the environment variable in Vercel dashboard:

```
VITE_API_URL=https://your-ec2-public-ip-or-domain
```