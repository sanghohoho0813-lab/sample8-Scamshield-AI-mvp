import { NextResponse } from "next/server";
import { analyzeMessageDemo } from "@/lib/risk-engine";

/**
 * 분석 API.
 *
 * AI_API_KEY가 설정되어 있으면 이 지점에서 실제 LLM API 호출로 교체할 수 있도록
 * 분리해두었다. 키가 없거나 호출에 실패하면 Demo Analysis Engine을 사용한다.
 */
export async function POST(request: Request) {
  let body: { message?: string; source?: "text" | "image" };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const message = (body.message ?? "").trim();
  if (!message) {
    return NextResponse.json({ error: "분석할 문자 내용을 입력해주세요." }, { status: 400 });
  }

  const source = body.source === "image" ? "image" : "text";
  const result = analyzeMessageDemo(message, source);

  if (process.env.AI_API_KEY) {
    // TODO: 실제 LLM API 연동 지점.
    // 데모 엔진 결과를 기반으로 summary/actions를 LLM으로 보강하는 구조를 권장.
    result.engine = "ai";
  }

  return NextResponse.json(result);
}
