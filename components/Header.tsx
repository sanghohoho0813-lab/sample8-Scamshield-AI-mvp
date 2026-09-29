"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings, ShieldCheck } from "lucide-react";
import DateTimeBar from "./DateTimeBar";

const NAV_ITEMS = [
  { href: "/", label: "문자 검사", match: (p: string) => p === "/" },
  { href: "/history", label: "분석 기록", match: (p: string) => p.startsWith("/history") || p.startsWith("/result") },
  { href: "/guide", label: "안전 가이드", match: (p: string) => p.startsWith("/guide") },
];

export default function Header() {
  const pathname = usePathname();
  const settingsActive = pathname.startsWith("/my");

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/90 backdrop-blur-md">
      <DateTimeBar />
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 md:h-16 md:px-6">
        <Link href="/" className="focus-ring flex items-center gap-2 rounded-lg" aria-label="ScamShield 홈">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
            <ShieldCheck className="h-5 w-5" aria-hidden />
          </span>
          <span className="text-lg font-bold tracking-tight text-navy-900">ScamShield</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="주요 메뉴">
          {NAV_ITEMS.map((item) => {
            const active = item.match(pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`focus-ring rounded-lg px-3.5 py-2 text-base font-semibold transition-colors ${
                  active ? "text-brand-700" : "text-slate-500 hover:text-navy-900"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <span className="mx-2 h-5 w-px bg-line" aria-hidden />
          <Link
            href="/my"
            aria-current={settingsActive ? "page" : undefined}
            className={`focus-ring flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
              settingsActive ? "text-brand-700" : "text-slate-500 hover:text-navy-900"
            }`}
          >
            <Settings className="h-4 w-4" aria-hidden />
            설정
          </Link>
        </nav>
      </div>
    </header>
  );
}
