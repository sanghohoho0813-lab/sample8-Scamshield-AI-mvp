import { NextResponse } from "next/server";
import { analyzeMessageDemo } from "@/lib/risk-engine";

/**
 * 분석 API.
 *
 * 현재는 규칙 기반 Demo Analysis Engine으로 분석한다. (engine: "demo")
 * 실제 LLM을 연결할 때는 AI_API_KEY가 있는 경우 이 지점에서 LLM을 호출해
 * summary·actions를 보강하고, 실제로 호출에 성공했을 때만 engine을 "ai"로 표시한다.
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
  if (message.length > 2000) {
    return NextResponse.json({ error: "문자는 2,000자까지 분석할 수 있습니다." }, { status: 400 });
  }

  const source = body.source === "image" ? "image" : "text";
  return NextResponse.json(analyzeMessageDemo(message, source));
}
