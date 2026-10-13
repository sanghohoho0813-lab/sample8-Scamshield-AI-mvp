/** 위험도 구간 */
export type RiskLevel = "low" | "caution" | "high" | "very-high";

/** 위험 신호 카테고리 */
export type SignalCategory =
  | "impersonation"
  | "urgency"
  | "link"
  | "credential"
  | "money"
  | "emotion";

/** 사기 유형 분류 */
export type ScamType =
  | "delivery"
  | "finance"
  | "government"
  | "payment"
  | "family"
  | "investment"
  | "loan"
  | "event"
  | "normal";

export interface RiskSignal {
  category: SignalCategory;
  title: string;
  description: string;
  /** 이 신호를 유발한 문구들 */
  matches: string[];
  weight: number;
}

export interface HighlightSpan {
  /** 원문 내 시작 인덱스 */
  start: number;
  end: number;
  text: string;
  category: SignalCategory;
  /** "왜 의심스러운가요?" 설명 */
  reason: string;
}

export interface UrlFinding {
  url: string;
  isShortened: boolean;
  isHttps: boolean;
  suspiciousTld: boolean;
  officialMismatch: boolean;
  /** 기관 공식 도메인으로 확인된 주소 (이전 기록에는 없을 수 있음) */
  isOfficial?: boolean;
  notes: string[];
}

/** 점수 계산 근거 한 줄 — 결과 화면 "점수는 이렇게 매겼어요"에 그대로 보여준다 */
export interface ScoreItem {
  label: string;
  points: number;
  /** 바로 위 항목에 딸린 추가 점수 (같은 종류 표현이 더 있을 때) */
  sub?: boolean;
}

export type PhoneType = "개인 휴대폰 번호" | "대표번호 형식" | "국제발신 번호" | "일반 전화번호";

export interface PhoneFinding {
  number: string;
  type: PhoneType;
  notes: string[];
}

export interface AnalysisResult {
  id: string;
  createdAt: string;
  /** 분석 원문 */
  message: string;
  score: number;
  level: RiskLevel;
  levelLabel: string;
  headline: string;
  scamType: ScamType;
  scamTypeLabel: string;
  signals: RiskSignal[];
  highlights: HighlightSpan[];
  urls: UrlFinding[];
  phones: PhoneFinding[];
  summary: string;
  actions: string[];
  /** 점수 계산 근거 (이전 기록에는 없을 수 있음) */
  breakdown?: ScoreItem[];
  /** 상한을 적용했다면 그 이유 */
  scoreCapNote?: string;
  /** 이미지 업로드 경로로 분석했는지 */
  source: AnalysisSource;
  /** demo | ai */
  engine: "demo" | "ai";
}

export interface HistoryEntry {
  id: string;
  createdAt: string;
  preview: string;
  score: number;
  level: RiskLevel;
  scamType: ScamType;
  scamTypeLabel: string;
  /** 가족에게 공유(또는 복사)한 시각 */
  sharedAt?: string;
  result: AnalysisResult;
}

export type AnalysisSource = "text" | "image";

export type FontScale = "normal" | "large" | "x-large";
