from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from typing import Optional, List
import logging
from nlp.extractor import extract_text, extract_entities
from nlp.preprocessor import preprocess
from nlp.scorer import score, sbert_model
from nlp.skill_analyzer import analyze_skills
from backend.models.schemas import AnalyzeResponse

router = APIRouter()
MAX_FILE_SIZE = 5 * 1024 * 1024


@router.post("/analyze", response_model=List[AnalyzeResponse])
async def analyze(
    resumes: List[UploadFile] = File(...),
    job_description_text: Optional[str] = Form(None),
    job_description_file: Optional[UploadFile] = File(None),
):
    jd_raw = ""

    if job_description_file and job_description_file.filename:
        jd_bytes = await job_description_file.read()
        if len(jd_bytes) > MAX_FILE_SIZE:
            raise HTTPException(status_code=413, detail="JD file too large.")
        try:
            jd_raw = extract_text(jd_bytes, job_description_file.filename)
        except ValueError as e:
            raise HTTPException(status_code=415, detail=f"JD Error: {str(e)}")
    elif job_description_text and job_description_text.strip():
        jd_raw = job_description_text.strip()
    else:
        raise HTTPException(status_code=422, detail="Provide a Job Description.")

    jd_clean = preprocess(jd_raw)
    jd_embedding = sbert_model.encode(jd_raw, convert_to_tensor=True)

    results = []

    for resume in resumes:
        try:
            resume_bytes = await resume.read()
            if not resume_bytes or len(resume_bytes) > MAX_FILE_SIZE:
                continue

            resume_raw = extract_text(resume_bytes, resume.filename)
            if not resume_raw.strip():
                logging.warning(
                    f"Empty content extracted from {resume.filename}, skipping."
                )
                continue

            resume_clean = preprocess(resume_raw)
            entities = extract_entities(resume_raw)
            skills_data = analyze_skills(resume_raw, jd_raw)

            scores = score(
                resume_clean,
                jd_clean,
                resume_raw,
                jd_raw,
                skill_coverage=skills_data["skill_coverage"],
                jd_embedding=jd_embedding,
            )

            results.append(
                AnalyzeResponse(
                    filename=resume.filename,
                    email=entities["email"],
                    phone=entities["phone"],
                    hybrid_score=scores["hybrid_score"],
                    tfidf_score=scores["tfidf_score"],
                    sbert_score=scores["sbert_score"],
                    skill_coverage=skills_data["skill_coverage"],
                    matched_skills=skills_data["matched_skills"],
                    missing_skills=skills_data["missing_skills"],
                    suggestions=skills_data["suggestions"],
                    jd_raw=jd_raw,
                    resume_raw=resume_raw,
                )
            )
        except Exception as e:
            logging.error(f"Failed to process {resume.filename}: {e}")
            continue

    if not results:
        raise HTTPException(
            status_code=422, detail="No valid resumes could be processed."
        )

    results.sort(key=lambda x: x.hybrid_score, reverse=True)
    return results
