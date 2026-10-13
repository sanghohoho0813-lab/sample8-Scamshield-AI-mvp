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
  const scams = SAMPLE_MESSAGES.filter((s) => s.type !== "normal" && !s.ambiguous);
  const ambiguous = SAMPLE_MESSAGES.filter((s) => s.ambiguous);
  const normals = SAMPLE_MESSAGES.filter((s) => s.type === "normal");

  it.each(scams.map((s) => [s.label, s.text]))("%s → 높음 이상", (_, text) => {
    expect(RANK[levelOf(text)]).toBeGreaterThanOrEqual(RANK.high);
  });

  it.each(ambiguous.map((s) => [s.label, s.text]))("%s → 주의", (_, text) => {
    expect(levelOf(text)).toBe("caution");
  });

  it.each(normals.map((s) => [s.label, s.text]))("%s → 낮음", (_, text) => {
    expect(levelOf(text)).toBe("low");
  });

  it.each(scams.map((s) => [s.label, s.text, s.type]))("%s → 유형 분류", (_, text, type) => {
    expect(analyzeMessageDemo(text).scamType).toBe(type);
  });
});

describe("실제와 비슷한 사기 문자 (미탐 방지)", () => {
  const cases: [label: string, text: string, expected: RiskLevel | "high+"][] = [
    ["가족 임시폰 + 상품권", "엄마 나야 폰 액정 나가서 임시폰이야 문화상품권 좀 사줄 수 있어? 급해", "high+"],
    ["택배 보관 + 단축 링크", "[Web발신] 귀하의 택배가 주소불명으로 보관중입니다. 확인: han.gl/aB3dE", "high+"],
    ["건강보험 + .xyz 링크", "[국민건강보험] 건강검진 결과 통보서가 발송되었습니다. 확인하기 http://nhis-kr.xyz", "high+"],
    ["햇살론 + 개인 번호", "○○저축은행입니다. 정부지원 햇살론 대상자로 선정되셨습니다. 기존 대출 상환 후 진행 가능하니 상담 바랍니다 010-9876-5432", "high+"],
    ["아들 급전", "아빠 나 지금 급하게 송금할 데가 있는데 이 계좌로 100만원만 보내줘 폰 고장나서 친구폰이야", "high+"],
    ["부고 + 단축 링크", "[부고] 故 김OO님께서 별세하셨기에 알려드립니다. 장례식장 안내 https://bit.ly/3xYz", "high+"],
    ["쇼핑 결제 사칭 + 070", "[쿠팡] 고객님 결제 완료 1,290,000원 (아이폰 16 Pro). 주문하지 않으셨다면 고객센터 070-4321-8765", "high+"],
    ["환급금 + 가짜 주소", "[건강보험공단] 환급금 52,000원이 발생했습니다. 신청하기 http://nhis-refund.site", "high+"],
    ["금감원 사칭 + 원격 앱", "금융감독원입니다. 고객님 계좌가 범죄에 연루되어 보호조치가 필요합니다. 팀뷰어 앱을 설치하고 상담원 안내를 따라주세요. 02-1234-5678", "high+"],
    ["검찰 사칭 + 사건 연루", "서울중앙지검 수사관입니다. 귀하 명의 계좌가 사건에 연루되어 연락드립니다. 010-9999-1111", "high+"],
    ["투자 리딩방 오픈채팅", "주식 리딩방 무료 초대합니다. 수익 보장 종목 공유 https://open.kakao.com/o/sAbC", "high+"],
    ["가족 사칭 첫 문자", "엄마 나 폰 고장나서 이 번호로 카톡 친구추가 해줘", "caution"],
    ["명의도용 개통 안내", "[Web발신] 고객님 명의로 휴대폰이 개통되었습니다. 본인이 아니면 02-123-4567로 연락주세요", "caution"],
    ["카드 해외승인 알림", "[KB국민카드] 홍*동님 10/05 12:31 해외승인 1,250,000원 누적 2,340,000원. 본인 아닐 경우 고객센터 1588-1688", "caution"],
  ];

  it.each(cases)("%s → %s", (_, text, expected) => {
    const level = levelOf(text);
    if (expected === "high+") expect(RANK[level]).toBeGreaterThanOrEqual(RANK.high);
    else expect(level).toBe(expected);
  });
});

describe("실제 정상 알림 (오탐 방지)", () => {
  const normals: [label: string, text: string][] = [
    ["카드 승인 알림", "[KB국민카드] 홍*동님 10/12 14:20 일시불 32,000원 스타벅스 승인 누적 152,000원"],
    ["카드 결제 예정 금액", "[신한카드] 10월 결제 예정 금액은 352,000원입니다. 결제일: 10/14"],
    ["통신요금 자동이체", "[SKT] 10월 이용요금 45,000원이 10/25 자동이체 예정입니다."],
    ["카드대금 자동이체", "[KB국민카드] 10월 카드대금 352,000원이 10/14 자동이체 예정입니다."],
    ["건강보험료 납부 안내", "[국민건강보험공단] 10월분 건강보험료 납부 안내. 납부기한 10/31. 미납 시 연체금이 부과됩니다."],
    ["은행 인증번호 발송", "[하나은행] 고객님의 인증번호는 [123456]입니다. 타인에게 절대 알려주지 마세요."],
    ["포털 인증번호 발송", "인증번호 [482913]를 입력해주세요. 타인에게 절대 알려주지 마세요. -네이버"],
    ["공식 주소 배송조회", "[CJ대한통운] 고객님의 상품이 배송 출발했습니다. 배송조회 https://www.cjlogistics.com/ko/tool/parcel/tracking"],
    ["집배원 휴대폰 번호", "[우체국] 고객님 택배가 오늘 배달 예정입니다. 집배원 010-1234-5678"],
    ["택배 기사 연락처", "[CJ대한통운] 오늘 배송 예정입니다. 기사님 연락처 010-4444-5555"],
    ["새 기기 로그인 알림", "[네이버] 새로운 기기에서 로그인되었습니다. 본인이 아니라면 비밀번호를 변경해주세요."],
    ["송금 완료 알림", "[토스] 홍길동님에게 10,000원을 보냈어요."],
    ["이체 완료 알림", "[카카오뱅크] 홍길동님께 50,000원 이체가 완료되었습니다."],
    ["급여 입금 알림", "[신한은행] 10월 급여 3,120,000원이 입금되었습니다."],
    ["자동차 검사 안내", "[국민비서] 자동차 검사 유효기간이 10월 30일 만료됩니다. 정부24에서 확인하세요."],
    ["본인확인 완료", "[KB국민은행] 고객님 본인확인이 완료되었습니다."],
    ["대출 만기 안내", "[신한은행] 고객님의 대출이 10/30 만기 예정입니다. 영업점 문의 1599-8000"],
    ["반송 안내(링크 없음)", "[Web발신] 고객님의 택배가 반송 처리되었습니다. 자세한 내용은 CJ대한통운 앱에서 확인해주세요."],
    ["쇼핑 결제 완료", "[쿠팡] 결제가 완료되었습니다. 주문 내역은 쿠팡 앱에서 확인하세요."],
    ["쇼핑몰 배송 완료", "[쿠팡] 주문하신 상품이 배송 완료되었습니다. 문 앞을 확인해주세요."],
    ["정상 배송 예정", "[CJ대한통운] 고객님의 상품이 오늘 14~16시 사이 배송 예정입니다."],
    ["가족 일상 문자", "아빠 오늘 저녁 7시에 들어갈게요. 엄마한테도 말해줘"],
    ["동창회 안내", "내일 저녁 7시 동창회 장소는 강남역 2번 출구 앞 식당입니다. 참석 여부 회신 부탁해요"],
    ["아파트 공지", "[OO아파트] 10/15 엘리베이터 정기점검으로 운행이 중지됩니다."],
  ];

  it.each(normals)("%s → 낮음", (_, text) => {
    expect(levelOf(text)).toBe("low");
  });
});

describe("문맥 규칙", () => {
  it("인증번호를 '받는' 문자는 개인정보 요구로 보지 않지만, 알려달라고 하면 본다", () => {
    const has = (t: string) => analyzeMessageDemo(t).signals.some((s) => s.category === "credential");
    expect(has("[하나은행] 인증번호는 [123456]입니다. 타인에게 알려주지 마세요.")).toBe(false);
    expect(has("인증번호 [123456] 오면 바로 알려줘")).toBe(true);
    expect(has("엄마 인증번호 오면 알려줘")).toBe(true);
  });

  it("'본인이 아니면 연락' 문구는 대표번호가 아닌 번호로 부를 때만 신호로 본다", () => {
    const lure = (t: string) => analyzeMessageDemo(t).breakdown?.some((b) => b.label.includes("본인이 아니면")) ?? false;
    expect(lure("해외승인 990,000원. 본인 아닐 경우 1588-1688")).toBe(false);
    expect(lure("해외승인 990,000원. 본인 아닐 경우 010-1234-5678")).toBe(true);
  });

  it("행동하게 만드는 수단이 없으면 낮음에 머물고 이유를 남긴다", () => {
    const r = analyzeMessageDemo("[국민건강보험공단] 건강보험료 미납 시 연체금이 부과됩니다. 납부기한 10/31.");
    expect(r.level).toBe("low");
    expect(r.scoreCapNote).toMatch(/수단이 없어/);
  });

  it("메신저로 옮기게 하는 말은 행동 수단으로 본다", () => {
    expect(levelOf("엄마 나 폰 고장나서 이 번호로 카톡 친구추가 해줘")).toBe("caution");
    expect(levelOf("엄마 나 폰 고장났어 수리 맡겼어")).toBe("low");
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

  it("점수 근거를 모두 더하면 (상한 전) 점수가 된다", () => {
    for (const { text } of SAMPLE_MESSAGES) {
      const r = analyzeMessageDemo(text);
      const total = r.breakdown!.reduce((sum, b) => sum + b.points, 0);
      if (r.scoreCapNote || r.signals.length === 0) expect(r.score).toBeLessThanOrEqual(total);
      else expect(r.score).toBe(total);
    }
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

  it("공식 주소 링크는 낮은 점수로만 반영한다", () => {
    const r = analyzeMessageDemo("CJ대한통운 배송조회 https://www.cjlogistics.com/ko/tool/parcel");
    expect(r.urls[0].isOfficial).toBe(true);
    expect(r.breakdown).toContainEqual({ label: "공식 주소로 보이는 링크", points: 5 });
  });

  it("공식 도메인을 흉내 낸 주소는 공식으로 보지 않는다", () => {
    const [u] = urlsOf("택배 확인 http://cjlogistics.com.parcel-check.top/kr");
    expect(u.isOfficial).toBe(false);
    expect(u.suspiciousTld).toBe(true);
  });

  it("누구나 만들 수 있는 주소(오픈채팅 등)는 공식으로 보지 않는다", () => {
    expect(urlsOf("리딩방 https://open.kakao.com/o/abc")[0].isOfficial).toBe(false);
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
