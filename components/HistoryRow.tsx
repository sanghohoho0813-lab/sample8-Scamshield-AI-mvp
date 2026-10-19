"use client";

import Link from "next/link";
import { ChevronRight, Share2, ShieldAlert, ShieldCheck, TriangleAlert } from "lucide-react";
import type { HistoryEntry } from "@/lib/types";
import { RISK_STYLE } from "@/lib/risk-style";
import { typeName } from "@/lib/verdict";

interface HistoryRowProps {
  entry: HistoryEntry;
  /** 첫 줄 오른쪽에 표시할 시각 (예: "3시간 전", "14:02") */
  timeLabel: string;
}

const LEVEL_ICON = { "very-high": ShieldAlert, high: ShieldAlert, caution: TriangleAlert, low: ShieldCheck } as const;

/**
 * 기록 목록의 한 줄 — 나중에 봐도 알아보기 쉽게 "유형 · 위험 정도 · 받은 문자 · 공유 여부"를 두 줄에 담는다.
 * 날짜는 목록의 날짜 묶음 제목이 맡는다.
 */
export default function HistoryRow({ entry, timeLabel }: HistoryRowProps) {
  const style = RISK_STYLE[entry.level];
  const Icon = LEVEL_ICON[entry.level];
  return (
    <Link
      href={`/result/${entry.id}`}
      className="focus-ring group flex items-center gap-3.5 px-4 py-4 transition-colors hover:bg-slate-50 md:px-5"
    >
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${style.bg} ${style.text}`}>
        <Icon className="h-5 w-5" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline gap-3">
          <span className="min-w-0 flex-1 truncate text-base font-bold text-navy-900">{typeName(entry.scamTypeLabel)}</span>
          <span className="shrink-0 whitespace-nowrap text-sm tabular-nums text-slate-500">{timeLabel}</span>
        </span>
        <span className="mt-1 flex items-center gap-2 whitespace-nowrap text-sm">
          <span className={`shrink-0 rounded-md px-1.5 py-px font-semibold ${style.bg} ${style.text}`}>위험 {style.label}</span>
          <span className="min-w-0 truncate text-slate-500">{entry.preview}</span>
          {entry.sharedAt && (
            <span className="ml-auto inline-flex shrink-0 items-center gap-1 pl-2 font-semibold text-brand-700">
              <Share2 className="h-3.5 w-3.5" aria-hidden />
              공유함
            </span>
          )}
        </span>
      </span>
      <ChevronRight
        className="hidden h-5 w-5 shrink-0 text-slate-300 transition-colors group-hover:text-slate-500 sm:block"
        aria-hidden
      />
    </Link>
  );
}
