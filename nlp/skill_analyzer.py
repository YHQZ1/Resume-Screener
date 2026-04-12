import re
import json
import os
from thefuzz import fuzz # type: ignore


def load_skills() -> dict:
    file_path = os.path.join(os.path.dirname(__file__), "skills.json")
    try:
        with open(file_path, "r") as f:
            return json.load(f)
    except FileNotFoundError:
        return {"General": [{"name": "python", "weight": 3}]}


SKILLS_DB = load_skills()
SKILL_MAP = {s["name"].lower(): s["weight"] for cat in SKILLS_DB.values() for s in cat}


def analyze_skills(resume_raw: str, jd_raw: str) -> dict:
    resume_found = _extract_weighted_skills(resume_raw)
    jd_required = _extract_weighted_skills(jd_raw)

    matched = sorted(list(resume_found.keys() & jd_required.keys()))
    missing = sorted(list(jd_required.keys() - resume_found.keys()))

    total_jd_weight = sum(jd_required.values())
    matched_weight = sum(jd_required[s] for s in matched)

    skill_coverage = (matched_weight / total_jd_weight) if total_jd_weight > 0 else 0

    return {
        "matched_skills": matched,
        "missing_skills": missing,
        "skill_coverage": round(skill_coverage, 4),
        "suggestions": generate_suggestions(missing),
    }


def _extract_weighted_skills(text: str) -> dict:
    text_low = text.lower()
    found = {}
    for name, weight in SKILL_MAP.items():
        if len(name) <= 3:
            if re.search(rf"\b{re.escape(name)}\b", text_low):
                found[name] = weight
            continue

        if name in text_low:
            found[name] = weight
        elif len(name) > 5 and fuzz.partial_ratio(name, text_low) > 90:
            found[name] = weight

    return found


def generate_suggestions(missing_skills: list) -> list:
    if not missing_skills:
        return ["Strategic alignment detected across all high-weight technical nodes."]

    priority = sorted(missing_skills, key=lambda x: SKILL_MAP.get(x, 0), reverse=True)[
        :3
    ]

    return [
        f"Critical Infrastructure Gap: Missing proficiency in {', '.join(priority)}.",
        f"Optimization: Documented experience in {missing_skills[-1]} would strengthen the lexical vector.",
    ]
