"use client";

import { useState, type ReactNode } from "react";
import { HelpCircle } from "lucide-react";
import type { HighlightSpan } from "@/lib/types";

interface HighlightedMessageProps {
  message: string;
  highlights: HighlightSpan[];
}

/** 원문에서 의심 문구를 강조하고, 탭하면 이유를 보여준다. */
export default function HighlightedMessage({ message, highlights }: HighlightedMessageProps) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  const nodes: ReactNode[] = [];
  let cursor = 0;
  highlights.forEach((span, i) => {
    if (span.start > cursor) {
      nodes.push(<span key={`t-${cursor}`}>{message.slice(cursor, span.start)}</span>);
    }
    nodes.push(
      <button
        key={`h-${i}`}
        type="button"
        onClick={() => setActiveIdx(activeIdx === i ? null : i)}
        className={`hl hl-${span.category} ${activeIdx === i ? "hl-active" : ""}`}
        aria-expanded={activeIdx === i}
        aria-label={`의심 문구: ${span.text}. 눌러서 이유 보기`}
      >
        {message.slice(span.start, span.end)}
      </button>,
    );
    cursor = span.end;
  });
  if (cursor < message.length) {
    nodes.push(<span key={`t-${cursor}`}>{message.slice(cursor)}</span>);
  }

  const active = activeIdx !== null ? highlights[activeIdx] : null;

  return (
    <div>
      <p className="whitespace-pre-wrap break-all rounded-2xl bg-slate-50 px-4 py-4 text-[1.40625rem] leading-relaxed text-slate-800 md:px-5">
        {nodes}
      </p>
      {active ? (
        <div className="animate-fade-in mt-3 flex gap-2.5 rounded-2xl border border-brand-100 bg-brand-50 px-4 py-3.5">
          <HelpCircle className="mt-0.5 h-4.5 w-4.5 shrink-0 text-brand-600" aria-hidden />
          <div>
            <p className="text-sm font-bold text-brand-800">“{active.text}” — 왜 의심스러운가요?</p>
            <p className="mt-1 text-sm leading-relaxed text-slate-700">{active.reason}</p>
          </div>
        </div>
      ) : (
        highlights.length > 0 && (
          <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
            <HelpCircle className="h-3.5 w-3.5" aria-hidden />
            강조된 문구를 누르면 의심되는 이유를 볼 수 있어요.
          </p>
        )
      )}
    </div>
  );
}
