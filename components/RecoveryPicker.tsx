"use client";

import { useEffect, useRef, useState } from "react";
import { ExternalLink, Phone } from "lucide-react";
import { SITUATIONS, findSituation, type SituationId } from "@/lib/recovery";
import { keepDots } from "@/lib/typography";

interface RecoveryPickerProps {
  /** 주소의 #money 같은 해시와 선택 상태를 맞출지 (피해 대응 페이지) */
  syncHash?: boolean;
  /** 같은 화면에 두 개가 있을 때 id 충돌을 피한다 */
  idPrefix?: string;
  /** 결과 화면처럼 다른 내용이 이어지는 곳: 보조 설명 없이 2열로 낮게 */
  compact?: boolean;
}

/**
 * "이미 행동했어요" — 상황을 고르면 지금 할 일을 순서대로 보여준다.
 * 결과 화면과 피해 대응 페이지가 같은 내용을 쓴다.
 */
export default function RecoveryPicker({ syncHash = false, idPrefix = "recovery", compact = false }: RecoveryPickerProps) {
  const [selected, setSelected] = useState<SituationId | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  /** 사용자가 직접 고른 직후에만 안내로 스크롤한다 (주소 해시로 들어온 첫 화면은 제외) */
  const userChose = useRef(false);

  useEffect(() => {
    if (!selected || !userChose.current || !panelRef.current) return;
    userChose.current = false;
    const top = panelRef.current.getBoundingClientRect().top;
    // 안내가 화면 아래쪽에 열려 눈에 띄지 않으면 보이는 곳까지 부드럽게 올린다
    if (top > window.innerHeight * 0.55) {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      panelRef.current.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    }
  }, [selected]);

  useEffect(() => {
    if (!syncHash) return;
    const fromHash = () => setSelected(findSituation(window.location.hash.slice(1))?.id ?? null);
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, [syncHash]);

  const choose = (id: SituationId) => {
    const next = selected === id ? null : id;
    userChose.current = next !== null;
    setSelected(next);
    if (syncHash) window.history.replaceState(null, "", next ? `#${next}` : window.location.pathname);
  };

  const situation = findSituation(selected);
  const panelId = `${idPrefix}-steps`;

  return (
    <div>
      <div className={`grid gap-2 ${compact ? "grid-cols-2" : "sm:grid-cols-2"}`} role="group" aria-label="어떤 상황인가요?">
        {SITUATIONS.map(({ id, icon: Icon, label, hint }) => {
          const active = selected === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => choose(id)}
              aria-pressed={active}
              aria-controls={panelId}
              className={`focus-ring press flex items-center rounded-2xl border text-left transition-colors ${
                compact ? "min-h-14 gap-2.5 px-3 py-2.5" : "min-h-[4.25rem] gap-3 px-3.5 py-3"
              } ${
                active ? "border-brand-600 bg-brand-50 ring-1 ring-brand-600" : "border-line bg-white hover:border-brand-200 hover:bg-slate-50/60"
              }`}
            >
              <span
                className={`flex shrink-0 items-center justify-center rounded-full transition-colors ${compact ? "h-8 w-8" : "h-10 w-10"} ${
                  active ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-600"
                }`}
              >
                <Icon className={compact ? "h-4 w-4" : "h-5 w-5"} aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className={`block text-base font-bold leading-snug ${active ? "text-brand-800" : "text-navy-900"}`}>{label}</span>
                {!compact && <span className="mt-0.5 block text-sm leading-snug text-slate-500">{keepDots(hint)}</span>}
              </span>
            </button>
          );
        })}
      </div>

      <div id={panelId} ref={panelRef} aria-live="polite" className="scroll-mt-20">
        {situation && (
          <div className="animate-fade-in mt-4 rounded-2xl bg-surface px-4 py-4 md:px-5">
            <p className="text-base font-semibold text-navy-900">{keepDots(situation.lead)}</p>
            <ol className="mt-4">
              {situation.steps.map((step, i) => (
                <li key={step.text} className="relative flex gap-3 pb-5 last:pb-0">
                  {i < situation.steps.length - 1 && <span className="absolute bottom-0 left-3 top-7 w-px bg-slate-300" aria-hidden />}
                  <span className="relative mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-navy-900 text-sm font-bold text-white">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-base text-slate-800">{keepDots(step.text)}</p>
                    {step.call && (
                      <a
                        href={`tel:${step.call.tel}`}
                        className="focus-ring mt-2 inline-flex min-h-12 items-center gap-2 rounded-xl bg-brand-600 px-4 text-base font-bold text-white hover:bg-brand-700"
                      >
                        <Phone className="h-5 w-5" aria-hidden />
                        {/* 한 덩어리로 감싸 flex 간격이 "112 에"처럼 끼어들지 않게 한다 */}
                        <span>
                          <span className="tabular-nums">{step.call.tel}</span>에 전화하기
                        </span>
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
