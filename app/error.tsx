"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCcw, TriangleAlert } from "lucide-react";

/** 예상하지 못한 오류가 나도 빈 화면 대신 다시 시도할 길을 준다 */
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-16 text-center md:py-24">
      <TriangleAlert className="h-12 w-12 text-risk-caution" aria-hidden />
      <h1 className="mt-5 text-2xl font-extrabold text-navy-900">화면을 불러오지 못했어요</h1>
      <p className="mt-2 text-base text-slate-500">
        잠시 후 다시 시도해주세요. 검사 기록은 이 기기에 그대로 남아 있어요.
      </p>
      <div className="mt-7 flex w-full flex-col gap-2.5 sm:w-auto sm:flex-row">
        <button type="button" onClick={reset} className="btn-primary">
          <RotateCcw className="h-5 w-5" aria-hidden />
          다시 시도
        </button>
        <Link href="/" className="btn-secondary">
          처음으로
        </Link>
      </div>
    </div>
  );
}
