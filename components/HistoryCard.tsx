"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { HistoryEntry, RiskLevel } from "@/lib/types";

const LEVEL_STYLES: Record<RiskLevel, { text: string; bg: string; label: string }> = {
  low: { text: "text-risk-low", bg: "bg-risk-low-bg", label: "낮음" },
  caution: { text: "text-risk-caution", bg: "bg-risk-caution-bg", label: "주의" },
  high: { text: "text-risk-high", bg: "bg-risk-high-bg", label: "높음" },
  "very-high": { text: "text-risk-very", bg: "bg-risk-very-bg", label: "매우 높음" },
};

export function formatDate(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function HistoryCard({ entry }: { entry: HistoryEntry }) {
  const style = LEVEL_STYLES[entry.level];
  return (
    <Link
      href={`/history/${entry.id}`}
      className="card group flex items-center gap-3.5 px-4 py-4 transition-all hover:border-brand-200 hover:shadow-card-lg md:px-5"
    >
      <div className={`flex h-13 w-13 shrink-0 flex-col items-center justify-center rounded-2xl ${style.bg}`}>
        <span className={`text-lg font-extrabold tabular-nums leading-none ${style.text}`}>
          {entry.score}
        </span>
        <span className={`mt-0.5 text-[0.9375rem] font-bold ${style.text}`}>{style.label}</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[1.40625rem] font-semibold text-navy-900">{entry.preview}</p>
        <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-400">
          <span className="font-semibold text-slate-500">{entry.scamTypeLabel}</span>
          <span aria-hidden>·</span>
          {formatDate(entry.createdAt)}
        </p>
      </div>
      <ChevronRight
        className="h-5 w-5 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5"
        aria-hidden
      />
    </Link>
  );
}
