from sentence_transformers import SentenceTransformer, util
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import torch
import logging

TFIDF_WEIGHT = 0.2
SBERT_WEIGHT = 0.5
SKILL_WEIGHT = 0.3

try:
    sbert_model = SentenceTransformer("all-MiniLM-L6-v2")
except Exception as e:
    raise RuntimeError(f"Failed to load SBERT model: {e}")


def score(
    resume_clean: str,
    jd_clean: str,
    resume_raw: str,
    jd_raw: str,
    skill_coverage: float = 0.0,
    jd_embedding=None,
) -> dict:
    tfidf = compute_tfidf_score(resume_clean, jd_clean)
    sbert = compute_sbert_score(resume_raw, jd_raw, jd_embedding)
    hybrid = compute_hybrid_score(tfidf, sbert, skill_coverage)
    return {
        "tfidf_score": round(tfidf, 4),
        "sbert_score": round(sbert, 4),
        "hybrid_score": round(hybrid, 4),
    }


def compute_tfidf_score(resume_clean: str, jd_clean: str) -> float:
    if not resume_clean.strip() or not jd_clean.strip():
        return 0.0
    vectorizer = TfidfVectorizer(ngram_range=(1, 2))
    try:
        tfidf_matrix = vectorizer.fit_transform([resume_clean, jd_clean])
        result = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
        return float(result)
    except Exception as e:
        logging.error(f"TF-IDF scoring failed: {e}")
        return 0.0


def compute_sbert_score(resume_raw: str, jd_raw: str, jd_embedding=None) -> float:
    try:
        resume_chunks = [
            resume_raw[i : i + 500] for i in range(0, len(resume_raw), 500)
        ]
        r_embeddings = sbert_model.encode(resume_chunks, convert_to_tensor=True)

        if jd_embedding is None:
            jd_chunks = [jd_raw[i : i + 500] for i in range(0, len(jd_raw), 500)]
            jd_embedding = sbert_model.encode(jd_chunks, convert_to_tensor=True)

        cosine_scores = util.cos_sim(r_embeddings, jd_embedding)
        result = torch.max(cosine_scores).item()
        return float(max(0.0, min(1.0, result)))
    except Exception as e:
        logging.error(f"SBERT scoring failed: {e}")
        return 0.0


def compute_hybrid_score(
    tfidf_score: float,
    sbert_score: float,
    skill_coverage: float = 0.0,
) -> float:
    return (
        (TFIDF_WEIGHT * tfidf_score)
        + (SBERT_WEIGHT * sbert_score)
        + (SKILL_WEIGHT * skill_coverage)
    )
