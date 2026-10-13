import type { AnalysisResult, HighlightSpan, HistoryEntry, ScoreItem, SignalCategory } from "./types";
import { LEVEL_HEADLINES } from "./risk-engine";

/**
 * 결과 화면 표현 규칙.
 * 엔진 결과(이전 버전에서 저장된 기록 포함)를 불안한 사용자가 몇 초 안에 이해할 수 있는 문장으로 바꾼다.
 * 저장된 문구 대신 항상 여기서 다시 만들어, 표현을 다듬어도 과거 기록에 같은 기준이 적용된다.
 */

export function verdictHeadline(r: AnalysisResult): string {
  return LEVEL_HEADLINES[r.level];
}

const hasSignal = (r: AnalysisResult, c: SignalCategory) => r.signals.some((s) => s.category === c);
const matchesOf = (r: AnalysisResult, c: SignalCategory) => r.signals.find((s) => s.category === c)?.matches ?? [];
const riskyUrls = (r: AnalysisResult) => r.urls.filter((u) => !u.isOfficial);
const REMOTE_APP = /앱|apk|원격|팀뷰어|애니\s*데스크/i;
const POLICE = /경찰|검찰|지검|수사/;

/* ------------------------------------------------------------------ */
/* 지금 이렇게 하세요                                                   */
/* ------------------------------------------------------------------ */

/** 유형별 가장 중요한 한 가지 행동 — 결론 바로 아래에 굵게 보여준다 */
function primaryAction(r: AnalysisResult): string {
  const link = riskyUrls(r).length > 0;
  const phone = r.phones.length > 0;
  const money = hasSignal(r, "money");
  switch (r.scamType) {
    case "delivery":
      return link
        ? "링크를 누르지 말고, 택배사 공식 앱에서 운송장 번호로 조회하세요."
        : "택배사 공식 앱이나 대표번호로 직접 조회하세요.";
    case "finance":
      if (link) return "링크를 누르지 말고, 평소 쓰던 은행·카드사 앱으로 직접 확인하세요.";
      if (phone) return "문자 속 번호로 전화하지 말고, 카드 뒷면이나 공식 홈페이지의 대표번호로 확인하세요.";
      return "평소 쓰던 은행·카드사 앱이나 대표번호로 직접 확인하세요.";
    case "payment":
      return "문자 속 번호로 전화하지 말고, 카드 앱이나 쇼핑 앱에서 실제 결제 내역을 확인하세요.";
    case "government":
      if (POLICE.test(r.message)) return "문자 속 번호로 연락하지 마세요. 걱정되면 112에 직접 물어보세요.";
      return link
        ? "링크를 누르지 말고, 정부24·이파인 같은 공식 사이트에서 직접 조회하세요."
        : "정부24·이파인 같은 공식 사이트나 기관 대표번호로 직접 확인하세요.";
    case "family":
      if (money) return "돈을 보내기 전에, 원래 알던 번호로 전화해 본인인지 꼭 확인하세요.";
      return "답장하기 전에, 원래 알던 번호로 전화해 본인인지 확인하세요.";
    case "investment":
      return "링크나 대화방에 들어가지 말고, 절대 돈을 보내지 마세요.";
    case "loan":
      return "수수료·보증금을 먼저 보내지 말고, 금융회사 대표번호로 직접 확인하세요.";
    case "event":
      return "링크를 누르지 말고, 보낸 사람이나 그곳에 직접 확인하세요.";
    default:
      return link
        ? "링크를 누르지 말고, 공식 앱이나 대표번호로 직접 확인하세요."
        : "문자 속 번호 대신 공식 대표번호로 직접 확인하세요.";
  }
}

/**
 * 지금 해야 할 행동 (최대 3개). 첫 번째가 가장 중요한 행동이다.
 * 같은 말을 반복하지 않도록, 첫 행동이 이미 다룬 내용은 뒤에서 빼고 남은 위험만 덧붙인다.
 */
export function actionPlan(r: AnalysisResult): string[] {
  if (r.level === "low") {
    return [
      "평소 받던 곳에서 온 문자인지 한 번만 확인하세요.",
      r.urls.length > 0
        ? "링크가 있다면 누르기보다 평소 쓰던 앱으로 들어가 확인하세요."
        : r.phones.length > 0
          ? "궁금한 점은 문자 속 번호보다 공식 대표번호로 물어보세요."
          : "조금이라도 이상하면 그곳의 대표번호로 물어보세요.",
    ];
  }

  const first = primaryAction(r);
  const steps = [first];
  const add = (text: string, covered: RegExp) => {
    if (steps.length < 3 && !covered.test(steps.join(" "))) steps.push(text);
  };
  if (riskyUrls(r).length > 0) add("문자 속 링크는 누르지 마세요.", /링크/);
  if (r.phones.length > 0) add("문자 속 번호로 전화하지 마세요.", /번호로 (전화|연락)/);
  const credentials = matchesOf(r, "credential");
  if (credentials.some((m) => REMOTE_APP.test(m))) add("상대가 시키는 앱은 설치하지 마세요.", /앱은 설치/);
  if (credentials.some((m) => !REMOTE_APP.test(m))) add("인증번호나 카드번호 같은 개인정보는 입력하거나 알려주지 마세요.", /인증번호/);
  if (hasSignal(r, "money")) add("확인하기 전에는 돈이나 상품권을 보내지 마세요.", /돈|송금|수수료/);
  add("답장하지 말고, 문자 앱에서 이 번호를 차단·스팸 신고하세요.", /차단/);
  return steps;
}

/* ------------------------------------------------------------------ */
/* 왜 위험한가요                                                       */
/* ------------------------------------------------------------------ */

export interface Explanation {
  id: string;
  /** 쉬운 말로 된 한 줄 제목 */
  title: string;
  /** 문자에서 찾은 실제 문구 */
  quotes: string[];
  /** 왜 위험 신호인지 */
  why: string;
}

const TITLES: Record<SignalCategory, string> = {
  urgency: "서두르게 만들어요",
  credential: "개인정보를 넣거나 알려달라고 해요",
  money: "돈을 보내게 하거나 돈으로 유혹해요",
  impersonation: "기관·회사 이름을 내세워요",
  emotion: "가족·지인이나 혜택을 내세워요",
  link: "누르게 하는 링크가 있어요",
};

const short = (s: string) => (s.length > 18 ? `${s.slice(0, 18)}…` : s);
const hostOf = (url: string) => url.replace(/^https?:\/\//i, "").split(/[/?#]/)[0];

/**
 * 탐지된 신호를 "어떤 문구가 → 왜 위험한지"로 풀어 쓴다 (최대 5개).
 * 설명은 엔진 규칙이 가진 쉬운 이유 문장을 그대로 써서, 화면과 엔진의 판단 근거가 어긋나지 않게 한다.
 */
export function riskExplanations(r: AnalysisResult): Explanation[] {
  if (r.level === "low") return [];
  const highlights = visibleHighlights(r);
  const reasonOf = (c: SignalCategory) => highlights.find((h) => h.category === c)?.reason;
  const items: Explanation[] = [];

  // 바로 행동과 이어지는 링크·개인정보·돈 요구를 먼저, 사칭·감정 표현은 나중에
  const order: SignalCategory[] = ["link", "credential", "money", "urgency", "impersonation", "emotion"];
  const signals = [...r.signals].sort((a, b) => order.indexOf(a.category) - order.indexOf(b.category));
  for (const signal of signals) {
    const c = signal.category;
    if (c === "link") {
      const risky = riskyUrls(r);
      if (risky.length === 0) continue;
      const fake = risky.find((u) => u.suspiciousTld || u.officialMismatch);
      const hidden = risky.find((u) => u.isShortened);
      items.push({
        id: "link",
        title: fake ? "공식 주소가 아닌 링크가 있어요" : hidden ? "주소를 숨긴 링크가 있어요" : "출처를 알 수 없는 링크가 있어요",
        quotes: risky.slice(0, 2).map((u) => hostOf(u.url)),
        why: fake
          ? "진짜 기관·회사 주소와 달라요. 누르면 가짜 사이트로 연결될 수 있어요."
          : hidden
            ? "주소를 짧게 줄여서 어디로 연결되는지 알 수 없게 했어요."
            : "어디서 보낸 주소인지 확인되지 않았어요. 누르지 않는 게 안전해요.",
      });
      continue;
    }
    const quotes = (c === "impersonation" ? preferNames(signal.matches) : signal.matches).slice(0, 3).map(short);
    const remote = c === "credential" && signal.matches.some((m) => REMOTE_APP.test(m));
    items.push({
      id: c,
      title: remote ? "모르는 앱을 설치하게 해요" : TITLES[c],
      quotes,
      why: (remote ? highlights.find((h) => h.category === c && REMOTE_APP.test(h.text))?.reason : undefined) ?? reasonOf(c) ?? signal.description,
    });
  }

  // 기관·금전 안내를 개인 휴대폰 번호로 받게 하는 것은 그 자체로 강한 신호
  const mobile = r.phones.find((p) => p.type === "개인 휴대폰 번호");
  if (mobile && (hasSignal(r, "money") || hasSignal(r, "impersonation")) && r.scamType !== "delivery") {
    items.splice(Math.min(items.length, 2), 0, {
      id: "phone",
      title: "개인 휴대폰 번호로 연락하게 해요",
      quotes: [mobile.number],
      why: "은행·기관은 개인 휴대폰 번호로 상담하지 않아요. 그 번호는 사기범에게 연결될 수 있어요.",
    });
  }
  return items.slice(0, 5);
}

/** 사칭 근거에는 '배송' 같은 일반 단어보다 실제 기관·회사 이름을 먼저 보여준다 */
const GENERIC_WORDS = /^(배송|택배|운송장|물류)$/;
function preferNames(matches: string[]): string[] {
  const names = matches.filter((m) => !GENERIC_WORDS.test(m)).sort((a, b) => b.length - a.length);
  return names.length > 0 ? names : matches;
}

/* ------------------------------------------------------------------ */
/* 낮음 결과 · 하이라이트 · 점수 근거                                    */
/* ------------------------------------------------------------------ */

/** 위험 낮음 결과: 확인했는데 없었던 위험 요소를 짧게 보여준다 (최대 3개) */
export function absentChecks(r: AnalysisResult): string[] {
  const riskyUrl = r.urls.some((u) => !u.isOfficial && (u.suspiciousTld || u.officialMismatch || u.isShortened));
  const checks: string[] = [];
  if (!hasSignal(r, "urgency")) checks.push("서두르게 만드는 말이 없어요");
  if (!hasSignal(r, "credential") && !hasSignal(r, "money")) checks.push("개인정보나 돈을 달라고 하지 않아요");
  if (!riskyUrl) checks.push(r.urls.length > 0 ? "의심스러운 주소의 링크는 없어요" : "누르게 하는 링크가 없어요");
  return checks.slice(0, 3);
}

/** 원문 하이라이트: '배송'·'택배' 같은 일상 단어는 빼고 실제로 주의할 표현만 강조한다 */
export function visibleHighlights(r: AnalysisResult): HighlightSpan[] {
  return r.highlights.filter((h) => !(h.category === "impersonation" && GENERIC_WORDS.test(h.text.trim())));
}

/** 점수 계산 근거 — 이전 버전 기록에는 근거가 없어 신호별 기본 점수로 대신 보여준다 */
export function scoreBreakdown(r: AnalysisResult): { items: ScoreItem[]; approximate: boolean } {
  if (r.breakdown && r.breakdown.length > 0) return { items: r.breakdown, approximate: false };
  return { items: r.signals.map((s) => ({ label: s.title, points: s.weight })), approximate: true };
}

/* ------------------------------------------------------------------ */
/* 반복해서 받은 유형                                                   */
/* ------------------------------------------------------------------ */

export const REPEAT_WINDOW_DAYS = 30;

/** 최근 30일 안에 같은 유형의 의심 문자를 받은 다른 기록 */
export function similarRecent(entry: HistoryEntry, all: HistoryEntry[], now = Date.now()): HistoryEntry[] {
  if (entry.level === "low" || entry.scamType === "normal") return [];
  const since = now - REPEAT_WINDOW_DAYS * 86_400_000;
  return all.filter(
    (e) => e.id !== entry.id && e.scamType === entry.scamType && e.level !== "low" && new Date(e.createdAt).getTime() >= since,
  );
}

/** "택배 사칭 의심" → "택배 사칭" */
export const typeName = (label: string) => label.replace(/\s*의심$/, "");
