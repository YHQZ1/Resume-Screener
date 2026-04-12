import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

type Props = {
  tfidf: number;
  sbert: number;
  skillCoverage: number;
};

export default function ScoreRadar({ tfidf, sbert, skillCoverage }: Props) {
  const data = [
    { metric: "Lexical", value: Math.round(tfidf * 100) },
    { metric: "Semantic", value: Math.round(sbert * 100) },
    { metric: "Skills", value: Math.round(skillCoverage * 100) },
  ];

  return (
    <div className="bg-white border border-[#e8e7e2] rounded-[10px] px-5 pt-5 pb-4 flex flex-col h-full w-full">
      <p className="text-[11px] font-semibold text-[#9a9990] uppercase tracking-[0.07em] mb-1">
        Vector map
      </p>
      <div className="flex-1 min-h-[220px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart
            data={data}
            margin={{ top: 16, right: 20, bottom: 10, left: 20 }}
          >
            <PolarGrid stroke="#e8e7e2" />
            <PolarAngleAxis
              dataKey="metric"
              tick={{ fill: "#5a5a55", fontSize: 11, fontWeight: 500 }}
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 100]}
              tick={false}
              axisLine={false}
            />
            <Radar
              name="Score"
              dataKey="value"
              stroke="#1a1a18"
              strokeWidth={1.5}
              fill="#1a1a18"
              fillOpacity={0.05}
            />
            <Tooltip
              contentStyle={{
                background: "#fff",
                border: "1px solid #e8e7e2",
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 500,
                boxShadow: "none",
              }}
              formatter={(v) => [`${Number(v)}%`, "Score"]}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
