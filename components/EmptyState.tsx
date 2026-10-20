import type { ReactNode } from "react";
import { keepDots } from "@/lib/typography";

type Art = "inbox" | "lost" | "missing" | "error";

interface EmptyStateProps {
  art: Art;
  title: string;
  description: ReactNode;
  /** 화면의 제목이면 h1 — 페이지 전체를 차지하는 404처럼 크게 */
  as?: "h1" | "h2";
  large?: boolean;
  children?: ReactNode;
  className?: string;
}

/**
 * 빈 화면·찾을 수 없음·오류 — 아이콘 하나 대신 서비스 톤의 작은 그림과 다음 행동을 함께 둔다.
 * 그림은 장식이라 화면 낭독기에서는 건너뛴다.
 */
export default function EmptyState({ art, title, description, as: Heading = "h2", large = false, children, className = "" }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center text-center ${className}`}>
      <EmptyArt art={art} />
      <Heading className={`mt-5 font-bold tracking-tight text-navy-900 ${large ? "text-2xl md:text-3xl" : "text-xl"}`}>{title}</Heading>
      <p className="mt-2 max-w-sm text-base text-slate-500">{typeof description === "string" ? keepDots(description) : description}</p>
      {children && <div className="mt-7 flex w-full flex-col gap-2.5 sm:w-auto sm:flex-row">{children}</div>}
    </div>
  );
}

const C = {
  bg: "#eef4ff", // brand-50
  line: "#c0d4fc", // brand-200
  soft: "#dce7fd", // brand-100
  mid: "#94b7f9", // brand-300
  brand: "#2563eb", // brand-600
  white: "#ffffff",
};

function EmptyArt({ art }: { art: Art }) {
  return (
    <svg viewBox="0 0 160 120" className="h-auto w-40" aria-hidden>
      <circle cx="80" cy="62" r="50" fill={C.bg} />
      <circle cx="32" cy="30" r="3.5" fill={C.line} />
      <circle cx="132" cy="36" r="2.5" fill={C.mid} />
      <circle cx="26" cy="88" r="2" fill={C.mid} />
      <circle cx="138" cy="92" r="3" fill={C.line} />
      {art === "inbox" && <InboxArt />}
      {art === "lost" && <LostArt />}
      {art === "missing" && <MissingArt />}
      {art === "error" && <ErrorArt />}
    </svg>
  );
}

/** 휴대폰 안의 빈 목록 + 방패 — 아직 검사한 문자가 없음 */
function InboxArt() {
  return (
    <g>
      <rect x="54" y="16" width="52" height="92" rx="12" fill={C.white} stroke={C.line} strokeWidth="2" />
      <rect x="72" y="22" width="16" height="3" rx="1.5" fill={C.soft} />
      {[36, 56, 76].map((y) => (
        <g key={y}>
          <circle cx="68" cy={y + 6} r="5" fill="none" stroke={C.line} strokeWidth="1.5" strokeDasharray="3 2.5" />
          <rect x="77" y={y + 3} width="20" height="6" rx="3" fill="none" stroke={C.line} strokeWidth="1.5" strokeDasharray="3 2.5" />
        </g>
      ))}
      <Badge cx={106} cy={94} />
    </g>
  );
}

/** 말풍선 속 물음표 + 돋보기 — 찾는 페이지가 없음 */
function LostArt() {
  return (
    <g>
      <path d="M42 34a14 14 0 0 1 14-14h48a14 14 0 0 1 14 14v26a14 14 0 0 1-14 14H66l-12 11v-11a14 14 0 0 1-12-14z" fill={C.white} stroke={C.line} strokeWidth="2" />
      <text x="80" y="57" textAnchor="middle" fontSize="28" fontWeight="800" fill={C.mid}>
        ?
      </text>
      <Magnifier cx={110} cy={82} />
    </g>
  );
}

/** 점선 결과 카드 + 돋보기 — 이 기기에 없는 검사 결과 */
function MissingArt() {
  return (
    <g>
      <rect x="50" y="18" width="60" height="84" rx="12" fill={C.white} stroke={C.line} strokeWidth="2" strokeDasharray="6 4" />
      <path d="M80 30l12 5v8c0 8-5 13-12 16-7-3-12-8-12-16v-8z" fill={C.soft} />
      <rect x="62" y="68" width="36" height="5" rx="2.5" fill={C.soft} />
      <rect x="66" y="79" width="28" height="5" rx="2.5" fill={C.soft} />
      <Magnifier cx={110} cy={84} />
    </g>
  );
}

/** 방패 속 다시 시도 화살표 — 차분한 오류 */
function ErrorArt() {
  return (
    <g>
      <path d="M80 16l32 13v24c0 24-14 39-32 47-18-8-32-23-32-47V29z" fill={C.white} stroke={C.line} strokeWidth="2" />
      <path d="M92 60a12 12 0 1 1-4-9" fill="none" stroke={C.brand} strokeWidth="4" strokeLinecap="round" />
      <path d="M90 42v10h-10" fill="none" stroke={C.brand} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
}

function Badge({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r="15" fill={C.brand} stroke={C.white} strokeWidth="3" />
      <path d={`M${cx} ${cy - 8}l7 3v4c0 5-3 8-7 10-4-2-7-5-7-10v-4z`} fill={C.white} />
      <path d={`M${cx - 3} ${cy + 1}l2.2 2.2 4-4.4`} fill="none" stroke={C.brand} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
}

function Magnifier({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g>
      <line x1={cx + 9} y1={cy + 9} x2={cx + 18} y2={cy + 18} stroke={C.brand} strokeWidth="6" strokeLinecap="round" />
      <circle cx={cx} cy={cy} r="13" fill={C.white} stroke={C.brand} strokeWidth="4" />
    </g>
  );
}
