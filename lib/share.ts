import type { HistoryEntry } from "./types";
import { PHONE_REGEX, URL_REGEX } from "./risk-engine";
import { RISK_STYLE } from "./risk-style";
import { actionPlan, typeName, verdictHeadline } from "./verdict";

/**
 * 가족에게 보내는 공유 문구.
 * - 받는 사람이 앞뒤 사정 없이 봐도 무슨 일인지 알 수 있게: 무엇을 검사했고 → 결과 → 할 일 순서로 쓴다.
 * - 문자 속 링크·전화번호는 메신저에서 바로 눌리지 않도록 가린다.
 * - 검사 기록은 링크에 담지 않는다 (기록은 이 기기에만 저장).
 */

const PREVIEW_LENGTH = 90;

/** 메신저에서 자동으로 눌리는 링크·전화번호를 가린다 */
export function maskSensitive(text: string): string {
  return text.replace(URL_REGEX, "[링크]").replace(PHONE_REGEX, "[전화번호]");
}

export function sharePreview(message: string): string {
  const oneLine = maskSensitive(message).replace(/\s+/g, " ").trim();
  return oneLine.length > PREVIEW_LENGTH ? `${oneLine.slice(0, PREVIEW_LENGTH)}…` : oneLine;
}

export function buildShareText(entry: HistoryEntry, siteUrl: string): string {
  const r = entry.result;
  const isLow = r.level === "low";
  const similar = isLow ? "" : ` · ${typeName(r.scamTypeLabel)}와 비슷해요`;
  const lines = [
    "[ScamShield] 받은 문자를 검사해봤어요",
    "",
    `결과: ${verdictHeadline(r)}`,
    `위험 정도 ${RISK_STYLE[r.level].label} (${r.score}/100)${similar}`,
    "",
    "받은 문자",
    `“${sharePreview(r.message)}”`,
    "",
    isLow ? "그래도 이것만 확인하세요" : "이렇게 하세요",
    ...actionPlan(r).map((a, i) => `${i + 1}. ${a}`),
  ];
  if (!isLow) lines.push("", "이미 돈을 보냈다면 112에 바로 전화해 ‘지급정지’를 요청하세요.");
  lines.push("", "※ 참고용 안내이며, 사기 여부를 확정하지는 않아요.", `직접 검사해보기: ${siteUrl}`);
  return lines.join("\n");
}
