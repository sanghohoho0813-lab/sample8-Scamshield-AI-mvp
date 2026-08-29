import Link from "next/link";
import {
  ArrowRight,
  BookOpenText,
  BrainCircuit,
  ImageUp,
  LockKeyhole,
  MessageSquareText,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { FEATURED_SAMPLES } from "@/lib/samples";

const FEATURES = [
  {
    icon: BrainCircuit,
    color: "bg-brand-50 text-brand-600",
    title: "AI 기반 위험 신호 분석",
    description: "최신 사기 패턴을 바탕으로 문자의 위험 신호를 종합해 알려드립니다.",
  },
  {
    icon: LockKeyhole,
    color: "bg-emerald-50 text-emerald-600",
    title: "개인정보 보호",
    description: "업로드한 이미지는 분석 후 저장하지 않아 안심하고 사용할 수 있습니다.",
  },
  {
    icon: Users,
    color: "bg-rose-50 text-rose-600",
    title: "가족과 함께 보호",
    description: "분석 결과를 원터치로 공유해 부모님·가족 모두가 예방할 수 있습니다.",
  },
  {
    icon: BookOpenText,
    color: "bg-amber-50 text-amber-600",
    title: "지식으로 예방",
    description: "다양한 사례와 안전가이드를 통해 스스로 예방 능력을 키웁니다.",
  },
];

const STEPS = [
  {
    icon: MessageSquareText,
    color: "bg-brand-50 text-brand-600",
    badge: "bg-brand-600",
    title: "문자 붙여넣기",
    description: "받은 문자를 그대로 붙여넣거나 캡처 이미지를 올려주세요.",
  },
  {
    icon: ScanSearch,
    color: "bg-violet-50 text-violet-600",
    badge: "bg-violet-600",
    title: "AI 분석",
    description: "사칭·압박 표현, 링크, 연락처 패턴을 몇 초 만에 확인합니다.",
  },
  {
    icon: ShieldCheck,
    color: "bg-emerald-50 text-emerald-600",
    badge: "bg-emerald-600",
    title: "행동 가이드",
    description: "위험도와 함께 지금 해야 할 행동을 알기 쉽게 안내합니다.",
  },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 via-white to-surface">
        <div
          className="pointer-events-none absolute -top-32 left-1/2 h-96 w-[52rem] -translate-x-1/2 rounded-full bg-brand-100/60 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-teal-100/50 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-24 top-48 h-72 w-72 rounded-full bg-violet-100/50 blur-3xl"
          aria-hidden
        />
        <div className="relative mx-auto flex max-w-6xl flex-col items-center px-4 pb-12 pt-14 text-center md:px-6 md:pb-16 md:pt-20">
          <span className="flex items-center gap-1.5 rounded-full border border-brand-200 bg-white px-3.5 py-1.5 text-xs font-bold text-brand-700 shadow-sm md:text-sm">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            AI 사기문자·스미싱 위험도 판독
          </span>
          <h1 className="mt-5 text-3xl font-extrabold leading-tight tracking-tight text-navy-900 md:text-5xl">
            이 문자, 눌러도
            <br className="md:hidden" /> 괜찮을까요?
          </h1>
          <p className="mt-4 max-w-xl text-[1.40625rem] leading-relaxed text-slate-600 md:text-lg">
            의심스러운 문자나 링크를 넣으면
            <br className="md:hidden" /> 위험 신호를 쉽고 빠르게 확인해드립니다.
          </p>
          <div className="mt-7 flex w-full max-w-md flex-col gap-3 sm:flex-row">
            <Link href="/analyze" className="btn-primary flex-1 text-base">
              <ScanSearch className="h-5 w-5" aria-hidden />
              문자 검사하기
            </Link>
            <Link href={`/analyze?sample=${FEATURED_SAMPLES[0].id}`} className="btn-secondary flex-1 text-base">
              샘플 문자로 체험하기
            </Link>
          </div>
          <p className="mt-4 text-xs text-slate-400">
            가입 없이 바로 사용 · 참고용 위험 신호 분석 서비스
          </p>
        </div>
      </section>

      {/* 이용 순서 */}
      <section className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-14">
        <h2 className="text-center text-xl font-extrabold tracking-tight text-navy-900 md:text-2xl">
          10초면 충분해요
        </h2>
        <div className="mt-6 grid gap-3.5 md:mt-8 md:grid-cols-3 md:gap-5">
          {STEPS.map((step, i) => (
            <div key={step.title} className="card flex items-start gap-4 px-5 py-5 md:flex-col md:gap-3 md:px-6 md:py-6">
              <span className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${step.color}`}>
                <step.icon className="h-6 w-6" aria-hidden />
                <span className={`absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full text-[1.03125rem] font-bold text-white ${step.badge}`}>
                  {i + 1}
                </span>
              </span>
              <div>
                <h3 className="text-[1.40625rem] font-bold text-navy-900 md:text-base">{step.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-500">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 샘플 체험 */}
      <section className="mx-auto max-w-6xl px-4 pb-10 md:px-6 md:pb-14">
        <div className="card overflow-hidden">
          <div className="border-b border-line bg-gradient-to-r from-brand-600 to-brand-500 px-5 py-6 text-white md:px-8 md:py-7">
            <h2 className="flex items-center gap-2 text-lg font-extrabold md:text-xl">
              <ImageUp className="h-5 w-5" aria-hidden />
              샘플 문자로 10초 체험
            </h2>
            <p className="mt-1 text-sm text-brand-100 md:text-[1.40625rem]">
              실제 스미싱과 유사한 샘플로 분석 과정을 바로 확인해보세요.
            </p>
          </div>
          <div className="grid gap-2.5 px-4 py-5 sm:grid-cols-2 md:grid-cols-3 md:gap-3 md:px-6">
            {FEATURED_SAMPLES.map((sample) => (
              <Link
                key={sample.id}
                href={`/analyze?sample=${sample.id}`}
                className="group rounded-2xl border border-line bg-white px-4 py-3.5 transition-all hover:border-brand-300 hover:shadow-card"
              >
                <p className="flex items-center justify-between text-sm font-bold text-navy-900">
                  {sample.label}
                  <ArrowRight
                    className="h-4 w-4 text-slate-300 transition-all group-hover:translate-x-0.5 group-hover:text-brand-500"
                    aria-hidden
                  />
                </p>
                <p className="mt-1 line-clamp-2 text-[1.21875rem] leading-relaxed text-slate-500">
                  {sample.text}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 특징 */}
      <section className="mx-auto max-w-6xl px-4 pb-12 md:px-6 md:pb-16">
        <div className="grid gap-3.5 sm:grid-cols-2 md:grid-cols-4 md:gap-5">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="card px-5 py-5 md:px-6 md:py-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                <feature.icon className="h-5.5 w-5.5" aria-hidden />
              </span>
              <h3 className="mt-3 text-[1.40625rem] font-bold text-navy-900">{feature.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-500">{feature.description}</p>
            </div>
          ))}
        </div>
        <p className="mt-8 text-center text-xs leading-relaxed text-slate-400 md:text-[1.21875rem]">
          이 서비스의 결과는 참고용 위험 신호 분석이며 실제 사기 여부를 확정하는 판정이 아닙니다.
          <br className="hidden md:block" /> 금융기관·공공기관 등은 공식 홈페이지나 공식 대표번호를
          통해 직접 확인해주세요.
        </p>
      </section>
    </div>
  );
}
