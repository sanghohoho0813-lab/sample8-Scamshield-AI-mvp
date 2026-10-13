"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Phone } from "lucide-react";
import { SITUATIONS, findSituation, type SituationId } from "@/lib/recovery";

interface RecoveryPickerProps {
  /** 주소의 #money 같은 해시와 선택 상태를 맞출지 (피해 대응 페이지) */
  syncHash?: boolean;
  /** 같은 화면에 두 개가 있을 때 id 충돌을 피한다 */
  idPrefix?: string;
}

/**
 * "이미 행동했어요" — 상황을 고르면 지금 할 일을 순서대로 보여준다.
 * 결과 화면과 피해 대응 페이지가 같은 내용을 쓴다.
 */
export default function RecoveryPicker({ syncHash = false, idPrefix = "recovery" }: RecoveryPickerProps) {
  const [selected, setSelected] = useState<SituationId | null>(null);

  useEffect(() => {
    if (!syncHash) return;
    const fromHash = () => setSelected(findSituation(window.location.hash.slice(1))?.id ?? null);
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, [syncHash]);

  const choose = (id: SituationId) => {
    const next = selected === id ? null : id;
    setSelected(next);
    if (syncHash) window.history.replaceState(null, "", next ? `#${next}` : window.location.pathname);
  };

  const situation = findSituation(selected);
  const panelId = `${idPrefix}-steps`;

  return (
    <div>
      <div className="grid gap-2 sm:grid-cols-2" role="group" aria-label="어떤 상황인가요?">
        {SITUATIONS.map(({ id, icon: Icon, label, hint }) => {
          const active = selected === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => choose(id)}
              aria-pressed={active}
              aria-controls={panelId}
              className={`focus-ring flex min-h-16 items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition-colors sm:items-start ${
                active ? "border-brand-600 bg-brand-50" : "border-line bg-white hover:border-brand-200"
              }`}
            >
              <Icon className={`h-6 w-6 shrink-0 sm:mt-0.5 sm:h-5 sm:w-5 ${active ? "text-brand-700" : "text-slate-500"}`} aria-hidden />
              <span className="min-w-0">
                <span className={`block text-base font-bold leading-snug ${active ? "text-brand-800" : "text-navy-900"}`}>{label}</span>
                <span className="mt-0.5 block text-sm leading-snug text-slate-500">{hint}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div id={panelId} aria-live="polite">
        {situation && (
          <div className="animate-fade-in mt-4 rounded-xl bg-slate-50 px-4 py-4 md:px-5">
            <p className="text-base font-semibold text-navy-900">{situation.lead}</p>
            <ol className="mt-3 flex flex-col gap-3.5">
              {situation.steps.map((step, i) => (
                <li key={step.text} className="flex gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-navy-900 text-sm font-bold text-white">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-base text-slate-800">{step.text}</p>
                    {step.call && (
                      <a
                        href={`tel:${step.call.tel}`}
                        className="focus-ring mt-2 inline-flex min-h-12 items-center gap-2 rounded-xl bg-brand-600 px-4 text-base font-bold text-white hover:bg-brand-700"
                      >
                        <Phone className="h-5 w-5" aria-hidden />
                        <span className="tabular-nums">{step.call.tel}</span>에 전화하기
                      </a>
                    )}
                    {step.link && (
                      <a
                        href={step.link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="focus-ring mt-2 inline-flex min-h-12 items-center gap-2 rounded-xl border border-line bg-white px-4 text-base font-semibold text-brand-700 hover:border-brand-200"
                      >
                        {step.link.label}
                        <ExternalLink className="h-4 w-4" aria-hidden />
                        <span className="sr-only">(새 창)</span>
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}
