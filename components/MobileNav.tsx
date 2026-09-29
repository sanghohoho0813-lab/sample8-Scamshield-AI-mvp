"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpenText, History, ScanSearch, Settings } from "lucide-react";

const ITEMS = [
  { href: "/", label: "검사", icon: ScanSearch, match: (p: string) => p === "/" },
  { href: "/history", label: "기록", icon: History, match: (p: string) => p.startsWith("/history") || p.startsWith("/result") },
  { href: "/guide", label: "가이드", icon: BookOpenText, match: (p: string) => p.startsWith("/guide") },
  { href: "/my", label: "설정", icon: Settings, match: (p: string) => p.startsWith("/my") },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="하단 메뉴"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
    >
      <div className="mx-auto grid max-w-md grid-cols-4">
        {ITEMS.map(({ href, label, icon: Icon, match }) => {
          const active = match(pathname);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-16 flex-col items-center justify-center gap-1 text-xs font-semibold transition-colors ${
                active ? "text-brand-700" : "text-slate-400"
              }`}
            >
              <Icon className="h-6 w-6" aria-hidden strokeWidth={active ? 2.3 : 1.9} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
