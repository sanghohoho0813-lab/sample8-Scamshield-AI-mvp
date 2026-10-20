import { Suspense } from "react";
import type { Viewport } from "next";
import Link from "next/link";
import { ArrowRight, ChevronRight, Clock3, LayoutGrid, LifeBuoy, LockKeyhole, ShieldCheck, UserRoundCheck } from "lucide-react";
import AnalyzeForm from "@/components/AnalyzeForm";
import RecentChecks from "@/components/RecentChecks";
import { GUIDES } from "@/lib/guides";

/** 홈은 상단이 브랜드 색이라 휴대폰 상태 표시줄도 같은 색으로 맞춘다 */
export const viewport: Viewport = {
  themeColor: "#1d4fd7",
};

const TRUST_POINTS = [
  { icon: UserRoundCheck, text: "가입 없이 바로 검사", short: "가입 없이" },
  { icon: Clock3, text: "몇 초 안에 결과 확인", short: "몇 초 안에" },
  { icon: LockKeyhole, text: "입력한 문자는 이 기기에만 저장", short: "이 기기에만 저장" },
];

export default function HomePage() {
  return (
    <>
      {/* 브랜드 영역 + 입력 — 모바일은 카드가 파란 영역 아래쪽에 걸쳐 올라오고, 데스크톱은 영역 안에 놓인다 */}
      <section className="home-hero relative isolate overflow-hidden" aria-labelledby="home-heading">
        <div className="mx-auto grid max-w-6xl gap-4 px-4 pb-2 md:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,34rem)] lg:gap-x-16 lg:pb-16 lg:pt-16">
          <div className="home-hero-top -mx-4 px-4 pb-28 pt-5 text-white md:-mx-6 md:px-6 md:pt-10 lg:mx-0 lg:px-0 lg:pb-0 lg:pt-6">
            <p className="inline-flex items-center gap-1.5 rounded-full bg-white/12 px-3 py-1 text-sm font-semibold text-white ring-1 ring-white/20">
              <ShieldCheck className="h-4 w-4" aria-hidden />
              문자·스미싱 위험 신호 검사
            </p>
            <h1 id="home-heading" className="mt-3 text-3xl font-extrabold tracking-tight md:mt-4 md:text-4xl lg:text-5xl lg:leading-[1.15]">
              이 문자, 눌러도
              <br /> 괜찮을까요?
            </h1>
            <p className="mt-2 max-w-md text-base text-white/90 md:mt-3 md:text-lg">
              붙여넣기만 하면 위험 신호와 지금 해야 할 행동을 알려드려요.
            </p>
            <ul className="mt-9 hidden flex-col gap-3.5 lg:flex">
              {TRUST_POINTS.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3 text-base text-white">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/12">
                    <Icon className="h-4 w-4" aria-hidden />
                  </span>
                  {text}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative -mt-24 lg:row-span-2 lg:mt-0">
            <Suspense fallback={<div className="card h-[26rem] p-6 shadow-[var(--shadow-raised)]" aria-hidden />}>
              <AnalyzeForm />
            </Suspense>
          </div>

          {/* 이미 행동한 사용자 — 검사보다 대처가 먼저다 */}
          <Link
            href="/help"
            className="focus-ring press group flex min-h-[4.5rem] items-center gap-3.5 rounded-2xl bg-white px-4 py-3.5 shadow-[var(--shadow-subtle)] ring-1 ring-line transition-colors hover:ring-brand-200 lg:col-start-1 lg:mt-4 lg:self-start lg:bg-white/10 lg:shadow-none lg:ring-white/20 lg:hover:bg-white/15"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700 lg:bg-white/15 lg:text-white">
              <LifeBuoy className="h-6 w-6" aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-base font-bold text-navy-900 lg:text-white">이미 링크를 눌렀거나 돈을 보냈나요?</span>
              <span className="block text-sm text-slate-500 lg:text-white">지금 할 일과 신고 전화번호를 알려드려요</span>
            </span>
            <ChevronRight className="h-5 w-5 shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5 lg:text-white/70" aria-hidden />
          </Link>

          <ul className="flex flex-wrap justify-center gap-x-5 gap-y-2 py-1 lg:hidden">
            {TRUST_POINTS.map(({ icon: Icon, text, short }) => (
              <li key={text} className="flex items-center gap-1.5 whitespace-nowrap text-sm text-slate-500">
                <Icon className="h-4 w-4 text-brand-600" aria-hidden />
                <span className="sm:hidden">{short}</span>
                <span className="hidden sm:inline">{text}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 pb-12 pt-8 md:px-6 md:pt-12 lg:grid lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:gap-12 lg:pb-16 lg:pt-14">
        {/* 상황별 유형 — 아이콘 타일로 한눈에 */}
        <section aria-labelledby="types-heading">
          <div className="flex items-center justify-between gap-3">
            <h2 id="types-heading" className="text-xl font-bold tracking-tight text-navy-900">
              이런 문자 받으셨나요?
            </h2>
            <Link href="/guide" className="focus-ring inline-flex min-h-11 items-center gap-1 rounded-lg text-sm font-semibold text-brand-700 hover:text-brand-800">
              대처법 전체
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
          <ul className="mt-3 grid grid-cols-4 gap-x-2 gap-y-3 md:grid-cols-8 lg:grid-cols-4">
            {GUIDES.map((guide) => (
              <li key={guide.id}>
                <TypeTile href={`/guide#${guide.id}`} label={guide.short} icon={<guide.icon className="h-7 w-7" strokeWidth={1.8} aria-hidden />} />
              </li>
            ))}
            <li>
              <TypeTile href="/guide" label="전체 보기" icon={<LayoutGrid className="h-7 w-7" strokeWidth={1.8} aria-hidden />} muted />
            </li>
          </ul>
        </section>

        <RecentChecks />
      </div>
    </>
  );
}

function TypeTile({ href, label, icon, muted = false }: { href: string; label: string; icon: React.ReactNode; muted?: boolean }) {
  return (
    <Link href={href} className="focus-ring press group flex flex-col items-center gap-2 rounded-2xl px-0.5 py-1.5 text-center">
      <span
        className={`flex h-[3.75rem] w-[3.75rem] items-center justify-center rounded-[1.25rem] bg-white shadow-[var(--shadow-subtle)] ring-1 ring-line transition-all group-hover:-translate-y-0.5 group-hover:ring-brand-200 ${
          muted ? "text-slate-500" : "text-brand-600"
        }`}
      >
        {icon}
      </span>
      <span className="text-sm font-semibold leading-tight text-navy-900">{label}</span>
    </Link>
  );
}
