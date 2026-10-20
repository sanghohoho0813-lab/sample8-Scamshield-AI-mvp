"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ShieldCheck } from "lucide-react";

const STEPS = [
  "문장 구조를 확인하고 있어요",
  "링크와 연락처를 살펴보고 있어요",
  "사칭·재촉 표현을 찾고 있어요",
  "위험 신호를 종합하고 있어요",
  "분석이 끝났어요",
];

const STEP_INTERVAL = 450;

interface AnalysisLoaderProps {
  onComplete: () => void;
}

/**
 * 분석 진행 오버레이.
 * 집중 흐름이므로 화면 전체를 덮어 내비게이션·외부 CTA를 가리고 스크롤을 잠근다.
 * 부모의 쌓임 맥락(isolate 등)에 갇히지 않도록 body 바로 아래에 그린다.
 */
export default function AnalysisLoader({ onComplete }: AnalysisLoaderProps) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
    };
  }, []);

  useEffect(() => {
    if (step >= STEPS.length - 1) {
      const done = setTimeout(onComplete, 400);
      return () => clearTimeout(done);
    }
    const timer = setTimeout(() => setStep((s) => s + 1), STEP_INTERVAL);
    return () => clearTimeout(timer);
  }, [step, onComplete]);

  const progress = ((step + 1) / STEPS.length) * 100;
  const finished = step === STEPS.length - 1;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="analysis-loader-title"
      className="animate-fade-in fixed inset-0 z-[70] flex items-center justify-center bg-surface/95 px-4 backdrop-blur-sm"
    >
      <div className="animate-fade-up w-full max-w-md rounded-3xl bg-white px-6 pb-8 pt-7 shadow-[var(--shadow-overlay)] md:px-8">
        {/* 검사 중임을 한눈에 — 방패 주위로 퍼지는 고리 */}
        <div className="relative mx-auto flex h-16 w-16 items-center justify-center" aria-hidden>
          {!finished && <span className="scan-ring absolute inset-0 rounded-full bg-brand-200" />}
          <span
            className={`relative flex h-16 w-16 items-center justify-center rounded-full text-white transition-colors duration-300 ${
              finished ? "bg-risk-low" : "bg-brand-600"
            }`}
          >
            {finished ? <Check className="h-8 w-8" strokeWidth={2.5} /> : <ShieldCheck className="h-8 w-8" />}
          </span>
        </div>
        <h2 id="analysis-loader-title" className="mt-5 text-center text-xl font-bold text-navy-900">
          {finished ? "분석이 끝났어요" : "문자를 분석하고 있어요"}
        </h2>
        <p className="mt-1 text-center text-base text-slate-500">{finished ? "결과를 보여드릴게요." : "잠시만 기다려주세요."}</p>

        <div
          className="mt-5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress)}
        >
          <div className="h-full rounded-full bg-brand-600 transition-[width] duration-500 ease-out" style={{ width: `${progress}%` }} />
        </div>

        <ol className="mt-5 flex flex-col gap-3" aria-live="polite">
          {STEPS.map((label, i) => {
            const state = i < step || finished ? "done" : i === step ? "active" : "pending";
            return (
              <li
                key={label}
                className={`flex items-center gap-3 text-base transition-opacity duration-200 ${
                  state === "pending" ? "opacity-40" : "opacity-100"
                }`}
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center">
                  {state === "done" ? (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-white">
                      <Check className="h-3.5 w-3.5" aria-hidden />
                    </span>
                  ) : state === "active" ? (
                    <span className="spinner h-4.5 w-4.5" aria-hidden />
                  ) : (
                    <span className="h-2 w-2 rounded-full bg-slate-300" aria-hidden />
                  )}
                </span>
                <span className={state === "active" ? "font-semibold text-navy-900" : "text-slate-600"}>{label}</span>
              </li>
            );
          })}
        </ol>
      </div>
    </div>,
    document.body,
  );
}
