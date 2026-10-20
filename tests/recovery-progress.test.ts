import { describe, expect, it } from "vitest";
import { parseProgress, progressOf, resetSituation, toggleStep } from "@/lib/recovery-progress";

describe("피해 대응 체크", () => {
  it("한 단계를 체크하고 다시 누르면 해제한다 (원본은 바꾸지 않음)", () => {
    const empty = {};
    const one = toggleStep(empty, "money", 1);
    expect(one).toEqual({ money: [1] });
    expect(empty).toEqual({});
    const two = toggleStep(one, "money", 0);
    expect(two.money).toEqual([0, 1]);
    expect(toggleStep(two, "money", 1).money).toEqual([0]);
    // 마지막 체크를 풀면 상황 자체를 지운다
    expect(toggleStep(one, "money", 1)).toEqual({});
  });

  it("상황마다 따로 셈한다", () => {
    const p = toggleStep(toggleStep({}, "money", 0), "link", 2);
    expect(progressOf(p, "money")).toEqual({ done: 1, total: 3 });
    expect(progressOf(p, "link")).toEqual({ done: 1, total: 3 });
    expect(progressOf(p, "code")).toEqual({ done: 0, total: 3 });
    expect(resetSituation(p, "money")).toEqual({ link: [2] });
  });

  it("저장된 값은 지금 있는 상황·단계 범위만 살린다", () => {
    expect(parseProgress(null)).toEqual({});
    expect(parseProgress("not json")).toEqual({});
    expect(parseProgress("[1,2]")).toEqual({});
    expect(parseProgress(JSON.stringify({ money: [2, 0, 0, 9, -1, 1.5, "1"], unknown: [0], code: [] }))).toEqual({ money: [0, 2] });
  });
});
