"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck } from "lucide-react";

const NAV_ITEMS = [
  { href: "/analyze", label: "검사하기" },
  { href: "/guide", label: "안전가이드" },
  { href: "/history", label: "분석기록" },
  { href: "/about", label: "서비스 소개" },
  { href: "/my", label: "마이페이지" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 md:h-16 md:px-6">
        <Link href="/" className="flex items-center gap-2" aria-label="ScamShield 홈">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm">
            <ShieldCheck className="h-5 w-5" aria-hidden />
          </span>
          <span className="text-lg font-bold tracking-tight text-navy-900">
            ScamShield
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="주요 메뉴">
          {NAV_ITEMS.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-brand-50 text-brand-700"
                    : "text-slate-600 hover:bg-slate-100 hover:text-navy-900"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <Link
          href="/analyze"
          className="btn-primary !min-h-9 !rounded-lg !px-3.5 !py-1.5 text-sm md:hidden"
        >
          검사하기
        </Link>
      </div>
    </header>
  );
}
