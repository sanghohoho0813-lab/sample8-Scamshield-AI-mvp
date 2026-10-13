import { Banknote, IdCard, KeyRound, Link2, type LucideIcon } from "lucide-react";

/**
 * 이미 행동한 사용자를 위한 대처 안내.
 * 공포를 키우지 않고, 상황별로 "지금 할 일"을 순서대로 보여준다. 가장 급한 상황을 먼저 둔다.
 */

export interface Contact {
  tel: string;
  name: string;
  /** 언제 거는 번호인지 */
  when: string;
}

export const CONTACTS = {
  police: { tel: "112", name: "경찰청", when: "돈을 보냈을 때 지급정지·사기 신고" },
  fss: { tel: "1332", name: "금융감독원", when: "계좌·카드 등 금융 피해 상담" },
  kisa: { tel: "118", name: "한국인터넷진흥원", when: "스미싱·악성 앱·개인정보 유출 상담" },
} satisfies Record<string, Contact>;

/** 신고·상담 전화 — 급한 순서 */
export const CONTACT_LIST: Contact[] = [CONTACTS.police, CONTACTS.fss, CONTACTS.kisa];

export interface RecoveryStep {
  text: string;
  call?: Contact;
  link?: { href: string; label: string };
}

export type SituationId = "money" | "code" | "info" | "link";

export interface Situation {
  id: SituationId;
  icon: LucideIcon;
  /** 버튼에 쓰는 짧은 상황 이름 */
  label: string;
  /** 버튼 보조 설명 */
  hint: string;
  /** 단계 위에 보여줄 한 줄 (안심 또는 시간 안내) */
  lead: string;
  steps: RecoveryStep[];
}

export const SITUATIONS: Situation[] = [
  {
    id: "money",
    icon: Banknote,
    label: "돈을 보냈어요",
    hint: "계좌이체·상품권 핀번호",
    lead: "지급정지는 빨리 요청할수록 돌려받을 가능성이 커요. 아래 순서대로 하세요.",
    steps: [
      { text: "112나 돈을 보낸 은행 고객센터에 바로 전화해 ‘지급정지’를 요청하세요.", call: CONTACTS.police },
      { text: "상품권 핀번호를 보냈다면, 상품권을 산 곳이나 발행사 고객센터에 사용 정지를 요청하세요." },
      { text: "경찰서에서 ‘사건사고사실확인원’을 받아 은행에 피해구제를 신청하세요. 기한은 은행에서 알려줘요." },
    ],
  },
  {
    id: "code",
    icon: KeyRound,
    label: "인증번호를 알려줬어요",
    hint: "문자로 받은 숫자",
    lead: "인증번호가 쓰이기 전에 막으면 피해를 줄일 수 있어요.",
    steps: [
      { text: "인증번호를 보낸 곳(은행·통신사·포털)에 전화해 로그인과 거래를 막아달라고 하세요." },
      { text: "그 서비스의 비밀번호를 바로 바꾸세요." },
      {
        text: "내 이름으로 휴대폰이 새로 개통됐는지 확인하고, 추가 개통을 막아두세요.",
        link: { href: "https://www.msafer.or.kr", label: "명의도용 방지(엠세이퍼)" },
      },
    ],
  },
  {
    id: "info",
    icon: IdCard,
    label: "개인정보를 입력했어요",
    hint: "카드·계좌·주민번호",
    lead: "입력한 정보에 맞춰 정지·등록만 해두면 대부분의 피해를 막을 수 있어요.",
    steps: [
      { text: "카드번호를 입력했다면 카드 뒷면의 번호로 전화해 카드를 정지하세요." },
      {
        text: "계좌·주민등록번호를 입력했다면 ‘개인정보 노출자’로 등록해 내 이름의 새 금융거래를 막으세요.",
        link: { href: "https://pd.fss.or.kr", label: "개인정보노출자 사고예방" },
      },
      { text: "무엇부터 해야 할지 모르겠다면 금융감독원에 상담하세요.", call: CONTACTS.fss },
    ],
  },
  {
    id: "link",
    icon: Link2,
    label: "링크만 눌렀어요",
    hint: "아무것도 입력하지 않음",
    lead: "링크만 열고 아무것도 입력하거나 설치하지 않았다면 피해 가능성은 낮아요.",
    steps: [
      { text: "열린 창을 닫으세요. 아무것도 입력하지 않았다면 여기까지면 돼요." },
      { text: "앱 설치 화면이 떴거나 모르는 앱이 생겼다면, 비행기 모드로 바꾼 뒤 그 앱을 지우세요." },
      { text: "앱을 설치했거나 휴대폰이 이상하면 한국인터넷진흥원에 상담하세요.", call: CONTACTS.kisa },
    ],
  },
];

export const findSituation = (id: string | null | undefined) => SITUATIONS.find((s) => s.id === id);
