type Props = {
  score: number;
  label: string;
  large?: boolean;
};

export default function ScoreRing({ score, label, large = false }: Props) {
  const pct = Math.round(score * 100);
  const r = 40;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  const size = large ? 136 : 108;
  const strokeW = large ? 6 : 5;
  const fontSize = large ? 22 : 17;

  return (
    <div className="flex flex-col items-center gap-2.5">
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        style={{ transform: "rotate(-90deg)" }}
      >
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="#e8e7e2"
          strokeWidth={strokeW}
        />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="#1a1a18"
          strokeWidth={strokeW}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{
            transition: "stroke-dashoffset 1.2s cubic-bezier(0.16,1,0.3,1)",
          }}
        />
        <text
          x="50"
          y="50"
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#1a1a18"
          fontSize={fontSize}
          fontWeight={large ? 600 : 500}
          letterSpacing="-0.03em"
          transform="rotate(90 50 50)"
          style={{ fontFamily: "inherit" }}
        >
          {pct}%
        </text>
      </svg>
      <span className="text-[11px] text-[#9a9990] uppercase tracking-[0.07em] font-medium">
        {label}
      </span>
    </div>
  );
}
