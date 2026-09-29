"use client";

import { useState } from "react";
import {
  Banknote,
  ChevronDown,
  HeartHandshake,
  KeyRound,
  Landmark,
  Link2,
  TimerReset,
  type LucideIcon,
} from "lucide-react";
import type { RiskSignal, SignalCategory } from "@/lib/types";

const CATEGORY_ICONS: Record<SignalCategory, LucideIcon> = {
  impersonation: Landmark,
  urgency: TimerReset,
  link: Link2,
  credential: KeyRound,
  money: Banknote,
  emotion: HeartHandshake,
};

/** 발견된 위험 신호 — 한 목록 안에서 행을 눌러 근거를 펼친다 */
export default function SignalList({ signals }: { signals: RiskSignal[] }) {
  const [open, setOpen] = useState<SignalCategory | null>(null);

  return (
    <ul className="divide-y divide-line">
      {signals.map((signal) => {
        const Icon = CATEGORY_ICONS[signal.category];
        const expanded = open === signal.category;
        const panelId = `signal-${signal.category}`;
        return (
          <li key={signal.category}>
            <button
              type="button"
              onClick={() => setOpen(expanded ? null : signal.category)}
              aria-expanded={expanded}
              aria-controls={panelId}
              className="focus-ring flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-slate-50 md:px-5"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-base font-semibold text-navy-900">{signal.title}</span>
                <span className="mt-0.5 block truncate text-sm text-slate-500">
                  {signal.matches.map((m) => `“${m}”`).join(" ")}
                </span>
              </span>
              <ChevronDown
                className={`h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
                aria-hidden
              />
            </button>
            {expanded && (
              <div id={panelId} className="animate-fade-in px-4 pb-4 pl-[4.25rem] md:px-5 md:pl-[4.5rem]">
                <p className="text-base text-slate-700">{signal.description}</p>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {signal.matches.map((m) => (
                    <span key={m} className="max-w-full rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700 [overflow-wrap:anywhere]">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
