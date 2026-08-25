import type { AnalysisResult } from "./types";
import { analyzeMessageDemo } from "./risk-engine";

/**
 * 메시지 분석 진입점.
 *
 * 실제 LLM API(AI_API_KEY)가 설정된 경우 서버 라우트(/api/analyze)를 통해
 * LLM 기반 분석을 시도하고, 실패하거나 키가 없으면 Demo Analysis Engine을 사용한다.
 * 함수 시그니처는 LLM 연동 후에도 동일하게 유지된다.
 */
export async function analyzeMessage(
  message: string,
  source: "text" | "image" = "text",
): Promise<AnalysisResult> {
  try {
    const res = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, source }),
    });
    if (res.ok) {
      const data = (await res.json()) as AnalysisResult;
      if (data && typeof data.score === "number") return data;
    }
  } catch {
    // 네트워크 오류 시 클라이언트 데모 엔진으로 폴백
  }
  return analyzeMessageDemo(message, source);
}

/** 위험 신호만 추출 (LLM 연동 시 별도 프롬프트로 대체 가능) */
export function extractRiskSignals(message: string) {
  return analyzeMessageDemo(message).signals;
}

/** AI 요약 생성 (LLM 연동 시 별도 프롬프트로 대체 가능) */
export function generateSummary(message: string) {
  return analyzeMessageDemo(message).summary;
}

/** 행동 가이드 생성 (LLM 연동 시 별도 프롬프트로 대체 가능) */
export function generateSafetyGuide(message: string) {
  return analyzeMessageDemo(message).actions;
}
