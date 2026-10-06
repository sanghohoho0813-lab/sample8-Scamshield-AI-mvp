import type { AnalysisResult, HighlightSpan, RiskLevel, SignalCategory } from "./types";

/**
 * 결과 화면 표현 규칙.
 * 엔진 결과(저장된 과거 기록 포함)를 사람이 훑어보기 쉬운 문장으로 바꾼다.
 */

const HEADLINES: Record<RiskLevel, string> = {
  "very-high": "위험 신호가 많이 발견됐어요",
  high: "주의가 필요한 문자예요",
  caution: "몇 가지 의심스러운 점이 있어요",
  low: "강한 위험 신호는 보이지 않아요",
};

export function verdictHeadline(r: AnalysisResult): string {
  return HEADLINES[r.level];
}

const q = (s: string) => `“${s.length > 14 ? `${s.slice(0, 14)}…` : s}”`;

const REASONS: Record<SignalCategory, (match?: string) => string> = {
  impersonation: (m) => (m ? `${q(m)} 같은 기관·회사 이름을 내세워요` : "기관·회사 이름을 내세워요"),
  urgency: (m) => (m ? `${q(m)}처럼 서두르게 만드는 표현이 있어요` : "서두르게 만드는 표현이 있어요"),
  link: () => "링크로 접속을 유도해요",
  credential: (m) => (m ? `${q(m)} 등 개인정보 입력을 요구해요` : "개인정보 입력을 요구해요"),
  money: (m) => (m ? `${q(m)} 등 돈과 관련된 행동을 요구해요` : "돈과 관련된 행동을 요구해요"),
  emotion: (m) => (m ? `${q(m)} 등 가족·혜택을 내세워 경계를 늦춰요` : "가족·혜택을 내세워 경계를 늦춰요"),
};

/** 왜 위험한지 — 짧은 이유 최대 3개 (낮음 단계는 빈 배열) */
export function verdictReasons(r: AnalysisResult): string[] {
  if (r.level === "low") return [];
  const suspiciousUrl = r.urls.find((u) => u.suspiciousTld || u.officialMismatch);
  const reasons = r.signals.slice(0, 3).map((s) => {
    if (s.category === "link") {
      if (suspiciousUrl) return "공식 주소가 아닌 것으로 보이는 링크가 있어요";
      if (r.urls.some((u) => u.isShortened)) return "목적지를 숨긴 단축 링크가 있어요";
    }
    return REASONS[s.category](s.category === "link" ? undefined : pickMatch(s.category, s.matches));
  });
  // 기관·금전 안내를 개인 휴대폰 번호로 받게 하는 것은 그 자체로 강한 신호
  const mobile = r.phones.some((p) => p.type === "개인 휴대폰 번호");
  const official = r.signals.some((s) => s.category === "impersonation" || s.category === "money");
  if (mobile && official) {
    reasons.splice(Math.min(reasons.length, 2), reasons.length >= 3 ? 1 : 0, "개인 휴대폰 번호로 연락하게 해요");
  }
  return reasons;
}

/** 사칭 이유에는 '배송' 같은 일반 단어보다 실제 기관·회사 이름을 인용한다 */
const GENERIC_WORDS = /^(배송|운송장|물류)$/;
function pickMatch(category: SignalCategory, matches: string[]): string | undefined {
  if (category !== "impersonation") return matches[0];
  const names = matches.filter((m) => !GENERIC_WORDS.test(m));
  return names.sort((a, b) => b.length - a.length)[0];
}

/** 엔진의 행동 목록에서 '이미 행동한 경우'의 대처 문장은 별도 안내로 분리한다 */
export function preventionActions(r: AnalysisResult): string[] {
  return r.actions.filter((a) => !/^이미 |신고하세요/.test(a));
}

/** 이미 링크를 눌렀거나 송금했을 때 — 바로 걸 수 있는 연락처 */
export const EMERGENCY_CONTACTS = [
  { tel: "112", name: "경찰청", note: "사기 피해 신고·지급정지" },
  { tel: "1332", name: "금융감독원", note: "금융 피해 상담" },
  { tel: "118", name: "한국인터넷진흥원", note: "개인정보 유출·스미싱 상담" },
] as const;

export const RECOVERY_STEPS = [
  "송금했거나 계좌·카드 정보를 입력했다면, 바로 은행·카드사 고객센터에 지급정지를 요청하세요.",
  "모르는 앱이 설치됐다면 삭제하고, 휴대폰 백신으로 검사하세요.",
  "인증번호를 알려줬다면 해당 서비스 비밀번호를 바로 바꾸세요.",
];

/** 원문 하이라이트: '배송'·'택배' 같은 일상 단어는 빼고 실제로 주의할 표현만 강조한다 */
const EVERYDAY_WORDS = /^(배송|택배|운송장|물류)$/;
export function visibleHighlights(r: AnalysisResult): HighlightSpan[] {
  return r.highlights.filter((h) => !(h.category === "impersonation" && EVERYDAY_WORDS.test(h.text.trim())));
}

/** 위험 낮음 결과: 확인했는데 없었던 위험 요소를 짧게 보여준다 (최대 3개) */
export function absentChecks(r: AnalysisResult): string[] {
  const has = (c: SignalCategory) => r.signals.some((s) => s.category === c);
  const riskyUrl = r.urls.some((u) => u.suspiciousTld || u.officialMismatch || u.isShortened);
  const checks: string[] = [];
  if (!has("urgency")) checks.push("서두르게 만드는 표현이 없어요");
  if (!has("credential") && !has("money")) checks.push("개인정보나 돈을 요구하지 않아요");
  if (!riskyUrl) checks.push(r.urls.length > 0 ? "의심스러운 주소의 링크는 없어요" : "누르게 하는 링크가 없어요");
  return checks.slice(0, 3);
}
