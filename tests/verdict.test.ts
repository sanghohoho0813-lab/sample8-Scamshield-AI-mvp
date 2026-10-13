import { describe, expect, it } from "vitest";
import { analyzeMessageDemo } from "@/lib/risk-engine";
import {
  absentChecks,
  actionPlan,
  riskExplanations,
  scoreBreakdown,
  similarRecent,
  verdictHeadline,
  visibleHighlights,
} from "@/lib/verdict";
import { guideForScamType, GUIDES } from "@/lib/guides";
import { SAMPLE_MESSAGES } from "@/lib/samples";
import type { HistoryEntry } from "@/lib/types";

const sample = (id: string) => SAMPLE_MESSAGES.find((s) => s.id === id)!.text;

describe("결론과 지금 할 일", () => {
  it("판정 문구는 저장된 문구가 아니라 현재 기준으로 다시 만든다", () => {
    const r = { ...analyzeMessageDemo(sample("s1")), headline: "예전 문구" };
    expect(verdictHeadline(r)).toBe("사기 문자일 가능성이 매우 높아요");
  });

  it("위험 문자는 할 일을 1~3개로, 유형에 맞는 행동을 맨 앞에 둔다", () => {
    expect(actionPlan(analyzeMessageDemo(sample("s1")))[0]).toMatch(/택배사 공식 앱/);
    expect(actionPlan(analyzeMessageDemo(sample("s4")))[0]).toMatch(/원래 알던 번호로 전화/);
    expect(actionPlan(analyzeMessageDemo(sample("s8")))[0]).toMatch(/결제 내역을 확인/);
    for (const s of SAMPLE_MESSAGES.filter((m) => m.type !== "normal" && !m.ambiguous)) {
      const steps = actionPlan(analyzeMessageDemo(s.text));
      expect(steps.length).toBeGreaterThanOrEqual(1);
      expect(steps.length).toBeLessThanOrEqual(3);
    }
  });

  it("같은 행동을 두 번 말하지 않는다", () => {
    for (const s of SAMPLE_MESSAGES) {
      const steps = actionPlan(analyzeMessageDemo(s.text));
      expect(steps.filter((x) => x.includes("링크를 누르지") || x.includes("링크는 누르지")).length).toBeLessThanOrEqual(1);
    }
  });

  it("수사기관 사칭은 112에 직접 확인하라고 안내한다", () => {
    const r = analyzeMessageDemo("서울중앙지검 수사관입니다. 귀하 명의 계좌가 사건에 연루되어 연락드립니다. 010-9999-1111");
    expect(actionPlan(r)[0]).toMatch(/112/);
  });

  it("낮음 결과는 겁주지 않고 가벼운 확인만 권한다", () => {
    const steps = actionPlan(analyzeMessageDemo(sample("s14")));
    expect(steps).toHaveLength(2);
    expect(steps.join(" ")).not.toMatch(/112|신고/);
  });
});

describe("왜 위험한가요", () => {
  it("문제 문구와 쉬운 이유를 함께 보여준다", () => {
    const items = riskExplanations(analyzeMessageDemo(sample("s1")));
    expect(items.length).toBeGreaterThanOrEqual(3);
    for (const item of items) {
      expect(item.title).toBeTruthy();
      expect(item.why).toMatch(/요\.$/);
    }
    const link = items.find((i) => i.id === "link")!;
    expect(link.title).toBe("공식 주소가 아닌 링크가 있어요");
    expect(link.quotes).toEqual(["dhl-track.top"]);
  });

  it("사칭 근거에는 '배송' 같은 일반 단어보다 회사 이름을 인용한다", () => {
    const item = riskExplanations(analyzeMessageDemo(sample("s1"))).find((i) => i.id === "impersonation")!;
    expect(item.quotes[0]).toBe("CJ대한통운");
  });

  it("원격 앱 설치 유도는 따로 이름 붙여 설명한다", () => {
    const r = analyzeMessageDemo("금융감독원입니다. 보호조치를 위해 팀뷰어 앱을 설치하세요. 02-1234-5678");
    expect(riskExplanations(r).some((i) => i.title === "모르는 앱을 설치하게 해요")).toBe(true);
  });

  it("기관·금전 안내를 개인 휴대폰 번호로 받게 하면 근거에 넣는다", () => {
    const r = analyzeMessageDemo(sample("s6"));
    expect(riskExplanations(r).some((i) => i.id === "phone")).toBe(true);
  });

  it("최대 5개, 낮음 결과는 근거 대신 확인한 항목을 보여준다", () => {
    for (const s of SAMPLE_MESSAGES) expect(riskExplanations(analyzeMessageDemo(s.text)).length).toBeLessThanOrEqual(5);
    const low = analyzeMessageDemo("엄마 오늘 7시에 들어갈게요");
    expect(riskExplanations(low)).toEqual([]);
    expect(absentChecks(low)).toEqual(["서두르게 만드는 말이 없어요", "개인정보나 돈을 달라고 하지 않아요", "누르게 하는 링크가 없어요"]);
  });

  it("'배송' 같은 일상 단어는 하이라이트하지 않는다", () => {
    const texts = visibleHighlights(analyzeMessageDemo(sample("s1"))).map((h) => h.text);
    expect(texts).not.toContain("배송");
    expect(texts).toContain("CJ대한통운");
  });
});

describe("점수 근거", () => {
  it("엔진이 남긴 근거를 그대로 쓴다", () => {
    const { items, approximate } = scoreBreakdown(analyzeMessageDemo(sample("s1")));
    expect(approximate).toBe(false);
    expect(items.map((i) => i.label)).toContain("스미싱에 흔한 주소(.top·.xyz 등)");
  });

  it("근거가 없는 이전 기록은 신호별 기본 점수로 대신 보여준다", () => {
    const old = { ...analyzeMessageDemo(sample("s1")), breakdown: undefined };
    const { items, approximate } = scoreBreakdown(old);
    expect(approximate).toBe(true);
    expect(items.length).toBe(old.signals.length);
  });
});

describe("반복해서 받은 유형", () => {
  const NOW = new Date(2026, 9, 13, 12).getTime();
  const entry = (id: string, text: string, daysAgo: number): HistoryEntry => {
    const result = analyzeMessageDemo(text);
    const createdAt = new Date(NOW - daysAgo * 86_400_000).toISOString();
    return { id, createdAt, preview: text, score: result.score, level: result.level, scamType: result.scamType, scamTypeLabel: result.scamTypeLabel, result };
  };

  it("최근 30일 안의 같은 유형 의심 문자만 센다", () => {
    const current = entry("now", sample("s1"), 0);
    const list = [current, entry("a", sample("s13"), 2), entry("b", sample("s13") + " ", 40), entry("c", sample("s2"), 1), entry("d", sample("s11"), 1)];
    expect(similarRecent(current, list, NOW).map((e) => e.id)).toEqual(["a"]);
  });

  it("낮음 결과에는 반복 안내를 하지 않는다", () => {
    const low = entry("low", sample("s14"), 0);
    expect(similarRecent(low, [low, entry("x", sample("s14"), 1)], NOW)).toEqual([]);
  });
});

describe("유형별 가이드", () => {
  it("위험 유형은 모두 가이드로 이어지고, 가이드는 패턴→확인→금지를 갖춘다", () => {
    for (const type of ["delivery", "finance", "government", "payment", "family", "investment", "loan", "event"] as const) {
      expect(guideForScamType(type)).toBeDefined();
    }
    expect(guideForScamType("normal")).toBeUndefined();
    for (const g of GUIDES) {
      expect(g.example.length).toBeGreaterThan(10);
      expect(g.checks.length).toBeGreaterThan(0);
      expect(g.donts.length).toBeGreaterThan(0);
    }
  });
});
