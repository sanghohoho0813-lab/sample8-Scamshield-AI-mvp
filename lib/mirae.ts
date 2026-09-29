/**
 * 미래AI랩 브릿지 CTA 설정.
 *
 * 링크와 문구는 모두 이 파일에서만 수정하면 모든 샘플 페이지에 반영된다.
 * (컴포넌트: components/SampleBridgeCTA.tsx)
 */

/** 이동 링크 — 여기만 바꾸면 전체 반영 */
export const MIRAE_LINKS = {
  /** 메인 CTA: 우리 회사도 만들어보기 */
  consultHref: "https://miraeailab.com/business-diagnosis",
  /** 서브: 다른 샘플 보기 */
  samplesHref: "https://miraeailab.com/business-services",
  /** 서브: 미래AI랩 홈페이지 */
  homeHref: "https://miraeailab.com/",
} as const;

/** CTA 문구 — 여기만 바꾸면 전체 반영 */
export const MIRAE_COPY = {
  badge: "미래AI랩 제안",
  headline: "이 샘플이 마음에 드셨다면,\n대표님 회사도 이렇게 설계해볼 수 있습니다.",
  credit: "이 샘플은 미래AI랩이 기획·제작했습니다",
  description:
    "미래AI랩은 평범한 회사를 기술·데이터·AI 기반의 성장형 기업으로 바꾸는 AX / MVP / 플랫폼 기획·개발을 진행합니다.",
  /** 메인 CTA 문구 (고정) */
  primaryCta: "우리 회사도 만들어보기",
  secondaryCta: "다른 샘플 보기",
  tertiaryCta: "미래AI랩 홈페이지",
} as const;
