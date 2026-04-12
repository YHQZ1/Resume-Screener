import { useState } from "react";

type AnalyzeResult = {
  hybrid_score: number;
  tfidf_score: number;
  sbert_score: number;
  matched_skills: string[];
  missing_skills: string[];
  suggestions: string[];
};

export default function App() {
  const [resume, setResume] = useState<File | null>(null);
  const [jd, setJd] = useState("");
  const [jdFile, setJdFile] = useState<File | null>(null);
  const [result, setResult] = useState<AnalyzeResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!resume || (!jd && !jdFile)) {
      setError("Please upload a resume and provide a job description.");
      return;
    }

    setError("");
    setLoading(true);

    const formData = new FormData();
    formData.append("resume", resume);
    if (jdFile) {
      formData.append("job_description_file", jdFile);
    } else {
      formData.append("job_description", jd);
    }

    try {
      const res = await fetch("http://localhost:8000/analyze", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setResult(data);
    } catch {
      setError("Something went wrong. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white px-6 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-2 text-center">ATS Scanner</h1>
        <p className="text-center text-gray-400 mb-10">
          Upload your resume and paste a job description to get your match
          score.
        </p>

        {/* Input Section */}
        <div className="bg-gray-900 rounded-2xl p-6 space-y-6">
          {/* Resume Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Resume <span className="text-gray-500">(PDF, DOCX, TXT)</span>
            </label>
            <input
              type="file"
              accept=".pdf,.docx,.doc,.txt"
              onChange={(e) => setResume(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer"
            />
          </div>

          {/* JD Text */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Job Description{" "}
              <span className="text-gray-500">(paste text or upload .txt)</span>
            </label>
            <textarea
              rows={6}
              value={jd}
              onChange={(e) => setJd(e.target.value)}
              placeholder="Paste the job description here..."
              className="w-full bg-gray-800 rounded-xl px-4 py-3 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
            <div className="mt-2">
              <input
                type="file"
                accept=".txt"
                onChange={(e) => setJdFile(e.target.files?.[0] ?? null)}
                className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gray-700 file:text-white hover:file:bg-gray-600 cursor-pointer"
              />
            </div>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors"
          >
            {loading ? "Analyzing..." : "Analyze Resume"}
          </button>
        </div>

        {/* Results Section — will be replaced by ResultDashboard component later */}
        {result && (
          <div className="mt-10 bg-gray-900 rounded-2xl p-6 space-y-6">
            <h2 className="text-2xl font-bold text-center">Results</h2>

            {/* Scores */}
            <div className="grid grid-cols-3 gap-4 text-center">
              {[
                { label: "Hybrid Score", value: result.hybrid_score },
                { label: "TF-IDF Score", value: result.tfidf_score },
                { label: "SBERT Score", value: result.sbert_score },
              ].map(({ label, value }) => (
                <div key={label} className="bg-gray-800 rounded-xl p-4">
                  <p className="text-3xl font-bold text-indigo-400">
                    {(value * 100).toFixed(1)}%
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{label}</p>
                </div>
              ))}
            </div>

            {/* Matched Skills */}
            <div>
              <h3 className="text-sm font-semibold text-gray-300 mb-2">
                Matched Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {result.matched_skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 bg-green-900 text-green-300 rounded-full text-xs"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Missing Skills */}
            <div>
              <h3 className="text-sm font-semibold text-gray-300 mb-2">
                Missing Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {result.missing_skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 bg-red-900 text-red-300 rounded-full text-xs"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Suggestions */}
            <div>
              <h3 className="text-sm font-semibold text-gray-300 mb-2">
                Suggestions
              </h3>
              <ul className="space-y-2">
                {result.suggestions.map((s, i) => (
                  <li
                    key={i}
                    className="text-sm text-gray-400 bg-gray-800 rounded-xl px-4 py-3"
                  >
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
