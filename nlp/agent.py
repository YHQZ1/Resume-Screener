import json
import os
import logging
from openai import OpenAI
from nlp.skill_analyzer import SKILL_MAP, _extract_weighted_skills
from nlp.scorer import TFIDF_WEIGHT, SBERT_WEIGHT, SKILL_WEIGHT

_client = None


def get_client():
    global _client
    if _client is None:
        _client = OpenAI(
            base_url=os.getenv("OLLAMA_BASE_URL", "http://localhost:11434/v1"),
            api_key="ollama",
        )
    return _client


def _run_simulation_loop(
    missing_skills: list,
    initial_score: float,
    initial_coverage: float,
    total_jd_weight: float,
    threshold: float,
) -> dict:
    ranked = sorted(
        missing_skills,
        key=lambda s: SKILL_MAP.get(s.lower(), 0),
        reverse=True,
    )

    current_score = initial_score
    current_coverage = initial_coverage
    score_progression = [round(initial_score, 4)]
    skills_added = []
    plateau_count = 0
    plateau_detected = False

    for skill in ranked:
        skill_weight = SKILL_MAP.get(skill.lower(), 1)
        coverage_gain = skill_weight / total_jd_weight if total_jd_weight > 0 else 0
        new_coverage = min(1.0, current_coverage + coverage_gain)
        coverage_delta = new_coverage - current_coverage
        new_score = round(current_score + (SKILL_WEIGHT * coverage_delta), 4)

        improvement = new_score - current_score
        if improvement < 0.02:
            plateau_count += 1
        else:
            plateau_count = 0

        skills_added.append(skill)
        score_progression.append(new_score)
        current_score = new_score
        current_coverage = new_coverage

        if current_score >= threshold:
            break

        if plateau_count >= 2:
            plateau_detected = True
            break

    verdict = (
        "hireable"
        if current_score >= threshold
        else "borderline" if current_score >= threshold - 0.1 else "not_hireable"
    )

    return {
        "score_progression": score_progression,
        "skills_added": skills_added,
        "final_score": current_score,
        "plateau_detected": plateau_detected,
        "verdict": verdict,
    }


def _get_llm_report(
    resume_result: dict,
    simulation: dict,
    threshold: float,
) -> dict:
    matched = ", ".join(resume_result.get("matched_skills", [])) or "None"
    missing_priority = ", ".join(simulation["skills_added"][:5]) or "None"
    resume_raw = resume_result.get("resume_raw", "")[:1500]
    jd_raw = resume_result.get("jd_raw", "")[:1000]

    prompt = f"""You are a technical career coach. Write a coaching report based on this resume analysis.

Candidate Data:
- Initial Score: {round(resume_result.get('hybrid_score', 0) * 100, 1)}%
- Projected Score: {round(simulation['final_score'] * 100, 1)}%
- Threshold: {round(threshold * 100, 1)}%
- Verdict: {simulation['verdict']}
- Matched Skills: {matched}
- Top Missing Skills: {missing_priority}
- Plateau Detected: {simulation['plateau_detected']}

Resume excerpt:
{resume_raw}

Job Description excerpt:
{jd_raw}

Respond with ONLY a valid JSON object. No markdown, no explanation, no extra text before or after:
{{"reasoning": "one paragraph verdict explanation referencing the candidate specifically", "action_items": ["specific action 1 referencing actual resume content", "specific action 2", "specific action 3"], "semantic_gap_reason": "specific explanation of what vocabulary or narrative is missing from this resume compared to this JD"}}"""

    try:
        response = get_client().chat.completions.create(
            model="llama3.1",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
        )
        text = response.choices[0].message.content or "{}"
        text = text.strip()

        if "```" in text:
            parts = text.split("```")
            for part in parts:
                part = part.strip()
                if part.startswith("json"):
                    part = part[4:].strip()
                if part.startswith("{"):
                    text = part
                    break

        start = text.find("{")
        end = text.rfind("}") + 1
        if start != -1 and end > start:
            text = text[start:end]

        parsed = json.loads(text)

        for key in ["action_items"]:
            val = parsed.get(key)
            if isinstance(val, str):
                try:
                    parsed[key] = json.loads(val)
                except Exception:
                    parsed[key] = [val]

        return parsed

    except Exception as e:
        logging.error(f"LLM report generation failed: {e}")
        return {
            "reasoning": f"Candidate scored {round(simulation['final_score'] * 100, 1)}% against a {round(threshold * 100, 1)}% threshold. {'Score plateaued — the main barrier is semantic mismatch, not missing skills.' if simulation['plateau_detected'] else 'Adding the recommended skills would improve alignment with the job description.'}",
            "action_items": (
                [
                    f"Add {s} to your resume and describe your experience with it"
                    for s in simulation["skills_added"][:3]
                ]
                or [
                    "Align your resume language more closely with the job description terminology."
                ]
            ),
            "semantic_gap_reason": "The resume narrative does not closely match the terminology and concepts used in the job description. Rewriting project descriptions using JD-aligned language would improve the semantic score.",
        }


def run_threshold_agent(resume_result: dict, threshold: float = 0.75) -> dict:
    jd_raw = resume_result.get("jd_raw", "")
    jd_skills = _extract_weighted_skills(jd_raw) if jd_raw else {}
    total_jd_weight = sum(jd_skills.values()) if jd_skills else 10.0
    missing_skills = resume_result.get("missing_skills", [])

    simulation = _run_simulation_loop(
        missing_skills=missing_skills,
        initial_score=resume_result.get("hybrid_score", 0),
        initial_coverage=resume_result.get("skill_coverage", 0),
        total_jd_weight=total_jd_weight,
        threshold=threshold,
    )

    llm_report = _get_llm_report(resume_result, simulation, threshold)

    return {
        "filename": resume_result.get("filename", "unknown"),
        "initial_score": resume_result.get("hybrid_score", 0),
        "threshold": threshold,
        "verdict": simulation["verdict"],
        "recommended_skills": simulation["skills_added"],
        "projected_score": simulation["final_score"],
        "reasoning": llm_report.get("reasoning", "Agent evaluation complete."),
        "plateau_detected": simulation["plateau_detected"],
        "score_progression": simulation["score_progression"],
        "iterations": len(simulation["score_progression"]) - 1,
        "action_items": llm_report.get("action_items", []),
        "semantic_gap_reason": llm_report.get("semantic_gap_reason", ""),
    }
