import { describe, expect, it } from "vitest";
import { keepDots } from "@/lib/typography";

describe("keepDots", () => {
  it("가운뎃점 앞에만 단어 결합 문자를 넣어 줄이 '·'로 시작하지 않게 한다", () => {
    expect(keepDots("주소·카드")).toBe("주소⁠·카드");
    expect(keepDots("가·나·다")).toBe("가⁠·나⁠·다");
    expect(keepDots("가운뎃점 없음")).toBe("가운뎃점 없음");
  });
});
