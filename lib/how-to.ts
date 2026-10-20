/** 문자 복사·캡처 방법 안내 — 붙여넣기가 낯선 분이 가장 먼저 막히는 곳 */

export type Device = "galaxy" | "iphone";
export type HowToTopic = "copy" | "capture";

export const DEVICES: { value: Device; label: string }[] = [
  { value: "galaxy", label: "갤럭시" },
  { value: "iphone", label: "아이폰" },
];

interface HowTo {
  title: string;
  /** 다른 방법을 보던 중 이 방법으로 넘어올 때 쓰는 이름 ("…도 보기") */
  switchLabel: string;
  steps: Record<Device, string[]>;
  /** 기기별 덧붙임 */
  tip: Record<Device, string>;
  /** 기기와 상관없이 꼭 알려야 하는 주의 */
  caution: string;
}

export const HOW_TO: Record<HowToTopic, HowTo> = {
  copy: {
    title: "문자 복사하는 법",
    switchLabel: "문자를 복사하는 법",
    steps: {
      galaxy: [
        "메시지 앱에서 받은 문자의 말풍선을 길게 눌러요.",
        "메뉴가 뜨면 '복사'(또는 '텍스트 복사')를 눌러요.",
        "이 화면으로 돌아와 '붙여넣기'를 눌러요.",
      ],
      iphone: [
        "메시지 앱에서 받은 문자의 말풍선을 길게 눌러요.",
        "뜨는 메뉴에서 '복사'를 눌러요.",
        "이 화면으로 돌아와 '붙여넣기'를 눌러요.",
      ],
    },
    tip: {
      galaxy: "'붙여넣기' 버튼이 없으면 입력칸을 길게 누른 뒤 '붙여넣기'를 고르세요.",
      iphone: "'붙여넣기'를 누른 뒤 작은 '붙여넣기' 말풍선이 한 번 더 뜨면 그것도 눌러주세요.",
    },
    caution: "링크 글자 위를 누르면 사이트가 열릴 수 있어요. 말풍선의 빈 곳을 길게 누르세요.",
  },
  capture: {
    title: "문자 캡처하는 법",
    switchLabel: "캡처해서 올리는 법",
    steps: {
      galaxy: [
        "문자 화면을 띄워 둔 채로 옆면의 '전원 버튼'과 '음량 아래 버튼'을 동시에 짧게 눌러요.",
        "화면이 깜빡이면 캡처된 거예요. '갤러리'에 저장돼요.",
        "이 화면의 '캡처 이미지'에서 방금 찍은 사진을 골라요.",
      ],
      iphone: [
        "문자 화면을 띄워 둔 채로 오른쪽 '측면 버튼'과 왼쪽 '음량 높이기 버튼'을 동시에 눌렀다 떼요.",
        "왼쪽 아래에 작은 미리보기가 뜨면 캡처된 거예요. '사진' 앱에 저장돼요.",
        "이 화면의 '캡처 이미지'에서 방금 찍은 사진을 골라요.",
      ],
    },
    tip: {
      galaxy: "손날로 화면을 옆으로 쓸어서 캡처하는 방법도 있어요. (설정에서 켜야 해요)",
      iphone: "홈 버튼이 있는 아이폰은 '홈 버튼'과 '측면 버튼'을 함께 눌러요.",
    },
    caution: "다른 대화나 이름이 함께 찍히지 않게, 의심되는 문자만 보이게 찍어주세요.",
  },
};

/** 처음 열 때 보여줄 기기 — 아이폰·아이패드면 아이폰, 그 밖에는 갤럭시(국내 안드로이드 대부분) */
export function guessDevice(userAgent: string): Device {
  return /iPhone|iPad|iPod/i.test(userAgent) ? "iphone" : "galaxy";
}
