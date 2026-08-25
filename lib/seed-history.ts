import type { HistoryEntry } from "./types";
import { analyzeMessageDemo } from "./risk-engine";
import { SAMPLE_MESSAGES } from "./samples";

/** 데모용 초기 분석 기록 8건 (샘플 문자를 데모 엔진으로 분석해 생성) */
function buildSeed(): HistoryEntry[] {
  const picks = [0, 1, 2, 3, 4, 5, 8, 10]; // 다양한 유형 + 정상에 가까운 문자 포함
  const now = Date.now();
  return picks.map((sampleIdx, i) => {
    const sample = SAMPLE_MESSAGES[sampleIdx];
    const result = analyzeMessageDemo(sample.text, "text");
    const createdAt = new Date(now - (i + 1) * 26 * 60 * 60 * 1000).toISOString();
    const id = `seed-${sample.id}`;
    result.id = id;
    result.createdAt = createdAt;
    const oneLine = sample.text.replace(/\s+/g, " ").trim();
    return {
      id,
      createdAt,
      preview: oneLine.length > 42 ? `${oneLine.slice(0, 42)}…` : oneLine,
      score: result.score,
      level: result.level,
      scamType: result.scamType,
      scamTypeLabel: result.scamTypeLabel,
      result,
    };
  });
}

export const SEED_HISTORY: HistoryEntry[] = buildSeed();
