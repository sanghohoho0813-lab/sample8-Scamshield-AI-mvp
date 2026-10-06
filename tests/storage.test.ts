import { beforeEach, describe, expect, it, vi } from "vitest";
import { analyzeMessageDemo } from "@/lib/risk-engine";

class MemoryStorage {
  private data = new Map<string, string>();
  broken = false;
  getItem(k: string) {
    if (this.broken) throw new Error("SecurityError");
    return this.data.get(k) ?? null;
  }
  setItem(k: string, v: string) {
    if (this.broken) throw new Error("QuotaExceededError");
    this.data.set(k, v);
  }
  removeItem(k: string) {
    this.data.delete(k);
  }
}

let storage: MemoryStorage;
// 모듈 안의 메모리 폴백 상태를 테스트마다 초기화하기 위해 매번 새로 불러온다
const load = () => import("@/lib/storage");

beforeEach(() => {
  vi.resetModules();
  storage = new MemoryStorage();
  vi.stubGlobal("window", { localStorage: storage });
});

describe("기록 저장소", () => {
  it("첫 방문에는 예시 기록 8건을 채운다", async () => {
    const { getHistory } = await load();
    expect(getHistory()).toHaveLength(8);
    expect(getHistory()).toHaveLength(8);
  });

  it("새 결과는 맨 앞에 저장된다", async () => {
    const { getHistory, saveAnalysis } = await load();
    const r = analyzeMessageDemo("급하게 송금해줘");
    expect(saveAnalysis(r).replaced).toBe(false);
    expect(getHistory()[0].id).toBe(r.id);
  });

  it("같은 문자를 다시 검사하면 기록을 늘리지 않고 교체한다", async () => {
    const { getHistory, saveAnalysis, getHistoryEntry } = await load();
    const first = analyzeMessageDemo("급하게 송금해줘");
    saveAnalysis(first);
    const before = getHistory().length;
    const again = analyzeMessageDemo("급하게   송금해줘\n");
    expect(saveAnalysis(again).replaced).toBe(true);
    expect(getHistory()).toHaveLength(before);
    expect(getHistoryEntry(first.id)).toBeUndefined();
    expect(getHistoryEntry(again.id)).toBeDefined();
  });

  it("최대 50건까지만 보관한다", async () => {
    const { getHistory, saveAnalysis } = await load();
    for (let i = 0; i < 60; i++) saveAnalysis(analyzeMessageDemo(`문자 ${i}`));
    expect(getHistory()).toHaveLength(50);
    expect(getHistory()[0].result.message).toBe("문자 59");
  });

  it("손상된 기록은 건너뛰고, 깨진 JSON이면 빈 목록을 돌려준다", async () => {
    const { getHistory } = await load();
    getHistory(); // 예시 기록 채우기
    const valid = JSON.parse(storage.getItem("scamshield.history.v2")!);
    storage.setItem("scamshield.history.v2", JSON.stringify([{ id: "broken" }, null, ...valid]));
    expect(getHistory()).toHaveLength(valid.length);
    storage.setItem("scamshield.history.v2", "{not json");
    expect(getHistory()).toEqual([]);
  });

  it("공유 표시와 삭제가 기록에 반영된다", async () => {
    const { getHistoryEntry, saveAnalysis, markShared, deleteEntry } = await load();
    const r = analyzeMessageDemo("급하게 송금해줘");
    saveAnalysis(r);
    const sharedAt = markShared(r.id);
    expect(getHistoryEntry(r.id)?.sharedAt).toBe(sharedAt);
    deleteEntry(r.id);
    expect(getHistoryEntry(r.id)).toBeUndefined();
  });

  it("저장소를 쓸 수 없어도 방금 검사한 결과는 볼 수 있다", async () => {
    const { getHistoryEntry, saveAnalysis } = await load();
    storage.broken = true;
    const r = analyzeMessageDemo("급하게 송금해줘");
    expect(() => saveAnalysis(r)).not.toThrow();
    expect(getHistoryEntry(r.id)?.result.message).toBe("급하게 송금해줘");
  });

  it("전체 삭제 후 예시 기록으로 되돌릴 수 있다", async () => {
    const { getHistory, clearHistory, restoreDemoHistory } = await load();
    clearHistory();
    expect(getHistory()).toEqual([]);
    expect(restoreDemoHistory()).toHaveLength(8);
    expect(getHistory()).toHaveLength(8);
  });
});
