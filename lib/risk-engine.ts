import type {
  AnalysisResult,
  AnalysisSource,
  HighlightSpan,
  PhoneFinding,
  PhoneType,
  RiskLevel,
  RiskSignal,
  ScamType,
  SignalCategory,
  UrlFinding,
} from "./types";

/* ------------------------------------------------------------------ */
/* 키워드 규칙 정의                                                     */
/* ------------------------------------------------------------------ */

interface KeywordRule {
  pattern: RegExp;
  category: SignalCategory;
  reason: string;
}

const KEYWORD_RULES: KeywordRule[] = [
  // 긴급성·압박
  { pattern: /즉시|지금\s*바로|바로\s*(확인|처리|인증)/g, category: "urgency", reason: "생각할 시간을 주지 않고 즉시 행동하도록 압박하는 표현이에요." },
  { pattern: /금일\s*(내|중|까지)?|오늘\s*(안에|까지|중으로|마감)/g, category: "urgency", reason: "짧은 기한을 제시해 서두르게 만드는 전형적인 압박 표현이에요." },
  { pattern: /정지\s*(예정|됩니다|처리)?|차단\s*(예정|됩니다)?|중지\s*예정/g, category: "urgency", reason: "계정·계좌 정지 등 불이익을 언급해 불안감을 조성하는 표현이에요." },
  { pattern: /마지막\s*(기회|안내|통보)|최종\s*(안내|통보|경고)/g, category: "urgency", reason: "‘마지막 기회’류 표현으로 조급함을 유도하고 있어요." },
  { pattern: /반송\s*(예정|처리)?|배송\s*보류|배송\s*중단|보관\s*중|주소\s*불명|주소지\s*불명|미수령|수취인\s*부재/g, category: "urgency", reason: "택배 반송·보관을 이유로 급하게 링크를 누르도록 유도하는 패턴이에요." },
  { pattern: /미납|연체|과태료|범칙금|벌금/g, category: "urgency", reason: "미납·과태료 등 불이익을 언급해 확인을 서두르게 만드는 표현이에요." },
  { pattern: /긴급|위급|급하게|급히|급전|급해|급한\s*(일|상황)/g, category: "urgency", reason: "긴급 상황을 강조해 침착한 판단을 방해하는 표현이에요." },

  // 개인정보·인증 요구
  { pattern: /인증\s*번호|인증번호/g, category: "credential", reason: "인증번호를 요구하는 문자는 계정 탈취 시도일 가능성이 높아요." },
  { pattern: /본인\s*인증|본인\s*확인/g, category: "credential", reason: "링크나 회신을 통한 본인 인증 요구는 개인정보 탈취에 자주 쓰여요." },
  { pattern: /비밀번호|비번/g, category: "credential", reason: "비밀번호를 묻는 기관은 없어요. 절대 입력하지 마세요." },
  { pattern: /주민\s*(등록)?\s*번호/g, category: "credential", reason: "주민등록번호 요구는 대표적인 개인정보 탈취 신호예요." },
  { pattern: /계좌\s*번호|카드\s*번호|카드\s*정보/g, category: "credential", reason: "계좌·카드번호 입력을 유도하는 것은 금융정보 탈취 패턴이에요." },
  { pattern: /주소\s*(를)?\s*(수정|확인|입력|변경)/g, category: "credential", reason: "주소 확인·수정을 명목으로 개인정보 입력 페이지로 유도하는 패턴이에요." },

  // 금전 요구
  { pattern: /(송금|이체)(?!\s*(이|가)?\s*(완료|되었|됐))/g, category: "money", reason: "문자로 송금을 요구하는 것은 전형적인 사기 패턴이에요." },
  { pattern: /입금\s*(요청|바랍니다|부탁|해\s*(줘|주세요|주시))/g, category: "money", reason: "입금을 요구하는 표현이 있어요. 직접 확인 전에는 입금하지 마세요." },
  { pattern: /결제\s*(가)?\s*(완료|되었|예정)/g, category: "money", reason: "결제 완료를 사칭해 문의 전화를 유도하는 수법에 자주 쓰여요." },
  { pattern: /수수료|보증금|선입금/g, category: "money", reason: "수수료·보증금 선입금 요구는 대출·중고거래 사기의 대표 패턴이에요." },
  { pattern: /돈\s*(좀)?\s*(보내|부쳐)/g, category: "money", reason: "지인을 사칭한 급전 요청일 가능성이 있어요. 반드시 전화로 본인 확인하세요." },
  { pattern: /(?:(?:문화|모바일|구글)\s*)?상품권|기프트\s*카드|핀\s*번호/g, category: "money", reason: "상품권·핀번호는 추적이 어려워 사기범이 돈 대신 자주 요구해요." },
  { pattern: /해외\s*(승인|결제)|결제\s*승인/g, category: "money", reason: "큰 금액의 결제 승인을 내세워 문자 속 번호로 전화하게 만드는 수법이 많아요." },
  { pattern: /햇살론|대환\s*대출|정부\s*지원|대상자로?\s*선정|기존\s*대출\s*상환/g, category: "money", reason: "정부지원·대환대출을 내세워 수수료나 기존 대출 상환을 요구하는 수법이 많아요." },

  // 기관·지인 사칭
  { pattern: /경찰(청|서)?|검찰(청)?|수사관?|법원/g, category: "impersonation", reason: "수사기관은 문자로 사건 안내나 출석 요구를 하지 않아요." },
  { pattern: /국세청|세무서|정부24|건강보험(공단)?|국민연금/g, category: "impersonation", reason: "정부기관을 사칭하는 문자에 자주 등장하는 기관명이에요." },
  { pattern: /\[[^\]\s]{0,10}(카드|은행|캐피탈)\]|(KB|국민|신한|삼성|현대|롯데|하나|우리|BC|NH|농협)\s*카드|은행|카드사|금융감독원|금감원|캐피탈|저축은행/g, category: "impersonation", reason: "금융기관 사칭 여부를 공식 대표번호로 직접 확인해야 해요." },
  { pattern: /택배|배송|운송장|물류|우체국|CJ대한통운|로젠|한진/g, category: "impersonation", reason: "택배사를 사칭해 주소 확인 링크를 누르게 하는 스미싱이 많아요." },
  { pattern: /엄마|아빠|딸|아들|부모님/g, category: "emotion", reason: "가족을 사칭해 휴대폰 고장 등을 핑계로 금전을 요구하는 수법이 많아요." },
  { pattern: /(휴대)?폰\s*(이)?\s*(고장|파손|액정)|액정\s*(이)?\s*(나가|깨)|임시\s*폰|친구\s*폰/g, category: "emotion", reason: "‘휴대폰 고장·임시폰’은 가족 사칭 사기의 대표적인 시작 문구예요." },

  // 투자·대출 유인
  { pattern: /수익\s*(보장|가능)|고수익|300%|\d{2,}%\s*수익/g, category: "money", reason: "높은 수익률 보장은 투자 사기의 전형적인 미끼예요." },
  { pattern: /오늘만\s*공개|단독\s*공개|비공개\s*정보|리딩방/g, category: "urgency", reason: "‘오늘만 공개’ 등 희소성을 강조하는 투자 유인 표현이에요." },
  { pattern: /저금리|무담보|무서류|당일\s*대출|대출\s*(가능|승인)/g, category: "money", reason: "쉬운 조건의 대출 광고는 불법 대출·수수료 사기로 이어질 수 있어요." },
  { pattern: /당첨|무료\s*쿠폰|경품|이벤트\s*당첨/g, category: "emotion", reason: "당첨·경품을 미끼로 링크 클릭이나 개인정보 입력을 유도하는 패턴이에요." },
];

/* ------------------------------------------------------------------ */
/* URL / 전화번호 패턴                                                  */
/* ------------------------------------------------------------------ */

const URL_REGEX = /(https?:\/\/[^\sㄱ-힝)\]},]+|(?<![\w.])(?:www\.)[^\sㄱ-힝)\]},]+|(?<![\w.@/])[a-z0-9][a-z0-9-]*\.(?:top|xyz|club|site|online|shop|vip|icu|kr|com|net|me|ly|gl|cc)\/[^\sㄱ-힝)\]},]*)/gi;

const SHORTENER_HOSTS = ["bit.ly", "han.gl", "url.kr", "me2.do", "goo.gl", "t.co", "tinyurl.com", "vo.la", "c11.kr", "zrr.kr", "buly.kr"];
const SUSPICIOUS_TLDS = [".top", ".xyz", ".club", ".site", ".online", ".shop", ".vip", ".icu", ".cc"];
const OFFICIAL_HINTS: { keyword: RegExp; domains: string[]; label: string }[] = [
  { keyword: /택배|배송|운송장|CJ대한통운|우체국|로젠|한진/, domains: ["cjlogistics.com", "epost.go.kr", "ilogen.com", "hanjin.co.kr"], label: "택배사" },
  { keyword: /은행|카드|금융|금감원/, domains: ["kbstar.com", "shinhan.com", "wooribank.com", "fss.or.kr"], label: "금융기관" },
  { keyword: /정부|국세청|과태료|범칙금|건강보험/, domains: ["gov.kr", "nts.go.kr", "efine.go.kr", "nhis.or.kr"], label: "정부기관" },
];

const PHONE_REGEX = /(01[016789][-.\s]?\d{3,4}[-.\s]?\d{4}|0\d{1,2}[-.\s]?\d{3,4}[-.\s]?\d{4}|15\d{2}[-.\s]?\d{4}|16\d{2}[-.\s]?\d{4}|18\d{2}[-.\s]?\d{4}|(?:\+|00)82[-.\s]?\d{1,2}[-.\s]?\d{3,4}[-.\s]?\d{4})/g;

/* ------------------------------------------------------------------ */
/* 신호 카테고리 메타                                                   */
/* ------------------------------------------------------------------ */

const CATEGORY_META: Record<SignalCategory, { title: string; description: string; weight: number }> = {
  impersonation: {
    title: "기관 사칭 의심 표현",
    description: "금융기관·정부기관·택배사 등을 사칭하는 것으로 의심되는 표현이 발견됐어요.",
    weight: 15,
  },
  urgency: {
    title: "긴급 행동 유도",
    description: "“즉시”, “금일 내”, “정지 예정” 등 사용자의 빠른 행동을 유도하는 표현이 있어요.",
    weight: 20,
  },
  link: {
    title: "외부 링크 포함",
    description: "메시지에 포함된 URL을 통해 개인정보 입력을 유도할 가능성이 있어요.",
    weight: 25,
  },
  credential: {
    title: "개인정보·인증 요구",
    description: "계좌번호·비밀번호·인증번호 등 민감한 정보의 입력을 요구하는 표현이 있어요.",
    weight: 25,
  },
  money: {
    title: "금전 요구·유인",
    description: "송금·결제를 요구하거나 수익을 미끼로 유인하는 패턴이 있어요.",
    weight: 20,
  },
  emotion: {
    title: "심리적 접근",
    description: "가족·지인 관계나 당첨 소식 등 감정을 이용해 경계심을 낮추는 표현이 있어요.",
    weight: 12,
  },
};

/* ------------------------------------------------------------------ */
/* 사기 유형 분류                                                       */
/* ------------------------------------------------------------------ */

const SCAM_TYPE_LABELS: Record<ScamType, string> = {
  delivery: "택배 사칭 의심",
  finance: "금융기관 사칭 의심",
  government: "정부기관 사칭 의심",
  family: "가족·지인 사칭 의심",
  investment: "투자 권유 의심",
  loan: "대출 권유 의심",
  event: "이벤트·당첨 위장 의심",
  normal: "일반 안내 문자",
};

function classifyScamType(message: string, score: number): ScamType {
  if (score < LEVEL_THRESHOLDS.caution) return "normal";
  const checks: [ScamType, RegExp][] = [
    ["family", /엄마|아빠|딸|아들|부모님|휴대폰\s*고장/],
    ["investment", /수익|종목|투자|리딩|주식|코인/],
    ["loan", /대출|저금리|무담보|한도/],
    ["delivery", /택배|배송|운송장|반송|물류|주소/],
    ["government", /과태료|범칙금|국세청|건강보험|정부|경찰|검찰|법원|출석/],
    ["finance", /은행|계좌|카드|금융|금감원|이상\s*거래/],
    ["event", /당첨|쿠폰|경품|이벤트/],
  ];
  for (const [type, re] of checks) {
    if (re.test(message)) return type;
  }
  return "finance";
}

/* ------------------------------------------------------------------ */
/* 레벨/헤드라인                                                        */
/* ------------------------------------------------------------------ */

/** 점수 구간 하한 (이상) — 결과 화면 게이지·배지와 기록 목록이 모두 이 기준을 따른다 */
export const LEVEL_THRESHOLDS = { "very-high": 80, high: 60, caution: 30 } as const;

/** 100점은 "사기 확정"처럼 보이므로 단정적 인상을 피하려고 상한을 둔다 */
const SCORE_CAP = 96;
/** 규칙에 하나도 걸리지 않은 문자의 상한 */
const NO_SIGNAL_CAP = 12;

export function scoreToLevel(score: number): RiskLevel {
  if (score >= LEVEL_THRESHOLDS["very-high"]) return "very-high";
  if (score >= LEVEL_THRESHOLDS.high) return "high";
  if (score >= LEVEL_THRESHOLDS.caution) return "caution";
  return "low";
}

export const LEVEL_LABELS: Record<RiskLevel, string> = {
  low: "낮음",
  caution: "주의",
  high: "높음",
  "very-high": "매우 높음",
};

export const LEVEL_HEADLINES: Record<RiskLevel, string> = {
  "very-high": "위험 신호가 많이 발견됐어요",
  high: "주의가 필요한 문자예요",
  caution: "몇 가지 의심스러운 점이 있어요",
  low: "강한 위험 신호는 보이지 않아요",
};

/* ------------------------------------------------------------------ */
/* URL / 전화번호 분석                                                  */
/* ------------------------------------------------------------------ */

function analyzeUrls(message: string): UrlFinding[] {
  const findings: UrlFinding[] = [];
  const seen = new Set<string>();
  for (const match of message.matchAll(URL_REGEX)) {
    const raw = match[0].replace(/[.,)\]]+$/, "");
    if (seen.has(raw)) continue;
    seen.add(raw);

    const isHttps = /^https:\/\//i.test(raw);
    const host = raw.replace(/^https?:\/\//i, "").split("/")[0].toLowerCase();
    const isShortened = SHORTENER_HOSTS.some((h) => host === h || host.endsWith(`.${h}`));
    const suspiciousTld = SUSPICIOUS_TLDS.some((t) => host.endsWith(t));

    let officialMismatch = false;
    const notes: string[] = [];
    for (const hint of OFFICIAL_HINTS) {
      if (hint.keyword.test(message)) {
        const matches = hint.domains.some((d) => host === d || host.endsWith(`.${d}`));
        if (!matches) {
          officialMismatch = true;
          notes.push(`${hint.label} 관련 내용이지만 공식 도메인과 다른 주소예요.`);
        }
        break;
      }
    }
    if (isShortened) notes.push("단축 URL은 실제 목적지를 숨길 수 있어 주의가 필요해요.");
    if (suspiciousTld) notes.push("스미싱에 자주 쓰이는 도메인 형식(.top, .xyz 등)이에요.");
    if (!isHttps && /^https?:\/\//i.test(raw)) notes.push("보안 연결(HTTPS)이 아닌 주소예요.");
    if (notes.length === 0) notes.push("공식 채널에서 안내된 주소가 맞는지 직접 확인해주세요.");

    findings.push({ url: raw, isShortened, isHttps, suspiciousTld, officialMismatch, notes });
  }
  return findings;
}

function analyzePhones(message: string): PhoneFinding[] {
  const findings: PhoneFinding[] = [];
  const seen = new Set<string>();
  for (const match of message.matchAll(PHONE_REGEX)) {
    const raw = match[0].trim();
    const normalized = raw.replace(/[-.\s]/g, "");
    if (seen.has(normalized)) continue;
    seen.add(normalized);

    let type: PhoneType = "일반 전화번호";
    const notes: string[] = [];
    if (/^01[016789]/.test(normalized)) {
      type = "개인 휴대폰 번호";
      notes.push("기관 안내가 개인 휴대폰 번호로 오는 경우는 드물어요.");
    } else if (/^(15|16|18)\d{2}/.test(normalized)) {
      type = "대표번호 형식";
      notes.push("대표번호 형식이지만, 실제 해당 기관의 번호인지는 확인되지 않았어요.");
    } else if (/^(\+|00)?82/.test(normalized) || raw.startsWith("+")) {
      type = "국제발신 번호";
      notes.push("국제발신 번호로 국내 기관을 안내하는 경우 사칭 가능성이 높아요.");
    } else {
      notes.push("문자 속 번호가 공식 대표번호인지 확인되지 않았어요.");
    }
    notes.push("문자 속 번호로 바로 전화하지 말고, 공식 홈페이지의 대표번호를 이용하세요.");
    findings.push({ number: raw, type, notes });
  }
  return findings;
}

/* ------------------------------------------------------------------ */
/* 하이라이트                                                           */
/* ------------------------------------------------------------------ */

function collectHighlights(message: string): HighlightSpan[] {
  const spans: HighlightSpan[] = [];

  for (const rule of KEYWORD_RULES) {
    rule.pattern.lastIndex = 0;
    for (const m of message.matchAll(rule.pattern)) {
      if (m.index === undefined || m[0].trim().length === 0) continue;
      spans.push({
        start: m.index,
        end: m.index + m[0].length,
        text: m[0],
        category: rule.category,
        reason: rule.reason,
      });
    }
  }

  URL_REGEX.lastIndex = 0;
  for (const m of message.matchAll(URL_REGEX)) {
    if (m.index === undefined) continue;
    const text = m[0].replace(/[.,)\]]+$/, "");
    spans.push({
      start: m.index,
      end: m.index + text.length,
      text,
      category: "link",
      reason: "출처가 불분명한 링크예요. 직접 누르지 말고 공식 채널에서 확인하세요.",
    });
  }

  // 겹치는 구간은 먼저 시작하고 더 긴 것을 우선
  spans.sort((a, b) => a.start - b.start || b.end - a.end);
  const result: HighlightSpan[] = [];
  let lastEnd = -1;
  for (const span of spans) {
    if (span.start >= lastEnd) {
      result.push(span);
      lastEnd = span.end;
    }
  }
  return result;
}

/* ------------------------------------------------------------------ */
/* 요약·행동 가이드                                                     */
/* ------------------------------------------------------------------ */

const CATEGORY_SUMMARY_FRAGMENTS: Record<SignalCategory, string> = {
  impersonation: "기관을 사칭하는 것으로 의심되는 표현을 사용하고",
  urgency: "정지·기한 등을 언급하며 긴급하게 행동하도록 유도하고",
  link: "외부 링크 접속을 유도하고",
  credential: "인증번호·개인정보 입력을 요구하고",
  money: "송금·결제 등 금전과 관련된 행동을 요구하고",
  emotion: "가족·지인 관계나 혜택을 내세워 경계심을 낮추려 하고",
};

function buildSummary(level: RiskLevel, scamType: ScamType, signals: RiskSignal[]): string {
  if (level === "low") {
    return "이번 분석에서는 사칭·압박 표현이나 의심 링크 같은 강한 위험 신호가 발견되지 않았어요.";
  }
  const parts = signals.slice(0, 3).map((s) => CATEGORY_SUMMARY_FRAGMENTS[s.category]);
  const joined = parts.join(", ").replace(/하고$/, "하고 있어");
  const typePrefix =
    scamType === "normal" ? "이 문자는" : `이 문자는 ${SCAM_TYPE_LABELS[scamType].replace(" 의심", "")} 유형으로,`;
  // 요약은 "왜 위험한가"만 담고, 무엇을 할지는 행동 가이드(actions)가 담당한다
  return `${typePrefix} ${joined} 주의가 필요해요.`;
}

function buildActions(level: RiskLevel, result: { urls: UrlFinding[]; phones: PhoneFinding[]; signals: RiskSignal[] }): string[] {
  if (level === "low") {
    return [
      "발신 번호가 평소 받던 공식 번호와 같은지 확인해보세요.",
      "링크가 있다면 공식 앱이나 홈페이지를 통해 같은 내용을 확인하세요.",
      "조금이라도 의심되면 해당 기관 대표번호로 직접 문의하세요.",
    ];
  }
  const actions: string[] = [];
  if (result.urls.length > 0) actions.push("문자에 포함된 링크를 누르지 마세요.");
  if (result.phones.length > 0) actions.push("문자에 적힌 번호로 바로 전화하지 마세요.");
  actions.push("해당 기관의 공식 앱·홈페이지·대표번호를 직접 찾아 확인하세요.");
  if (result.signals.some((s) => s.category === "credential")) {
    actions.push("인증번호·비밀번호·카드정보를 절대 입력하지 마세요.");
  }
  if (result.signals.some((s) => s.category === "money" || s.category === "emotion")) {
    actions.push("송금 요청은 반드시 전화 통화로 본인을 확인한 뒤 결정하세요.");
  }
  actions.push("이미 정보를 입력했다면 해당 기관 공식 고객센터를 통해 즉시 조치하세요.");
  actions.push("피해가 의심되면 경찰청(112) 또는 불법스팸신고센터(118)에 신고하세요.");
  return actions;
}

/* ------------------------------------------------------------------ */
/* 메인 분석 함수                                                       */
/* ------------------------------------------------------------------ */

function makeId(): string {
  return `a-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function analyzeMessageDemo(message: string, source: AnalysisSource = "text"): AnalysisResult {
  const trimmed = message.trim();

  // 카테고리별 매칭 수집
  const matchesByCategory = new Map<SignalCategory, Set<string>>();
  for (const rule of KEYWORD_RULES) {
    rule.pattern.lastIndex = 0;
    for (const m of trimmed.matchAll(rule.pattern)) {
      if (!m[0].trim()) continue;
      if (!matchesByCategory.has(rule.category)) matchesByCategory.set(rule.category, new Set());
      matchesByCategory.get(rule.category)!.add(m[0]);
    }
  }

  const urls = analyzeUrls(trimmed);
  if (urls.length > 0) {
    matchesByCategory.set("link", new Set(urls.map((u) => u.url)));
  }

  // 점수 계산: 카테고리 기본 가중치 + 추가 매칭 보너스
  let score = 0;
  const signals: RiskSignal[] = [];
  for (const [category, matches] of matchesByCategory) {
    const meta = CATEGORY_META[category];
    const extra = Math.min((matches.size - 1) * 3, 9);
    score += meta.weight + extra;
    signals.push({
      category,
      title: meta.title,
      description: meta.description,
      matches: [...matches].slice(0, 6),
      weight: meta.weight,
    });
  }

  // URL 위험 가중
  for (const u of urls) {
    if (u.isShortened) score += 5;
    if (u.suspiciousTld) score += 12;
    if (u.officialMismatch) score += 8;
  }

  // 함께 나타나면 훨씬 위험한 조합
  const has = (c: SignalCategory) => matchesByCategory.has(c);
  const phones = analyzePhones(trimmed);
  const mobileContact = phones.some((p) => p.type === "개인 휴대폰 번호");
  if (has("emotion") && has("money")) score += 12; // 가족·지인을 내세운 금전 요구
  if (has("impersonation") && has("money")) score += 8; // 기관을 내세운 금전 요구
  if (mobileContact && (has("impersonation") || has("money"))) score += 15; // 기관·금전 안내를 개인 번호로

  score = Math.max(0, Math.min(SCORE_CAP, score));
  if (signals.length === 0) score = Math.min(score, NO_SIGNAL_CAP);

  // 가중치 큰 순으로 정렬
  signals.sort((a, b) => b.weight - a.weight);

  const level = scoreToLevel(score);
  const scamType = classifyScamType(trimmed, score);
  const highlights = collectHighlights(trimmed);

  return {
    id: makeId(),
    createdAt: new Date().toISOString(),
    message: trimmed,
    score,
    level,
    levelLabel: LEVEL_LABELS[level],
    headline: LEVEL_HEADLINES[level],
    scamType,
    scamTypeLabel: SCAM_TYPE_LABELS[scamType],
    signals,
    highlights,
    urls,
    phones,
    summary: buildSummary(level, scamType, signals),
    actions: buildActions(level, { urls, phones, signals }),
    source,
    engine: "demo",
  };
}

export { SCAM_TYPE_LABELS };
