"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import type { HistoryEntry, RiskLevel, ScamType } from "@/lib/types";
import { getHistory, restoreDemoHistory } from "@/lib/storage";
import { SCAM_TYPE_LABELS } from "@/lib/risk-engine";
import HistoryRow from "@/components/HistoryRow";
import { formatDayGroup, formatTime } from "@/lib/format";
import { typeName } from "@/lib/verdict";
import { useToast } from "@/components/Toast";
import EmptyState from "@/components/EmptyState";
import PageHeader from "@/components/PageHeader";

type LevelFilter = "all" | "danger" | "caution" | "low";

const FILTERS: { value: LevelFilter; label: string; match: (l: RiskLevel) => boolean }[] = [
  { value: "all", label: "전체", match: () => true },
  { value: "danger", label: "위험", match: (l) => l === "high" || l === "very-high" },
  { value: "caution", label: "주의", match: (l) => l === "caution" },
  { value: "low", label: "낮음", match: (l) => l === "low" },
];

export default function HistoryPage() {
  const [entries, setEntries] = useState<HistoryEntry[] | null>(null);
  const [now, setNow] = useState(0);
  const [level, setLevel] = useState<LevelFilter>("all");
  const [type, setType] = useState<ScamType | null>(null);
  const { show, node: toastNode } = useToast();

  useEffect(() => {
    setEntries(getHistory());
    setNow(Date.now());
    const params = new URLSearchParams(window.location.search);
    const t = params.get("type");
    if (t && t in SCAM_TYPE_LABELS) setType(t as ScamType);
    if (params.get("deleted") === "1") {
      show("기록을 삭제했어요.");
      window.history.replaceState(null, "", "/history");
    }
  }, [show]);

  const visible = useMemo(() => {
    const match = FILTERS.find((f) => f.value === level)!.match;
    return (entries ?? []).filter((e) => match(e.level) && (!type || e.scamType === type));
  }, [entries, level, type]);

  const clearType = () => {
    setType(null);
    window.history.replaceState(null, "", "/history");
  };

  const restore = () => {
    setEntries(restoreDemoHistory());
    setNow(Date.now());
    setLevel("all");
    clearType();
    show("예시 기록 8건을 불러왔어요.");
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 md:px-6 md:py-10">
      <PageHeader title="분석 기록">
        {entries && entries.length > 0
          ? `검사 ${entries.length}건 · 눌러서 결과를 다시 볼 수 있어요.`
          : "검사한 문자의 결과를 다시 확인할 수 있어요."}
      </PageHeader>

      <div className="mt-6">
        {entries === null ? (
          // 불러오는 동안 화면 높이를 미리 차지해, 기록이 그려질 때 아래 영역이 밀려 내려가지 않게 한다
          <div className="min-h-dvh" aria-busy="true">
            <div className="card divide-y divide-line overflow-hidden">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-3.5 px-4 py-3.5 md:px-5" aria-hidden>
                  <div className="skeleton h-11 w-11 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <div className="skeleton h-4 w-1/3" />
                    <div className="skeleton h-3.5 w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : entries.length === 0 ? (
          <EmptyState
            art="inbox"
            title="아직 검사한 문자가 없어요"
            description="의심스러운 문자를 넣고 위험 신호를 확인해보세요. 검사 기록은 이 기기에만 남아요."
            className="card px-6 py-12"
          >
            <Link href="/" className="btn-primary">
              첫 문자 검사하기
            </Link>
            <button type="button" onClick={restore} className="btn-secondary">
              예시 기록 불러오기
            </button>
          </EmptyState>
        ) : (
          <div className="animate-fade-in">
            {/* 위험 정도로 거르기 */}
            <div className="-mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
              <div className="flex w-max gap-2" role="group" aria-label="위험 정도로 보기">
                {FILTERS.map((f) => {
                  const count = entries.filter((e) => f.match(e.level) && (!type || e.scamType === type)).length;
                  const active = level === f.value;
                  return (
                    <button
                      key={f.value}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setLevel(f.value)}
                      className={`focus-ring inline-flex min-h-11 items-center gap-1.5 rounded-full border px-4 text-base font-semibold transition-colors ${
                        active ? "border-navy-900 bg-navy-900 text-white" : "border-line bg-white text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      {f.label}
                      <span className={`tabular-nums ${active ? "text-white/80" : "text-slate-500"}`}>{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {type && (
              <p className="mt-3 flex flex-wrap items-center gap-2 text-base text-slate-600">
                <span>
                  <b className="text-navy-900">{typeName(SCAM_TYPE_LABELS[type])}</b> 기록만 보고 있어요
                </span>
                <button
                  type="button"
                  onClick={clearType}
                  className="focus-ring inline-flex min-h-11 items-center gap-1 rounded-lg px-2 font-semibold text-brand-700 hover:bg-brand-50"
                >
                  <X className="h-4 w-4" aria-hidden />
                  모든 유형 보기
                </button>
              </p>
            )}

            {visible.length === 0 ? (
              <p className="card mt-4 px-5 py-10 text-center text-base text-slate-500">이 조건에 맞는 기록이 없어요.</p>
            ) : (
              <div className="mt-5 flex flex-col gap-6">
                {groupByDay(visible, now).map(([label, group]) => (
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
