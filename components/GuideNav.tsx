"use client";

import { useEffect, useRef, useState } from "react";
import { GUIDES } from "@/lib/guides";

/**
 * 가이드 유형 바로가기.
 * 모바일에서는 헤더 아래에 붙어 따라오고, 지금 화면에 보이는 유형을 강조해 긴 목록에서도 위치를 잃지 않게 한다.
 */
export default function GuideNav() {
  const [active, setActive] = useState<string | null>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const visible = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) visible.add(e.target.id);
          else visible.delete(e.target.id);
        }
        // 화면 위쪽 띠에 걸친 유형 중 문서 순서상 첫 번째
        setActive(GUIDES.find((g) => visible.has(g.id))?.id ?? null);
      },
      { rootMargin: "-30% 0px -60% 0px" },
    );
    for (const g of GUIDES) {
      const el = document.getElementById(g.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);

  // 강조된 칩이 가로 스크롤 밖에 있으면 보이게 옮긴다 (세로 스크롤은 건드리지 않음)
  useEffect(() => {
    const list = listRef.current;
    const chip = active ? list?.querySelector<HTMLElement>(`[data-id="${active}"]`) : null;
    if (!list || !chip) return;
    const scroller = list.parentElement!;
    const left = chip.offsetLeft - 16;
    const right = chip.offsetLeft + chip.offsetWidth + 16;
    if (left < scroller.scrollLeft || right > scroller.scrollLeft + scroller.clientWidth) {
      scroller.scrollTo({ left: Math.max(0, left), behavior: "smooth" });
    }
  }, [active]);

  return (
    <nav
      aria-label="유형 바로가기"
      className="sticky top-14 z-30 -mx-4 mt-1 overflow-x-auto bg-surface/95 px-4 py-2.5 backdrop-blur-md md:static md:mx-0 md:mt-3 md:bg-transparent md:px-0 md:py-0 md:backdrop-blur-none"
    >
      <ul ref={listRef} className="flex w-max gap-2 md:w-auto md:flex-wrap">
        {GUIDES.map((guide) => {
          const on = active === guide.id;
          return (
            <li key={guide.id} data-id={guide.id}>
              <a
                href={`#${guide.id}`}
                onClick={() => setActive(guide.id)}
                aria-current={on ? "location" : undefined}
                className={`focus-ring press inline-flex min-h-11 items-center gap-2 whitespace-nowrap rounded-full py-1 pl-1.5 pr-4 text-base font-semibold shadow-[var(--shadow-subtle)] ring-1 transition-colors ${
                  on ? "bg-navy-900 text-white ring-navy-900" : "bg-white text-navy-900 ring-line hover:ring-brand-200"
                }`}
              >
                <span className={`flex h-8 w-8 items-center justify-center rounded-full ${on ? "bg-white/15 text-white" : "bg-brand-50 text-brand-700"}`}>
                  <guide.icon className="h-4 w-4" aria-hidden />
                </span>
                {guide.title}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
