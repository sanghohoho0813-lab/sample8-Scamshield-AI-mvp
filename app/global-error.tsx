"use client";

/**
 * 루트 레이아웃까지 실패했을 때의 마지막 안전망.
 * 레이아웃·전역 CSS 없이 그려지므로 스타일을 인라인으로 둔다.
 */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="ko">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#f5f7fb", color: "#101b3f" }}>
        <main style={{ maxWidth: 420, margin: "0 auto", padding: "96px 24px", textAlign: "center", wordBreak: "keep-all" }}>
          <h1 style={{ fontSize: 24, margin: 0 }}>화면을 불러오지 못했어요</h1>
          <p style={{ marginTop: 12, fontSize: 17, lineHeight: 1.6, color: "#56657e" }}>
            잠시 후 다시 시도해주세요. 검사 기록은 이 기기에 그대로 남아 있어요.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{ marginTop: 28, minHeight: 52, padding: "0 24px", border: 0, borderRadius: 12, background: "#2563eb", color: "#fff", fontSize: 17, fontWeight: 700, cursor: "pointer" }}
          >
            다시 시도
          </button>
        </main>
      </body>
    </html>
  );
}
