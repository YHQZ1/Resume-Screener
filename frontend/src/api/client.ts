export type AnalyzeResult = {
  filename: string;
  email: string;
  phone: string;
  hybrid_score: number;
  tfidf_score: number;
  sbert_score: number;
  matched_skills: string[];
  missing_skills: string[];
  suggestions: string[];
};

export async function analyzeResume(
  resumes: File[],
  jobDescription: string | File,
): Promise<AnalyzeResult[]> {
  const formData = new FormData();

  resumes.forEach((resume) => {
    formData.append("resumes", resume);
  });

  if (jobDescription instanceof File) {
    formData.append("job_description_file", jobDescription);
  } else {
    formData.append("job_description_text", jobDescription);
  }

  const res = await fetch(
    `${import.meta.env.VITE_API_URL ?? "http://localhost:8000"}/analyze`,
    {
      method: "POST",
      body: formData,
    },
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
