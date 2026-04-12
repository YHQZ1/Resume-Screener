import { useState } from "react";

type Props = {
  onSubmit: (resumes: File[], jd: string | File) => void;
  loading: boolean;
};

export default function UploadPage({ onSubmit, loading }: Props) {
  const [resumes, setResumes] = useState<File[]>([]);
  const [jdMode, setJdMode] = useState<"text" | "file">("text");
  const [jdText, setJdText] = useState("");
  const [jdFile, setJdFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [drag, setDrag] = useState(false);

  const handleFiles = (files: FileList | null) => {
    if (files) setResumes(Array.from(files));
  };

  const handleSubmit = () => {
    if (resumes.length === 0) {
      setError("Select at least one resume document.");
      return;
    }
    const jd = jdMode === "text" ? jdText : jdFile;
    if (!jd || (typeof jd === "string" && !jd.trim())) {
      setError("Add a target job description.");
      return;
    }
    setError("");
    onSubmit(resumes, jd);
  };

  return (
    <div className="w-full px-6 md:px-12 lg:px-20 py-16">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start w-full">
        <div className="w-full flex flex-col justify-center">
          <p className="text-[11px] font-semibold tracking-[0.1em] text-[#9a9990] uppercase mb-5">
            AI-powered screening
          </p>
          <h1 className="text-[44px] lg:text-[52px] font-light leading-[1.1] tracking-[-0.03em] text-[#1a1a18] mb-6">
            Find the right
            <br />
            <em className="italic font-light">fit,</em> faster.
          </h1>
          <p className="text-[15px] lg:text-[16px] text-[#5a5a55] leading-[1.7] max-w-2xl mb-12">
            Upload a single resume or process an entire batch against a target
            job description. Our intelligence engine utilizes advanced lexical
            analysis, SBERT semantic vectors, and layout-aware parameter
            extraction to accurately rank candidate viability.
          </p>

          <div className="flex flex-col gap-7">
            {(
              [
                [
                  "Document Sourcing",
                  "Upload candidate payloads in PDF, DOCX, or TXT formats via single file or batch selection.",
                ],
                [
                  "Target Role Definition",
                  "Provide the baseline job description either as raw text or a formatted document file.",
                ],
                [
                  "Vector Analysis Engine",
                  "The system maps keyword density against deep semantic proficiency to prevent false positives.",
                ],
                [
                  "Actionable Intelligence",
                  "Receive deterministic match scores, identified capability gaps, and strategic hiring directives.",
                ],
              ] as const
            ).map(([title, sub], i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-[24px] h-[24px] rounded-full bg-[#eceae5] text-[#5a5a55] text-[12px] font-semibold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <div>
                  <p className="text-[15px] font-medium text-[#1a1a18] mb-1">
                    {title}
                  </p>
                  <p className="text-[14px] text-[#9a9990] max-w-xl leading-relaxed">
                    {sub}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-[#e8e7e2] rounded-[12px] overflow-hidden w-full shadow-sm">
          <div className="p-8 pb-0">
            <p className="text-[11px] font-semibold tracking-[0.07em] text-[#5a5a55] uppercase mb-3">
              Candidate Payloads
            </p>
            <div
              className="relative rounded-[8px] cursor-pointer transition-all duration-150"
              style={{
                border: `1.5px dashed ${drag ? "#1a1a18" : "#d4d3cd"}`,
                background: drag ? "#f0ede8" : "#f6f5f2",
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setDrag(true);
              }}
              onDragLeave={() => setDrag(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDrag(false);
                handleFiles(e.dataTransfer.files);
              }}
            >
              <input
                type="file"
                multiple
                accept=".pdf,.docx,.doc,.txt"
                onChange={(e) => handleFiles(e.target.files)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="px-5 py-8 text-center pointer-events-none">
                {resumes.length === 0 ? (
                  <>
                    <div className="w-10 h-10 bg-[#eceae5] rounded-[8px] flex items-center justify-center mx-auto mb-4">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 16 16"
                        fill="none"
                      >
                        <path
                          d="M8 2.5v8M5.5 5L8 2.5 10.5 5"
                          stroke="#5a5a55"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M2.5 11v1.5A1 1 0 003.5 13.5h9a1 1 0 001-1V11"
                          stroke="#5a5a55"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                    <p className="text-[14px] text-[#5a5a55] mb-1.5 font-medium">
                      Drop files here or click to browse
                    </p>
                    <p className="text-[12px] text-[#9a9990] tracking-wide">
                      PDF · DOCX · TXT
                    </p>
                  </>
                ) : (
                  <div>
                    <p className="text-[15px] font-medium text-[#1a1a18] mb-3">
                      {resumes.length === 1
                        ? resumes[0].name
                        : `${resumes.length} documents loaded`}
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {resumes.slice(0, 8).map((f, i) => (
                        <span
                          key={i}
                          className="text-[12px] bg-[#eceae5] text-[#4a4a45] px-2.5 py-1 rounded-[4px] font-medium"
                        >
                          {f.name}
                        </span>
                      ))}
                      {resumes.length > 8 && (
                        <span className="text-[12px] text-[#9a9990] py-1 font-medium">
                          +{resumes.length - 8} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="p-8 pb-0">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[11px] font-semibold tracking-[0.07em] text-[#5a5a55] uppercase">
                Job Description
              </p>
              <div className="flex bg-[#f6f5f2] border border-[#e8e7e2] rounded-[6px] p-1 gap-1">
                {(["text", "file"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setJdMode(m)}
                    className={`px-4 py-1.5 rounded-[4px] text-[12px] font-medium transition-all duration-100 cursor-pointer
                      ${
                        jdMode === m
                          ? "bg-white text-[#1a1a18] shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
                          : "text-[#9a9990] hover:text-[#5a5a55]"
                      }`}
                  >
                    {m.charAt(0).toUpperCase() + m.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {jdMode === "text" ? (
              <textarea
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                placeholder="Paste the target job description here…"
                rows={6}
                className="w-full border border-[#e8e7e2] rounded-[8px] px-5 py-4 text-[14px] text-[#1a1a18]
                  bg-[#f6f5f2] placeholder-[#9a9990] resize-y outline-none leading-relaxed
                  focus:border-[#1a1a18] focus:bg-white transition-colors duration-150"
              />
            ) : (
              <div className="relative border-[1.5px] border-dashed border-[#d4d3cd] rounded-[8px] bg-[#f6f5f2] cursor-pointer hover:border-[#1a1a18] transition-colors">
                <input
                  type="file"
                  accept=".pdf,.docx,.doc,.txt"
                  onChange={(e) => setJdFile(e.target.files?.[0] ?? null)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="px-5 py-10 text-center pointer-events-none">
                  <p
                    className={`text-[14px] ${jdFile ? "font-medium text-[#1a1a18]" : "text-[#9a9990]"}`}
                  >
                    {jdFile
                      ? jdFile.name
                      : "Drop target profile file here or click to browse"}
                  </p>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="mx-8 mt-5 text-[13px] font-medium text-[#8b3a3a] bg-[#fdf2f2] border border-[#f0d4d4] rounded-[6px] px-4 py-3">
              {error}
            </div>
          )}

          <div className="p-8">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`w-full py-3.5 rounded-[8px] text-[14px] font-medium tracking-[-0.01em] transition-all duration-150
                ${
                  loading
                    ? "bg-[#eceae5] text-[#9a9990] cursor-not-allowed"
                    : "bg-[#1a1a18] text-white hover:bg-[#2e2e2a] active:scale-[0.99] cursor-pointer"
                }`}
            >
              {loading ? "Analyzing vectors…" : "Execute Scan →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
