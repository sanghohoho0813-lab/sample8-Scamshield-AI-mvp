"use client";

import { useEffect, useRef, useState } from "react";
import type { RiskLevel } from "@/lib/types";

const LEVEL_COLORS: Record<RiskLevel, string> = {
  low: "var(--color-risk-low)",
  caution: "var(--color-risk-caution)",
  high: "var(--color-risk-high)",
  "very-high": "var(--color-risk-very)",
};

interface RiskGaugeProps {
  score: number;
  level: RiskLevel;
  levelLabel: string;
  /** true면 마운트 시 0부터 점수까지 카운트업 */
  animate?: boolean;
}

/** 첨부 디자인의 반원형 위험도 게이지 */
export default function RiskGauge({ score, level, levelLabel, animate = true }: RiskGaugeProps) {
  const [display, setDisplay] = useState(animate ? 0 : score);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!animate) {
      setDisplay(score);
      return;
    }
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setDisplay(score);
      return;
    }
    const duration = 900;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(score * eased));
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [score, animate]);

  const color = LEVEL_COLORS[level];
  // 반원 호: 반지름 80, 중심 (100, 95)
  const r = 80;
  const circumference = Math.PI * r;
  const progress = (display / 100) * circumference;

  return (
    <div className="flex flex-col items-center" role="img" aria-label={`위험도 ${score}점, ${levelLabel}`}>
      <svg viewBox="0 0 200 112" className="w-56 max-w-full md:w-64" aria-hidden>
        <path
          d="M 20 95 A 80 80 0 0 1 180 95"
          fill="none"
          stroke="var(--color-line)"
          strokeWidth="13"
          strokeLinecap="round"
        />
        <path
          d="M 20 95 A 80 80 0 0 1 180 95"
          fill="none"
          stroke={color}
          strokeWidth="13"
          strokeLinecap="round"
          strokeDasharray={`${progress} ${circumference}`}
          style={{ transition: "stroke 0.3s ease" }}
        />
      </svg>
      <div className="-mt-20 flex flex-col items-center md:-mt-24">
        <div className="flex items-baseline gap-1">
          <span className="text-6xl font-extrabold tabular-nums tracking-tight md:text-7xl" style={{ color }}>
            {display}
          </span>
          <span className="text-xl font-semibold text-slate-400">/100</span>
        </div>
        <span
          className="mt-2 rounded-full px-3 py-1 text-sm font-bold"
          style={{ color, backgroundColor: `color-mix(in srgb, ${color} 10%, white)` }}
        >
          위험 신호: {levelLabel}
        </span>
      </div>
    </div>
  );
}
