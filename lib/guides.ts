import { CreditCard, Gift, HeartHandshake, Landmark, PiggyBank, TrendingUp, Truck, type LucideIcon } from "lucide-react";
import type { ScamType } from "./types";

export interface Guide {
  /** /guide#{id} 앵커 */
  id: string;
  icon: LucideIcon;
  title: string;
  /** 어떤 수법인지 한 줄 */
  summary: string;
  /** 대표 패턴 — 실제로 이런 문자가 와요 */
  example: string;
  /** 자주 쓰는 문구 (홈 목록 등 짧은 자리용) */
  phrases: string[];
  /** 이렇게 확인하세요 */
  checks: string[];
  /** 이것만은 하지 마세요 */
  donts: string[];
}

/** 실제 상황별 사기 유형 — 대표 패턴 → 확인 방법 → 하지 말아야 할 행동 */
export const GUIDES: Guide[] = [
  {
    id: "delivery",
    icon: Truck,
    title: "택배 사칭",
    summary: "배송 문제를 핑계로 가짜 사이트에서 주소·카드 정보를 입력하게 해요.",
    example: "[국제발신] 주소 불일치로 배송이 보류되었습니다. 아래 링크에서 주소를 수정해주세요.",
    phrases: ["주소 불일치", "반송 예정", "보관 중"],
    checks: ["주문한 물건이 있는지 먼저 떠올려보세요.", "택배사 공식 앱에서 운송장 번호로 직접 조회하세요."],
    donts: ["문자 속 링크 누르기", "주소·카드번호 입력하기"],
  },
  {
    id: "institution",
    icon: Landmark,
    title: "기관 사칭",
    summary: "은행·카드사·경찰·정부를 내세워 계좌 정지나 사건 연루로 겁을 줘요.",
    example: "[Web발신] 고객님 계좌가 정지될 예정입니다. 즉시 아래 링크에서 본인 인증 바랍니다.",
    phrases: ["계좌 정지 예정", "본인 인증", "사건 연루", "과태료 미납"],
    checks: [
      "평소 쓰던 은행 앱이나 카드 뒷면의 대표번호로 직접 확인하세요.",
      "과태료·세금은 정부24·이파인 같은 공식 사이트에서 조회하세요.",
      "경찰·검찰은 문자로 연락하거나 돈·앱 설치를 요구하지 않아요.",
    ],
    donts: ["문자 속 번호로 전화하기", "상대가 시키는 앱 설치하기"],
  },
  {
    id: "family",
    icon: HeartHandshake,
    title: "가족·지인 사칭",
    summary: "휴대폰이 고장 났다며 새 번호로 연락해 돈이나 상품권을 요구해요.",
    example: "엄마 나 폰 액정 깨져서 친구 폰으로 문자해. 급한데 상품권 좀 사줄 수 있어?",
    phrases: ["휴대폰 고장", "급하게 송금", "상품권 핀번호"],
    checks: ["원래 알던 번호로 직접 전화해 목소리를 확인하세요.", "가족끼리만 아는 것을 물어보세요."],
    donts: ["확인하기 전에 돈·상품권 보내기", "인증번호·신분증 사진 보내기"],
  },
  {
    id: "payment",
    icon: CreditCard,
    title: "결제 알림 사칭",
    summary: "하지 않은 결제가 됐다고 놀라게 한 뒤, 문자 속 번호로 전화하게 해요.",
    example: "[OO카드] 해외에서 899,000원 결제가 완료되었습니다. 본인이 아닐 경우 문의 010-…",
    phrases: ["해외 결제 완료", "본인이 아닐 경우", "주문하지 않으셨다면"],
    checks: ["카드 앱이나 쇼핑 앱에서 실제 결제 내역을 확인하세요.", "카드 뒷면에 있는 대표번호로 직접 전화하세요."],
    donts: ["문자 속 번호로 전화하기", "상담원이 시키는 앱 설치하기"],
  },
  {
    id: "loan",
    icon: PiggyBank,
    title: "대출 사기",
    summary: "정부지원·저금리 대출을 내세워 수수료나 기존 대출 상환을 먼저 요구해요.",
    example: "정부지원 서민대출 대상자로 선정되셨습니다. 무담보 당일 대출 가능. 상담 010-…",
    phrases: ["대상자 선정", "무담보·당일 대출", "선입금 수수료"],
    checks: ["금융감독원 ‘파인’에서 등록된 금융회사인지 확인하세요.", "대출 상담은 금융회사 대표번호로 직접 하세요."],
    donts: ["대출 전에 수수료·보증금 보내기", "기존 대출을 안내받은 계좌로 갚기"],
  },
  {
    id: "investment",
    icon: TrendingUp,
    title: "투자 사기",
    summary: "높은 수익을 보장한다며 리딩방이나 가짜 투자 앱으로 끌어들여요.",
    example: "오늘만 공개되는 비공개 종목 정보. 300% 수익 보장, 지금 바로 리딩방 입장",
    phrases: ["수익 보장", "오늘만 공개", "리딩방"],
    checks: ["‘수익 보장’이라는 말 자체를 의심하세요.", "금융감독원 ‘파인’에서 제도권 금융회사인지 확인하세요."],
    donts: ["모르는 투자 앱 설치하기", "대화방에서 알려준 계좌로 입금하기"],
  },
  {
    id: "event",
    icon: Gift,
    title: "당첨·부고 위장",
    summary: "당첨 선물이나 부고·청첩장을 핑계로 링크를 누르게 해요.",
    example: "[부고] 故 OOO님께서 별세하셨습니다. 장례식장 안내 https://bit.ly/…",
    phrases: ["당첨 축하", "부고 안내", "모바일 청첩장"],
    checks: ["보낸 사람에게 직접 전화해 사실인지 확인하세요.", "응모한 적 없는 당첨 소식은 무시하세요."],
    donts: ["문자 속 링크 누르기", "당첨금을 받으려고 수수료·개인정보 보내기"],
  },
];

/** 모든 문자에 공통으로 적용되는 확인 원칙 */
export const GOLDEN_RULES = [
  "문자 속 링크는 누르지 말고, 평소 쓰던 앱이나 홈페이지로 직접 확인하세요.",
  "문자 속 번호 대신, 카드 뒷면이나 공식 홈페이지의 대표번호로 전화하세요.",
  "인증번호·비밀번호·카드번호는 누구에게도 알려주지 마세요.",
  "가족이 돈을 요구하면 원래 알던 번호로 전화해 직접 확인하세요.",
  "모르는 앱은 설치하지 마세요. 은행·기관은 앱 설치를 문자로 요구하지 않아요.",
];

const TYPE_TO_GUIDE: Partial<Record<ScamType, string>> = {
  delivery: "delivery",
  finance: "institution",
  government: "institution",
  payment: "payment",
  family: "family",
  investment: "investment",
  loan: "loan",
  event: "event",
};

/** 분석 결과 유형 → 가이드 */
export function guideForScamType(type: ScamType): Guide | undefined {
  const id = TYPE_TO_GUIDE[type];
  return id ? GUIDES.find((g) => g.id === id) : undefined;
}
