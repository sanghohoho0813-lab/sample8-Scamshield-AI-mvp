import { SITUATIONS, type SituationId } from "./recovery";

/**
 * 피해 대응 체크 — "몇 번째 할 일을 마쳤는지"만 남긴다.
 * 전화를 걸고 돌아오거나 다른 사이트에 다녀와도 이어서 볼 수 있게 이 탭 동안만 보관한다.
 */
export const RECOVERY_PROGRESS_KEY = "scamshield.recovery.v1";

export type RecoveryProgress = Partial<Record<SituationId, number[]>>;

/** 저장된 값을 믿지 않고, 지금 있는 상황·단계 범위 안의 값만 살린다 */
export function parseProgress(raw: string | null): RecoveryProgress {
  if (!raw) return {};
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return {};
  }
  if (!data || typeof data !== "object") return {};
  const out: RecoveryProgress = {};
  for (const s of SITUATIONS) {
    const value = (data as Record<string, unknown>)[s.id];
    if (!Array.isArray(value)) continue;
    const steps = [...new Set(value.filter((i): i is number => Number.isInteger(i) && i >= 0 && i < s.steps.length))].sort(
      (a, b) => a - b,
    );
    if (steps.length > 0) out[s.id] = steps;
  }
  return out;
}

/** 한 단계를 했어요 ↔ 아직으로 바꾼 새 값 (원본은 그대로) */
export function toggleStep(progress: RecoveryProgress, id: SituationId, index: number): RecoveryProgress {
  const current = progress[id] ?? [];
  const next = current.includes(index) ? current.filter((i) => i !== index) : [...current, index].sort((a, b) => a - b);
  const out = { ...progress };
  if (next.length > 0) out[id] = next;
  else delete out[id];
  return out;
}

/** 한 상황의 체크를 모두 지운 새 값 */
export function resetSituation(progress: RecoveryProgress, id: SituationId): RecoveryProgress {
  const out = { ...progress };
  delete out[id];
  return out;
}

export function progressOf(progress: RecoveryProgress, id: SituationId): { done: number; total: number } {
  const total = SITUATIONS.find((s) => s.id === id)?.steps.length ?? 0;
  return { done: progress[id]?.length ?? 0, total };
}
