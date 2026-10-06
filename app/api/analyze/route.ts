import { NextResponse } from "next/server";
import { analyzeMessageDemo } from "@/lib/risk-engine";
import { parseAnalyzeRequest } from "@/lib/validation";

/** 2,000자 한글 문자 + JSON 여유분. 이보다 큰 본문은 파싱 전에 거절한다 */
const MAX_BODY_BYTES = 16 * 1024;

const json = (data: unknown, status = 200) =>
  NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });

/**
 * 분석 API — 현재는 규칙 기반 데모 엔진(engine: "demo")으로 분석한다.
 * LLM을 연결할 때는 이 지점에서 호출하고, 실제로 성공했을 때만 engine을 "ai"로 표시한다.
 */
export async function POST(request: Request) {
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return json({ error: "JSON 형식으로 보내주세요." }, 415);
  }

  const raw = await request.text();
  if (new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES) {
    return json({ error: "요청이 너무 커요." }, 413);
  }

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return json({ error: "요청 형식이 올바르지 않아요." }, 400);
  }

  const parsed = parseAnalyzeRequest(body);
  if (!parsed.ok) return json({ error: parsed.error }, 400);

  return json(analyzeMessageDemo(parsed.value.message, parsed.value.source));
}
