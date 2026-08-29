import type { Metadata } from "next";
import Link from "next/link";
import {
  BrainCircuit,
  HeartHandshake,
  ScanSearch,
  ShieldCheck,
  Smartphone,
  Users,
} from "lucide-react";

export const metadata: Metadata = {
  title: "서비스 소개",
};

const VALUES = [
  {
    icon: BrainCircuit,
    color: "bg-brand-50 text-brand-600",
    title: "쉽게 설명하는 AI 분석",
    description:
      "어려운 보안 용어 대신, 왜 위험한지와 지금 무엇을 해야 하는지를 누구나 이해할 수 있는 말로 설명합니다.",
  },
  {
    icon: Smartphone,
    color: "bg-teal-50 text-teal-600",
    title: "받은 즉시, 그 자리에서",
    description:
      "의심 문자를 받은 그 순간 스마트폰에서 바로 붙여넣어 확인할 수 있도록 모바일 경험을 최우선으로 설계했습니다.",
  },
  {
    icon: Users,
    color: "bg-rose-50 text-rose-600",
    title: "가족을 함께 지키는 도구",
    description:
      "부모님이 받은 문자를 자녀가 대신 확인하고, 분석 결과를 공유해 온 가족이 함께 예방할 수 있습니다.",
  },
  {
    icon: HeartHandshake,
    color: "bg-violet-50 text-violet-600",
    title: "판정이 아닌 안내",
    description:
      "‘100% 사기’ 같은 단정 대신 위험 신호를 안내하고, 항상 공식 채널을 통한 재확인을 권장합니다.",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:py-12">
      <div className="text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-brand-600 text-white shadow-card">
          <ShieldCheck className="h-8 w-8" aria-hidden />
        </span>
        <h1 className="mt-5 text-2xl font-extrabold tracking-tight text-navy-900 md:text-3xl">
          ScamShield
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-[1.40625rem] leading-relaxed text-slate-600 md:text-base">
          받은 문자나 메시지가 의심스러울 때, 내용을 넣으면 위험 신호를 쉽게 설명해주는
          <br className="hidden md:block" /> AI 안전보조 서비스입니다.
        </p>
      </div>

      <div className="mt-8 grid gap-3.5 md:grid-cols-2 md:gap-4">
        {VALUES.map((value) => (
          <div key={value.title} className="card px-5 py-5 md:px-6">
            <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${value.color}`}>
              <value.icon className="h-5.5 w-5.5" aria-hidden />
            </span>
            <h2 className="mt-3 text-[1.40625rem] font-bold text-navy-900 md:text-base">{value.title}</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{value.description}</p>
          </div>
        ))}
      </div>

      <div className="card mt-8 px-5 py-6 md:px-8">
        <h2 className="text-base font-extrabold text-navy-900">이런 문자에 도움이 돼요</h2>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {[
            "금융기관 사칭",
            "정부기관 사칭",
            "택배 사칭",
            "과태료·범칙금 사칭",
            "가족·지인 사칭",
            "투자 권유",
            "대출 권유",
            "악성 링크 포함",
            "계정 탈취 유도",
            "개인정보 요구",
            "긴급 송금 요구",
            "이벤트·쿠폰 위장",
          ].map((t) => (
            <span key={t} className="rounded-lg bg-brand-50 px-2.5 py-1.5 text-[1.21875rem] font-semibold text-brand-700">
              {t}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-8 text-center">
        <Link href="/analyze" className="btn-primary text-base">
          <ScanSearch className="h-5 w-5" aria-hidden />
          지금 문자 검사하기
        </Link>
        <p className="mt-4 text-xs leading-relaxed text-slate-400">
          이 서비스의 결과는 참고용 위험 신호 분석이며 실제 사기 여부를 확정하는 판정이 아닙니다.
        </p>
      </div>
    </div>
  );
}
