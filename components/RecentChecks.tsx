"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { HistoryEntry } from "@/lib/types";
import { getHistory } from "@/lib/storage";
import HistoryRow from "./HistoryRow";

/** 홈 "최근 검사" — 방금 검사한 결과가 곧바로 여기에 반영된다 */
export default function RecentChecks() {
  const [entries, setEntries] = useState<HistoryEntry[] | null>(null);
  const [now, setNow] = useState(0);

  useEffect(() => {
    setEntries(getHistory().slice(0, 3));
    setNow(Date.now());
  }, []);

  if (entries !== null && entries.length === 0) return null;

  return (
    <section aria-labelledby="recent-heading">
      <div className="flex items-end justify-between gap-3">
        <h2 id="recent-heading" className="text-xl font-bold text-navy-900">
          최근 검사
        </h2>
        <Link href="/history" className="focus-ring inline-flex min-h-11 items-center gap-1 rounded-lg text-sm font-semibold text-brand-700 hover:text-brand-800">
          전체 기록
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
      <div className="card mt-3 divide-y divide-line overflow-hidden">
        {entries === null
          ? [0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-3.5 px-4 py-3.5 md:px-5" aria-hidden>
                <div className="skeleton h-12 w-12 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-4 w-3/4" />
                  <div className="skeleton h-3.5 w-1/2" />
                </div>
              </div>
            ))
          : entries.map((entry) => <HistoryRow key={entry.id} entry={entry} now={now} />)}
      </div>
    </section>
  );
}
