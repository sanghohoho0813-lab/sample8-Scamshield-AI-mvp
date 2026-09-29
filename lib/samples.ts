import type { ScamType } from "./types";

export interface SampleMessage {
  id: string;
  label: string;
  type: ScamType;
  text: string;
}

/** 분석 체험용 샘플 문자 12개 */
export const SAMPLE_MESSAGES: SampleMessage[] = [
  {
    id: "s1",
    label: "택배 사칭",
    type: "delivery",
    text: "[국제발신] CJ대한통운 배송 주소 불일치로 배송이 보류되었습니다. 금일 내 아래 링크에서 주소를 확인해주세요. http://dhl-track.top/kr",
  },
  {
    id: "s2",
    label: "금융기관 사칭",
    type: "finance",
    text: "[Web발신] 고객님의 계좌에서 이상 거래가 확인되었습니다. 계좌가 정지될 예정이오니 즉시 아래 링크에서 본인 인증 바랍니다. https://bit.ly/kb-check",
  },
  {
    id: "s3",
    label: "정부기관 사칭",
    type: "government",
    text: "[국제발신] 교통 범칙금 미납 건이 있습니다. 금일 내 확인하지 않으면 가산금이 부과됩니다. 조회: http://efine-gov.xyz/pay",
  },
  {
    id: "s4",
    label: "가족 사칭",
    type: "family",
    text: "엄마 나 휴대폰 고장나서 친구 폰으로 문자해. 급하게 결제할 게 있는데 여기 계좌로 30만원만 보내줘. 인증번호 오면 바로 알려줘.",
  },
  {
    id: "s5",
    label: "투자 권유",
    type: "investment",
    text: "오늘만 공개되는 비공개 종목 정보입니다. 300% 수익 보장, 선착순 마감. 지금 바로 리딩방 입장 http://vip-stock.club/join",
  },
  {
    id: "s6",
    label: "대출 권유",
    type: "loan",
    text: "정부지원 서민대출 대상자로 선정되셨습니다. 무담보 저금리 당일 대출 가능. 한도 조회는 오늘까지! 상담: 010-2345-6789",
  },
  {
    id: "s7",
    label: "과태료 사칭",
    type: "government",
    text: "[교통민원24] 신호위반 과태료 미납으로 차량이 압류 예정입니다. 즉시 확인 바랍니다. http://efine-24.top",
  },
  {
    id: "s8",
    label: "계정 탈취 유도",
    type: "finance",
    text: "[OO카드] 해외에서 899,000원 결제가 완료되었습니다. 본인이 아닐 경우 즉시 소비자센터로 문의: 010-5551-2323",
  },
  {
    id: "s9",
    label: "이벤트 위장",
    type: "event",
    text: "축하합니다! 신세계 모바일상품권 10만원 당첨! 금일 내 수령하지 않으면 소멸됩니다. 수령하기 http://gift-event.site/get",
  },
  {
    id: "s10",
    label: "지인 사칭 급전",
    type: "family",
    text: "아빠 나야. 폰 액정 깨져서 수리 맡겼어. 급한 일인데 문화상품권 20만원만 구매해서 핀번호 좀 보내줘.",
  },
  {
    id: "s11",
    label: "정상에 가까운 문자",
    type: "normal",
    text: "고객님이 주문하신 상품이 오늘 배송될 예정입니다. 배송 관련 문의는 구매하신 쇼핑몰 고객센터를 이용해주세요.",
  },
  {
    id: "s12",
    label: "일반 안내 문자",
    type: "normal",
    text: "안녕하세요, 내일 오후 2시 정기 점검 예약이 확정되었습니다. 일정 변경이 필요하시면 매장으로 연락 부탁드립니다.",
  },
];

/** 입력 화면 "샘플로 체험" 칩: 짧은 이름 + 대표 샘플 (정상에 가까운 문자 포함) */
export const FEATURED_SAMPLES: { chip: string; sample: SampleMessage }[] = [
  { chip: "택배", sample: SAMPLE_MESSAGES[0] },
  { chip: "은행", sample: SAMPLE_MESSAGES[1] },
  { chip: "과태료", sample: SAMPLE_MESSAGES[2] },
  { chip: "가족", sample: SAMPLE_MESSAGES[3] },
  { chip: "투자", sample: SAMPLE_MESSAGES[4] },
  { chip: "정상 문자", sample: SAMPLE_MESSAGES[10] },
];

/**
 * 캡처 이미지 업로드의 데모 OCR 결과.
 * 실제 이미지 인식이 아니므로 화면에서 "데모 OCR"로 명시하고 사용자가 수정할 수 있게 한다.
 */
export const DEMO_EXTRACTED_TEXT = SAMPLE_MESSAGES[0].text;
