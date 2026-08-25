"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Banknote,
  ChevronDown,
  HeartHandshake,
  KeyRound,
  Landmark,
  Link2,
  TimerReset,
} from "lucide-react";
import type { RiskSignal, SignalCategory } from "@/lib/types";

const CATEGORY_ICONS: Record<SignalCategory, typeof AlertTriangle> = {
  impersonation: Landmark,
  urgency: TimerReset,
  link: Link2,
  credential: KeyRound,
  money: Banknote,
  emotion: HeartHandshake,
};

const CATEGORY_BADGES: Record<SignalCategory, string> = {
  impersonation: "bg-indigo-50 text-indigo-700",
  urgency: "bg-amber-50 text-amber-700",
  link: "bg-pink-50 text-pink-700",
  credential: "bg-rose-50 text-rose-700",
  money: "bg-red-50 text-red-700",
  emotion: "bg-yellow-50 text-yellow-700",
};

export default function RiskSignalCard({ signal }: { signal: RiskSignal }) {
  const [open, setOpen] = useState(false);
  const Icon = CATEGORY_ICONS[signal.category];

  return (
    <div className="card overflow-hidden transition-shadow hover:shadow-card-lg">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left md:px-5"
        aria-expanded={open}
      >
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${CATEGORY_BADGES[signal.category]}`}>
          <Icon className="h-5 w-5" aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] font-bold text-navy-900">{signal.title}</span>
          <span className="mt-0.5 block truncate text-sm text-slate-500">
            {signal.matches.map((m) => `“${m}”`).join(" ")}
          </span>
        </span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>
      {open && (
        <div className="animate-fade-in border-t border-line bg-slate-50/60 px-4 py-3.5 md:px-5">
          <p className="text-sm leading-relaxed text-slate-700">{signal.description}</p>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {signal.matches.map((m) => (
              <span
                key={m}
                className={`rounded-lg px-2 py-1 text-xs font-semibold ${CATEGORY_BADGES[signal.category]}`}
              >
                {m}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
