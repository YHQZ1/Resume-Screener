import { useState, useEffect } from "react";
import type { AnalyzeResult, AgentResult } from "../api/client";
import { coachResume } from "../api/client";
import ScoreRing from "../components/Scorering";
import ScoreRadar from "../components/ScoreRadar";
import SectionLabel from "../components/SectionLabel";

type Props = {
  result: AnalyzeResult;
};

export default function ResultPage({ result }: Props) {
  const [agentResult, setAgentResult] = useState<AgentResult | null>(null);
  const [agentLoading, setAgentLoading] = useState(false);
  const [agentError, setAgentError] = useState("");
  const [threshold, setThreshold] = useState(0.75);
  const [hasAutoRun, setHasAutoRun] = useState(false);

  const skillCoverage = result.skill_coverage;
  const pct = Math.round(result.hybrid_score * 100);
  const name = result.filename.replace(/\.[^/.]+$/, "");
  const initials = name
    .split(/[\s_-]/)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const fitTier = pct >= 70 ? "strong" : pct >= 40 ? "moderate" : "low";

  const runAgent = async (t: number) => {
    setAgentLoading(true);
    setAgentError("");
    setAgentResult(null);
    try {
      const data = await coachResume(result, t);
      setAgentResult(data);
    } catch (err) {
      setAgentError(
        err instanceof Error ? err.message : "Agent evaluation failed.",
      );
    } finally {
      setAgentLoading(false);
    }
  };

  useEffect(() => {
    if (!hasAutoRun) {
      setHasAutoRun(true);
      runAgent(threshold);
    }
  }, []);

  const handleRunAgent = () => runAgent(threshold);

  const verdictConfig = {
    hireable: { label: "Hireable", bg: "#1a1a18", text: "#fff" },
    borderline: { label: "Borderline", bg: "#f0ede8", text: "#5a5a55" },
    not_hireable: { label: "Not Hireable", bg: "#fdf2f2", text: "#8b3a3a" },
  };

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

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 w-full mb-5">
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
                    className="flex-1 px-4 py-3 rounded-[6px] text-center"
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

      <div className="bg-white border border-[#e8e7e2] rounded-[10px] px-6 pt-5 pb-6 w-full">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-5">
          <div>
            <SectionLabel>Agent Analysis</SectionLabel>
            <p className="text-[13px] text-[#9a9990] -mt-2">
              Autonomous threshold evaluation — the agent iteratively simulates
              skill additions to determine hireability.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-[#5a5a55] font-medium">
                Threshold
              </span>
              <select
                value={threshold}
                onChange={(e) => setThreshold(parseFloat(e.target.value))}
                className="border border-[#e8e7e2] rounded-[6px] px-3 py-1.5 text-[13px] text-[#1a1a18] bg-[#f6f5f2] outline-none cursor-pointer"
              >
                <option value={0.6}>60%</option>
                <option value={0.65}>65%</option>
                <option value={0.7}>70%</option>
                <option value={0.75}>75%</option>
                <option value={0.8}>80%</option>
                <option value={0.85}>85%</option>
              </select>
            </div>
            <button
              onClick={handleRunAgent}
              disabled={agentLoading}
              className={`px-4 py-2 rounded-[6px] text-[13px] font-medium transition-all duration-150
                ${
                  agentLoading
                    ? "bg-[#eceae5] text-[#9a9990] cursor-not-allowed"
                    : "bg-[#1a1a18] text-white hover:bg-[#2e2e2a] cursor-pointer"
                }`}
            >
              {agentLoading ? "Agent running…" : "Re-run Agent →"}
            </button>
          </div>
        </div>

        {agentError && (
          <div className="text-[13px] font-medium text-[#8b3a3a] bg-[#fdf2f2] border border-[#f0d4d4] rounded-[6px] px-4 py-3 mb-4">
            {agentError}
          </div>
        )}

        {agentLoading && (
          <div className="flex flex-col gap-3 py-8 items-center">
            <div className="flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-[#1a1a18]"
                  style={{
                    animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                  }}
                />
              ))}
            </div>
            <p className="text-[13px] text-[#9a9990]">
              Agent is evaluating candidate…
            </p>
            <style>{`@keyframes pulse { 0%, 100% { opacity: 0.2; } 50% { opacity: 1; } }`}</style>
          </div>
        )}

        {agentResult && !agentLoading && (
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div
                className="rounded-[8px] px-5 py-4 flex flex-col gap-1"
                style={{
                  background:
                    verdictConfig[
                      agentResult.verdict as keyof typeof verdictConfig
                    ]?.bg ?? "#f6f5f2",
                  border: `1px solid ${agentResult.verdict === "hireable" ? "#1a1a18" : agentResult.verdict === "borderline" ? "#e8e7e2" : "#f0d4d4"}`,
                }}
              >
                <span
                  className="text-[11px] font-semibold uppercase tracking-[0.07em]"
                  style={{
                    color:
                      agentResult.verdict === "hireable"
                        ? "rgba(255,255,255,0.6)"
                        : "#9a9990",
                  }}
                >
                  Verdict
                </span>
                <span
                  className="text-[20px] font-semibold tracking-[-0.02em]"
                  style={{
                    color:
                      verdictConfig[
                        agentResult.verdict as keyof typeof verdictConfig
                      ]?.text ?? "#1a1a18",
                  }}
                >
                  {verdictConfig[
                    agentResult.verdict as keyof typeof verdictConfig
                  ]?.label ?? agentResult.verdict}
                </span>
              </div>

              <div className="bg-[#f6f5f2] border border-[#e8e7e2] rounded-[8px] px-5 py-4 flex flex-col gap-1">
                <span className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#9a9990]">
                  Score Projection
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-[20px] font-semibold tracking-[-0.02em] text-[#1a1a18]">
                    {Math.round(agentResult.initial_score * 100)}%
                  </span>
                  <span className="text-[13px] text-[#9a9990]">→</span>
                  <span className="text-[20px] font-semibold tracking-[-0.02em] text-[#1a1a18]">
                    {Math.round(agentResult.projected_score * 100)}%
                  </span>
                </div>
              </div>

              <div className="bg-[#f6f5f2] border border-[#e8e7e2] rounded-[8px] px-5 py-4 flex flex-col gap-1">
                <span className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#9a9990]">
                  Agent Iterations
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-[20px] font-semibold tracking-[-0.02em] text-[#1a1a18]">
                    {agentResult.iterations}
                  </span>
                  <span className="text-[13px] text-[#9a9990]">steps</span>
                  {agentResult.plateau_detected && (
                    <span className="text-[11px] bg-[#f0ede8] text-[#5a5a55] px-2 py-0.5 rounded-[3px] font-medium">
                      plateau
                    </span>
                  )}
                </div>
              </div>
            </div>

            {agentResult.score_progression.length > 1 && (
              <div className="bg-[#f6f5f2] border border-[#e8e7e2] rounded-[8px] px-5 py-4">
                <span className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#9a9990] block mb-3">
                  Score Progression
                </span>
                <div className="flex items-end gap-2 h-[48px]">
                  {agentResult.score_progression.map((s, i) => {
                    const h = Math.max(8, Math.round((s / 1) * 48));
                    return (
                      <div
                        key={i}
                        className="flex flex-col items-center gap-1 flex-1"
                      >
                        <div
                          className="w-full rounded-[3px]"
                          style={{
                            height: h,
                            background:
                              i === agentResult.score_progression.length - 1
                                ? "#1a1a18"
                                : "#d4d3cd",
                          }}
                        />
                        <span
                          className="text-[9px] text-[#9a9990]"
                          style={{ fontFamily: "'DM Mono', monospace" }}
                        >
                          {Math.round(s * 100)}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex gap-1 mt-2 flex-wrap">
                  {agentResult.recommended_skills.map((s) => (
                    <span
                      key={s}
                      className="text-[11px] bg-[#eceae5] text-[#4a4a45] px-2 py-0.5 rounded-[3px] font-medium"
                    >
                      +{s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {agentResult.action_items &&
              agentResult.action_items.length > 0 && (
                <div className="bg-white border border-[#e8e7e2] rounded-[8px] px-5 py-4">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#9a9990] block mb-3">
                    Action Items
                  </span>
                  <div className="flex flex-col gap-3">
                    {agentResult.action_items.map((item, i) => (
                      <div key={i} className="flex gap-3 items-start">
                        <div className="w-[20px] h-[20px] rounded-full bg-[#1a1a18] text-white text-[10px] font-semibold flex items-center justify-center flex-shrink-0 mt-0.5">
                          {i + 1}
                        </div>
                        <p className="text-[13px] text-[#1a1a18] leading-relaxed">
                          {item}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {agentResult.semantic_gap_reason && (
              <div className="bg-[#f6f5f2] border border-[#e8e7e2] rounded-[8px] px-5 py-4">
                <span className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#9a9990] block mb-2">
                  Why Your Semantic Score Is Low
                </span>
                <p className="text-[13px] text-[#1a1a18] leading-relaxed">
                  {agentResult.semantic_gap_reason}
                </p>
              </div>
            )}

            <div className="bg-[#f6f5f2] border border-[#e8e7e2] rounded-[8px] px-5 py-4">
              <span className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#9a9990] block mb-2">
                Agent Reasoning
              </span>
              <p className="text-[13px] text-[#1a1a18] leading-relaxed">
                {agentResult.reasoning}
              </p>
            </div>
          </div>
        )}

        {!agentResult && !agentLoading && agentError === "" && (
          <div className="border border-dashed border-[#d4d3cd] rounded-[8px] px-6 py-10 text-center">
            <p className="text-[14px] text-[#9a9990]">
              Initializing agent evaluation…
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
