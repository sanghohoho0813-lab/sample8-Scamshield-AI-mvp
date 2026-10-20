import { describe, expect, it } from "vitest";
import { DEVICES, HOW_TO, guessDevice } from "@/lib/how-to";
import { GUIDES, guideForScamType } from "@/lib/guides";
import { SAMPLE_MESSAGES } from "@/lib/samples";

describe("복사·캡처 방법 안내", () => {
  it("아이폰·아이패드면 아이폰, 그 밖에는 갤럭시 안내부터 보여준다", () => {
    expect(guessDevice("Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)")).toBe("iphone");
    expect(guessDevice("Mozilla/5.0 (iPad; CPU OS 17_4 like Mac OS X)")).toBe("iphone");
    expect(guessDevice("Mozilla/5.0 (Linux; Android 14; SM-S921N)")).toBe("galaxy");
    expect(guessDevice("Mozilla/5.0 (Windows NT 10.0; Win64; x64)")).toBe("galaxy");
  });

  it("두 방법 모두 기기별 순서와 덧붙임이 있다", () => {
    for (const topic of Object.values(HOW_TO)) {
      for (const { value } of DEVICES) {
        expect(topic.steps[value].length).toBeGreaterThanOrEqual(3);
        expect(topic.tip[value]).toBeTruthy();
      }
      expect(topic.caution).toBeTruthy();
    }
    // "…도 보기" 버튼은 넘어갈 방법의 이름을 쓴다
    expect(HOW_TO.capture.switchLabel).toContain("캡처");
    expect(HOW_TO.copy.switchLabel).toContain("복사");
  });
});

describe("가이드 → 예시로 검사해보기", () => {
  it("모든 가이드가 같은 유형의 사기 예시와 이어진다", () => {
    for (const guide of GUIDES) {
      const sample = SAMPLE_MESSAGES.find((s) => s.id === guide.sampleId);
      expect(sample, guide.id).toBeDefined();
      expect(sample!.ambiguous).toBeFalsy();
      expect(guideForScamType(sample!.type)?.id).toBe(guide.id);
    }
  });
});
