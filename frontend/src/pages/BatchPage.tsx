import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { AnalyzeResult } from "../api/client";
import SectionLabel from "../components/SectionLabel";

type Props = {
  results: AnalyzeResult[];
  onViewCandidate: (c: AnalyzeResult) => void;
};

export default function BatchPage({ results, onViewCandidate }: Props) {
  const avg = Math.round(
    (results.reduce((a, r) => a + r.hybrid_score, 0) / results.length) * 100,
  );
  const strong = results.filter((r) => r.hybrid_score >= 0.7).length;
  const uniqueSkills = [...new Set(results.flatMap((r) => r.matched_skills))]
    .length;

  const chartData = results.slice(0, 10).map((r) => ({
    name: r.filename.replace(/\.[^/.]+$/, "").substring(0, 10),
    score: Math.round(r.hybrid_score * 100),
  }));

  return (
    <div className="w-full px-6 md:px-12 py-10">
      <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
        <div>
          <h2 className="text-[26px] font-medium tracking-[-0.02em] text-[#1a1a18] mb-1">
            {results.length} candidate{results.length !== 1 ? "s" : ""} screened
          </h2>
          <p className="text-[14px] text-[#9a9990]">
            Ranked by multi-vector match score. Select any candidate row for
            deep parameter analysis.
          </p>
        </div>
        <div className="flex gap-10">
          {(
            [
              ["Top match", `${Math.round(results[0].hybrid_score * 100)}%`],
              ["Average", `${avg}%`],
              ["Strong fits", `${strong}`],
            ] as const
          ).map(([label, value]) => (
            <div key={label} className="text-right">
              <p className="text-[11px] text-[#9a9990] uppercase tracking-[0.07em] font-medium mb-1">
                {label}
              </p>
              <p className="text-[22px] font-semibold tracking-[-0.02em] text-[#1a1a18]">
                {value}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[450px_1fr] gap-5 mb-5 w-full">
        <div className="bg-white border border-[#e8e7e2] rounded-[10px] px-5 pt-5 pb-4 w-full">
          <SectionLabel>Score distribution</SectionLabel>
          <div className="h-[160px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 0, right: 0, left: -28, bottom: 0 }}
              >
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#9a9990", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fill: "#9a9990", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: "#f0ede8" }}
                  contentStyle={{
                    background: "#fff",
                    border: "1px solid #e8e7e2",
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 500,
                    boxShadow: "none",
                  }}
                  formatter={(v) => [`${Number(v)}%`, "Match"]}
                />
                <Bar dataKey="score" radius={[3, 3, 0, 0]}>
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={i === 0 ? "#1a1a18" : "#d4d3cd"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-[#e8e7e2] rounded-[10px] px-6 py-5 w-full flex flex-col">
          <SectionLabel>Overview & Analytics</SectionLabel>
          <div className="grid grid-cols-4 gap-0 divide-x divide-[#e8e7e2] flex-1 items-center">
            {(
              [
                ["Resumes processed", results.length],
                ["Above 70% match", strong],
                ["Average score", `${avg}%`],
                ["Unique skills found", uniqueSkills],
              ] as const
            ).map(([label, value]) => (
              <div key={label} className="px-8 first:pl-2 last:pr-2">
                <p className="text-[12px] text-[#9a9990] mb-2 leading-tight">
                  {label}
                </p>
                <p className="text-[28px] font-semibold tracking-[-0.03em] text-[#1a1a18]">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-[2fr_1.5fr_2.5fr_100px] gap-6 px-4 mb-2 mt-8 w-full">
        {["Candidate", "Contact", "Top skills", "Score"].map((h, i) => (
          <p
            key={h}
            className={`text-[11px] font-semibold text-[#9a9990] uppercase tracking-[0.07em] ${i === 3 ? "text-right" : ""}`}
          >
            {h}
          </p>
        ))}
      </div>

      <div className="flex flex-col gap-1.5 w-full">
        {results.map((res, idx) => {
          const pct = Math.round(res.hybrid_score * 100);
          const name = res.filename.replace(/\.[^/.]+$/, "");
          const initials = name
            .split(/[\s_-]/)
            .map((w) => w[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);

          return (
            <div
              key={idx}
              onClick={() => onViewCandidate(res)}
              className="grid grid-cols-[2fr_1.5fr_2.5fr_100px] gap-6 items-center bg-white border border-[#e8e7e2] rounded-[8px] px-4 py-3.5
                cursor-pointer transition-all duration-100 group w-full"
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#f0ede8";
                e.currentTarget.style.borderColor = "#d4d3cd";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#ffffff";
                e.currentTarget.style.borderColor = "#e8e7e2";
              }}
            >
              <div className="flex items-center gap-4 overflow-hidden">
                <div className="w-8 h-8 rounded-[6px] bg-[#eceae5] flex items-center justify-center text-[11px] font-semibold text-[#5a5a55] flex-shrink-0">
                  {initials}
                </div>
                <div className="overflow-hidden">
                  <p className="text-[14px] font-medium text-[#1a1a18] truncate leading-none mb-1">
                    {name}
                  </p>
                  <p
                    className="text-[11px] text-[#9a9990]"
                    style={{ fontFamily: "'DM Mono', monospace" }}
                  >
                    #{String(idx + 1).padStart(3, "0")}
                  </p>
                </div>
              </div>

              <div className="overflow-hidden">
                <p className="text-[12px] text-[#5a5a55] truncate leading-none mb-1">
                  {res.email}
                </p>
                <p className="text-[12px] text-[#9a9990]">{res.phone}</p>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {res.matched_skills.slice(0, 6).map((s) => (
                  <span
                    key={s}
                    className="text-[11px] bg-[#eceae5] text-[#4a4a45] px-2 py-0.5 rounded-[3px] font-medium"
                  >
                    {s}
                  </span>
                ))}
                {res.matched_skills.length > 6 && (
                  <span className="text-[11px] text-[#9a9990] py-0.5 font-medium">
                    +{res.matched_skills.length - 6}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-end gap-2">
                <span className="text-[17px] font-semibold tracking-[-0.02em] text-[#1a1a18]">
                  {pct}%
                </span>
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 13 13"
                  fill="none"
                  className="text-[#d4d3cd] group-hover:text-[#1a1a18] transition-colors"
                >
                  <path
                    d="M4.5 2.5l4 4-4 4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
