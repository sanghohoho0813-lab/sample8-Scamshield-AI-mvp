"use client";

import { useEffect, useState } from "react";
import { MiraeMark } from "./BrandMark";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];
const pad = (n: number) => String(n).padStart(2, "0");

/**
 * 데스크톱 전용 상단 브랜드 바: 제작사 표기 + 오늘 날짜·요일·현재 시각(초).
 * 모바일에서는 콘텐츠 공간을 위해 표시하지 않는다.
 */
export default function DateTimeBar() {
  // hydration 불일치를 피하기 위해 마운트 후에만 시각 표시
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="hidden border-b border-line/70 bg-surface/60 md:block">
      <div className="mx-auto flex h-8 max-w-6xl items-center justify-between px-6 text-xs text-slate-500">
        <span className="flex items-center gap-1.5 font-semibold">
          <MiraeMark size={14} className="h-3.5 w-3.5" />
          MIRAE AI LAB
        </span>
        <span className="tabular-nums" aria-live="off">
          {now
            ? `${now.getFullYear()}.${pad(now.getMonth() + 1)}.${pad(now.getDate())} (${WEEKDAYS[now.getDay()]}) ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
            : " "}
        </span>
      </div>
    </div>
  );
}
