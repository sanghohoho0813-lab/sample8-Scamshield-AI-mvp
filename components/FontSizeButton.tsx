"use client";

import { useEffect, useRef, useState } from "react";
import { useSettings } from "@/lib/settings";
import { FONT_SCALES, fontScaleLabel, nextFontScale } from "@/lib/font-scale";

/**
 * 헤더의 글자 크기 빠른 전환 — 설정 화면까지 가지 않아도 한 번 눌러 키울 수 있다.
 * 누를 때마다 보통 → 크게 → 아주 크게 → 보통. 바뀐 크기는 잠깐 말풍선으로 보여주고 화면 낭독기에도 알린다.
 */
export default function FontSizeButton({ onBrand = false }: { onBrand?: boolean }) {
  const { fontScale, setFontScale } = useSettings();
  const [hint, setHint] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const cycle = () => {
    const next = nextFontScale(fontScale);
    setFontScale(next);
    setHint(`글자 크기 ${fontScaleLabel(next)}`);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setHint(null), 1600);
  };

  const level = FONT_SCALES.findIndex((s) => s.value === fontScale);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={cycle}
        className={`focus-ring press flex h-11 items-center gap-2 rounded-xl px-2.5 transition-colors md:text-slate-600 md:hover:bg-slate-100 md:hover:text-navy-900 ${
          onBrand ? "text-white hover:bg-white/10" : "text-slate-600 hover:bg-slate-100 hover:text-navy-900"
        }`}
      >
        <span className="flex items-end gap-px font-bold leading-none" aria-hidden>
          <span className="text-[0.8125rem]">가</span>
          <span className="text-[1.1875rem]">가</span>
        </span>
        {/* 지금 단계를 점 3개로 */}
        <span className="flex gap-0.5" aria-hidden>
          {FONT_SCALES.map((s, i) => (
            <span
              key={s.value}
              className={`h-1.5 w-1.5 rounded-full ${i <= level ? (onBrand ? "bg-white md:bg-brand-600" : "bg-brand-600") : onBrand ? "bg-white/35 md:bg-slate-300" : "bg-slate-300"}`}
            />
          ))}
        </span>
        <span className="hidden text-sm font-semibold lg:inline" aria-hidden>
          글자 크기
        </span>
        {/* 이름은 글자로 — "가가" 모양은 그림 역할이라 읽지 않는다 */}
        <span className="sr-only">글자 크기 바꾸기, 지금 {fontScaleLabel(fontScale)}</span>
      </button>
      <span className="sr-only" role="status" aria-live="polite">
        {hint ?? ""}
      </span>
      {hint && (
        <span
          aria-hidden
          className="animate-fade-in pointer-events-none absolute right-0 top-full z-50 mt-2 whitespace-nowrap rounded-lg bg-navy-900 px-3 py-1.5 text-sm font-semibold text-white shadow-[var(--shadow-raised)]"
        >
          {hint}
        </span>
      )}
    </div>
  );
}
