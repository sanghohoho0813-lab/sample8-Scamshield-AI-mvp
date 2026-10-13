import type { RiskLevel } from "@/lib/types";
import { RISK_STYLE } from "@/lib/risk-style";

const LEVELS: RiskLevel[] = ["low", "caution", "high", "very-high"];

/**
 * 위험 정도 4단계 막대 — 숫자보다 "어디쯤인지"가 먼저 보이게 한다.
 * 점수는 오른쪽에 작게 보조 근거로만 둔다.
 */
export default function RiskMeter({ level, score }: { level: RiskLevel; score: number }) {
  const active = LEVELS.indexOf(level);
  return (
    <div role="img" aria-label={`위험 정도 ${RISK_STYLE[level].label}, 위험 점수 ${score}점 (100점 만점)`}>
      <div className="flex items-baseline justify-between gap-3" aria-hidden>
        <span className="text-sm font-semibold text-slate-500">위험 정도</span>
        <span className="text-sm text-slate-500">
          점수 <span className="font-bold tabular-nums text-navy-900">{score}</span>/100
        </span>
      </div>
      <div className="mt-2 grid grid-cols-4 gap-1.5" aria-hidden>
        {LEVELS.map((l, i) => (
          <span
            key={l}
            className="h-2.5 rounded-full"
            style={{ background: i === active ? RISK_STYLE[l].color : "var(--color-line)" }}
          />
        ))}
      </div>
      <div className="mt-1.5 grid grid-cols-4 gap-1.5 text-center text-sm" aria-hidden>
        {LEVELS.map((l, i) => (
          <span key={l} className={i === active ? `font-bold ${RISK_STYLE[l].text}` : "text-slate-500"}>
            {RISK_STYLE[l].label}
          </span>
        ))}
      </div>
    </div>
  );
}
