/** 저장·목록용 미리보기: 개인정보 노출을 줄이기 위해 앞부분만 한 줄로 */
export function toPreview(message: string): string {
  const oneLine = message.replace(/\s+/g, " ").trim();
  return oneLine.length > 42 ? `${oneLine.slice(0, 42)}…` : oneLine;
}

const pad = (n: number) => String(n).padStart(2, "0");

/** 2026.09.29 14:02 */
export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** 방금 전 / 3시간 전 / 어제 / 9월 25일 */
export function formatRelative(iso: string, now = Date.now()): string {
  const d = new Date(iso);
  const diffMin = Math.floor((now - d.getTime()) / 60000);
  if (diffMin < 1) return "방금 전";
  if (diffMin < 60) return `${diffMin}분 전`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}시간 전`;
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const dayDiff = Math.round((today.getTime() - new Date(d).setHours(0, 0, 0, 0)) / 86400000);
  if (dayDiff === 1) return "어제";
  if (dayDiff < 7) return `${dayDiff}일 전`;
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
}
