import { describe, expect, it } from "vitest";
import { POST } from "@/app/api/analyze/route";

const post = (body: string, contentType = "application/json") =>
  POST(new Request("http://localhost/api/analyze", { method: "POST", headers: { "content-type": contentType }, body }));

describe("POST /api/analyze", () => {
  it("분석 결과를 돌려주고 캐시하지 않는다", async () => {
    const res = await post(JSON.stringify({ message: "급하게 송금해줘 http://a.top/x" }));
    expect(res.status).toBe(200);
    expect(res.headers.get("cache-control")).toBe("no-store");
    const data = await res.json();
    expect(data.engine).toBe("demo");
    expect(typeof data.score).toBe("number");
  });

  it("JSON이 아니면 415", async () => {
    expect((await post("message=hi", "application/x-www-form-urlencoded")).status).toBe(415);
  });

  it("깨진 JSON이면 400", async () => {
    expect((await post("{not json")).status).toBe(400);
  });

  it("형식이 틀리면 400과 이유를 돌려준다", async () => {
    const res = await post(JSON.stringify({ message: 42 }));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBeTruthy();
  });

  it("지나치게 큰 본문은 파싱 전에 413", async () => {
    expect((await post(JSON.stringify({ message: "가".repeat(10000) }))).status).toBe(413);
  });
});
