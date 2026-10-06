import { describe, expect, it } from "vitest";
import { parseAnalyzeRequest } from "@/lib/validation";
import { MAX_MESSAGE_LENGTH } from "@/lib/constants";

describe("parseAnalyzeRequest", () => {
  it("정상 요청은 공백을 정리하고 기본 입력 방식을 채운다", () => {
    expect(parseAnalyzeRequest({ message: "  안녕  " })).toEqual({ ok: true, value: { message: "안녕", source: "text" } });
    expect(parseAnalyzeRequest({ message: "a", source: "image" })).toMatchObject({ ok: true, value: { source: "image" } });
  });

  it.each([
    ["null", null],
    ["배열", ["x"]],
    ["문자열", "x"],
    ["숫자 message", { message: 1 }],
    ["빈 message", { message: "   " }],
    ["알 수 없는 source", { message: "x", source: "video" }],
    ["너무 긴 message", { message: "가".repeat(MAX_MESSAGE_LENGTH + 1) }],
  ])("%s → 거절", (_, body) => {
    expect(parseAnalyzeRequest(body).ok).toBe(false);
  });

  it("최대 길이까지는 허용한다", () => {
    expect(parseAnalyzeRequest({ message: "가".repeat(MAX_MESSAGE_LENGTH) }).ok).toBe(true);
  });
});
