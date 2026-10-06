import type { Metadata } from "next";
import Link from "next/link";
import { GOLDEN_RULES, GUIDES } from "@/lib/guides";

export const metadata: Metadata = {
  title: "안전 가이드",
};

export default function GuidePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-10">
      <h1 className="text-2xl font-extrabold tracking-tight text-navy-900 md:text-3xl">안전 가이드</h1>
      <p className="mt-1.5 max-w-2xl text-base text-slate-500">
        어떤 문자든 아래 다섯 가지만 지키면 대부분의 피해를 막을 수 있어요. 유형별로 자주 쓰이는 문구도 함께 확인해보세요.
      </p>

      {/* 공통 원칙 */}
      <section aria-labelledby="rules-heading" className="mt-7 rounded-2xl bg-brand-50 px-5 py-6 md:px-8 md:py-7">
        <h2 id="rules-heading" className="text-lg font-bold text-navy-900">
          먼저 기억할 5가지
        </h2>
        <ol className="mt-3 grid gap-x-10 gap-y-3 md:grid-cols-2">
          {GOLDEN_RULES.map((rule, i) => (
            <li key={rule} className="flex gap-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
                {i + 1}
              </span>
              <p className="text-base text-slate-800">{rule}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* 유형별 */}
      <section aria-labelledby="types-heading" className="mt-10">
        <h2 id="types-heading" className="text-xl font-bold text-navy-900">
          유형별로 조심할 문구
        </h2>
        <nav aria-label="유형 바로가기" className="-mx-4 mt-3 overflow-x-auto px-4 pb-1 md:mx-0 md:px-0">
          <ul className="flex w-max gap-2 md:w-auto md:flex-wrap">
            {GUIDES.map((guide) => (
              <li key={guide.id}>
                <a
                  href={`#${guide.id}`}
                  className="focus-ring inline-flex min-h-11 items-center whitespace-nowrap rounded-full border border-line bg-white px-4 text-sm font-semibold text-slate-600 hover:border-brand-200 hover:text-navy-900"
                >
                  {guide.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {GUIDES.map((guide) => (
            <article
              key={guide.id}
              id={guide.id}
              className="card scroll-mt-24 px-5 py-5 transition-shadow target:border-brand-300 target:ring-4 target:ring-brand-100 md:scroll-mt-32"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                  <guide.icon className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="text-lg font-bold text-navy-900">{guide.title}</h3>
              </div>
              <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="조심할 문구">
                {guide.phrases.map((p) => (
                  <li key={p} className="rounded-full border border-line bg-slate-50 px-3 py-1 text-sm font-medium text-slate-700">
                    “{p}”
                  </li>
                ))}
              </ul>
              <p className="mt-4 border-t border-line pt-4 text-base text-slate-700">{guide.tip}</p>
            </article>
          ))}
        </div>
      </section>

      <div className="mt-10 flex flex-col items-start gap-4 border-t border-line pt-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-lg font-bold text-navy-900">의심되는 문자를 받으셨나요?</p>
          <p className="mt-0.5 text-base text-slate-500">붙여넣기만 하면 위험 신호를 바로 알려드려요.</p>
        </div>
        <Link href="/" className="btn-primary w-full sm:w-auto">
          문자 검사하기
        </Link>
      </div>
    </div>
  );
}
