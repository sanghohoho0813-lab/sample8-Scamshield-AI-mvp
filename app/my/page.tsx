"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ALargeSmall,
  Bell,
  BookOpenText,
  ChevronRight,
  History,
  Info,
  Trash2,
  UserRound,
} from "lucide-react";
import type { FontScale } from "@/lib/types";
import { useSettings } from "@/lib/settings";
import { clearHistory, getHistory } from "@/lib/storage";
import { useToast } from "@/components/Toast";

const FONT_OPTIONS: { value: FontScale; label: string; sample: string }[] = [
  { value: "normal", label: "보통 글자", sample: "가나다" },
  { value: "large", label: "큰 글자", sample: "가나다" },
  { value: "x-large", label: "매우 큰 글자", sample: "가나다" },
];

export default function MyPage() {
  const { fontScale, setFontScale } = useSettings();
  const { show, node: toastNode } = useToast();
  const [historyCount, setHistoryCount] = useState<number | null>(null);
  const [notifyDemo, setNotifyDemo] = useState(true);
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    setHistoryCount(getHistory().length);
  }, []);

  const handleClear = () => {
    if (!confirmClear) {
      setConfirmClear(true);
      return;
    }
    clearHistory();
    setHistoryCount(0);
    setConfirmClear(false);
    show("분석 기록을 모두 삭제했어요.");
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 md:py-10">
      <div className="flex items-center gap-3.5">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
          <UserRound className="h-7 w-7" aria-hidden />
        </span>
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-navy-900 md:text-2xl">마이페이지</h1>
          <p className="mt-0.5 text-sm text-slate-500">데모 사용자 · 가입 없이 이용 중</p>
        </div>
      </div>

      {/* 바로가기 */}
      <div className="mt-6 flex flex-col gap-2.5">
        <Link href="/history" className="card group flex items-center gap-3.5 px-4 py-4 transition-all hover:border-brand-200 hover:shadow-card-lg md:px-5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <History className="h-5 w-5" aria-hidden />
          </span>
          <span className="flex-1">
            <span className="block text-[15px] font-bold text-navy-900">분석 기록</span>
            <span className="mt-0.5 block text-sm text-slate-500">
              {historyCount === null ? "불러오는 중…" : `저장된 기록 ${historyCount}건`}
            </span>
          </span>
          <ChevronRight className="h-5 w-5 text-slate-300 transition-transform group-hover:translate-x-0.5" aria-hidden />
        </Link>
        <Link href="/guide" className="card group flex items-center gap-3.5 px-4 py-4 transition-all hover:border-brand-200 hover:shadow-card-lg md:px-5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <BookOpenText className="h-5 w-5" aria-hidden />
          </span>
          <span className="flex-1">
            <span className="block text-[15px] font-bold text-navy-900">저장한 안전가이드</span>
            <span className="mt-0.5 block text-sm text-slate-500">유형별 예방 수칙 모아보기</span>
          </span>
          <ChevronRight className="h-5 w-5 text-slate-300 transition-transform group-hover:translate-x-0.5" aria-hidden />
        </Link>
      </div>

      {/* 글자 크기 */}
      <section className="card mt-5 px-4 py-5 md:px-5">
        <h2 className="flex items-center gap-2 text-[15px] font-bold text-navy-900">
          <ALargeSmall className="h-5 w-5 text-brand-600" aria-hidden />
          글자 크기
        </h2>
        <p className="mt-1 text-sm text-slate-500">화면 전체의 글자 크기를 조절할 수 있어요.</p>
        <div className="mt-3.5 grid grid-cols-3 gap-2">
          {FONT_OPTIONS.map((option, i) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                setFontScale(option.value);
                show(`${option.label}로 변경했어요.`);
              }}
              aria-pressed={fontScale === option.value}
              className={`flex min-h-20 flex-col items-center justify-center gap-1 rounded-2xl border-2 px-2 py-3 transition-all ${
                fontScale === option.value
                  ? "border-brand-500 bg-brand-50 text-brand-700"
                  : "border-line bg-white text-slate-500 hover:border-brand-200"
              }`}
            >
              <span className="font-extrabold" style={{ fontSize: `${1 + i * 0.25}rem` }}>
                {option.sample}
              </span>
              <span className="text-xs font-bold">{option.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 알림 (데모) */}
      <section className="card mt-5 flex items-center gap-3.5 px-4 py-4.5 md:px-5">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
          <Bell className="h-5 w-5" aria-hidden />
        </span>
        <div className="flex-1">
          <p className="text-[15px] font-bold text-navy-900">새 사기 유형 알림</p>
          <p className="mt-0.5 text-sm text-slate-500">새로운 스미싱 수법이 알려지면 안내해드려요. (데모)</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={notifyDemo}
          aria-label="새 사기 유형 알림"
          onClick={() => {
            setNotifyDemo((v) => !v);
            show(notifyDemo ? "알림을 껐어요." : "알림을 켰어요.", "info");
          }}
          className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
            notifyDemo ? "bg-brand-600" : "bg-slate-300"
          }`}
        >
          <span
            className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${
              notifyDemo ? "left-6" : "left-1"
            }`}
          />
        </button>
      </section>

      {/* 기록 삭제 */}
      <section className="card mt-5 px-4 py-4.5 md:px-5">
        <button
          type="button"
          onClick={handleClear}
          className={`inline-flex min-h-11 items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-bold transition-colors ${
            confirmClear
              ? "bg-risk-very text-white"
              : "bg-risk-very-bg text-risk-very hover:bg-red-100"
          }`}
        >
          <Trash2 className="h-4 w-4" aria-hidden />
          {confirmClear ? "정말 삭제할까요? 한 번 더 누르면 삭제됩니다" : "분석 기록 모두 삭제"}
        </button>
        <p className="mt-2 text-xs text-slate-400">
          기록은 이 기기의 브라우저에만 저장되며, 서버로 전송되지 않습니다.
        </p>
      </section>

      <p className="mt-6 flex gap-2 rounded-2xl border border-line bg-white/70 px-4 py-3.5 text-xs leading-relaxed text-slate-500">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden />
        ScamShield는 참고용 위험 신호 분석 서비스로, 실제 사기 여부를 확정하는 판정을 제공하지
        않습니다.
      </p>

      {toastNode}
    </div>
  );
}
