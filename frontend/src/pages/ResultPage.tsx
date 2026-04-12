import type { AnalyzeResult } from "../api/client";
import ScoreRing from "../components/Scorering"
import ScoreRadar from "../components/ScoreRadar";
import SectionLabel from "../components/SectionLabel";

type Props = {
  result: AnalyzeResult;
};

export default function ResultPage({ result }: Props) {
  const skillCoverage =
    result.matched_skills.length /
    Math.max(result.matched_skills.length + result.missing_skills.length, 1);

  const pct = Math.round(result.hybrid_score * 100);
  const name = result.filename.replace(/\.[^/.]+$/, "");
  const initials = name
    .split(/[\s_-]/)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const fitTier = pct >= 70 ? "strong" : pct >= 40 ? "moderate" : "low";

  return (
    <div className="w-full px-6 md:px-12 py-10">
      <div className="flex items-start justify-between flex-wrap gap-4 mb-8 pb-6 border-b border-[#e8e7e2]">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-[8px] bg-[#eceae5] flex items-center justify-center text-[18px] font-semibold text-[#5a5a55]">
            {initials}
          </div>
          <div>
            <h2 className="text-[24px] font-semibold tracking-[-0.02em] text-[#1a1a18] mb-1">
              {name}
            </h2>
            <div className="flex items-center gap-2 mb-1.5">
              <p className="text-[14px] text-[#5a5a55] font-medium">
                {result.email}
                <span className="mx-2 text-[#e8e7e2]">·</span>
                {result.phone}
              </p>
            </div>
            <p className="text-[13px] text-[#9a9990] max-w-xl leading-relaxed">
              Comprehensive vector analysis complete. Parameters extracted and
              semantic matching applied against target role specifications to
              determine alignment probability.
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 mt-2 md:mt-0">
          <span className="text-[13px] text-[#9a9990] uppercase tracking-[0.07em] font-semibold">
            Overall Match
          </span>
          <span className="text-[42px] font-bold tracking-[-0.03em] text-[#1a1a18] leading-none">
            {pct}%
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-5 mb-5 w-full">
        <div className="bg-white border border-[#e8e7e2] rounded-[10px] px-7 pt-5 pb-7 w-full flex flex-col">
          <SectionLabel>Confidence breakdown</SectionLabel>
          <div className="flex-1 flex justify-around items-center pt-2">
            <ScoreRing score={result.tfidf_score} label="Lexical" />
            <ScoreRing score={result.hybrid_score} label="Overall" large />
            <ScoreRing score={result.sbert_score} label="Semantic" />
          </div>
        </div>
        <div className="w-full h-full min-h-[300px]">
          <ScoreRadar
            tfidf={result.tfidf_score}
            sbert={result.sbert_score}
            skillCoverage={skillCoverage}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 w-full">
        <div className="bg-white border border-[#e8e7e2] rounded-[10px] px-6 pt-5 pb-6 w-full flex flex-col">
          <SectionLabel>Parameter Extraction</SectionLabel>

          <div className="mb-6 flex-1">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[12px] font-medium text-[#5a5a55]">
                Matched Capabilities
              </span>
              <span
                className="text-[11px] text-[#9a9990] bg-[#eceae5] px-2 py-0.5 rounded-[3px]"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                {result.matched_skills.length} IDENTIFIED
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {result.matched_skills.map((s) => (
                <span
                  key={s}
                  className="text-[12px] font-medium bg-[#1a1a18] text-white px-3 py-1.5 rounded-[4px] tracking-[-0.01em]"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div className="border-t border-[#e8e7e2] pt-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[12px] font-medium text-[#5a5a55]">
                Missing Capabilities
              </span>
              <span
                className="text-[11px] text-[#9a9990] bg-[#eceae5] px-2 py-0.5 rounded-[3px]"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                {result.missing_skills.length} IDENTIFIED
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {result.missing_skills.length > 0 ? (
                result.missing_skills.map((s) => (
                  <span
                    key={s}
                    className="text-[12px] bg-[#f6f5f2] text-[#5a5a55] px-3 py-1.5 rounded-[4px] border border-[#e8e7e2]"
                  >
                    {s}
                  </span>
                ))
              ) : (
                <span className="text-[13px] text-[#9a9990] italic">
                  No critical gaps identified in the current extraction phase.
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#e8e7e2] rounded-[10px] px-6 pt-5 pb-6 flex flex-col w-full">
          <SectionLabel>Strategic Directives</SectionLabel>

          <div className="flex flex-col gap-4 flex-1 mt-2">
            {result.suggestions.map((s, i) => (
              <div
                key={i}
                className="flex gap-4 items-start bg-[#f6f5f2] p-4 rounded-[6px] border border-[#e8e7e2]"
              >
                <div className="w-[20px] h-[20px] rounded-full bg-[#1a1a18] text-white text-[10px] font-semibold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <p className="text-[13px] text-[#1a1a18] font-medium leading-relaxed">
                  {s}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-[#e8e7e2]">
            <p className="text-[11px] font-semibold text-[#9a9990] uppercase tracking-[0.07em] mb-4">
              Calculated Fit Tier
            </p>
            <div className="flex gap-3">
              {(
                [
                  ["Strong fit", "≥ 70%", "strong"],
                  ["Moderate", "40–69%", "moderate"],
                  ["Low fit", "< 40%", "low"],
                ] as const
              ).map(([label, range, tier]) => {
                const active = fitTier === tier;
                return (
                  <div
                    key={tier}
                    className="flex-1 px-4 py-3 rounded-[6px] text-center transition-none"
                    style={{
                      background: active ? "#1a1a18" : "#f6f5f2",
                      border: `1px solid ${active ? "#1a1a18" : "#e8e7e2"}`,
                    }}
                  >
                    <p
                      className="text-[13px] font-medium mb-1"
                      style={{ color: active ? "#fff" : "#9a9990" }}
                    >
                      {label}
                    </p>
                    <p
                      className="text-[11px]"
                      style={{
                        color: active ? "rgba(255,255,255,0.6)" : "#9a9990",
                        fontFamily: "'DM Mono', monospace",
                      }}
                    >
                      {range}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
