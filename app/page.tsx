import { Suspense } from "react";
import Link from "next/link";
import { ArrowRight, Clock3, LockKeyhole, UserRoundCheck } from "lucide-react";
import AnalyzeForm from "@/components/AnalyzeForm";
import RecentChecks from "@/components/RecentChecks";
import { GUIDES } from "@/lib/guides";

const TRUST_POINTS = [
  { icon: UserRoundCheck, text: "가입 없이 바로 검사", short: "가입 없이" },
  { icon: Clock3, text: "결과까지 약 3초", short: "약 3초" },
  { icon: LockKeyhole, text: "입력한 문자는 이 기기에만 저장", short: "이 기기에만 저장" },
];

/** 홈에 노출할 대표 사기 유형 */
const FEATURED_GUIDE_IDS = ["delivery", "finance", "family", "government"];

export default function HomePage() {
  const featuredGuides = GUIDES.filter((g) => FEATURED_GUIDE_IDS.includes(g.id));

  return (
    <>
      {/* Hero + 입력 */}
      <section className="border-b border-line bg-white">
        <div className="mx-auto grid max-w-6xl gap-5 px-4 pb-10 pt-6 md:gap-6 md:px-6 md:pb-14 md:pt-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,34rem)] lg:gap-x-16 lg:pt-16">
          <div className="lg:pt-8">
            <p className="hidden text-sm font-bold text-brand-700 md:block">문자·스미싱 위험 신호 검사</p>
            <h1 className="text-3xl font-extrabold tracking-tight text-navy-900 md:mt-2 md:text-4xl lg:text-5xl">
              이 문자, 눌러도
              <br /> 괜찮을까요?
            </h1>
            <p className="mt-2 max-w-md text-base text-slate-600 md:mt-3 md:text-lg">
              붙여넣기만 하면 위험 신호와 지금 해야 할 행동을 알려드려요.
            </p>
            <ul className="mt-8 hidden flex-col gap-3 lg:flex">
              {TRUST_POINTS.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-2.5 text-base text-slate-600">
                  <Icon className="h-5 w-5 text-brand-600" aria-hidden />
                  {text}
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:row-span-2">
            <Suspense fallback={<div className="card h-[26rem] p-6" aria-hidden />}>
              <AnalyzeForm />
            </Suspense>
          </div>

          <ul className="flex flex-wrap justify-center gap-x-5 gap-y-2 lg:hidden">
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

      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-4 py-10 md:px-6 md:py-14 lg:grid lg:grid-cols-2 lg:gap-10">
        <RecentChecks />

        {/* 자주 오는 사기 유형 */}
        <section aria-labelledby="types-heading">
          <div className="flex items-center justify-between gap-3">
            <h2 id="types-heading" className="text-xl font-bold text-navy-900">
              자주 오는 사기 문자
            </h2>
            <Link href="/guide" className="focus-ring inline-flex min-h-11 items-center gap-1 rounded-lg text-sm font-semibold text-brand-700 hover:text-brand-800">
              가이드 전체
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
          <ul className="card mt-3 divide-y divide-line overflow-hidden">
            {featuredGuides.map((guide) => (
              <li key={guide.id}>
                <Link
                  href={`/guide#${guide.id}`}
                  className="focus-ring group flex items-center gap-3.5 px-4 py-3.5 transition-colors hover:bg-slate-50 md:px-5"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                    <guide.icon className="h-5 w-5" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-base font-semibold text-navy-900">{guide.title}</span>
                    <span className="mt-0.5 block truncate text-sm text-slate-500">
                      {guide.phrases.map((p) => `“${p}”`).join(" ")}
                    </span>
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-slate-300 group-hover:text-slate-500" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
