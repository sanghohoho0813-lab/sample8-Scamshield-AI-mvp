import type { Metadata } from "next";
import Link from "next/link";
import {
  Banknote,
  Building2,
  HeartHandshake,
  KeyRound,
  Landmark,
  Link2,
  PiggyBank,
  ScanSearch,
  TrendingUp,
  Truck,
} from "lucide-react";

export const metadata: Metadata = {
  title: "안전가이드",
};

const GUIDES = [
  {
    icon: Landmark,
    title: "금융기관 사칭",
    color: "bg-indigo-50 text-indigo-600",
    phrases: ["이상 거래 확인", "계좌 정지 예정", "즉시 본인 인증"],
    tip: "은행·카드사는 문자 링크로 본인 인증을 요구하지 않아요. 공식 앱이나 대표번호로 확인하세요.",
  },
  {
    icon: Building2,
    title: "정부기관 사칭",
    color: "bg-blue-50 text-blue-600",
    phrases: ["미납", "과태료", "출석 요구"],
    tip: "과태료·범칙금은 정부24, 이파인 등 공식 사이트에서 직접 조회하세요.",
  },
  {
    icon: Truck,
    title: "택배 사칭",
    color: "bg-cyan-50 text-cyan-600",
    phrases: ["주소 오류", "반송 예정", "배송 확인"],
    tip: "주문한 적 없는 배송 안내라면 링크를 누르지 말고, 택배사 공식 앱에서 운송장 번호로 조회하세요.",
  },
  {
    icon: HeartHandshake,
    title: "가족·지인 사칭",
    color: "bg-rose-50 text-rose-600",
    phrases: ["휴대폰 고장", "급하게 송금", "상품권 구매"],
    tip: "가족이 급히 돈을 요구하면, 반드시 원래 알던 번호로 전화해 목소리를 확인하세요.",
  },
  {
    icon: TrendingUp,
    title: "투자사기",
    color: "bg-amber-50 text-amber-600",
    phrases: ["고수익 보장", "오늘만 공개", "리딩방 입장"],
    tip: "수익을 보장한다는 말 자체가 위험 신호예요. 원금 보장 고수익은 존재하지 않습니다.",
  },
  {
    icon: PiggyBank,
    title: "대출사기",
    color: "bg-emerald-50 text-emerald-600",
    phrases: ["무담보 당일 대출", "정부지원 대상자", "선입금 수수료"],
    tip: "대출 전에 수수료·보증금을 먼저 요구하면 사기예요. 제도권 금융회사인지 먼저 확인하세요.",
  },
  {
    icon: KeyRound,
    title: "개인정보 탈취",
    color: "bg-violet-50 text-violet-600",
    phrases: ["인증번호 입력", "비밀번호 확인", "본인 확인 필요"],
    tip: "인증번호는 ‘내가 요청했을 때’만 사용하는 거예요. 남이 알려달라는 인증번호는 절대 알려주지 마세요.",
  },
  {
    icon: Link2,
    title: "스미싱 링크",
    color: "bg-pink-50 text-pink-600",
    phrases: ["단축 URL", "앱 설치 유도", ".top .xyz 도메인"],
    tip: "출처가 불분명한 링크로 설치한 앱은 휴대폰 정보를 훔칠 수 있어요. 공식 앱스토어만 이용하세요.",
  },
];

const TYPE_CARDS = [
  {
    icon: Truck,
    title: "택배형",
    keywords: ["주소 오류", "반송 예정", "배송 확인"],
  },
  {
    icon: Building2,
    title: "기관 사칭형",
    keywords: ["미납", "정지", "과태료"],
  },
  {
    icon: HeartHandshake,
    title: "지인 사칭형",
    keywords: ["휴대폰 고장", "급하게 송금", "인증번호"],
  },
  {
    icon: Banknote,
    title: "금전 유인형",
    keywords: ["고수익", "당일 대출", "당첨"],
  },
];

export default function GuidePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-6 md:py-10">
      <h1 className="text-2xl font-extrabold tracking-tight text-navy-900 md:text-3xl">안전가이드</h1>
      <p className="mt-2 text-[1.6875rem] text-slate-500">
        유형별로 이런 문구를 조심하세요. 알고 있으면 당하지 않아요.
      </p>

      {/* 사기 유형 카드 */}
      <div className="mt-6 grid grid-cols-2 gap-2.5 md:grid-cols-4 md:gap-3.5">
        {TYPE_CARDS.map((card) => (
          <div key={card.title} className="card px-4 py-4 text-center md:py-5">
            <card.icon className="mx-auto h-6 w-6 text-brand-600" aria-hidden />
            <p className="mt-2 text-sm font-extrabold text-navy-900">{card.title}</p>
            <div className="mt-2 flex flex-wrap justify-center gap-1">
              {card.keywords.map((k) => (
                <span key={k} className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[1.2375rem] font-semibold text-slate-600">
                  {k}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 상세 가이드 */}
      <div className="mt-8 grid gap-3.5 md:grid-cols-2 md:gap-4">
        {GUIDES.map((guide) => (
          <div key={guide.title} className="card px-5 py-5 transition-shadow hover:shadow-card-lg">
            <div className="flex items-center gap-3">
              <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${guide.color}`}>
                <guide.icon className="h-5.5 w-5.5" aria-hidden />
              </span>
              <h2 className="text-[1.6875rem] font-extrabold text-navy-900 md:text-base">{guide.title}</h2>
            </div>
            <p className="mt-3 text-xs font-bold text-slate-400">이런 문구를 조심하세요</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {guide.phrases.map((p) => (
                <span key={p} className="rounded-lg bg-risk-very-bg px-2 py-1 text-xs font-bold text-risk-very">
                  “{p}”
                </span>
              ))}
            </div>
            <p className="mt-3 rounded-xl bg-slate-50 px-3.5 py-2.5 text-sm leading-relaxed text-slate-700">
              {guide.tip}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-col items-center gap-3 rounded-[1.25rem] bg-gradient-to-r from-brand-600 to-brand-500 px-6 py-8 text-center shadow-card">
        <p className="text-lg font-extrabold text-white">의심되는 문자가 있나요?</p>
        <p className="text-sm text-brand-100">지금 바로 넣어보면 위험 신호를 확인해드려요.</p>
        <Link
          href="/analyze"
          className="mt-1 inline-flex min-h-12 items-center gap-2 rounded-xl bg-white px-6 py-3 font-bold text-brand-700 shadow-sm transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <ScanSearch className="h-5 w-5" aria-hidden />
          문자 검사하기
        </Link>
      </div>
    </div>
  );
}
