import { describe, expect, it } from "vitest";
import { analyzeMessageDemo } from "@/lib/risk-engine";
import { buildShareText, maskSensitive, sharePreview } from "@/lib/share";
import { SAMPLE_MESSAGES } from "@/lib/samples";
import type { HistoryEntry } from "@/lib/types";

const toEntry = (text: string): HistoryEntry => {
  const result = analyzeMessageDemo(text);
  return { id: result.id, createdAt: result.createdAt, preview: text, score: result.score, level: result.level, scamType: result.scamType, scamTypeLabel: result.scamTypeLabel, result };
};

describe("공유 문구", () => {
  it("메신저에서 눌리지 않도록 링크와 전화번호를 가린다", () => {
    expect(maskSensitive("확인 http://dhl-track.top/kr 문의 010-1234-5678")).toBe("확인 [링크] 문의 [전화번호]");
    expect(maskSensitive("han.gl/aB3dE 또는 1588-1688")).toBe("[링크] 또는 [전화번호]");
  });

  it("받는 사람이 문맥을 알 수 있게 무엇을·결과·할 일 순서로 쓴다", () => {
    const text = buildShareText(toEntry(SAMPLE_MESSAGES[0].text), "https://scamshield.example");
    const order = ["받은 문자를 검사해봤어요", "결과: 사기 문자일 가능성이 매우 높아요", "\n받은 문자\n", "이렇게 하세요", "112", "직접 검사해보기: https://scamshield.example"];
    let cursor = -1;
    for (const part of order) {
      const at = text.indexOf(part);
      expect(at).toBeGreaterThan(cursor);
      cursor = at;
    }
    expect(text).not.toMatch(/dhl-track|https?:\/\/(?!scamshield)/);
  });

  it("공유 문구에 검사 기록 주소를 넣지 않는다", () => {
    const entry = toEntry(SAMPLE_MESSAGES[0].text);
    expect(buildShareText(entry, "https://scamshield.example")).not.toContain(entry.id);
  });

  it("위험이 낮으면 신고 안내 없이 가벼운 확인만 보낸다", () => {
    const text = buildShareText(toEntry(SAMPLE_MESSAGES[13].text), "https://scamshield.example");
    expect(text).toContain("뚜렷한 위험 신호는 없어요");
    expect(text).toContain("그래도 이것만 확인하세요");
    expect(text).not.toContain("112");
  });

  it("긴 문자는 앞부분만 보낸다", () => {
    expect(sharePreview("가".repeat(200))).toHaveLength(91);
  });
});
