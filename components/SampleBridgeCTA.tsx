import { ArrowUpRight, LayoutGrid, Sparkles } from "lucide-react";
import { MIRAE_COPY, MIRAE_LINKS } from "@/lib/mirae";
import { MiraeMark } from "./BrandMark";

interface SampleBridgeCTAProps {
  /** 메인 CTA(우리 회사도 만들어보기) 링크 */
  consultHref?: string;
  /** 다른 샘플 보기 링크 */
  samplesHref?: string;
  /** 미래AI랩 홈페이지 링크 */
  homeHref?: string;
  className?: string;
}

/**
 * 샘플 페이지 공통 브릿지 CTA.
 *
 * 샘플을 다 본 사용자를 상담(메인) → 다른 샘플 / 홈페이지(보조)로 연결한다.
 * 링크·문구 기본값은 lib/mirae.ts에서 관리한다.
 */
export default function SampleBridgeCTA({
  consultHref = MIRAE_LINKS.consultHref,
  samplesHref = MIRAE_LINKS.samplesHref,
  homeHref = MIRAE_LINKS.homeHref,
  className = "",
}: SampleBridgeCTAProps) {
  return (
    <section
      aria-labelledby="mirae-bridge-heading"
      className={`mx-auto max-w-4xl px-4 pb-12 pt-4 md:px-6 md:pb-16 md:pt-8 ${className}`}
    >
      <div className="relative overflow-hidden rounded-[1.75rem] border border-brand-100 bg-gradient-to-br from-white via-brand-50/50 to-teal-50/40 px-5 py-8 shadow-card sm:px-8 md:px-12 md:py-12">
        {/* 은은한 배경 광원 */}
        <div
          className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-brand-100/40 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-teal-100/40 blur-3xl"
          aria-hidden
        />

        <div className="relative flex flex-col items-center text-center">
          {/* 1. 배지 */}
          <span className="badge-shimmer inline-flex items-center gap-1.5 rounded-full border border-brand-200/80 bg-white/80 px-3.5 py-1.5 text-xs font-bold tracking-wide text-brand-700 shadow-sm">
            <MiraeMark size={15} className="h-[15px] w-[15px]" />
            {MIRAE_COPY.badge}
          </span>

          {/* 2. 헤드라인 */}
          <h2
            id="mirae-bridge-heading"
            className="mt-5 break-keep text-lg font-extrabold leading-snug tracking-tight text-navy-900 md:whitespace-pre-line md:text-2xl"
          >
            {MIRAE_COPY.headline}
          </h2>

          {/* 3. 미래AI랩 소개 */}
          <p className="mt-4 break-keep text-sm font-bold text-brand-700 md:text-base">
            {MIRAE_COPY.credit}
          </p>
          <p className="mt-2 max-w-2xl break-keep text-sm leading-relaxed text-slate-500">
            {MIRAE_COPY.description}
          </p>

          {/* 4. 메인 CTA */}
          <a
            href={consultHref}
            target="_blank"
            rel="noopener noreferrer"
            className="cta-sweep group mt-7 inline-flex min-h-14 w-full max-w-sm items-center justify-center gap-2 break-keep rounded-2xl px-5 py-4 text-center text-sm font-bold text-white transition-all duration-300 hover:-translate-y-0.5 sm:w-auto sm:px-8 sm:text-base"
          >
            <Sparkles className="hidden h-5 w-5 shrink-0 sm:block" aria-hidden />
            {MIRAE_COPY.primaryCta}
            <ArrowUpRight
              className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 sm:h-5 sm:w-5"
              aria-hidden
            />
          </a>

          {/* 5. 서브 액션 */}
          <div className="mt-5 flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row sm:gap-4">
            <a
              href={samplesHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 break-keep rounded-xl border border-brand-200 bg-white/80 px-5 py-3 text-sm font-bold text-brand-700 transition-colors hover:border-brand-300 hover:bg-white sm:w-auto"
            >
              <LayoutGrid className="h-4 w-4" aria-hidden />
              {MIRAE_COPY.secondaryCta}
            </a>
            <a
              href={homeHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 items-center justify-center gap-1 break-keep rounded-xl px-3 py-3 text-center text-sm font-semibold text-slate-500 underline-offset-4 transition-colors hover:text-navy-900 hover:underline"
            >
              {MIRAE_COPY.tertiaryCta}
              <ArrowUpRight className="h-4 w-4" aria-hidden />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
