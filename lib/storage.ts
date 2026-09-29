import type { AnalysisResult, HistoryEntry } from "./types";
import { buildSeedHistory } from "./seed-history";
import { toPreview } from "./format";

// v2: 결과 요약 형식·공유 기록(sharedAt) 추가에 맞춰 예시 데이터를 새로 채운다
const HISTORY_KEY = "scamshield.history.v2";
const SEEDED_KEY = "scamshield.history.seeded.v2";
const MAX_ENTRIES = 50;

/** localStorage를 쓸 수 없는 환경(사생활 보호 모드 등)에서도 방금 분석한 결과를 볼 수 있도록 하는 폴백 */
const memory = new Map<string, HistoryEntry>();

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function read(): HistoryEntry[] {
  if (!isBrowser()) return [];
  try {
    if (!window.localStorage.getItem(SEEDED_KEY)) {
      const seed = buildSeedHistory();
      window.localStorage.setItem(HISTORY_KEY, JSON.stringify(seed));
      window.localStorage.setItem(SEEDED_KEY, "1");
      return seed;
    }
    const raw = window.localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as HistoryEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [...memory.values()];
  }
}

function write(list: HistoryEntry[]): void {
  try {
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(list.slice(0, MAX_ENTRIES)));
  } catch {
    // 저장 불가 환경: memory 폴백만 유지
  }
}

export function getHistory(): HistoryEntry[] {
  return read();
}

export function getHistoryEntry(id: string): HistoryEntry | undefined {
  return read().find((e) => e.id === id) ?? memory.get(id);
}

/** 핵심 완료 이벤트: 분석 결과를 기록에 저장 */
export function saveAnalysis(result: AnalysisResult): HistoryEntry {
  const entry: HistoryEntry = {
    id: result.id,
    createdAt: result.createdAt,
    preview: toPreview(result.message),
    score: result.score,
    level: result.level,
    scamType: result.scamType,
    scamTypeLabel: result.scamTypeLabel,
    result,
  };
  memory.set(entry.id, entry);
  if (isBrowser()) write([entry, ...read().filter((e) => e.id !== entry.id)]);
  return entry;
}

/** 공유(또는 복사) 완료 표시 */
export function markShared(id: string): string {
  const sharedAt = new Date().toISOString();
  const cached = memory.get(id);
  if (cached) memory.set(id, { ...cached, sharedAt });
  if (isBrowser()) write(read().map((e) => (e.id === id ? { ...e, sharedAt } : e)));
  return sharedAt;
}

export function deleteEntry(id: string): void {
  memory.delete(id);
  if (isBrowser()) write(read().filter((e) => e.id !== id));
}

export function clearHistory(): void {
  memory.clear();
  if (isBrowser()) write([]);
}

/** 데모 상태로 되돌리기: 직접 검사한 기록은 지우고 예시 기록을 다시 채움 */
export function restoreDemoHistory(): HistoryEntry[] {
  memory.clear();
  const seed = buildSeedHistory();
  if (isBrowser()) write(seed);
  return seed;
}
