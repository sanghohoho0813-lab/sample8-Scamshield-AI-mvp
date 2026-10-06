"use client";

import { useState, type ReactNode } from "react";
import type { HighlightSpan } from "@/lib/types";

interface HighlightedMessageProps {
  message: string;
  highlights: HighlightSpan[];
  /** 하이라이트 안내 문구 (기본: 의심 문구 안내) */
  hint?: string;
}

/** 원문에서 의심 문구를 강조하고, 누르면 의심되는 이유를 바로 아래에 보여준다 */
export default function HighlightedMessage({ message, highlights, hint }: HighlightedMessageProps) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  const nodes: ReactNode[] = [];
  let cursor = 0;
  highlights.forEach((span, i) => {
    if (span.start > cursor) nodes.push(message.slice(cursor, span.start));
    nodes.push(
      <button
        key={`h-${i}`}
        type="button"
        onClick={() => setActiveIdx(activeIdx === i ? null : i)}
        className="hl focus-ring"
        aria-expanded={activeIdx === i}
        aria-controls="highlight-reason"
      >
        {message.slice(span.start, span.end)}
      </button>,
    );
    cursor = span.end;
  });
  if (cursor < message.length) nodes.push(message.slice(cursor));

  const active = activeIdx !== null ? highlights[activeIdx] : null;

  return (
    <div>
      <p className="whitespace-pre-wrap rounded-xl bg-slate-50 px-4 py-4 text-base leading-8 text-slate-800 [overflow-wrap:anywhere] md:px-5">
        {nodes}
      </p>
      <div id="highlight-reason" aria-live="polite">
        {active ? (
          <div className="animate-fade-in mt-3 border-l-4 border-amber-400 bg-amber-50/60 px-4 py-3">
            <p className="text-sm font-bold text-navy-900">“{active.text}” — 왜 주의해야 하나요?</p>
            <p className="mt-1 text-base text-slate-700">{active.reason}</p>
          </div>
        ) : (
          highlights.length > 0 && (
            <p className="mt-2.5 text-sm text-slate-500">
              {hint ?? "밑줄 친 문구를 누르면 의심되는 이유를 볼 수 있어요."}
            </p>
          )
        )}
      </div>
    </div>
  );
}
