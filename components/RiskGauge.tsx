"use client";

import { useEffect, useState } from "react";
import type { RiskLevel } from "@/lib/types";
import { RISK_STYLE } from "@/lib/risk-style";

interface RiskGaugeProps {
  score: number;
  level: RiskLevel;
  /** true면 0부터 점수까지 카운트업 (방금 분석한 결과에만 사용) */
  animate?: boolean;
}

const R = 80;
const ARC = Math.PI * R;

/** 반원형 위험도 게이지 — 점수는 호 안쪽에 겹치지 않게 배치 */
export default function RiskGauge({ score, level, animate = false }: RiskGaugeProps) {
  const [display, setDisplay] = useState(animate ? 0 : score);
  const style = RISK_STYLE[level];

  useEffect(() => {
    if (!animate || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplay(score);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / 800, 1);
      setDisplay(Math.round(score * (1 - Math.pow(1 - t, 3))));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [score, animate]);

  return (
    <div className="relative mx-auto w-full max-w-[12rem] lg:max-w-[14rem]" role="img" aria-label={`위험도 ${score}점 (100점 만점), ${style.label}`}>
      <svg viewBox="0 0 200 108" className="block w-full" aria-hidden>
        <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="var(--color-line)" strokeWidth="14" strokeLinecap="round" />
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke={style.color}
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={`${(display / 100) * ARC} ${ARC}`}
        />
      </svg>
      <div className="absolute inset-x-0 bottom-0 flex items-baseline justify-center gap-0.5" aria-hidden>
        <span className={`whitespace-nowrap text-4xl font-extrabold tabular-nums tracking-tight lg:text-5xl ${style.text}`}>{display}</span>
        <span className="text-base font-semibold text-slate-500">/100</span>
      </div>
    </div>
  );
}
