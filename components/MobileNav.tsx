"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpenText, History, LifeBuoy, ScanSearch, Settings } from "lucide-react";

const ITEMS = [
  { href: "/", label: "검사", icon: ScanSearch, match: (p: string) => p === "/" },
  { href: "/history", label: "기록", icon: History, match: (p: string) => p.startsWith("/history") || p.startsWith("/result") },
  { href: "/guide", label: "가이드", icon: BookOpenText, match: (p: string) => p.startsWith("/guide") },
  { href: "/help", label: "피해 대응", icon: LifeBuoy, match: (p: string) => p.startsWith("/help") },
  { href: "/my", label: "설정", icon: Settings, match: (p: string) => p.startsWith("/my") },
];

export default function MobileNav() {
  const pathname = usePathname();

  // 결과(상세) 화면은 하단 탭 대신 화면이 직접 고정 실행 버튼을 둔다 — 그 높이만큼 아래 여백을 남긴다
  if (pathname.startsWith("/result/")) {
    return <div className="h-[calc(5.25rem+env(safe-area-inset-bottom))] lg:hidden" aria-hidden />;
  }

  return (
    <>
      <div className="h-[calc(4rem+env(safe-area-inset-bottom))] md:hidden" aria-hidden />
      <nav
        aria-label="하단 메뉴"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
      >
        <div className="mx-auto grid max-w-md grid-cols-5">
          {ITEMS.map(({ href, label, icon: Icon, match }) => {
            const active = match(pathname);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`focus-ring flex min-h-16 flex-col items-center justify-center gap-0.5 whitespace-nowrap text-[0.875rem] font-semibold tracking-tight transition-colors ${
                  active ? "text-brand-700" : "text-slate-500"
                }`}
              >
                <span className={`flex h-8 w-14 items-center justify-center rounded-full transition-colors ${active ? "bg-brand-50" : ""}`}>
                  <Icon className="h-6 w-6" aria-hidden strokeWidth={active ? 2.3 : 1.9} />
                </span>
                {label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
