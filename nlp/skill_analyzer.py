import re
import json
import os
import logging

MIN_JD_SKILLS = 5


def load_skills() -> dict:
    file_path = os.path.join(os.path.dirname(__file__), "skills.json")
    try:
        if os.path.exists(file_path):
            with open(file_path, "r", encoding="utf-8") as f:
                return json.load(f)
        else:
            logging.warning(f"skills.json not found at {file_path}. Using fallback.")
    except Exception as e:
        logging.error(f"Error loading skills.json: {e}")

    return {
        "Backend": [
            {"name": "python", "aliases": [], "weight": 3},
            {"name": "nodejs", "aliases": ["node.js", "node"], "weight": 3},
        ]
    }


SKILLS_DB = load_skills()

SKILL_MAP: dict[str, int] = {}
ALIAS_MAP: dict[str, str] = {}

for category in SKILLS_DB.values():
    for skill in category:
        canonical = skill["name"].lower()
        weight = skill["weight"]
        SKILL_MAP[canonical] = weight
        for alias in skill.get("aliases", []):
            ALIAS_MAP[alias.lower()] = canonical


def _resolve(term: str) -> str:
    return ALIAS_MAP.get(term, term)


def analyze_skills(resume_raw: str, jd_raw: str) -> dict:
    resume_found = _extract_weighted_skills(resume_raw)
    jd_required = _extract_weighted_skills(jd_raw)

    matched = sorted(list(resume_found.keys() & jd_required.keys()))
    missing = sorted(list(jd_required.keys() - resume_found.keys()))

    total_jd_weight = sum(jd_required.values())
    matched_weight = sum(jd_required[s] for s in matched)

    jd_skill_count = len(jd_required)
    effective_skill_weight = 0.15 if jd_skill_count < MIN_JD_SKILLS else 0.3

    skill_coverage = (matched_weight / total_jd_weight) if total_jd_weight > 0 else 0.0

    return {
        "matched_skills": matched,
        "missing_skills": missing,
        "skill_coverage": round(skill_coverage, 4),
        "effective_skill_weight": effective_skill_weight,
        "suggestions": generate_suggestions(missing),
    }


def _extract_weighted_skills(text: str) -> dict:
    text_low = text.lower()
    found: dict[str, int] = {}

    all_terms = list(SKILL_MAP.keys()) + list(ALIAS_MAP.keys())

    for term in all_terms:
        if term not in text_low:
            continue

        canonical = _resolve(term)
        weight = SKILL_MAP.get(canonical, 0)

        if len(term) <= 3:
            if re.search(rf"\b{re.escape(term)}\b", text_low):
                found[canonical] = weight
        else:
            if term in text_low:
                found[canonical] = weight

    return found


def generate_suggestions(missing_skills: list) -> list:
    if not missing_skills:
        return ["Strategic alignment detected across all high-weight technical nodes."]

    priority = sorted(missing_skills, key=lambda x: SKILL_MAP.get(x, 0), reverse=True)[
        :3
    ]

    return [
        f"Critical Infrastructure Gap: Missing proficiency in {', '.join(priority)}.",
        f"Optimization: Documented experience in {missing_skills[-1]} would strengthen the technical match.",
    ]
