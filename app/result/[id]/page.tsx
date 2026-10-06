"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, SearchX } from "lucide-react";
import type { HistoryEntry } from "@/lib/types";
import { getHistoryEntry } from "@/lib/storage";
import { formatWhen } from "@/lib/format";
import ResultView from "@/components/ResultView";
import { useToast } from "@/components/Toast";

export default function ResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { show, node: toastNode } = useToast();
  // undefined: 불러오는 중 / null: 없음
  const [entry, setEntry] = useState<HistoryEntry | null | undefined>(undefined);
  const [isNew, setIsNew] = useState(false);

  useEffect(() => {
    setEntry(getHistoryEntry(id) ?? null);
    // 방금 분석한 결과: 저장 안내 후 주소에서 표시를 지워 새로고침 시 반복되지 않게 함
    const fresh = new URLSearchParams(window.location.search).get("new");
    if (fresh) {
      setIsNew(true);
      show(fresh === "updated" ? "같은 문자라 기록을 새로 고쳤어요." : "분석 기록에 저장했어요.");
      router.replace(`/result/${id}`, { scroll: false });
    }
  }, [id, router, show]);

  return (
    <div className="mx-auto max-w-6xl px-4 pb-4 pt-4 md:px-6 md:pt-8">
      <div className="mb-3 flex items-center justify-between gap-3 md:mb-5">
        <Link
          href={isNew ? "/" : "/history"}
          className="focus-ring -ml-2 inline-flex min-h-11 items-center gap-0.5 rounded-lg px-2 text-base font-semibold text-slate-500 hover:text-navy-900"
        >
          <ChevronLeft className="h-5 w-5" aria-hidden />
          {isNew ? "새 문자 검사" : "분석 기록"}
        </Link>
        {entry && <p className="text-sm text-slate-500">{formatWhen(entry.result.createdAt)} 검사</p>}
      </div>

      {entry === undefined && (
        <div className="grid min-h-dvh content-start gap-4 lg:grid-cols-[23rem_1fr] lg:gap-8" aria-busy="true" aria-label="결과를 불러오는 중">
          <div className="skeleton h-96 rounded-2xl" />
          <div className="flex flex-col gap-4">
            <div className="skeleton h-72 rounded-2xl" />
            <div className="skeleton h-40 rounded-2xl" />
          </div>
        </div>
      )}

      {entry === null && (
        <div className="card mx-auto flex max-w-lg flex-col items-center px-6 py-14 text-center">
          <SearchX className="h-10 w-10 text-slate-300" aria-hidden />
          <h1 className="mt-4 text-lg font-bold text-navy-900">검사 결과를 찾을 수 없어요</h1>
          <p className="mt-1.5 text-base text-slate-500">
            삭제되었거나 다른 기기·브라우저에서 검사한 결과일 수 있어요. 기록은 검사한 기기에만 저장돼요.
          </p>
          <div className="mt-6 flex w-full flex-col gap-2.5 sm:w-auto sm:flex-row">
            <Link href="/" className="btn-primary">
              문자 검사하기
            </Link>
            <Link href="/history" className="btn-secondary">
              분석 기록 보기
            </Link>
          </div>
        </div>
      )}

      {entry && <ResultView key={entry.id} entry={entry} isNew={isNew} notify={show} />}
      {toastNode}
    </div>
  );
}
