import { describe, expect, it } from "vitest";
import { analyzeMessageDemo } from "@/lib/risk-engine";
import { absentChecks, preventionActions, verdictHeadline, verdictReasons, visibleHighlights } from "@/lib/verdict";
import { SAMPLE_MESSAGES } from "@/lib/samples";

describe("verdictReasons", () => {
  it("위험 문자는 이유를 1~3개로 압축한다", () => {
    for (const s of SAMPLE_MESSAGES.filter((m) => m.type !== "normal")) {
      const reasons = verdictReasons(analyzeMessageDemo(s.text));
      expect(reasons.length).toBeGreaterThanOrEqual(1);
      expect(reasons.length).toBeLessThanOrEqual(3);
    }
  });

  it("위험이 낮으면 이유를 만들지 않는다", () => {
    expect(verdictReasons(analyzeMessageDemo("내일 회의는 3시로 옮겼어요"))).toEqual([]);
  });

  it("의심 링크는 구체적인 문장으로 설명한다", () => {
    const r = analyzeMessageDemo("택배 주소불명 반송 예정. 금일 내 확인 http://dhl-track.top/kr");
    expect(verdictReasons(r)).toContain("공식 주소가 아닌 것으로 보이는 링크가 있어요");
  });

  it("기관·금전 안내를 개인 휴대폰 번호로 받게 하면 이유에 넣는다", () => {
    const r = analyzeMessageDemo("정부지원 햇살론 대상자로 선정되셨습니다. 기존 대출 상환 후 진행. 상담 010-9876-5432");
    expect(verdictReasons(r)).toContain("개인 휴대폰 번호로 연락하게 해요");
  });

  it("사칭 이유에는 '배송' 같은 일반 단어 대신 회사 이름을 인용한다", () => {
    const r = analyzeMessageDemo(SAMPLE_MESSAGES[0].text);
    const impersonation = verdictReasons(r).find((x) => x.includes("내세워요"));
    if (impersonation) expect(impersonation).not.toMatch(/“배송”/);
  });
});

describe("표현 규칙", () => {
  it("판정 문구는 항상 현재 기준으로 다시 만든다", () => {
    const r = { ...analyzeMessageDemo(SAMPLE_MESSAGES[0].text), headline: "예전 문구입니다." };
    expect(verdictHeadline(r)).toBe("위험 신호가 많이 발견됐어요");
  });

  it("예방 행동에서 사후 대처·신고 문장은 분리한다", () => {
    const actions = preventionActions(analyzeMessageDemo(SAMPLE_MESSAGES[1].text));
    expect(actions.length).toBeGreaterThan(0);
    expect(actions.some((a) => a.startsWith("이미 ") || a.includes("신고하세요"))).toBe(false);
  });

  it("'배송' 같은 일상 단어는 하이라이트하지 않는다", () => {
    const r = analyzeMessageDemo("[CJ대한통운] 배송 주소 불일치. 금일 내 확인 http://dhl-track.top/kr");
    const texts = visibleHighlights(r).map((h) => h.text);
    expect(texts).not.toContain("배송");
    expect(texts).toContain("CJ대한통운");
  });

  it("낮음 결과는 확인한 항목을 최대 3개 보여준다", () => {
    const checks = absentChecks(analyzeMessageDemo("엄마 오늘 7시에 들어갈게요"));
    expect(checks).toEqual(["서두르게 만드는 표현이 없어요", "개인정보나 돈을 요구하지 않아요", "누르게 하는 링크가 없어요"]);
  });
});
