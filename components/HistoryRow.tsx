"use client";

import Link from "next/link";
import { ChevronRight, Share2 } from "lucide-react";
import type { HistoryEntry } from "@/lib/types";
import { RISK_STYLE } from "@/lib/risk-style";

interface HistoryRowProps {
  entry: HistoryEntry;
  /** 첫 줄 오른쪽에 표시할 시각 (예: "3시간 전", "14:02") */
  timeLabel: string;
}

/** 기록 목록의 한 줄 — 두 줄 고정(줄바꿈 없음), 목록 컨테이너 안에서 구분선으로 나뉜다 */
export default function HistoryRow({ entry, timeLabel }: HistoryRowProps) {
  const style = RISK_STYLE[entry.level];
  const type = entry.scamTypeLabel.replace(/\s*의심$/, "");
  return (
    <Link
      href={`/result/${entry.id}`}
      className="focus-ring group flex items-center gap-3.5 px-4 py-3.5 transition-colors hover:bg-slate-50 md:px-5"
    >
      <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${style.bg}`}>
        <span className="sr-only">위험도</span>
        <span className={`text-lg font-extrabold tabular-nums ${style.text}`}>{entry.score}</span>
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline gap-3">
          <span className="min-w-0 flex-1 truncate text-base font-semibold text-navy-900">{entry.preview}</span>
          <span className="shrink-0 whitespace-nowrap text-sm tabular-nums text-slate-400">{timeLabel}</span>
        </span>
        <span className="mt-0.5 flex items-center gap-1.5 whitespace-nowrap text-sm">
          <span className={`shrink-0 font-semibold ${style.text}`}>{style.label}</span>
          <span className="shrink-0 text-slate-300" aria-hidden>
            ·
          </span>
          <span className="truncate text-slate-500">{type}</span>
          {entry.sharedAt && (
            <span className="ml-auto inline-flex shrink-0 items-center gap-1 pl-2 text-brand-700">
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
