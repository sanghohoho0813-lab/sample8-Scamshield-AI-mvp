import { describe, expect, it } from "vitest";
import { formatDayGroup, formatRelative, formatWhen, toPreview } from "@/lib/format";

// 로컬 시간대 기준으로 만들어 어느 시간대에서 돌려도 같은 결과가 나오게 한다
const NOW = new Date(2026, 9, 6, 15, 0).getTime(); // 2026-10-06 (화) 15:00
const at = (d: number, h: number, m = 0, month = 9, y = 2026) => new Date(y, month, d, h, m).toISOString();

describe("formatWhen", () => {
  it("오늘·어제·그 이전·작년을 구분한다", () => {
    expect(formatWhen(at(6, 14, 2), NOW)).toBe("오늘 14:02");
    expect(formatWhen(at(5, 9, 10), NOW)).toBe("어제 09:10");
    expect(formatWhen(at(3, 8, 10), NOW)).toBe("10월 3일 08:10");
    expect(formatWhen(at(3, 8, 10, 9, 2025), NOW)).toBe("2025년 10월 3일 08:10");
  });
});

describe("formatRelative", () => {
  it("방금·분·시간·어제·며칠·날짜 순으로 표시한다", () => {
    expect(formatRelative(new Date(NOW - 20_000).toISOString(), NOW)).toBe("방금 전");
    expect(formatRelative(new Date(NOW - 5 * 60_000).toISOString(), NOW)).toBe("5분 전");
    expect(formatRelative(new Date(NOW - 3 * 3_600_000).toISOString(), NOW)).toBe("3시간 전");
    expect(formatRelative(at(5, 9), NOW)).toBe("어제");
    expect(formatRelative(at(2, 9), NOW)).toBe("4일 전");
    expect(formatRelative(at(25, 9, 0, 8), NOW)).toBe("9월 25일");
  });
});

describe("formatDayGroup", () => {
  it("요일을 붙여 날짜 묶음 제목을 만든다", () => {
    expect(formatDayGroup(at(6, 1), NOW)).toBe("오늘");
    expect(formatDayGroup(at(5, 23), NOW)).toBe("어제");
    expect(formatDayGroup(at(3, 12), NOW)).toBe("10월 3일 (토)");
  });
});

describe("toPreview", () => {
  it("줄바꿈을 없애고 42자에서 자른다", () => {
    expect(toPreview("첫 줄\n\n둘째   줄")).toBe("첫 줄 둘째 줄");
    const long = "가".repeat(50);
    expect(toPreview(long)).toBe(`${"가".repeat(42)}…`);
  });
});
