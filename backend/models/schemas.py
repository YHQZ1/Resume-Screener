from pydantic import BaseModel
from typing import List

class AnalyzeResponse(BaseModel):
    filename: str
    email: str
    phone: str
    hybrid_score: float
    tfidf_score: float
    sbert_score: float
    skill_coverage: float
    matched_skills: List[str]
    missing_skills: List[str]
    suggestions: List[str]