"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Inbox } from "lucide-react";
import type { HistoryEntry } from "@/lib/types";
import { getHistory, restoreDemoHistory } from "@/lib/storage";
import HistoryRow from "@/components/HistoryRow";
import { formatDayGroup, formatTime } from "@/lib/format";
import { useToast } from "@/components/Toast";

export default function HistoryPage() {
  const [entries, setEntries] = useState<HistoryEntry[] | null>(null);
  const [now, setNow] = useState(0);
  const { show, node: toastNode } = useToast();

  useEffect(() => {
    setEntries(getHistory());
    setNow(Date.now());
    if (new URLSearchParams(window.location.search).get("deleted") === "1") {
      show("기록을 삭제했어요.");
      window.history.replaceState(null, "", "/history");
    }
  }, [show]);

  const restore = () => {
    setEntries(restoreDemoHistory());
    setNow(Date.now());
    show("예시 기록 8건을 불러왔어요.");
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 md:px-6 md:py-10">
      <h1 className="text-2xl font-extrabold tracking-tight text-navy-900 md:text-3xl">분석 기록</h1>
      <p className="mt-1.5 text-base text-slate-500">
        {entries && entries.length > 0
          ? `검사 ${entries.length}건 · 눌러서 결과를 다시 볼 수 있어요.`
          : "검사한 문자의 결과를 다시 확인할 수 있어요."}
      </p>

      <div className="mt-6">
        {entries === null ? (
          // 불러오는 동안 화면 높이를 미리 차지해, 기록이 그려질 때 아래 영역이 밀려 내려가지 않게 한다
          <div className="min-h-dvh" aria-busy="true">
            <div className="card divide-y divide-line overflow-hidden">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-3.5 px-4 py-3.5 md:px-5" aria-hidden>
                  <div className="skeleton h-12 w-12 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <div className="skeleton h-4 w-3/4" />
                    <div className="skeleton h-3.5 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : entries.length === 0 ? (
          <div className="card flex flex-col items-center px-6 py-14 text-center">
            <Inbox className="h-10 w-10 text-slate-300" aria-hidden />
            <h2 className="mt-4 text-lg font-bold text-navy-900">아직 검사한 문자가 없어요</h2>
            <p className="mt-1.5 text-base text-slate-500">의심스러운 문자를 넣고 위험 신호를 확인해보세요.</p>
            <div className="mt-6 flex w-full flex-col gap-2.5 sm:w-auto sm:flex-row">
              <Link href="/" className="btn-primary">
                첫 문자 검사하기
              </Link>
              <button type="button" onClick={restore} className="btn-secondary">
                예시 기록 불러오기
              </button>
            </div>
          </div>
        ) : (
          <div className="animate-fade-in flex flex-col gap-6">
            {groupByDay(entries, now).map(([label, group]) => (
              <section key={label} aria-label={label}>
                <h2 className="mb-2 px-1 text-sm font-semibold text-slate-500">{label}</h2>
                <div className="card divide-y divide-line overflow-hidden">
                  {group.map((entry) => (
                    <HistoryRow key={entry.id} entry={entry} timeLabel={formatTime(entry.createdAt)} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>

      {entries && entries.length > 0 && (
        <p className="mt-4 text-sm text-slate-500">
          기록은 이 기기의 브라우저에만 저장돼요. 기록 정리는{" "}
          <Link href="/my" className="font-semibold text-brand-700 underline-offset-4 hover:underline">
            설정
          </Link>
          에서 할 수 있어요.
        </p>
      )}
      {toastNode}
    </div>
  );
}

/** 최신순 목록을 날짜별로 묶는다 (순서 유지) */
function groupByDay(entries: HistoryEntry[], now: number): [string, HistoryEntry[]][] {
  const groups = new Map<string, HistoryEntry[]>();
  for (const entry of entries) {
    const label = formatDayGroup(entry.createdAt, now);
    groups.set(label, [...(groups.get(label) ?? []), entry]);
  }
  return [...groups.entries()];
}
