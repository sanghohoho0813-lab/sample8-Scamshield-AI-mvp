"use client";

import Link from "next/link";
import { ChevronRight, Share2 } from "lucide-react";
import type { HistoryEntry } from "@/lib/types";
import { RISK_STYLE } from "@/lib/risk-style";
import { formatRelative } from "@/lib/format";

interface HistoryRowProps {
  entry: HistoryEntry;
  now: number;
}

/** 기록 목록의 한 줄 — 목록 컨테이너 안에서 구분선으로 나뉜다 */
export default function HistoryRow({ entry, now }: HistoryRowProps) {
  const style = RISK_STYLE[entry.level];
  return (
    <Link
      href={`/result/${entry.id}`}
      className="focus-ring group flex items-center gap-3.5 px-4 py-3.5 transition-colors hover:bg-slate-50 md:px-5"
    >
      <span className={`flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl ${style.bg}`}>
        <span className="sr-only">위험도</span>
        <span className={`text-lg font-extrabold leading-none tabular-nums ${style.text}`}>{entry.score}</span>
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-base font-semibold text-navy-900">{entry.preview}</span>
        <span className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-sm text-slate-500">
          <span className={`font-semibold ${style.text}`}>{style.label}</span>
          <span aria-hidden>·</span>
          <span>{entry.scamTypeLabel}</span>
          <span aria-hidden>·</span>
          <span className="whitespace-nowrap">{formatRelative(entry.createdAt, now)}</span>
          {entry.sharedAt && (
            <span className="inline-flex items-center gap-1 whitespace-nowrap text-brand-700">
              <span aria-hidden>·</span>
              <Share2 className="h-3.5 w-3.5" aria-hidden />
              공유함
            </span>
          )}
        </span>
      </span>
      <ChevronRight className="h-5 w-5 shrink-0 text-slate-300 transition-colors group-hover:text-slate-500" aria-hidden />
    </Link>
  );
}
