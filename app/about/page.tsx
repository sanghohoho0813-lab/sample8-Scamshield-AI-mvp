import type { Metadata } from "next";
import Link from "next/link";
import { Check, Minus } from "lucide-react";

export const metadata: Metadata = {
  title: "서비스 소개",
};

const PRINCIPLES = [
  {
    title: "판정이 아닌 안내",
    description: "‘100% 사기’ 같은 단정 대신 위험 신호를 알려드리고, 항상 공식 채널에서 다시 확인하도록 안내합니다.",
  },
  {
    title: "쉽게, 행동 중심으로",
    description: "어려운 보안 용어 대신 왜 위험한지, 지금 무엇을 하면 되는지를 먼저 보여드립니다.",
  },
  {
    title: "받은 그 자리에서",
    description: "문자를 받은 순간 스마트폰에서 바로 붙여넣어 확인할 수 있도록 모바일을 기준으로 설계했습니다.",
  },
  {
    title: "가족과 함께",
    description: "부모님이 받은 문자를 자녀가 대신 확인하고, 결과를 메신저로 바로 공유할 수 있습니다.",
  },
];

const SCOPE_DONE = [
  "사칭·압박·금전·개인정보 요구 표현을 찾는 규칙 기반 분석",
  "링크(단축 URL·의심 도메인)와 연락처 형식 점검",
  "검사 기록 저장·다시 보기·삭제 (이 기기에만 저장)",
  "결과 공유 (휴대폰 공유 창 또는 복사)",
];

const SCOPE_NOT_YET = [
  "대규모 언어모델(LLM) 기반 AI 분석 — 연결 구조만 준비됨",
  "실제 이미지 문자 인식(OCR) — 현재는 예시 문장으로 대체",
  "링크 실제 접속·악성코드 검사, 전화번호 소유자 조회",
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-6 md:px-6 md:py-10">
      <p className="text-sm font-bold text-brand-700">서비스 소개</p>
      <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-navy-900 md:text-3xl">
        의심 문자 앞에서, 몇 초 안에 판단을 돕습니다
      </h1>
      <p className="mt-3 text-base text-slate-600 md:text-lg">
        ScamShield는 받은 문자나 메시지가 의심스러울 때, 내용을 넣으면 위험 신호와 지금 해야 할 행동을 쉽게
        설명해주는 안전 보조 서비스입니다.
      </p>

      <section aria-labelledby="principles-heading" className="mt-10">
        <h2 id="principles-heading" className="text-xl font-bold text-navy-900">
          이렇게 만들었어요
        </h2>
        <dl className="mt-4 grid gap-x-10 gap-y-6 sm:grid-cols-2">
          {PRINCIPLES.map((p) => (
            <div key={p.title} className="border-l-2 border-brand-200 pl-4">
              <dt className="text-lg font-bold text-navy-900">{p.title}</dt>
              <dd className="mt-1 text-base text-slate-600">{p.description}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="scope-heading" className="mt-12">
        <h2 id="scope-heading" className="text-xl font-bold text-navy-900">
          현재 데모에서 되는 것과 아직 안 되는 것
        </h2>
        <div className="card mt-4 grid divide-y divide-line overflow-hidden md:grid-cols-2 md:divide-x md:divide-y-0">
          <div className="px-5 py-5">
            <h3 className="text-base font-bold text-navy-900">지금 동작해요</h3>
            <ul className="mt-3 flex flex-col gap-2.5">
              {SCOPE_DONE.map((item) => (
                <li key={item} className="flex gap-2 text-base text-slate-700">
                  <Check className="mt-1 h-4 w-4 shrink-0 text-brand-600" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="px-5 py-5">
            <h3 className="text-base font-bold text-navy-900">아직 연결 전이에요</h3>
            <ul className="mt-3 flex flex-col gap-2.5">
              {SCOPE_NOT_YET.map((item) => (
                <li key={item} className="flex gap-2 text-base text-slate-500">
                  <Minus className="mt-1 h-4 w-4 shrink-0 text-slate-400" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <div className="mt-10">
        <Link href="/" className="btn-primary w-full sm:w-auto">
          문자 검사하기
        </Link>
      </div>
    </div>
  );
}
