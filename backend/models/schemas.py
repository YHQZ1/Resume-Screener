from pydantic import BaseModel
from typing import List, Dict, Any


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
    jd_raw: str
    resume_raw: str


class AgentRequest(BaseModel):
    resume_result: Dict[str, Any]
    threshold: float = 0.75


class AgentResponse(BaseModel):
    filename: str
    initial_score: float
    threshold: float
    verdict: str
    recommended_skills: List[str]
    projected_score: float
    reasoning: str
    plateau_detected: bool
    score_progression: List[float]
    iterations: int
    action_items: List[str] = []
    semantic_gap_reason: str = ""
