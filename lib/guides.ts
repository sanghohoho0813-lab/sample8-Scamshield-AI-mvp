import {
  Building2,
  Gift,
  HeartHandshake,
  KeyRound,
  Landmark,
  Link2,
  PiggyBank,
  TrendingUp,
  Truck,
  type LucideIcon,
} from "lucide-react";
import type { ScamType } from "./types";

export interface Guide {
  /** /guide#{id} 앵커 */
  id: string;
  icon: LucideIcon;
  title: string;
  /** 이런 문구를 조심하세요 */
  phrases: string[];
  /** 이렇게 확인하세요 */
  tip: string;
}

export const GUIDES: Guide[] = [
  {
    id: "finance",
    icon: Landmark,
    title: "금융기관 사칭",
    phrases: ["이상 거래 확인", "계좌 정지 예정", "즉시 본인 인증"],
    tip: "은행·카드사는 문자 링크로 본인 인증을 요구하지 않습니다. 사용하던 공식 앱을 직접 열어 확인하세요.",
  },
  {
    id: "government",
    icon: Building2,
    title: "정부·공공기관 사칭",
    phrases: ["미납", "과태료·범칙금", "출석 요구"],
    tip: "과태료·범칙금은 정부24, 이파인 등 공식 사이트에서 직접 조회하세요. 수사기관은 문자로 출석을 요구하지 않습니다.",
  },
  {
    id: "delivery",
    icon: Truck,
    title: "택배 사칭",
    phrases: ["주소 불일치", "반송 예정", "배송 조회 링크"],
    tip: "주문한 적 없는 배송 안내라면 링크를 누르지 말고, 택배사 공식 앱에서 운송장 번호로 조회하세요.",
  },
  {
    id: "family",
    icon: HeartHandshake,
    title: "가족·지인 사칭",
    phrases: ["휴대폰 고장", "급하게 송금", "상품권 구매"],
    tip: "가족이 급히 돈이나 상품권을 요구하면, 원래 알던 번호로 전화해 목소리를 직접 확인하세요.",
  },
  {
    id: "investment",
    icon: TrendingUp,
    title: "투자 사기",
    phrases: ["수익 보장", "오늘만 공개", "리딩방 입장"],
    tip: "수익을 보장한다는 말 자체가 위험 신호입니다. 금융감독원 ‘제도권 금융회사 조회’로 업체를 먼저 확인하세요.",
  },
  {
    id: "loan",
    icon: PiggyBank,
    title: "대출 사기",
    phrases: ["정부지원 대상자 선정", "무담보 당일 대출", "선입금 수수료"],
    tip: "대출 전에 수수료·보증금을 먼저 요구하면 사기입니다. 정식 금융회사는 대출 전에 돈을 받지 않습니다.",
  },
  {
    id: "event",
    icon: Gift,
    title: "이벤트·당첨 위장",
    phrases: ["당첨 축하", "금일 내 수령", "상품권 지급"],
    tip: "응모한 적 없는 당첨 소식은 의심하세요. 수령을 위해 링크 접속이나 개인정보 입력을 요구하면 멈추세요.",
  },
  {
    id: "credential",
    icon: KeyRound,
    title: "인증번호·개인정보 요구",
    phrases: ["인증번호 알려줘", "비밀번호 확인", "신분증 사진"],
    tip: "인증번호는 내가 직접 요청했을 때만 쓰는 번호입니다. 누가 알려달라고 하면 절대 알려주지 마세요.",
  },
  {
    id: "link",
    icon: Link2,
    title: "스미싱 링크",
    phrases: ["단축 URL", "앱 설치 유도", ".top · .xyz 주소"],
    tip: "출처가 불분명한 링크로 설치한 앱은 휴대폰 정보를 빼갈 수 있습니다. 앱은 공식 앱스토어에서만 설치하세요.",
  },
];

/** 모든 문자에 공통으로 적용되는 확인 원칙 */
export const GOLDEN_RULES = [
  "문자 속 링크는 누르지 말고, 공식 앱·홈페이지에 직접 들어가 확인합니다.",
  "문자 속 번호 대신, 공식 홈페이지에 있는 대표번호로 전화합니다.",
  "인증번호·비밀번호·카드번호는 누구에게도 알려주지 않습니다.",
  "가족이 돈을 요구하면 원래 알던 번호로 전화해 직접 확인합니다.",
  "이미 정보를 입력했거나 송금했다면 경찰(112)이나 금융회사 고객센터에 즉시 지급정지를 요청합니다.",
];

/** 분석 결과 유형 → 가이드 */
export function guideForScamType(type: ScamType): Guide | undefined {
  if (type === "normal") return undefined;
  return GUIDES.find((g) => g.id === type);
}
