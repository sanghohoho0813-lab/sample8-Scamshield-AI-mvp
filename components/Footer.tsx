import Link from "next/link";
import { MIRAE_LINKS } from "@/lib/mirae";
import { MiraeLogo } from "./BrandMark";

export default function Footer() {
  return (
    <footer className="border-t border-line bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-8 md:flex-row md:items-center md:justify-between md:px-6">
        <div className="flex flex-col gap-2">
          <MiraeLogo width={132} className="h-auto w-[132px]" />
          <p className="text-xs text-slate-400">© {new Date().getFullYear()} MIRAE AI LAB. All rights reserved.</p>
        </div>
        <div className="flex flex-col gap-3 md:items-end">
          <nav aria-label="하단 링크" className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium text-slate-500">
            <Link href="/about" className="hover:text-navy-900">
              서비스 소개
            </Link>
            <Link href="/guide" className="hover:text-navy-900">
              안전 가이드
            </Link>
            <a href={MIRAE_LINKS.homeHref} target="_blank" rel="noopener noreferrer" className="hover:text-navy-900">
              미래AI랩
            </a>
          </nav>
          <p className="text-xs text-slate-400">
            분석 결과는 참고용 위험 신호 안내이며, 사기 여부를 확정하지 않습니다.
          </p>
        </div>
      </div>
    </footer>
  );
}
