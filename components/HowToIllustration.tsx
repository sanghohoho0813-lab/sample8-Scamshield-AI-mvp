import type { Device, HowToTopic } from "@/lib/how-to";

/**
 * 복사·캡처 안내용 그림 — 말로만 들으면 헷갈리는 "어디를 길게 누르는지", "어느 버튼인지"를 보여준다.
 * 실제 기기 화면을 흉내 내지 않고, 눌러야 할 곳만 파란색으로 짚는 단순한 선 그림.
 */
export default function HowToIllustration({ topic, device }: { topic: HowToTopic; device: Device }) {
  return topic === "copy" ? <CopyArt /> : <CaptureArt device={device} />;
}

const STROKE = "#cbd5e1";
const FILL_SOFT = "#f1f5f9";
const BRAND = "var(--color-brand-600)";
const BRAND_SOFT = "var(--color-brand-100)";

function CopyArt() {
  return (
    <svg viewBox="0 0 240 132" className="h-auto w-full max-w-[15rem]" aria-hidden>
      {/* 휴대폰 화면 일부 */}
      <rect x="40" y="6" width="160" height="140" rx="20" fill="#fff" stroke={STROKE} strokeWidth="2" />
      {/* 받은 말풍선 */}
      <rect x="56" y="58" width="104" height="44" rx="14" fill={FILL_SOFT} />
      <rect x="66" y="69" width="70" height="6" rx="3" fill={STROKE} />
      <rect x="66" y="83" width="52" height="6" rx="3" fill={STROKE} />
      {/* 길게 누르기 — 손가락 위치 */}
      <circle cx="138" cy="92" r="15" fill={BRAND_SOFT} />
      <circle cx="138" cy="92" r="7" fill={BRAND} />
      {/* 화면 아래쪽은 그림 상자 배경으로 서서히 사라지게 */}
      <defs>
        <linearGradient id="howto-fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f5f8ff" stopOpacity="0" />
          <stop offset="1" stopColor="#f5f8ff" />
        </linearGradient>
      </defs>
      <rect x="30" y="104" width="180" height="30" fill="url(#howto-fade)" />
      {/* 뜨는 메뉴 */}
      <g>
        <rect x="70" y="18" width="112" height="32" rx="10" fill="var(--color-navy-900)" />
        <rect x="74" y="22" width="44" height="24" rx="7" fill={BRAND} />
        <text x="96" y="38.5" textAnchor="middle" fontSize="12" fontWeight="700" fill="#fff">
          복사
        </text>
        <text x="148" y="38.5" textAnchor="middle" fontSize="12" fill="rgba(255,255,255,0.7)">
          전달
        </text>
      </g>
    </svg>
  );
}

function CaptureArt({ device }: { device: Device }) {
  // 갤럭시: 오른쪽 옆면에 음량(위)·전원(아래). 아이폰: 왼쪽 음량, 오른쪽 측면 버튼.
  const galaxy = device === "galaxy";
  return (
    <svg viewBox="0 0 240 156" className="h-auto w-full max-w-[15rem]" aria-hidden>
      <rect x="84" y="8" width="72" height="140" rx="16" fill="#fff" stroke={STROKE} strokeWidth="2" />
      <rect x="92" y="18" width="56" height="120" rx="9" fill={FILL_SOFT} />
      <rect x="100" y="34" width="34" height="12" rx="5" fill={STROKE} />
      <rect x="100" y="52" width="40" height="12" rx="5" fill={STROKE} />

      {galaxy ? (
        <>
          {/* 음량 위(눌리지 않음) · 음량 아래 · 전원 */}
          <rect x="155" y="30" width="5" height="14" rx="2" fill={STROKE} />
          <rect x="155" y="44" width="5" height="14" rx="2" fill={BRAND} />
          <rect x="155" y="68" width="5" height="18" rx="2" fill={BRAND} />
          <Callout x={168} y={51} label="음량 아래" />
          <Callout x={168} y={77} label="전원" />
        </>
      ) : (
        <>
          {/* 왼쪽: 음량 높이기(누름) · 낮추기 / 오른쪽: 측면 버튼 */}
          <rect x="80" y="32" width="5" height="16" rx="2" fill={BRAND} />
          <rect x="80" y="54" width="5" height="16" rx="2" fill={STROKE} />
          <rect x="155" y="40" width="5" height="26" rx="2" fill={BRAND} />
          <Callout x={72} y={40} label="음량 높이기" align="end" />
          <Callout x={168} y={53} label="측면 버튼" />
        </>
      )}
    </svg>
  );
}

function Callout({ x, y, label, align = "start" }: { x: number; y: number; label: string; align?: "start" | "end" }) {
  const dir = align === "start" ? 1 : -1;
  return (
    <g>
      <line x1={x - dir * 6} y1={y} x2={x + dir * 4} y2={y} stroke={BRAND} strokeWidth="2" strokeLinecap="round" />
      <text x={x + dir * 8} y={y + 4.5} textAnchor={align} fontSize="12.5" fontWeight="700" fill="var(--color-navy-900)">
        {label}
      </text>
    </g>
  );
}
