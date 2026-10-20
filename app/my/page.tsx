"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, ChevronRight, Cpu, History, Info, RotateCcw, ScanText, ShieldAlert, Trash2, type LucideIcon } from "lucide-react";
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
      <h1 className="text-2xl font-bold tracking-tight text-navy-900 md:text-3xl">설정</h1>

      {/* 글자 크기 */}
      <section aria-labelledby="font-heading" className="mt-7">
        <h2 id="font-heading" className="text-lg font-bold text-navy-900">
          글자 크기
        </h2>
        <p className="mt-1 text-base text-slate-500">화면 전체의 글자를 더 크게 볼 수 있어요. 바로 아래 미리 보기처럼 보여요.</p>
        <div className="card mt-3 p-4 md:p-5">
          {/* 실제 결과 화면 문구로 미리 보기 — 글자 크기를 바꾸면 이 부분도 함께 커진다 */}
          <div className="rounded-2xl bg-surface px-4 py-4" aria-hidden>
            <p className="flex items-center gap-1.5 text-sm font-bold text-risk-high">
              <ShieldAlert className="h-4 w-4" />
              위험 높음
            </p>
            <p className="mt-1.5 text-lg font-bold leading-snug text-navy-900">사기 문자일 가능성이 높아요</p>
            <p className="mt-1 text-base text-slate-600">링크를 누르지 말고, 평소 쓰던 앱으로 직접 확인하세요.</p>
          </div>
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
                  className={`focus-ring press flex min-h-20 flex-col items-center justify-center gap-1 rounded-xl border-2 px-2 transition-colors ${
                    selected ? "border-brand-600 bg-brand-50 text-brand-700" : "border-line bg-white text-slate-600 hover:border-brand-200"
                  }`}
                >
                  <span className={`font-bold ${option.size}`}>가나다</span>
                  <span className="flex items-center gap-1 text-sm font-semibold">
                    {selected && <Check className="h-4 w-4" strokeWidth={3} aria-hidden />}
                    {option.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 기록 관리 */}
      <section aria-labelledby="records-heading" className="mt-10">
        <h2 id="records-heading" className="text-lg font-bold text-navy-900">
          기록 관리
        </h2>
        <p className="mt-1 text-base text-slate-500">기록은 이 기기의 브라우저에만 저장되고, 서버로 보내지 않아요.</p>
        <div className="card mt-3 divide-y divide-line overflow-hidden">
          <Link href="/history" className="focus-ring flex min-h-14 items-center justify-between gap-3 px-5 py-3 hover:bg-slate-50">
            <span className="flex items-center gap-3 text-base font-semibold text-navy-900">
              <RowIcon icon={History} />
              분석 기록
            </span>
            <span className="flex items-center gap-1 text-base text-slate-500">
              {count === null ? "…" : `${count}건`}
              <ChevronRight className="h-5 w-5 text-slate-300" aria-hidden />
            </span>
          </Link>
          <SettingRow
            icon={RotateCcw}
            title="예시 기록으로 되돌리기"
            description="직접 검사한 기록은 지우고, 체험용 예시 기록 8건을 다시 채워요."
            actionLabel="되돌리기"
            onAction={() => setPending("restore")}
          />
          <SettingRow
            icon={Trash2}
            title="모든 기록 삭제"
            description="저장된 검사 기록을 모두 지워요. 되돌릴 수 없어요."
            actionLabel="삭제"
            danger
            disabled={count === 0}
            onAction={() => setPending("clear")}
          />
        </div>

        {pending && (
          <div role="alertdialog" aria-labelledby="confirm-text" className="animate-fade-in mt-3 rounded-xl border border-line bg-white px-5 py-4">
            <p id="confirm-text" className="text-base font-semibold text-navy-900">
              {pending === "clear" ? `기록 ${count}건을 모두 삭제할까요?` : "예시 기록으로 되돌릴까요? 직접 검사한 기록은 사라져요."}
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
        <div className="card mt-3 divide-y divide-line overflow-hidden text-base">
          <dl className="divide-y divide-line">
            <div className="flex items-center justify-between gap-4 px-5 py-3.5">
              <dt className="flex items-center gap-3 text-slate-500">
                <RowIcon icon={Cpu} />
                분석 방식
              </dt>
              <dd className="text-right font-semibold text-navy-900">규칙 기반 분석</dd>
            </div>
            <div className="flex items-center justify-between gap-4 px-5 py-3.5">
              <dt className="flex items-center gap-3 text-slate-500">
                <RowIcon icon={ScanText} />
                캡처 이미지 인식
              </dt>
              <dd className="text-right font-semibold text-navy-900">데모 OCR (예시 문장)</dd>
            </div>
          </dl>
          <Link href="/about" className="focus-ring flex min-h-14 items-center justify-between gap-3 px-5 py-3 hover:bg-slate-50">
            <span className="flex items-center gap-3 font-semibold text-navy-900">
              <RowIcon icon={Info} />
              서비스 소개
            </span>
            <ChevronRight className="h-5 w-5 text-slate-300" aria-hidden />
          </Link>
        </div>
      </section>

      {toastNode}
    </div>
  );
}

/** 설정 행 앞의 작은 아이콘 — 목록을 훑을 때 항목을 빨리 구분하게 한다 */
function RowIcon({ icon: Icon, danger = false }: { icon: LucideIcon; danger?: boolean }) {
  return (
    <span
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${danger ? "bg-risk-very-bg text-risk-very" : "bg-slate-100 text-slate-600"}`}
      aria-hidden
    >
      <Icon className="h-[1.125rem] w-[1.125rem]" />
    </span>
  );
}

function SettingRow({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  danger = false,
  disabled = false,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
  danger?: boolean;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-3.5">
      <div className="flex min-w-0 items-start gap-3">
        <RowIcon icon={icon} danger={danger} />
        <div className="min-w-0">
          <p className="text-base font-semibold text-navy-900">{title}</p>
          <p className="mt-0.5 text-sm text-slate-500">{description}</p>
        </div>
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
