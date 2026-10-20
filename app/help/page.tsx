import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, Phone, ScanSearch, ShieldBan } from "lucide-react";
import RecoveryPicker from "@/components/RecoveryPicker";
import { CONTACT_LIST } from "@/lib/recovery";
import { keepDots } from "@/lib/typography";
import PageHeader from "@/components/PageHeader";

export const metadata: Metadata = {
  title: "피해 대응",
  description: "사기 문자의 링크를 눌렀거나, 개인정보·인증번호를 알려줬거나, 돈을 보냈을 때 지금 할 일을 순서대로 알려드려요.",
};

const PREVENTION = [
  { title: "내 이름으로 휴대폰 개통 막기", note: "명의도용 방지 서비스(엠세이퍼)", href: "https://www.msafer.or.kr" },
  { title: "내 이름으로 새 금융거래 막기", note: "금융감독원 개인정보노출자 사고예방", href: "https://pd.fss.or.kr" },
];

export default function HelpPage() {
  const [primary, ...others] = CONTACT_LIST;
  return (
    <div className="mx-auto max-w-2xl px-4 py-6 md:px-6 md:py-10">
      <PageHeader eyebrow="피해 대응" title="이미 링크를 눌렀거나 돈을 보냈나요?">
        당황하지 않아도 돼요. 어떤 상황인지 고르면 지금 할 일을 순서대로 알려드려요.
      </PageHeader>

      <section aria-label="상황별 대처" className="card mt-6 px-4 py-5 md:px-6">
        <RecoveryPicker syncHash idPrefix="help" />
      </section>

      {/* 신고·상담 전화 — 급한 순서 */}
      <section aria-labelledby="contacts-heading" className="mt-10">
        <h2 id="contacts-heading" className="text-lg font-bold text-navy-900">
          신고·상담 전화
        </h2>
        <a
          href={`tel:${primary.tel}`}
          className="focus-ring press mt-3 flex min-h-[4.5rem] items-center gap-4 rounded-2xl bg-navy-900 px-5 py-4 text-white hover:bg-navy-800"
        >
          <Phone className="h-6 w-6 shrink-0" aria-hidden />
          <span className="min-w-0 flex-1">
            <span className="block text-lg font-bold">
              <span className="tabular-nums">{primary.tel}</span> {primary.name}
            </span>
            <span className="block text-base text-white/80">{keepDots(primary.when)}</span>
          </span>
          <span className="shrink-0 text-base font-semibold">전화</span>
        </a>
        <ul className="card mt-2.5 divide-y divide-line overflow-hidden">
          {others.map((c) => (
            <li key={c.tel}>
              <a href={`tel:${c.tel}`} className="focus-ring flex min-h-16 items-center gap-4 px-5 py-3.5 hover:bg-slate-50">
                <Phone className="h-5 w-5 shrink-0 text-brand-600" aria-hidden />
                <span className="min-w-0 flex-1">
                  <span className="block text-base font-bold text-navy-900">
                    <span className="tabular-nums">{c.tel}</span> {c.name}
                  </span>
                  <span className="block text-sm text-slate-500">{keepDots(c.when)}</span>
                </span>
                <span className="shrink-0 text-base font-semibold text-brand-700">전화</span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      {/* 함께 해두면 좋은 것 */}
      <section aria-labelledby="prevent-heading" className="mt-10">
        <h2 id="prevent-heading" className="text-lg font-bold text-navy-900">
          함께 해두면 좋아요
        </h2>
        <ul className="card mt-3 divide-y divide-line overflow-hidden">
          {PREVENTION.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="focus-ring flex min-h-16 items-center gap-4 px-5 py-3.5 hover:bg-slate-50"
              >
                <span className="min-w-0 flex-1">
                  <span className="block text-base font-bold text-navy-900">{item.title}</span>
                  <span className="block text-sm text-slate-500">{item.note}</span>
                </span>
                <ExternalLink className="h-5 w-5 shrink-0 text-slate-400" aria-hidden />
                <span className="sr-only">(새 창)</span>
              </a>
            </li>
          ))}
          <li className="flex gap-4 px-5 py-4">
            <ShieldBan className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" aria-hidden />
            <span className="text-base text-slate-700">
              받은 문자는 지우기 전에 휴대폰 문자 앱에서 <b className="text-navy-900">스팸 신고</b>와 <b className="text-navy-900">번호 차단</b>을
              해두세요. 신고 기록은 수사와 피해 구제에 도움이 돼요.
            </span>
          </li>
        </ul>
      </section>

      <div className="mt-10 border-t border-line pt-8">
        <Link href="/" className="btn-secondary w-full sm:w-auto">
          <ScanSearch className="h-5 w-5" aria-hidden />
          받은 문자부터 검사하기
        </Link>
      </div>
    </div>
  );
}
