import { ArrowUpRight } from "lucide-react";
import { MIRAE_COPY, MIRAE_LINKS } from "@/lib/mirae";

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
      className={`mx-auto max-w-6xl px-4 pb-12 pt-6 md:px-6 md:pb-16 md:pt-10 ${className}`}
    >
      <div className="rounded-3xl border border-brand-100 bg-gradient-to-b from-brand-50/70 to-white px-5 py-9 text-center md:px-12 md:py-12">
        <p className="text-sm font-bold tracking-wide text-brand-700">{MIRAE_COPY.badge}</p>

        <h2
          id="mirae-bridge-heading"
          className="mx-auto mt-3 max-w-2xl text-xl font-extrabold leading-snug tracking-tight text-navy-900 md:whitespace-pre-line md:text-2xl"
        >
          {MIRAE_COPY.headline}
        </h2>

        <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600">
          <strong className="font-bold text-navy-800">{MIRAE_COPY.credit}.</strong>{" "}
          {MIRAE_COPY.description}
        </p>

        <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <a
            href={consultHref}
            target="_blank"
            rel="noopener noreferrer"
            className="cta-sweep focus-ring inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-xl px-7 py-3.5 text-lg font-bold text-white sm:w-auto"
          >
            {MIRAE_COPY.primaryCta}
            <ArrowUpRight className="h-5 w-5 shrink-0" aria-hidden />
          </a>
          <a
            href={samplesHref}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary w-full sm:w-auto"
          >
            {MIRAE_COPY.secondaryCta}
          </a>
        </div>

        <a
          href={homeHref}
          target="_blank"
          rel="noopener noreferrer"
          className="focus-ring mt-4 inline-flex min-h-11 items-center gap-1 rounded-lg px-2 text-sm font-semibold text-slate-500 underline-offset-4 hover:text-navy-900 hover:underline"
        >
          {MIRAE_COPY.tertiaryCta}
          <ArrowUpRight className="h-4 w-4" aria-hidden />
        </a>
      </div>
    </section>
  );
}
