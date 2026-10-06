import type { RiskLevel } from "./types";

/** 위험도 구간별 표현 — 모든 화면에서 동일하게 사용 */
export const RISK_STYLE: Record<
  RiskLevel,
  { label: string; text: string; bg: string; /** 상단 강조선 색 */ border: string; dot: string; color: string }
> = {
  low: {
    label: "낮음",
    text: "text-risk-low",
    bg: "bg-risk-low-bg",
    border: "border-t-risk-low",
    dot: "bg-risk-low",
    color: "var(--color-risk-low)",
  },
  caution: {
    label: "주의",
    text: "text-risk-caution",
    bg: "bg-risk-caution-bg",
    border: "border-t-risk-caution",
    dot: "bg-risk-caution",
    color: "var(--color-risk-caution)",
  },
  high: {
    label: "높음",
    text: "text-risk-high",
    bg: "bg-risk-high-bg",
    border: "border-t-risk-high",
    dot: "bg-risk-high",
    color: "var(--color-risk-high)",
  },
  "very-high": {
    label: "매우 높음",
    text: "text-risk-very",
    bg: "bg-risk-very-bg",
    border: "border-t-risk-very",
    dot: "bg-risk-very",
    color: "var(--color-risk-very)",
  },
};
