"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCcw } from "lucide-react";
import EmptyState from "@/components/EmptyState";

/** 예상하지 못한 오류가 나도 빈 화면 대신 다시 시도할 길을 준다 */
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <EmptyState
      art="error"
      as="h1"
      large
      title="화면을 불러오지 못했어요"
      description="잠시 후 다시 시도해주세요. 검사 기록은 이 기기에 그대로 남아 있어요."
      className="mx-auto max-w-lg px-4 py-14 md:py-20"
    >
      <button type="button" onClick={reset} className="btn-primary">
        <RotateCcw className="h-5 w-5" aria-hidden />
        다시 시도
      </button>
      <Link href="/" className="btn-secondary">
        처음으로
      </Link>
    </EmptyState>
  );
}
