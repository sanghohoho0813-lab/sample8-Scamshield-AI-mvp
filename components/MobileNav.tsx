"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpenText, History, ScanSearch, UserRound } from "lucide-react";

const ITEMS = [
  { href: "/analyze", label: "검사", icon: ScanSearch },
  { href: "/history", label: "기록", icon: History },
  { href: "/guide", label: "가이드", icon: BookOpenText },
  { href: "/my", label: "마이", icon: UserRound },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="하단 메뉴"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
    >
      <div className="mx-auto grid max-w-md grid-cols-4">
        {ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex min-h-14 flex-col items-center justify-center gap-0.5 text-[1.03125rem] font-medium transition-colors ${
                active ? "text-brand-600" : "text-slate-400 hover:text-slate-600"
              }`}
              aria-current={active ? "page" : undefined}
            >
              <Icon className="h-5 w-5" aria-hidden strokeWidth={active ? 2.4 : 2} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
