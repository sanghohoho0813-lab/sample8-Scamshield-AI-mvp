import { describe, expect, it } from "vitest";
import { analyzeMessageDemo, LEVEL_THRESHOLDS, scoreToLevel } from "@/lib/risk-engine";
import { SAMPLE_MESSAGES } from "@/lib/samples";
import type { RiskLevel } from "@/lib/types";

const RANK: Record<RiskLevel, number> = { low: 0, caution: 1, high: 2, "very-high": 3 };
const levelOf = (text: string) => analyzeMessageDemo(text).level;

describe("scoreToLevel", () => {
  it("구간 경계값을 정확히 나눈다", () => {
    expect(scoreToLevel(0)).toBe("low");
    expect(scoreToLevel(LEVEL_THRESHOLDS.caution - 1)).toBe("low");
    expect(scoreToLevel(LEVEL_THRESHOLDS.caution)).toBe("caution");
    expect(scoreToLevel(LEVEL_THRESHOLDS.high)).toBe("high");
    expect(scoreToLevel(LEVEL_THRESHOLDS["very-high"])).toBe("very-high");
    expect(scoreToLevel(96)).toBe("very-high");
  });
});

describe("샘플 문자", () => {
  const scams = SAMPLE_MESSAGES.filter((s) => s.type !== "normal");
  const normals = SAMPLE_MESSAGES.filter((s) => s.type === "normal");

  it.each(scams.map((s) => [s.label, s.text]))("%s → 높음 이상", (_, text) => {
    expect(RANK[levelOf(text)]).toBeGreaterThanOrEqual(RANK.high);
  });

  it.each(normals.map((s) => [s.label, s.text]))("%s → 낮음", (_, text) => {
    expect(levelOf(text)).toBe("low");
  });

  it.each(scams.map((s) => [s.label, s.text, s.type]))("%s → 유형 분류", (_, text, type) => {
    expect(analyzeMessageDemo(text).scamType).toBe(type);
  });
});

describe("실제와 비슷한 문자 (오탐·미탐 회귀 방지)", () => {
  const cases: [label: string, text: string, expected: RiskLevel | "high+"][] = [
    ["가족 임시폰 + 상품권", "엄마 나야 폰 액정 나가서 임시폰이야 문화상품권 좀 사줄 수 있어? 급해", "high+"],
    ["택배 보관 + 단축 링크", "[Web발신] 귀하의 택배가 주소불명으로 보관중입니다. 확인: han.gl/aB3dE", "high+"],
    ["건강보험 + .xyz 링크", "[국민건강보험] 건강검진 결과 통보서가 발송되었습니다. 확인하기 http://nhis-kr.xyz", "high+"],
    ["햇살론 + 개인 번호", "○○저축은행입니다. 정부지원 햇살론 대상자로 선정되셨습니다. 기존 대출 상환 후 진행 가능하니 상담 바랍니다 010-9876-5432", "high+"],
    ["아들 급전", "아빠 나 지금 급하게 송금할 데가 있는데 이 계좌로 100만원만 보내줘 폰 고장나서 친구폰이야", "high+"],
    ["카드 해외승인 알림", "[KB국민카드] 홍*동님 10/05 12:31 해외승인 1,250,000원 누적 2,340,000원. 본인 아닐 경우 고객센터 1588-1688", "caution"],
    ["동창회 안내", "내일 저녁 7시 동창회 장소는 강남역 2번 출구 앞 식당입니다. 참석 여부 회신 부탁해요", "low"],
    ["쇼핑몰 배송 완료", "[쿠팡] 주문하신 상품이 배송 완료되었습니다. 문 앞을 확인해주세요.", "low"],
    ["인증번호 안내", "인증번호 [482913]를 입력해주세요. 타인에게 절대 알려주지 마세요. -네이버", "low"],
    ["급여 입금 알림", "[신한은행] 10월 급여 3,120,000원이 입금되었습니다.", "low"],
    ["이체 완료 알림", "[카카오뱅크] 홍길동님께 50,000원 이체가 완료되었습니다.", "low"],
    ["정상 배송 예정", "[CJ대한통운] 고객님의 상품이 오늘 14~16시 사이 배송 예정입니다.", "low"],
  ];

  it.each(cases)("%s → %s", (_, text, expected) => {
    const level = levelOf(text);
    if (expected === "high+") expect(RANK[level]).toBeGreaterThanOrEqual(RANK.high);
    else expect(level).toBe(expected);
  });
});

describe("점수 규칙", () => {
  it("같은 문자는 항상 같은 점수를 낸다", () => {
    const text = SAMPLE_MESSAGES[0].text;
    const a = analyzeMessageDemo(text);
    const b = analyzeMessageDemo(text);
    expect(a.score).toBe(b.score);
    expect(a.signals).toEqual(b.signals);
    expect(a.id).not.toBe(b.id);
  });

  it("점수는 0~96 범위를 벗어나지 않는다", () => {
    const worst = SAMPLE_MESSAGES.map((s) => s.text).join(" ");
    expect(analyzeMessageDemo(worst).score).toBeLessThanOrEqual(96);
    expect(analyzeMessageDemo("안녕").score).toBeGreaterThanOrEqual(0);
  });

  it("위험 신호가 없으면 낮은 점수에 머문다", () => {
    const r = analyzeMessageDemo("오늘 점심 같이 먹을래?");
    expect(r.signals).toHaveLength(0);
    expect(r.score).toBeLessThanOrEqual(12);
    expect(r.scamType).toBe("normal");
  });

  it("신호는 가중치가 큰 순서로 정렬된다", () => {
    const { signals } = analyzeMessageDemo(SAMPLE_MESSAGES[1].text);
    const weights = signals.map((s) => s.weight);
    expect(weights).toEqual([...weights].sort((a, b) => b - a));
  });

  it("입력 앞뒤 공백은 잘라서 저장한다", () => {
    expect(analyzeMessageDemo("  급하게 송금해줘  ").message).toBe("급하게 송금해줘");
  });
});

describe("링크 분석", () => {
  const urlsOf = (text: string) => analyzeMessageDemo(text).urls;

  it("단축 URL을 구분한다", () => {
    const [u] = urlsOf("확인 https://bit.ly/abc123");
    expect(u.isShortened).toBe(true);
  });

  it("스미싱에 자주 쓰이는 도메인을 구분한다", () => {
    const [u] = urlsOf("조회 http://efine-gov.xyz/pay");
    expect(u.suspiciousTld).toBe(true);
    expect(u.isHttps).toBe(false);
  });

  it("공식 도메인이면 불일치로 보지 않는다", () => {
    const [u] = urlsOf("CJ대한통운 배송조회 https://www.cjlogistics.com/ko/tool/parcel");
    expect(u.officialMismatch).toBe(false);
  });

  it("택배 문자에 다른 도메인이 오면 불일치로 본다", () => {
    const [u] = urlsOf("택배 주소 확인 http://dhl-track.top/kr");
    expect(u.officialMismatch).toBe(true);
  });

  it("문장부호가 붙은 링크도 깔끔하게 잘라낸다", () => {
    expect(urlsOf("여기(https://bit.ly/x1).")[0].url).toBe("https://bit.ly/x1");
  });

  it("같은 링크는 한 번만 센다", () => {
    expect(urlsOf("https://bit.ly/a 다시 https://bit.ly/a")).toHaveLength(1);
  });
});

describe("전화번호 분석", () => {
  const typeOf = (text: string) => analyzeMessageDemo(text).phones[0]?.type;

  it("번호 형식을 구분한다", () => {
    expect(typeOf("연락 010-1234-5678")).toBe("개인 휴대폰 번호");
    expect(typeOf("고객센터 1588-1688")).toBe("대표번호 형식");
    expect(typeOf("문의 +82 10 1234 5678")).toBe("국제발신 번호");
    expect(typeOf("사무실 02-123-4567")).toBe("일반 전화번호");
  });

  it("구분자만 다른 같은 번호는 한 번만 센다", () => {
    expect(analyzeMessageDemo("010-1234-5678 / 01012345678").phones).toHaveLength(1);
  });
});

describe("하이라이트", () => {
  it("구간이 겹치지 않고 원문 위치와 일치한다", () => {
    for (const { text } of SAMPLE_MESSAGES) {
      const r = analyzeMessageDemo(text);
      let lastEnd = -1;
      for (const h of r.highlights) {
        expect(h.start).toBeGreaterThanOrEqual(lastEnd);
        expect(r.message.slice(h.start, h.end)).toBe(h.text);
        lastEnd = h.end;
      }
    }
  });
});
