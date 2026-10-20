import { describe, expect, it } from "vitest";
import { FONT_SCALES, fontScaleLabel, nextFontScale } from "@/lib/font-scale";

describe("글자 크기 빠른 전환", () => {
  it("보통 → 크게 → 아주 크게 → 보통 순서로 돈다", () => {
    expect(nextFontScale("normal")).toBe("large");
    expect(nextFontScale("large")).toBe("x-large");
    expect(nextFontScale("x-large")).toBe("normal");
  });

  it("설정 화면과 같은 이름을 쓴다", () => {
    expect(FONT_SCALES.map((s) => s.label)).toEqual(["보통", "크게", "아주 크게"]);
    expect(fontScaleLabel("x-large")).toBe("아주 크게");
  });
});
