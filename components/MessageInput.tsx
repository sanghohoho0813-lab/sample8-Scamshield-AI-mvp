"use client";

import { Eraser, ScanSearch, WandSparkles } from "lucide-react";
import { FEATURED_SAMPLES } from "@/lib/samples";

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  error?: string | null;
}

export default function MessageInput({ value, onChange, onSubmit, error }: MessageInputProps) {
  const loadRandomSample = () => {
    const pool = FEATURED_SAMPLES.filter((s) => s.text !== value);
    const pick = pool[Math.floor(Math.random() * pool.length)];
    onChange(pick.text);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="받은 문자 내용을 그대로 붙여넣어 주세요."
          rows={7}
          maxLength={2000}
          aria-label="분석할 문자 내용"
          className="w-full resize-none rounded-2xl border border-line bg-white px-4 py-4 text-[1.40625rem] leading-relaxed text-slate-800 shadow-card outline-none transition-shadow placeholder:text-slate-400 focus:border-brand-300 focus:ring-4 focus:ring-brand-100"
        />
        <span className="pointer-events-none absolute bottom-3.5 right-4 text-xs tabular-nums text-slate-400">
          {value.length}/2,000
        </span>
      </div>

      {error && (
        <p role="alert" className="animate-fade-in rounded-xl bg-risk-very-bg px-3.5 py-2.5 text-sm font-medium text-risk-very">
          {error}
        </p>
      )}

      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={loadRandomSample}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-line bg-white px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
          >
            <WandSparkles className="h-4 w-4 text-violet-500" aria-hidden />
            샘플 불러오기
          </button>
          <button
            type="button"
            onClick={() => onChange("")}
            disabled={!value}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-line bg-white px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Eraser className="h-4 w-4" aria-hidden />
            초기화
          </button>
        </div>
      </div>

      <button type="button" onClick={onSubmit} className="btn-primary w-full text-base">
        <ScanSearch className="h-5 w-5" aria-hidden />
        AI 위험도 분석
      </button>

      <div>
        <p className="mb-2 mt-1 text-sm font-semibold text-slate-600">샘플 문자로 바로 체험해보세요</p>
        <div className="flex flex-wrap gap-2">
          {FEATURED_SAMPLES.map((sample) => (
            <button
              key={sample.id}
              type="button"
              onClick={() => onChange(sample.text)}
              className={`min-h-10 rounded-xl border px-3 py-2 text-sm font-medium transition-colors ${
                value === sample.text
                  ? "border-brand-400 bg-brand-50 text-brand-700"
                  : "border-line bg-white text-slate-600 hover:border-brand-200 hover:bg-brand-50/50"
              }`}
            >
              {sample.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
