/** 배포 주소 — OG 이미지·사이트맵 절대 경로에 쓴다. 배포 환경에서 NEXT_PUBLIC_SITE_URL로 지정 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");

export const SITE_NAME = "ScamShield";
export const SITE_DESCRIPTION = "의심스러운 문자를 붙여넣으면 위험 신호와 지금 해야 할 행동을 쉽고 빠르게 알려드려요.";
