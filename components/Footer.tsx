import { MiraeLogo } from "./BrandMark";

export default function Footer() {
  return (
    <footer className="border-t border-line bg-white/60">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-8 text-center md:flex-row md:justify-between md:px-6 md:py-9 md:text-left">
        <div className="flex flex-col items-center gap-2.5 md:items-start">
          <MiraeLogo width={148} className="h-auto w-[148px] md:w-[164px]" />
          <p className="text-xs leading-relaxed text-slate-400">
            ScamShield는 미래에이아이랩이 만든 AI 사기문자 판독 서비스입니다.
          </p>
        </div>
        <p className="max-w-md text-xs leading-relaxed text-slate-400 md:text-right">
          본 서비스의 분석 결과는 참고용 위험 신호 안내이며, 실제 사기 여부를 확정하는 판정이
          아닙니다.
          <br />© {new Date().getFullYear()} MIRAE AI LAB. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
