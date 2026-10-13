import type { HistoryEntry } from "./types";
import { analyzeMessageDemo } from "./risk-engine";
import { SAMPLE_MESSAGES } from "./samples";
import { toPreview } from "./format";

/** 예시 기록 구성: 샘플 인덱스와 "몇 시간 전"에 검사했는지 */
const SEED_PLAN: [sampleIndex: number, hoursAgo: number][] = [
  [0, 2], // 택배 사칭
  [13, 5], // 정상 카드 승인 알림
  [1, 25], // 금융기관 사칭
  [3, 28], // 가족 사칭
  [12, 50], // 택배 사칭 (같은 유형 반복)
  [14, 74], // 애매한 해외 승인 알림 (주의)
  [2, 98], // 정부기관 사칭
  [7, 145], // 결제 알림 사칭
];

/**
 * 데모용 예시 분석 기록 8건.
 * 결과는 결정적(deterministic)이며, 날짜는 생성 시점 기준 최근 일주일로 채운다.
 */
export function buildSeedHistory(): HistoryEntry[] {
  const now = Date.now();
  return SEED_PLAN.map(([sampleIdx, hoursAgo]) => {
    const sample = SAMPLE_MESSAGES[sampleIdx];
    const result = analyzeMessageDemo(sample.text, "text");
    const id = `seed-${sample.id}`;
    const createdAt = new Date(now - hoursAgo * 60 * 60 * 1000).toISOString();
    result.id = id;
    result.createdAt = createdAt;
    return {
      id,
      createdAt,
      preview: toPreview(sample.text),
      score: result.score,
      level: result.level,
      scamType: result.scamType,
      scamTypeLabel: result.scamTypeLabel,
      // 가족 사칭 예시는 "가족에게 공유한 기록"으로 두어 공유 흐름이 기록에 남는 모습을 보여줌
      ...(sampleIdx === 3 ? { sharedAt: new Date(now - (hoursAgo - 1) * 3600 * 1000).toISOString() } : {}),
      result,
    };
  });
}
