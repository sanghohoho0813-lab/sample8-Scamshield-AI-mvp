"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { FontScale } from "@/lib/types";
import { useSettings } from "@/lib/settings";
import { clearHistory, getHistory, restoreDemoHistory } from "@/lib/storage";
import { useToast } from "@/components/Toast";

const FONT_OPTIONS: { value: FontScale; label: string; size: string }[] = [
  { value: "normal", label: "보통", size: "text-base" },
  { value: "large", label: "크게", size: "text-lg" },
  { value: "x-large", label: "아주 크게", size: "text-xl" },
];

type Pending = "clear" | "restore" | null;

export default function SettingsPage() {
  const { fontScale, setFontScale } = useSettings();
  const { show, node: toastNode } = useToast();
  const [count, setCount] = useState<number | null>(null);
  const [pending, setPending] = useState<Pending>(null);

  useEffect(() => {
    setCount(getHistory().length);
  }, []);

  const confirmAction = () => {
    if (pending === "clear") {
      clearHistory();
      setCount(0);
      show("모든 기록을 삭제했어요.");
    } else if (pending === "restore") {
      setCount(restoreDemoHistory().length);
      show("예시 기록으로 되돌렸어요.");
    }
    setPending(null);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 md:px-6 md:py-10">
      <h1 className="text-2xl font-extrabold tracking-tight text-navy-900 md:text-3xl">설정</h1>

      {/* 글자 크기 */}
      <section aria-labelledby="font-heading" className="mt-7">
        <h2 id="font-heading" className="text-lg font-bold text-navy-900">
          글자 크기
        </h2>
        <p className="mt-1 text-base text-slate-500">화면 전체의 글자를 더 크게 볼 수 있어요.</p>
        <div className="mt-3 grid grid-cols-3 gap-2" role="radiogroup" aria-labelledby="font-heading">
          {FONT_OPTIONS.map((option) => {
            const selected = fontScale === option.value;
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => {
                  setFontScale(option.value);
                  show(`글자 크기를 '${option.label}'로 바꿨어요.`);
                }}
                className={`focus-ring flex min-h-20 flex-col items-center justify-center gap-1 rounded-xl border-2 px-2 transition-colors ${
                  selected ? "border-brand-600 bg-brand-50 text-brand-700" : "border-line bg-white text-slate-600 hover:border-brand-200"
                }`}
              >
                <span className={`font-extrabold ${option.size}`}>가나다</span>
                <span className="text-sm font-semibold">{option.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 기록 관리 */}
      <section aria-labelledby="records-heading" className="mt-10">
        <h2 id="records-heading" className="text-lg font-bold text-navy-900">
          기록 관리
        </h2>
        <p className="mt-1 text-base text-slate-500">기록은 이 기기의 브라우저에만 저장되며, 서버로 전송되지 않습니다.</p>
        <div className="card mt-3 divide-y divide-line overflow-hidden">
          <Link href="/history" className="focus-ring flex min-h-14 items-center justify-between gap-3 px-5 py-3 hover:bg-slate-50">
            <span className="text-base font-semibold text-navy-900">분석 기록</span>
            <span className="flex items-center gap-1 text-base text-slate-500">
              {count === null ? "…" : `${count}건`}
              <ChevronRight className="h-5 w-5 text-slate-300" aria-hidden />
            </span>
          </Link>
          <SettingRow
            title="예시 기록으로 되돌리기"
            description="직접 검사한 기록은 지우고, 체험용 예시 기록 8건을 다시 채웁니다."
            actionLabel="되돌리기"
            onAction={() => setPending("restore")}
          />
          <SettingRow
            title="모든 기록 삭제"
            description="저장된 검사 기록을 모두 지웁니다. 되돌릴 수 없어요."
            actionLabel="삭제"
            danger
            disabled={count === 0}
            onAction={() => setPending("clear")}
          />
        </div>

        {pending && (
          <div role="alertdialog" aria-labelledby="confirm-text" className="animate-fade-in mt-3 rounded-xl border border-line bg-white px-5 py-4">
            <p id="confirm-text" className="text-base font-semibold text-navy-900">
              {pending === "clear" ? `기록 ${count}건을 모두 삭제할까요?` : "예시 기록으로 되돌릴까요? 직접 검사한 기록은 사라집니다."}
            </p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={confirmAction}
                className={`focus-ring min-h-11 rounded-lg px-4 text-base font-semibold text-white ${
                  pending === "clear" ? "bg-risk-very" : "bg-brand-600"
                }`}
              >
                {pending === "clear" ? "삭제" : "되돌리기"}
              </button>
              <button
                type="button"
                onClick={() => setPending(null)}
                className="focus-ring min-h-11 rounded-lg px-4 text-base font-semibold text-slate-600 hover:bg-slate-100"
              >
                취소
              </button>
            </div>
          </div>
        )}
      </section>

      {/* 서비스 정보 */}
      <section aria-labelledby="info-heading" className="mt-10">
        <h2 id="info-heading" className="text-lg font-bold text-navy-900">
          서비스 정보
        </h2>
        <dl className="card mt-3 divide-y divide-line overflow-hidden text-base">
          <div className="flex items-center justify-between gap-4 px-5 py-3.5">
            <dt className="text-slate-500">분석 방식</dt>
            <dd className="text-right font-semibold text-navy-900">규칙 기반 데모 엔진</dd>
          </div>
          <div className="flex items-center justify-between gap-4 px-5 py-3.5">
            <dt className="text-slate-500">캡처 이미지 인식</dt>
            <dd className="text-right font-semibold text-navy-900">데모 OCR (예시 문장)</dd>
          </div>
          <Link href="/about" className="focus-ring flex min-h-14 items-center justify-between gap-3 px-5 py-3 hover:bg-slate-50">
            <span className="font-semibold text-navy-900">서비스 소개</span>
            <ChevronRight className="h-5 w-5 text-slate-300" aria-hidden />
          </Link>
        </dl>
      </section>

      {toastNode}
    </div>
  );
}

function SettingRow({
  title,
  description,
  actionLabel,
  onAction,
  danger = false,
  disabled = false,
}: {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
  danger?: boolean;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-3.5">
      <div className="min-w-0">
        <p className="text-base font-semibold text-navy-900">{title}</p>
        <p className="mt-0.5 text-sm text-slate-500">{description}</p>
      </div>
      <button
        type="button"
        onClick={onAction}
        disabled={disabled}
        className={`focus-ring min-h-11 shrink-0 rounded-lg border px-4 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
          danger ? "border-red-200 text-risk-very hover:bg-risk-very-bg" : "border-line text-navy-800 hover:bg-slate-50"
        }`}
      >
        {actionLabel}
      </button>
    </div>
  );
}
