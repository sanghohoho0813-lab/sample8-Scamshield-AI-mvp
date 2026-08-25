"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, SearchX } from "lucide-react";
import type { HistoryEntry } from "@/lib/types";
import { getHistoryEntry } from "@/lib/storage";
import { formatDate } from "@/components/HistoryCard";
import ResultView from "@/components/ResultView";

export default function HistoryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [entry, setEntry] = useState<HistoryEntry | null | undefined>(undefined);

  useEffect(() => {
    setEntry(getHistoryEntry(id) ?? null);
  }, [id]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 md:py-10">
      <Link
        href="/history"
        className="inline-flex min-h-10 items-center gap-1.5 text-sm font-semibold text-slate-500 transition-colors hover:text-navy-900"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        분석 기록으로
      </Link>

      {entry === undefined && (
        <div className="mt-4 flex flex-col gap-4">
          <div className="skeleton h-64 w-full" />
          <div className="skeleton h-32 w-full" />
        </div>
      )}

      {entry === null && (
        <div className="card mt-4 flex flex-col items-center px-6 py-14 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <SearchX className="h-7 w-7" aria-hidden />
          </span>
          <p className="mt-4 text-[15px] font-bold text-navy-900">기록을 찾을 수 없습니다.</p>
          <p className="mt-1 text-sm text-slate-500">삭제되었거나 다른 기기에서 저장된 기록일 수 있어요.</p>
          <Link href="/analyze" className="btn-primary mt-5">
            새로 검사하기
          </Link>
        </div>
      )}

      {entry && (
        <div className="mt-4">
          <div className="mb-4 flex items-baseline justify-between gap-3 md:mb-5">
            <h1 className="text-xl font-extrabold tracking-tight text-navy-900 md:text-2xl">
              분석 상세
            </h1>
            <p className="text-xs text-slate-400 md:text-sm">{formatDate(entry.createdAt)} 검사</p>
          </div>
          <ResultView result={entry.result} animateGauge={false} />
        </div>
      )}
    </div>
  );
}
