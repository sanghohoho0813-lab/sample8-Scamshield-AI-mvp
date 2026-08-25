import type { AnalysisResult, HistoryEntry } from "./types";
import { SEED_HISTORY } from "./seed-history";

const HISTORY_KEY = "scamshield.history.v1";
const SEEDED_KEY = "scamshield.history.seeded.v1";
const MAX_ENTRIES = 50;

/** 저장 시 개인정보 보호를 위해 미리보기는 앞부분만 사용 */
function toPreview(message: string): string {
  const oneLine = message.replace(/\s+/g, " ").trim();
  return oneLine.length > 42 ? `${oneLine.slice(0, 42)}…` : oneLine;
}

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function readRaw(): HistoryEntry[] {
  if (!isBrowser()) return [];
  try {
    const seeded = window.localStorage.getItem(SEEDED_KEY);
    if (!seeded) {
      window.localStorage.setItem(HISTORY_KEY, JSON.stringify(SEED_HISTORY));
      window.localStorage.setItem(SEEDED_KEY, "1");
      return [...SEED_HISTORY];
    }
    const raw = window.localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as HistoryEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getHistory(): HistoryEntry[] {
  return readRaw();
}

export function getHistoryEntry(id: string): HistoryEntry | undefined {
  return readRaw().find((e) => e.id === id);
}

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
  if (!isBrowser()) return entry;
  try {
    const list = readRaw();
    const next = [entry, ...list.filter((e) => e.id !== entry.id)].slice(0, MAX_ENTRIES);
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  } catch {
    // 저장 실패는 치명적이지 않음
  }
  return entry;
}

export function clearHistory(): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify([]));
  } catch {
    // ignore
  }
}
