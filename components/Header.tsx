"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings, ShieldCheck } from "lucide-react";
import DateTimeBar from "./DateTimeBar";
import FontSizeButton from "./FontSizeButton";

const NAV_ITEMS = [
  { href: "/", label: "문자 검사", match: (p: string) => p === "/" },
  { href: "/history", label: "분석 기록", match: (p: string) => p.startsWith("/history") || p.startsWith("/result") },
  { href: "/guide", label: "안전 가이드", match: (p: string) => p.startsWith("/guide") },
  { href: "/help", label: "피해 대응", match: (p: string) => p.startsWith("/help") },
];

export default function Header() {
  const pathname = usePathname();
  const settingsActive = pathname.startsWith("/my");
  // 모바일 홈은 아래 브랜드 영역과 이어지도록 헤더도 같은 색으로 칠한다
  const onBrand = pathname === "/";

  return (
    <header
      className={`sticky top-0 z-40 border-b backdrop-blur-md md:border-line md:bg-white/90 ${
        onBrand ? "border-transparent bg-brand-700" : "border-line bg-white/90"
      }`}
    >
      <DateTimeBar />
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 md:h-16 md:px-6">
        <Link href="/" className="focus-ring flex items-center gap-2 rounded-lg" aria-label="ScamShield 홈">
          <span
            className={`flex h-8 w-8 items-center justify-center rounded-[0.625rem] md:bg-brand-600 md:text-white ${
              onBrand ? "bg-white text-brand-700" : "bg-brand-600 text-white"
            }`}
          >
            <ShieldCheck className="h-5 w-5" aria-hidden />
          </span>
          <span className={`text-lg font-bold tracking-tight md:text-navy-900 ${onBrand ? "text-white" : "text-navy-900"}`}>ScamShield</span>
        </Link>

        {/* 모바일: 메뉴는 하단 탭이 맡고, 헤더 오른쪽에는 글자 크기 빠른 전환만 둔다 */}
        <div className="md:hidden">
          <FontSizeButton onBrand={onBrand} />
        </div>

        {/* 데스크톱: 지금 있는 메뉴는 헤더 아래 선에 붙은 밑줄로 표시 */}
        <nav className="hidden self-stretch md:flex" aria-label="주요 메뉴">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.href} href={item.href} active={item.match(pathname)}>
              {item.label}
            </NavLink>
          ))}
          <span className="mx-2 h-5 w-px self-center bg-line" aria-hidden />
          <div className="flex items-center">
            <FontSizeButton />
          </div>
          <NavLink href="/my" active={settingsActive}>
            <Settings className="h-4 w-4" aria-hidden />
            설정
          </NavLink>
        </nav>
      </div>
    </header>
  );
}

function NavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`focus-ring group relative flex items-center gap-1.5 px-3.5 text-base font-semibold transition-colors focus-visible:outline-offset-[-10px] ${
        active ? "text-brand-700" : "text-slate-500 hover:text-navy-900"
      }`}
    >
      {children}
      <span
        className={`absolute inset-x-3 bottom-0 h-[3px] rounded-t-full transition-colors ${
          active ? "bg-brand-600" : "bg-transparent group-hover:bg-slate-200"
        }`}
        aria-hidden
      />
    </Link>
  );
}
