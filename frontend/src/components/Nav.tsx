import type { AnalyzeResult } from "../api/client";

type Props = {
  results: AnalyzeResult[] | null;
  activeCandidate: AnalyzeResult | null;
  onNewScan: () => void;
  onBack: () => void;
};

export default function Nav({
  results,
  activeCandidate,
  onNewScan,
  onBack,
}: Props) {
  return (
    <nav className="bg-white border-b border-[#e8e7e2] sticky top-0 z-50">
      <div className="w-full px-6 md:px-12 h-[52px] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <img src="/logo.svg" alt="Resume Screener" className="w-5 h-5" />
          <span className="font-semibold text-[15px] tracking-[-0.01em] text-[#1a1a18]">
            Resume Screener
          </span>
          <span className="text-[#888883] text-[13px] hidden sm:inline-block border-l border-[#e8e7e2] pl-3 ml-1 font-medium">
            AI-Powered Applicant Evaluation Engine
          </span>
        </div>

        <div className="flex items-center gap-3">
          {activeCandidate && results && results.length > 1 && (
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 text-[13px] text-[#5a5a55] border border-[#e8e7e2] rounded-[6px] px-3 py-1.5 hover:bg-[#f6f5f2] transition-colors cursor-pointer font-medium"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path
                  d="M8 2L4 6l4 4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              All candidates
            </button>
          )}
          {results && (
            <button
              onClick={onNewScan}
              className="bg-[#1a1a18] text-white text-[13px] font-medium px-3.5 py-1.5 rounded-[6px] hover:bg-[#2e2e2a] transition-colors cursor-pointer"
            >
              New scan
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
