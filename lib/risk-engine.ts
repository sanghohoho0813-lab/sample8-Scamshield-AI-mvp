import type {
  AnalysisResult,
  AnalysisSource,
  HighlightSpan,
  PhoneFinding,
  PhoneType,
  RiskLevel,
  RiskSignal,
  ScamType,
  ScoreItem,
  SignalCategory,
  UrlFinding,
} from "./types";

/**
 * 규칙 기반 문자 위험도 엔진.
 *
 * 원칙
 * 1. 설명 가능해야 한다 — 모든 점수는 "어떤 문구 때문에 몇 점"으로 되돌려 보여줄 수 있어야 한다.
 * 2. 오탐을 줄인다 — 실제 기관·회사가 보내는 정상 알림(승인·납부·인증번호·배송 안내)이
 *    '주의' 이상으로 올라가지 않도록 문맥 조건과 상한을 둔다.
 * 3. 단정하지 않는다 — 100점("사기 확정")을 쓰지 않는다.
 */

/* ------------------------------------------------------------------ */
/* 문맥 패턴                                                           */
/* ------------------------------------------------------------------ */

/** "본인이 아니면 연락하라" — 문자 속 번호로 전화를 걸게 만드는 미끼 */
const CALL_LURE = /본인이?\s*아닐\s*(경우|시)|본인이?\s*아니(면|라면|시면)|(주문|구매|결제)\s*(하지|한\s*적)\s*(않|없)|명의\s*도용/;

/** 인증번호를 '받는' 정상 문자: 번호 자체가 들어 있고, 누구에게 알려달라는 말이 없다 */
const OTP_DELIVERY = /인증\s*번호\D{0,8}\d{4,8}/;
const SHARE_REQUEST = /알려\s*(줘|주세요|주시면|달라)|불러\s*(줘|주세요)|보내\s*(줘|주세요)|상담원|직원에게/;

/** 메신저로 대화를 옮기게 하는 말 — 링크·번호가 없어도 행동을 유도하는 수단이 된다 */
const CHANNEL = /카톡|카카오톡|오픈\s*채팅|텔레그램|친구\s*추가|이\s*번호로\s*(연락|문자|답장)|답장\s*(줘|주세요)|회신\s*(바랍|부탁|주세요)/;

/** 개인 휴대폰 번호로 안내할 리가 없는 곳 (택배 기사님은 실제로 휴대폰으로 연락하므로 제외) */
const OFFICIAL_ORG = /은행|카드|캐피탈|금융|금감원|경찰|검찰|지검|수사|법원|국세청|건강보험|국민연금|정부|공단/;

const hasNonRepresentativePhone = (phones: PhoneFinding[]) => phones.some((p) => p.type !== "대표번호 형식");

/* ------------------------------------------------------------------ */
/* 키워드 규칙                                                          */
/* ------------------------------------------------------------------ */

interface KeywordRule {
  /** 조합 규칙에서 참조하는 이름 */
  id?: string;
  pattern: RegExp;
  category: SignalCategory;
  /** 결과 화면에 그대로 보이는 쉬운 설명 */
  reason: string;
  /** 문맥 조건 — false면 이 규칙을 적용하지 않는다 (오탐 방지) */
  appliesTo?: (message: string, phones: PhoneFinding[]) => boolean;
}

const KEYWORD_RULES: KeywordRule[] = [
  // 서두르게 만드는 말
  { pattern: /즉시|지금\s*바로|바로\s*(확인|처리|인증)/g, category: "urgency", reason: "생각할 틈 없이 바로 하라고 재촉하는 말이에요." },
  { pattern: /금일\s*(내|까지)|오늘\s*(안에|까지|중으로|마감)/g, category: "urgency", reason: "기한을 짧게 정해 서두르게 만드는 말이에요." },
  { pattern: /정지\s*(예정|됩니다|처리)|정지될|차단\s*(예정|됩니다)|차단될|중지\s*예정|이용\s*제한/g, category: "urgency", reason: "계좌나 서비스가 막힌다고 겁을 줘서 서두르게 해요." },
  { pattern: /마지막\s*(기회|안내|통보)|최종\s*(안내|통보|경고)/g, category: "urgency", reason: "‘마지막 기회’라며 조급하게 만드는 말이에요." },
  { pattern: /반송\s*(예정|처리)?|배송이?\s*(보류|중단)|보관\s*중|주소지?\s*불명|미수령|수취인\s*부재/g, category: "urgency", reason: "택배가 반송·보관된다며 링크를 누르게 하는 흔한 수법이에요." },
  { pattern: /미납|연체|과태료|범칙금|벌금|압류/g, category: "urgency", reason: "내지 않은 돈이 있다며 불안하게 만드는 말이에요." },
  { pattern: /긴급|위급|급하게|급히|급전|급해|급한\s*(일|상황)/g, category: "urgency", reason: "급한 상황이라며 차분하게 생각하지 못하게 해요." },
  { id: "crime", pattern: /(범죄|사건)에?\s*연루|수사\s*중|출석\s*요구|구속\s*(수사|영장)/g, category: "urgency", reason: "사건에 연루됐다며 겁을 주는 것은 수사기관 사칭의 대표적인 수법이에요." },
  {
    id: "call-lure",
    pattern: new RegExp(CALL_LURE.source, "g"),
    category: "urgency",
    reason: "‘본인이 아니면 연락하라’며 문자 속 번호로 전화하게 만드는 수법이에요.",
    // 카드사 정식 알림도 "본인 아닐 시 대표번호로"라고 쓴다 — 대표번호가 아닌 번호로 부를 때만 신호로 본다
    appliesTo: (_, phones) => hasNonRepresentativePhone(phones),
  },
  { pattern: /오늘만\s*공개|단독\s*공개|비공개\s*(정보|종목)|리딩방|선착순\s*마감/g, category: "urgency", reason: "‘오늘만’, ‘비공개’처럼 놓치면 손해라고 느끼게 하는 말이에요." },

  // 개인정보·인증 요구
  {
    pattern: /인증\s*번호/g,
    category: "credential",
    reason: "인증번호를 남에게 알려주면 내 계정과 돈이 빠져나갈 수 있어요.",
    // "인증번호는 [123456]입니다. 타인에게 알려주지 마세요" 같은 정상 발송 문자는 제외
    appliesTo: (m) => !OTP_DELIVERY.test(m) || SHARE_REQUEST.test(m),
  },
  { pattern: /본인\s*(인증|확인)(?!\s*(이|가|을|를)?\s*(완료|되었|됐|했))/g, category: "credential", reason: "문자 속 링크로 본인 인증을 하라는 건 개인정보를 빼내려는 경우가 많아요." },
  { pattern: /비밀번호|비번/g, category: "credential", reason: "비밀번호를 묻는 은행·기관은 없어요." },
  { pattern: /주민\s*(등록)?\s*번호/g, category: "credential", reason: "주민등록번호를 문자로 요구하는 곳은 없어요." },
  { pattern: /계좌\s*번호|카드\s*번호|카드\s*정보|CVC|CVV/g, category: "credential", reason: "카드·계좌 정보를 넣게 해서 돈을 빼가려는 수법이에요." },
  { pattern: /주소\s*(를)?\s*(수정|확인|입력|변경)/g, category: "credential", reason: "주소를 고친다며 가짜 사이트에 개인정보를 넣게 해요." },
  { id: "remote-app", pattern: /앱\s*(을|를)?\s*(설치|다운)|\.apk\b|원격\s*(제어|지원)|팀뷰어|애니\s*데스크/gi, category: "credential", reason: "모르는 앱을 깔게 하면 휴대폰을 원격으로 조종해 돈을 빼갈 수 있어요." },

  // 돈 요구·금전 미끼
  { pattern: /(?<!자동)(송금|이체)(?!\s*(이|가)?\s*(완료|되었|됐|예정))/g, category: "money", reason: "문자로 돈을 보내라고 하면 먼저 의심해야 해요." },
  { pattern: /입금\s*(요청|바랍니다|부탁|해\s*(줘|주세요|주시))/g, category: "money", reason: "입금을 요구하고 있어요. 직접 확인하기 전에는 보내지 마세요." },
  { pattern: /(\d+\s*만\s*원|돈)\s*(만|좀)?\s*(좀\s*)?(보내|부쳐|빌려)/g, category: "money", reason: "급하게 돈을 보내달라는 말은 지인 사칭 사기의 핵심이에요." },
  {
    pattern: /결제\s*(가)?\s*(완료|되었|승인)/g,
    category: "money",
    reason: "결제됐다고 놀라게 해서 문자 속 번호로 전화하게 만드는 수법이에요.",
    // 정상 결제 알림은 "본인이 아니면 연락하라"고 부추기지 않는다
    appliesTo: (m) => CALL_LURE.test(m),
  },
  { pattern: /해외\s*(승인|결제)/g, category: "money", reason: "큰 금액이 결제됐다며 문자 속 번호로 전화하게 만드는 수법이 많아요." },
  { pattern: /수수료|보증금|선입금/g, category: "money", reason: "대출·거래 전에 돈부터 내라고 하면 사기예요." },
  { pattern: /(?:(?:문화|모바일|구글)\s*)?상품권|기프트\s*카드|핀\s*번호/g, category: "money", reason: "상품권 핀번호는 추적이 어려워 사기범이 돈 대신 자주 요구해요." },
  { pattern: /환급금|환급\s*(대상|신청)|미환급|지원금\s*(지급|신청)/g, category: "money", reason: "돌려받을 돈이 있다며 링크에 개인정보를 넣게 하는 수법이 많아요." },
  { pattern: /햇살론|대환\s*대출|정부\s*지원|대상자로?\s*선정|기존\s*대출\s*상환/g, category: "money", reason: "정부지원 대출을 내세워 수수료나 기존 대출 상환을 요구하는 수법이 많아요." },
  { pattern: /수익\s*(보장|가능)|고수익|\d{2,}%\s*수익/g, category: "money", reason: "수익을 보장한다는 말 자체가 투자 사기의 미끼예요." },
  { pattern: /저금리|무담보|무서류|당일\s*대출|대출\s*(가능|승인)/g, category: "money", reason: "조건이 너무 쉬운 대출 광고는 수수료 사기로 이어질 수 있어요." },

  // 기관·회사 이름
  { id: "police", pattern: /경찰(청|서)?|검찰(청)?|지검|지방검찰청|수사관?|법원/g, category: "impersonation", reason: "경찰·검찰은 문자로 사건을 알리거나 연락을 요구하지 않아요." },
  { pattern: /국세청|세무서|정부24|건강보험(공단)?|국민연금/g, category: "impersonation", reason: "정부기관은 문자 링크로 납부나 개인정보 입력을 요구하지 않아요." },
  {
    pattern: /\[[^\]\s]{0,10}(카드|은행|캐피탈)\]|(KB|국민|신한|삼성|현대|롯데|하나|우리|BC|NH|농협)\s*카드|은행|카드사|금융감독원|금감원|캐피탈|저축은행/g,
    category: "impersonation",
    reason: "은행·카드사는 문자 링크로 본인 확인이나 정보 입력을 요구하지 않아요.",
  },
  { pattern: /택배|배송|운송장|물류|우체국|CJ대한통운|로젠|한진/g, category: "impersonation", reason: "택배사는 주소 확인을 문자 링크로 요청하지 않아요." },
  { pattern: /쿠팡|네이버\s*페이|카카오\s*페이|11번가|G마켓|지마켓|옥션|토스(?!트)/g, category: "impersonation", reason: "유명 쇼핑·결제 회사 이름을 내세워 믿게 만들어요." },

  // 가족·지인·혜택을 내세움
  { id: "family", pattern: /엄마|아빠|딸|아들|부모님/g, category: "emotion", reason: "가족인 척 연락해 돈을 요구하는 수법이 많아요." },
  { id: "phone-broken", pattern: /(휴대)?폰\s*(이)?\s*(고장|파손|액정)|액정\s*(이)?\s*(나가|깨)|임시\s*폰|친구\s*폰/g, category: "emotion", reason: "‘휴대폰이 고장 났다’는 말은 가족 사칭 사기의 대표적인 시작이에요." },
  { pattern: /부고|장례식장|청첩장|돌잔치\s*초대/g, category: "emotion", reason: "부고·청첩장인 척 링크를 누르게 하는 스미싱이 많아요." },
  { pattern: /당첨|무료\s*쿠폰|경품|이벤트\s*당첨/g, category: "emotion", reason: "당첨·경품을 미끼로 링크를 누르거나 개인정보를 넣게 해요." },
];

/* ------------------------------------------------------------------ */
/* URL / 전화번호                                                       */
/* ------------------------------------------------------------------ */

export const URL_REGEX = /(https?:\/\/[^\sㄱ-힝)\]},]+|(?<![\w.])(?:www\.)[^\sㄱ-힝)\]},]+|(?<![\w.@/])[a-z0-9][a-z0-9-]*\.(?:top|xyz|club|site|online|shop|vip|icu|kr|com|net|me|ly|gl|cc)\/[^\sㄱ-힝)\]},]*)/gi;

export const PHONE_REGEX = /(01[016789][-.\s]?\d{3,4}[-.\s]?\d{4}|0\d{1,2}[-.\s]?\d{3,4}[-.\s]?\d{4}|15\d{2}[-.\s]?\d{4}|16\d{2}[-.\s]?\d{4}|18\d{2}[-.\s]?\d{4}|(?:\+|00)82[-.\s]?\d{1,2}[-.\s]?\d{3,4}[-.\s]?\d{4})/g;

const SHORTENER_HOSTS = ["bit.ly", "han.gl", "url.kr", "me2.do", "goo.gl", "t.co", "tinyurl.com", "vo.la", "c11.kr", "zrr.kr", "buly.kr"];
const SUSPICIOUS_TLDS = [".top", ".xyz", ".club", ".site", ".online", ".shop", ".vip", ".icu", ".cc"];

/**
 * 기관·회사가 직접 운영하는 공식 도메인.
 * 누구나 글을 올릴 수 있는 주소(오픈채팅·블로그·설문 등)는 절대 넣지 않는다 — 사칭에 그대로 쓰인다.
 */
const OFFICIAL_DOMAINS = [
  "go.kr",
  "nhis.or.kr", "nps.or.kr", "fss.or.kr", "kisa.or.kr",
  "cjlogistics.com", "ilogen.com", "hanjin.com", "hanjin.co.kr", "lotteglogis.com", "coupang.com", "coupa.ng",
  "kbstar.com", "kbcard.com", "shinhan.com", "shinhancard.com", "wooribank.com", "wooricard.com", "hanabank.com",
  "hanacard.co.kr", "nonghyup.com", "ibk.co.kr", "kakaobank.com", "samsungcard.com", "hyundaicard.com", "lottecard.co.kr",
  "bccard.com", "toss.im",
];

const OFFICIAL_HINTS: { keyword: RegExp; label: string }[] = [
  { keyword: /택배|배송|운송장|CJ대한통운|우체국|로젠|한진/, label: "택배사" },
  { keyword: /은행|카드|금융|금감원/, label: "금융기관" },
  { keyword: /정부|국세청|과태료|범칙금|건강보험/, label: "정부기관" },
];

const matchesDomain = (host: string, domain: string) => host === domain || host.endsWith(`.${domain}`);
const cleanUrl = (raw: string) => raw.replace(/[.,)\]]+$/, "");

function analyzeUrls(message: string): UrlFinding[] {
  const findings: UrlFinding[] = [];
  const seen = new Set<string>();
  for (const match of message.matchAll(URL_REGEX)) {
    const raw = cleanUrl(match[0]);
    if (seen.has(raw)) continue;
    seen.add(raw);

    const isHttps = /^https:\/\//i.test(raw);
    const host = raw.replace(/^https?:\/\//i, "").split(/[/?#]/)[0].toLowerCase();
    const isShortened = SHORTENER_HOSTS.some((h) => matchesDomain(host, h));
    const suspiciousTld = SUSPICIOUS_TLDS.some((t) => host.endsWith(t));
    const isOfficial = OFFICIAL_DOMAINS.some((d) => matchesDomain(host, d));
    const hint = OFFICIAL_HINTS.find((h) => h.keyword.test(message));
    const officialMismatch = Boolean(hint) && !isOfficial;

    const notes: string[] = [];
    if (isOfficial) notes.push("공식 주소로 보여요. 그래도 문자 링크보다 평소 쓰던 앱으로 확인하는 게 더 안전해요.");
    if (hint && officialMismatch) notes.push(`${hint.label} 관련 내용인데, 공식 주소와 다른 주소예요.`);
    if (isShortened) notes.push("단축 주소라서 실제로 어디로 연결되는지 알 수 없어요.");
    if (suspiciousTld) notes.push("스미싱에 자주 쓰이는 주소 형식(.top, .xyz 등)이에요.");
    if (!isHttps && /^https?:\/\//i.test(raw)) notes.push("보안 연결(https)이 아닌 주소예요.");
    if (notes.length === 0) notes.push("어디서 보낸 주소인지 확인되지 않았어요. 공식 앱이나 홈페이지로 직접 확인하세요.");

    findings.push({ url: raw, isShortened, isHttps, suspiciousTld, officialMismatch, isOfficial, notes });
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
      notes.push("은행·기관은 개인 휴대폰 번호로 상담하지 않아요.");
    } else if (/^(15|16|18)\d{2}/.test(normalized)) {
      type = "대표번호 형식";
      notes.push("대표번호 형식이지만, 그 회사의 진짜 번호인지는 확인되지 않았어요.");
    } else if (/^(\+|00)?82/.test(normalized) || raw.startsWith("+")) {
      type = "국제발신 번호";
      notes.push("국내 기관이 해외 번호로 연락하는 일은 거의 없어요.");
    } else {
      notes.push("문자 속 번호가 공식 대표번호인지 확인되지 않았어요.");
    }
    notes.push("문자 속 번호 대신 공식 홈페이지나 카드 뒷면의 대표번호로 전화하세요.");
    findings.push({ number: raw, type, notes });
  }
  return findings;
}

/* ------------------------------------------------------------------ */
/* 신호 카테고리                                                        */
/* ------------------------------------------------------------------ */

export const CATEGORY_META: Record<SignalCategory, { title: string; description: string; weight: number }> = {
  link: { title: "누르게 하는 링크", description: "문자 속 링크를 누르면 가짜 사이트로 연결될 수 있어요.", weight: 25 },
  credential: { title: "개인정보·인증 요구", description: "인증번호·비밀번호·카드번호 같은 정보를 달라고 해요.", weight: 25 },
  urgency: { title: "서두르게 만드는 말", description: "생각할 시간을 주지 않고 바로 하라고 재촉해요.", weight: 20 },
  money: { title: "돈 요구·금전 미끼", description: "돈을 보내라고 하거나 돈이 생긴다며 유인해요.", weight: 20 },
  impersonation: { title: "기관·회사 이름을 내세움", description: "믿을 만한 기관·회사 이름을 앞세워요. 이름만으로는 진짜인지 알 수 없어요.", weight: 15 },
  emotion: { title: "가족·지인·혜택을 내세움", description: "가족이나 지인인 척하거나, 당첨·혜택으로 경계를 늦춰요.", weight: 12 },
};

/** 공식 주소 링크만 있을 때의 가중치 — 링크 자체보다 "문자 링크로 확인하는 습관"의 위험만 반영 */
const OFFICIAL_LINK_WEIGHT = 5;
const EXTRA_MATCH_POINTS = 3;
const MAX_EXTRA_POINTS = 9;

/* ------------------------------------------------------------------ */
/* 유형 분류 · 등급                                                     */
/* ------------------------------------------------------------------ */

export const SCAM_TYPE_LABELS: Record<ScamType, string> = {
  delivery: "택배 사칭 의심",
  finance: "금융기관 사칭 의심",
  government: "정부·수사기관 사칭 의심",
  payment: "결제 알림 사칭 의심",
  family: "가족·지인 사칭 의심",
  investment: "투자 권유 의심",
  loan: "대출 권유 의심",
  event: "당첨·부고 위장 의심",
  normal: "일반 안내 문자",
};

/** 점수 구간 하한 (이상) — 결과 화면·기록 목록이 모두 이 기준을 따른다 */
export const LEVEL_THRESHOLDS = { "very-high": 80, high: 60, caution: 30 } as const;

/** 100점은 "사기 확정"처럼 보이므로 단정적 인상을 피하려고 상한을 둔다 */
const SCORE_CAP = 96;
/** 규칙에 하나도 걸리지 않은 문자의 상한 */
const NO_SIGNAL_CAP = 12;
/** 누르거나 전화하거나 돈을 보낼 수단이 없는 문자의 상한 — '낮음'에 머문다 */
const NOT_ACTIONABLE_CAP = LEVEL_THRESHOLDS.caution - 1;

function classifyScamType(message: string, score: number): ScamType {
  if (score < LEVEL_THRESHOLDS.caution) return "normal";
  const checks: [ScamType, RegExp][] = [
    ["family", /엄마|아빠|딸|아들|부모님|휴대폰\s*고장|폰\s*(이)?\s*(고장|액정)|임시\s*폰/],
    ["investment", /수익|종목|투자|리딩|주식|코인/],
    ["loan", /대출|저금리|무담보|한도|햇살론/],
    ["delivery", /택배|배송|운송장|반송|물류|주소/],
    ["payment", /결제|승인|구매|주문하지/],
    ["government", /과태료|범칙금|국세청|건강보험|정부|경찰|검찰|지검|수사|법원|출석|환급|민원/],
    ["finance", /은행|계좌|카드|금융|금감원|이상\s*거래/],
    ["event", /당첨|쿠폰|경품|이벤트|부고|청첩장|장례식장|돌잔치/],
  ];
  for (const [type, re] of checks) {
    if (re.test(message)) return type;
  }
  return "finance";
}

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

/** 결과 화면의 결론 문장 */
export const LEVEL_HEADLINES: Record<RiskLevel, string> = {
  "very-high": "사기 문자일 가능성이 매우 높아요",
  high: "사기 문자일 가능성이 높아요",
  caution: "확인이 필요한 문자예요",
  low: "뚜렷한 위험 신호는 없어요",
};

/* ------------------------------------------------------------------ */
/* 하이라이트                                                           */
/* ------------------------------------------------------------------ */

function collectHighlights(message: string, rules: KeywordRule[], urls: UrlFinding[]): HighlightSpan[] {
  const spans: HighlightSpan[] = [];
  for (const rule of rules) {
    rule.pattern.lastIndex = 0;
    for (const m of message.matchAll(rule.pattern)) {
      if (m.index === undefined || !m[0].trim()) continue;
      spans.push({ start: m.index, end: m.index + m[0].length, text: m[0], category: rule.category, reason: rule.reason });
    }
  }

  URL_REGEX.lastIndex = 0;
  for (const m of message.matchAll(URL_REGEX)) {
    if (m.index === undefined) continue;
    const text = cleanUrl(m[0]);
    const official = urls.find((u) => u.url === text)?.isOfficial;
    spans.push({
      start: m.index,
      end: m.index + text.length,
      text,
      category: "link",
      reason: official
        ? "공식 주소로 보이지만, 문자 속 링크보다 평소 쓰던 앱으로 확인하는 게 더 안전해요."
        : "어디로 연결될지 모르는 링크예요. 누르지 말고 공식 앱이나 홈페이지로 확인하세요.",
    });
  }

  // 겹치는 구간은 먼저 시작하고 더 긴 것을 남긴다
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
/* 요약·행동 (저장용 — 화면 문구는 lib/verdict.ts가 다시 만든다)          */
/* ------------------------------------------------------------------ */

function buildSummary(level: RiskLevel, scamType: ScamType, signals: RiskSignal[]): string {
  if (level === "low") return "사칭·재촉 표현이나 의심 링크 같은 뚜렷한 위험 신호가 보이지 않았어요.";
  const titles = signals.slice(0, 3).map((s) => s.title);
  const type = scamType === "normal" ? "" : `${SCAM_TYPE_LABELS[scamType].replace(" 의심", "")}와 비슷하고, `;
  return `${type}${titles.join(" · ")} 신호가 있어요.`;
}

function buildActions(level: RiskLevel, r: { urls: UrlFinding[]; phones: PhoneFinding[]; signals: RiskSignal[] }): string[] {
  if (level === "low") {
    return [
      "평소 받던 발신처가 맞는지 확인해보세요.",
      "링크가 있다면 누르기보다 공식 앱이나 홈페이지로 확인하세요.",
      "조금이라도 이상하면 그곳의 대표번호로 직접 물어보세요.",
    ];
  }
  const has = (c: SignalCategory) => r.signals.some((s) => s.category === c);
  const actions: string[] = [];
  if (r.urls.length > 0) actions.push("문자 속 링크를 누르지 마세요.");
  if (r.phones.length > 0) actions.push("문자 속 번호로 전화하지 마세요.");
  actions.push("공식 앱·홈페이지·대표번호로 직접 확인하세요.");
  if (has("credential")) actions.push("인증번호·비밀번호·카드번호는 누구에게도 알려주지 마세요.");
  if (has("money") || has("emotion")) actions.push("돈을 보내기 전에 꼭 전화로 본인인지 확인하세요.");
  return actions;
}

/* ------------------------------------------------------------------ */
/* 메인 분석                                                            */
/* ------------------------------------------------------------------ */

function makeId(): string {
  return `a-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function analyzeMessageDemo(message: string, source: AnalysisSource = "text"): AnalysisResult {
  const trimmed = message.trim();
  const urls = analyzeUrls(trimmed);
  const phones = analyzePhones(trimmed);

  // 1) 문맥 조건을 통과한 규칙만 적용
  const rules = KEYWORD_RULES.filter((rule) => !rule.appliesTo || rule.appliesTo(trimmed, phones));
  const hitIds = new Set<string>();
  const matchesByCategory = new Map<SignalCategory, Set<string>>();
  for (const rule of rules) {
    rule.pattern.lastIndex = 0;
    for (const m of trimmed.matchAll(rule.pattern)) {
      if (!m[0].trim()) continue;
      if (rule.id) hitIds.add(rule.id);
      if (!matchesByCategory.has(rule.category)) matchesByCategory.set(rule.category, new Set());
      matchesByCategory.get(rule.category)!.add(m[0]);
    }
  }
  if (urls.length > 0) matchesByCategory.set("link", new Set(urls.map((u) => u.url)));

  // 2) 신호별 점수 — 근거를 한 줄씩 남긴다
  const breakdown: ScoreItem[] = [];
  const signals: RiskSignal[] = [];
  const riskyUrls = urls.filter((u) => !u.isOfficial);
  for (const [category, matches] of matchesByCategory) {
    const meta = CATEGORY_META[category];
    const officialLinkOnly = category === "link" && riskyUrls.length === 0;
    const weight = officialLinkOnly ? OFFICIAL_LINK_WEIGHT : meta.weight;
    const title = officialLinkOnly ? "공식 주소로 보이는 링크" : meta.title;
    breakdown.push({ label: title, points: weight });
    if (category !== "link" && matches.size > 1) {
      breakdown.push({
        label: `비슷한 표현 ${matches.size - 1}개 더`,
        points: Math.min((matches.size - 1) * EXTRA_MATCH_POINTS, MAX_EXTRA_POINTS),
        sub: true,
      });
    }
    signals.push({ category, title, description: meta.description, matches: [...matches].slice(0, 6), weight });
  }

  for (const u of urls) {
    if (u.isShortened) breakdown.push({ label: "주소를 숨긴 단축 링크", points: 5 });
    if (u.suspiciousTld) breakdown.push({ label: "스미싱에 흔한 주소(.top·.xyz 등)", points: 12 });
    if (u.officialMismatch) breakdown.push({ label: "내용과 다른 낯선 주소", points: 8 });
  }

  // 3) 함께 나오면 훨씬 위험한 조합
  const has = (c: SignalCategory) => matchesByCategory.has(c);
  const mobile = phones.some((p) => p.type === "개인 휴대폰 번호");
  const combos: [hit: boolean, label: string, points: number][] = [
    [has("emotion") && has("money"), "가족·지인·혜택 + 돈 요구", 12],
    [has("impersonation") && has("money"), "기관·회사 이름 + 돈 요구", 8],
    [mobile && (has("money") || (has("impersonation") && OFFICIAL_ORG.test(trimmed))), "금융·기관 안내를 개인 휴대폰 번호로", 15],
    [has("emotion") && riskyUrls.length > 0, "가족·지인·혜택 + 낯선 링크", 18],
    [hitIds.has("family") && hitIds.has("phone-broken"), "가족 호칭 + 휴대폰 고장·임시폰", 15],
    [hitIds.has("call-lure"), "‘본인이 아니면 연락’ + 문자 속 번호", 15],
    [hitIds.has("police") && hitIds.has("crime"), "수사기관 이름 + 사건 연루", 15],
    [hitIds.has("remote-app") && has("impersonation"), "기관·회사 이름 + 앱 설치 유도", 15],
  ];
  for (const [hit, label, points] of combos) if (hit) breakdown.push({ label, points });

  // 4) 상한 — 단정을 피하고, 행동하게 만드는 수단이 없는 알림은 '낮음'에 둔다
  const raw = breakdown.reduce((sum, item) => sum + item.points, 0);
  const actionable =
    urls.length > 0 ||
    phones.length > 0 ||
    has("money") ||
    CHANNEL.test(trimmed) ||
    (has("credential") && SHARE_REQUEST.test(trimmed));
  let score = raw;
  let scoreCapNote: string | undefined;
  if (signals.length === 0 && score > NO_SIGNAL_CAP) {
    score = NO_SIGNAL_CAP;
  } else if (!actionable && score > NOT_ACTIONABLE_CAP) {
    score = NOT_ACTIONABLE_CAP;
    scoreCapNote = `링크·전화번호·송금 요구처럼 행동하게 만드는 수단이 없어 ${NOT_ACTIONABLE_CAP}점까지만 반영했어요.`;
  } else if (score > SCORE_CAP) {
    score = SCORE_CAP;
    scoreCapNote = `‘사기 확정’처럼 보이지 않도록 ${SCORE_CAP}점을 넘기지 않아요.`;
  }

  signals.sort((a, b) => b.weight - a.weight);
  const level = scoreToLevel(score);
  const scamType = classifyScamType(trimmed, score);

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
    highlights: collectHighlights(trimmed, rules, urls),
    urls,
    phones,
    summary: buildSummary(level, scamType, signals),
    actions: buildActions(level, { urls, phones, signals }),
    breakdown,
    scoreCapNote,
    source,
    engine: "demo",
  };
}
