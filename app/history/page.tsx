"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Inbox, ScanSearch } from "lucide-react";
import type { HistoryEntry } from "@/lib/types";
import { getHistory } from "@/lib/storage";
import HistoryCard from "@/components/HistoryCard";

export default function HistoryPage() {
  const [entries, setEntries] = useState<HistoryEntry[] | null>(null);

  useEffect(() => {
    setEntries(getHistory());
  }, []);

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 md:py-10">
      <h1 className="text-2xl font-extrabold tracking-tight text-navy-900 md:text-3xl">분석 기록</h1>
      <p className="mt-2 text-[1.6875rem] text-slate-500">
        이전에 검사한 문자의 위험도를 다시 확인할 수 있어요.
      </p>

      <div className="mt-6 flex flex-col gap-3">
        {entries === null ? (
          <>
            <div className="skeleton h-20 w-full" />
            <div className="skeleton h-20 w-full" />
            <div className="skeleton h-20 w-full" />
          </>
        ) : entries.length === 0 ? (
          <div className="card animate-fade-up flex flex-col items-center px-6 py-14 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <Inbox className="h-7 w-7" aria-hidden />
            </span>
            <p className="mt-4 text-[1.6875rem] font-bold text-navy-900">아직 검사한 메시지가 없습니다.</p>
            <p className="mt-1 text-sm text-slate-500">의심스러운 문자를 넣고 위험 신호를 확인해보세요.</p>
            <Link href="/analyze" className="btn-primary mt-5">
              <ScanSearch className="h-4 w-4" aria-hidden />
              첫 문자 검사하기
            </Link>
          </div>
        ) : (
          entries.map((entry, i) => (
            <div key={entry.id} className="animate-fade-up" style={{ animationDelay: `${Math.min(i * 40, 240)}ms` }}>
              <HistoryCard entry={entry} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
