"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Clock3 } from "lucide-react";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

function format(now: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    date: `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일 (${WEEKDAYS[now.getDay()]})`,
    time: `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`,
  };
}

/** 상단 실시간 날짜·요일·시각(초 단위) 표시 바 */
export default function DateTimeBar() {
  // 서버-클라이언트 hydration 불일치를 피하기 위해 마운트 후에만 시간 표시
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatted = now ? format(now) : null;

  return (
    <div className="border-b border-line bg-white/70">
      <div className="mx-auto flex h-10 max-w-6xl items-center justify-center gap-4 px-4 text-xs font-semibold text-slate-500 md:justify-end md:px-6">
        {formatted ? (
          <>
            <span className="flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4 text-brand-500" aria-hidden />
              {formatted.date}
            </span>
            <span className="flex items-center gap-1.5 tabular-nums">
              <Clock3 className="h-4 w-4 text-teal-600" aria-hidden />
              {formatted.time}
            </span>
          </>
        ) : (
          <span className="skeleton h-5 w-64" aria-hidden />
        )}
      </div>
    </div>
  );
}
