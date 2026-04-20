import { useState } from "react";
import { analyzeResume } from "./api/client";
import type { AnalyzeResult } from "./api/client";
import Nav from "./components/Nav";
import UploadPage from "./pages/UploadPage";
import BatchPage from "./pages/BatchPage";
import ResultPage from "./pages/ResultPage";

export default function App() {
  const [results, setResults] = useState<AnalyzeResult[] | null>(null);
  const [activeCandidate, setActiveCandidate] = useState<AnalyzeResult | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (resumes: File[], jd: string | File) => {
    setLoading(true);
    setError("");
    setActiveCandidate(null);
    try {
      const data = await analyzeResume(resumes, jd);
      setResults(data);
      if (data.length === 1) setActiveCandidate(data[0]);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("A system failure occurred during vector analysis.");
      }
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setResults(null);
    setActiveCandidate(null);
    setError("");
  };

  return (
    <div
      className="min-h-screen bg-[#f6f5f2] w-full overflow-x-hidden"
      style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}
    >
      <Nav
        results={results}
        activeCandidate={activeCandidate}
        onNewScan={reset}
        onBack={() => setActiveCandidate(null)}
      />

      {error && (
        <div className="w-full px-6 md:px-12 lg:px-20 pt-6">
          <div className="text-[14px] font-medium text-[#8b3a3a] bg-[#fdf2f2] border border-[#f0d4d4] rounded-[8px] px-5 py-3 shadow-sm">
            {error}
          </div>
        </div>
      )}

      {!results ? (
        <UploadPage onSubmit={handleSubmit} loading={loading} />
      ) : activeCandidate ? (
        <ResultPage key={activeCandidate.filename} result={activeCandidate} />
      ) : (
        <BatchPage results={results} onViewCandidate={setActiveCandidate} />
      )}
    </div>
  );
}
