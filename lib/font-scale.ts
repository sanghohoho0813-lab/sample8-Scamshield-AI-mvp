import type { FontScale } from "./types";

/** 글자 크기 단계 — 설정 화면과 헤더의 빠른 전환 버튼이 같은 순서·이름을 쓴다 */
export const FONT_SCALES: { value: FontScale; label: string }[] = [
  { value: "normal", label: "보통" },
  { value: "large", label: "크게" },
  { value: "x-large", label: "아주 크게" },
];

export const fontScaleLabel = (scale: FontScale) => FONT_SCALES.find((s) => s.value === scale)?.label ?? "보통";

/** 보통 → 크게 → 아주 크게 → 보통 순으로 돌아간다 */
export function nextFontScale(current: FontScale): FontScale {
  const i = FONT_SCALES.findIndex((s) => s.value === current);
  return FONT_SCALES[(i + 1) % FONT_SCALES.length].value;
}
