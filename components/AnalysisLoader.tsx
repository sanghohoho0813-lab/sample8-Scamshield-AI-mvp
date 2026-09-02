"use client";

import { useEffect, useState } from "react";
import { Check, ShieldCheck } from "lucide-react";
import { MiraeMark } from "./BrandMark";

const STEPS = [
  "문장 구조를 확인하고 있습니다.",
  "링크와 연락처 패턴을 확인하고 있습니다.",
  "사칭·압박 표현을 분석하고 있습니다.",
  "위험 신호를 종합하고 있습니다.",
  "분석이 완료되었습니다.",
];

const STEP_INTERVAL = 650;

interface AnalysisLoaderProps {
  onComplete: () => void;
}

/** 2~4초간 단계별 분석 과정을 보여주는 로더 */
export default function AnalysisLoader({ onComplete }: AnalysisLoaderProps) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (step >= STEPS.length - 1) {
      const done = setTimeout(onComplete, 450);
      return () => clearTimeout(done);
    }
    const timer = setTimeout(() => setStep((s) => s + 1), STEP_INTERVAL);
    return () => clearTimeout(timer);
  }, [step, onComplete]);

  const progress = Math.min(((step + 1) / STEPS.length) * 100, 100);

  return (
    <div className="card mx-auto w-full max-w-xl px-6 py-10 text-center animate-fade-up md:px-10" role="status" aria-live="polite">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50">
        <ShieldCheck className="h-8 w-8 text-brand-600 pulse-dot" aria-hidden />
      </div>
      <h2 className="mt-5 text-lg font-bold text-navy-900">AI가 문자를 분석하고 있어요</h2>

      <div className="mx-auto mt-6 h-1.5 w-full max-w-sm overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-brand-500 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <ul className="mx-auto mt-6 flex max-w-sm flex-col gap-2.5 text-left">
        {STEPS.map((label, i) => {
          const state = i < step ? "done" : i === step ? "active" : "pending";
          return (
            <li
              key={label}
              className={`flex items-center gap-2.5 text-sm transition-opacity duration-300 ${
                state === "pending" ? "opacity-35" : "opacity-100"
              }`}
            >
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-white ${
                  state === "done"
                    ? "bg-brand-500"
                    : state === "active"
                      ? "bg-brand-400 pulse-dot"
                      : "bg-slate-200"
                }`}
              >
                {state === "done" ? <Check className="h-3 w-3" aria-hidden /> : null}
              </span>
              <span className={state === "active" ? "font-semibold text-navy-900" : "text-slate-600"}>
                {label}
              </span>
            </li>
          );
        })}
      </ul>

      <p className="mt-7 flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-400">
        <MiraeMark size={16} className="h-4 w-4" />
        MIRAE AI LAB 분석 엔진
      </p>
    </div>
  );
}
