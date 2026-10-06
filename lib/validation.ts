import { MAX_MESSAGE_LENGTH } from "./constants";
import type { AnalysisSource } from "./types";

export type AnalyzeRequest = { message: string; source: AnalysisSource };

type ParseResult = { ok: true; value: AnalyzeRequest } | { ok: false; error: string };

/**
 * /api/analyze 요청 본문 검증.
 * 신뢰할 수 없는 입력이므로 형태·타입·길이를 모두 확인하고, 통과한 값만 엔진에 넘긴다.
 */
export function parseAnalyzeRequest(body: unknown): ParseResult {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, error: "요청 형식이 올바르지 않아요." };
  }
  const { message, source } = body as Record<string, unknown>;
  if (typeof message !== "string") {
    return { ok: false, error: "분석할 문자 내용을 입력해주세요." };
  }
  const trimmed = message.trim();
  if (!trimmed) {
    return { ok: false, error: "분석할 문자 내용을 입력해주세요." };
  }
  if (trimmed.length > MAX_MESSAGE_LENGTH) {
    return { ok: false, error: `문자는 ${MAX_MESSAGE_LENGTH.toLocaleString("ko-KR")}자까지 분석할 수 있어요.` };
  }
  if (source !== undefined && source !== "text" && source !== "image") {
    return { ok: false, error: "지원하지 않는 입력 방식이에요." };
  }
  return { ok: true, value: { message: trimmed, source: source ?? "text" } };
}
