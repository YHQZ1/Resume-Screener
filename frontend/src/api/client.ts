export type AnalyzeResult = {
  filename: string;
  email: string;
  phone: string;
  hybrid_score: number;
  tfidf_score: number;
  sbert_score: number;
  skill_coverage: number;
  matched_skills: string[];
  missing_skills: string[];
  suggestions: string[];
  jd_raw?: string;
  resume_raw?: string;
};

export type AgentResult = {
  filename: string;
  initial_score: number;
  threshold: number;
  verdict: "hireable" | "not_hireable" | "borderline";
  recommended_skills: string[];
  projected_score: number;
  reasoning: string;
  plateau_detected: boolean;
  score_progression: number[];
  iterations: number;
  action_items: string[];
  semantic_gap_reason: string;
};

export async function analyzeResume(
  resumes: File[],
  jobDescription: string | File,
): Promise<AnalyzeResult[]> {
  const formData = new FormData();
  resumes.forEach((resume) => formData.append("resumes", resume));
  if (jobDescription instanceof File) {
    formData.append("job_description_file", jobDescription);
  } else {
    formData.append("job_description_text", jobDescription);
  }

  const res = await fetch(
    `${import.meta.env.VITE_API_URL ?? "http://localhost:8000"}/analyze`,
    { method: "POST", body: formData },
  );

  if (!res.ok) {
    let errorMessage = "An error occurred during analysis.";
    try {
      const errorData = await res.json();
      errorMessage = errorData.detail || errorMessage;
    } catch {
      errorMessage = (await res.text()) || res.statusText;
    }
    throw new Error(errorMessage);
  }

  return res.json();
}

export async function coachResume(
  resumeResult: AnalyzeResult,
  threshold: number = 0.75,
): Promise<AgentResult> {
  const res = await fetch(
    `${import.meta.env.VITE_API_URL ?? "http://localhost:8000"}/agent/coach`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resume_result: resumeResult, threshold }),
    },
  );

  if (!res.ok) {
    let errorMessage = "Agent evaluation failed.";
    try {
      const errorData = await res.json();
      errorMessage = errorData.detail || errorMessage;
    } catch {
      errorMessage = (await res.text()) || res.statusText;
    }
    throw new Error(errorMessage);
  }

  return res.json();
}
