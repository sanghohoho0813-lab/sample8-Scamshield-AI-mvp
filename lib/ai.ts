import type { AnalysisResult, AnalysisSource } from "./types";
import { analyzeMessageDemo } from "./risk-engine";

const REQUEST_TIMEOUT_MS = 5000;

/**
 * 메시지 분석 진입점.
 * 서버 API(/api/analyze)를 먼저 쓰고, 네트워크 오류·시간 초과·비정상 응답이면
 * 같은 규칙 엔진을 브라우저에서 실행해 결과를 돌려준다. (오프라인에서도 검사 가능)
 */
export async function analyzeMessage(message: string, source: AnalysisSource = "text"): Promise<AnalysisResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, source }),
      signal: controller.signal,
    });
    if (res.ok) {
      const data: unknown = await res.json();
      if (isAnalysisResult(data)) return data;
    }
  } catch {
    // 네트워크 오류·시간 초과 → 아래 로컬 엔진으로 폴백
  } finally {
    clearTimeout(timer);
  }
  return analyzeMessageDemo(message, source);
}

function isAnalysisResult(data: unknown): data is AnalysisResult {
  const r = data as Partial<AnalysisResult> | null;
  return !!r && typeof r.id === "string" && typeof r.score === "number" && Array.isArray(r.signals);
}
