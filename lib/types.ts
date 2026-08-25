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
  notes: string[];
}

export interface PhoneFinding {
  number: string;
  type: string;
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
  /** 이미지 업로드 경로로 분석했는지 */
  source: "text" | "image";
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
  result: AnalysisResult;
}

export type FontScale = "normal" | "large" | "x-large";
