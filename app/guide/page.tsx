import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, LifeBuoy, MessageSquareText, X } from "lucide-react";
import { GOLDEN_RULES, GUIDES } from "@/lib/guides";
import { keepDots } from "@/lib/typography";
import GuideNav from "@/components/GuideNav";

export const metadata: Metadata = {
  title: "안전 가이드",
};

export default function GuidePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-10">
      <h1 className="text-2xl font-bold tracking-tight text-navy-900 md:text-3xl">안전 가이드</h1>
      <p className="mt-1.5 max-w-2xl text-base text-slate-500">상황별로 자주 오는 문자와 확인 방법, 하지 말아야 할 행동을 정리했어요.</p>

      <Link
        href="/help"
        className="focus-ring mt-5 flex min-h-16 items-center gap-3 rounded-2xl border border-line bg-white px-5 py-4 hover:border-brand-200"
      >
        <LifeBuoy className="h-6 w-6 shrink-0 text-brand-600" aria-hidden />
        <span className="min-w-0 flex-1">
          <span className="block text-base font-bold text-navy-900">이미 링크를 눌렀거나 돈을 보냈나요?</span>
          <span className="block text-sm text-slate-500">상황별로 지금 할 일과 신고 전화번호를 알려드려요.</span>
        </span>
        <ArrowRight className="h-5 w-5 shrink-0 text-slate-400" aria-hidden />
      </Link>

      {/* 공통 원칙 */}
      <section aria-labelledby="rules-heading" className="mt-6 rounded-2xl bg-brand-50 px-5 py-6 md:px-8 md:py-7">
        <h2 id="rules-heading" className="text-lg font-bold tracking-tight text-navy-900">
          어떤 문자든 이 다섯 가지면 충분해요
        </h2>
        <ol className="mt-3 grid gap-x-10 gap-y-3 md:grid-cols-2">
          {GOLDEN_RULES.map((rule, i) => (
            <li key={rule} className="flex gap-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
                {i + 1}
              </span>
              <p className="text-base text-slate-800">{keepDots(rule)}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* 상황별 */}
      <section aria-labelledby="types-heading" className="mt-10">
        <h2 id="types-heading" className="text-xl font-bold tracking-tight text-navy-900">
          상황별 대처법
        </h2>
        <GuideNav />

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {GUIDES.map((guide) => (
            <article
              key={guide.id}
              id={guide.id}
              aria-labelledby={`${guide.id}-title`}
              className="card scroll-mt-32 px-5 py-5 transition-shadow target:border-brand-300 target:ring-4 target:ring-brand-100 md:px-6"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                  <guide.icon className="h-5 w-5" aria-hidden />
                </span>
                <h3 id={`${guide.id}-title`} className="text-lg font-bold text-navy-900">
                  {guide.title}
                </h3>
              </div>
              <p className="mt-2.5 text-base text-slate-600">{keepDots(guide.summary)}</p>

              {/* 대표 패턴 — 휴대폰에서 받은 문자처럼 보여준다 */}
              <div className="mt-4 rounded-2xl bg-surface px-3.5 pb-4 pt-3">
                <p className="flex items-center gap-1.5 text-sm font-semibold text-slate-500">
                  <MessageSquareText className="h-4 w-4" aria-hidden />
                  이런 문자가 와요
                </p>
                <p className="mt-2 max-w-[94%] rounded-2xl rounded-tl-md bg-white px-4 py-3 text-base text-slate-800 shadow-[var(--shadow-subtle)] ring-1 ring-line [overflow-wrap:anywhere]">
                  {keepDots(guide.example)}
                </p>
              </div>

              <div className="mt-4 grid gap-4 border-t border-line pt-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm font-bold text-slate-500">이렇게 확인하세요</p>
                  <ul className="mt-2 flex flex-col gap-2">
                    {guide.checks.map((item) => (
                      <li key={item} className="flex gap-2 text-base text-slate-800">
                        <Check className="mt-1 h-5 w-5 shrink-0 text-risk-low" aria-hidden />
                        {keepDots(item)}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-500">이것만은 하지 마세요</p>
                  <ul className="mt-2 flex flex-col gap-2">
                    {guide.donts.map((item) => (
                      <li key={item} className="flex gap-2 text-base text-slate-800">
                        <X className="mt-1 h-5 w-5 shrink-0 text-risk-high" aria-hidden />
                        {keepDots(item)}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <div className="mt-10 flex flex-col items-start gap-4 border-t border-line pt-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-lg font-bold text-navy-900">의심되는 문자를 받으셨나요?</p>
          <p className="mt-0.5 text-base text-slate-500">붙여넣기만 하면 위험 신호와 할 일을 바로 알려드려요.</p>
        </div>
        <Link href="/" className="btn-primary w-full sm:w-auto">
          문자 검사하기
        </Link>
      </div>
    </div>
  );
}
