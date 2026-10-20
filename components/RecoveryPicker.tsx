"use client";

import { useEffect, useRef, useState } from "react";
import { Check, CircleCheck, ExternalLink, Phone, RotateCcw } from "lucide-react";
import { SITUATIONS, findSituation, type SituationId } from "@/lib/recovery";
import { RECOVERY_PROGRESS_KEY, parseProgress, progressOf, resetSituation, toggleStep, type RecoveryProgress } from "@/lib/recovery-progress";
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
  const [progress, setProgress] = useState<RecoveryProgress>({});
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

  // 체크 기록은 서버 렌더 뒤에 불러와 첫 화면이 어긋나지 않게 한다
  useEffect(() => {
    try {
      setProgress(parseProgress(sessionStorage.getItem(RECOVERY_PROGRESS_KEY)));
    } catch {
      // 저장소를 쓸 수 없는 환경 — 이 화면에서만 체크된다
    }
  }, []);

  const updateProgress = (next: RecoveryProgress) => {
    setProgress(next);
    try {
      sessionStorage.setItem(RECOVERY_PROGRESS_KEY, JSON.stringify(next));
    } catch {
      // 저장소를 쓸 수 없는 환경
    }
  };

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
  const doneSteps = situation ? (progress[situation.id] ?? []) : [];
  const { done, total } = situation ? progressOf(progress, situation.id) : { done: 0, total: 0 };
  const allDone = total > 0 && done === total;

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

      {/* 화면 낭독기: 고른 상황과 진행만 짧게 알린다 (단계 전체를 다시 읽지 않게) */}
      <p className="sr-only" role="status">
        {situation ? `${situation.label}: 할 일 ${total}가지 중 ${done}가지 했어요` : ""}
      </p>
      <div id={panelId} ref={panelRef} className="scroll-mt-20">
        {situation && (
          <div className="animate-fade-in mt-4 rounded-2xl bg-surface px-4 py-4 md:px-5">
            <p className="text-base font-semibold text-navy-900">{keepDots(situation.lead)}</p>

            {/* 진행 상황 — 하나씩 마칠 때마다 채워진다 */}
            <div className="mt-3 flex items-center gap-3">
              <div
                className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200"
                role="progressbar"
                aria-label="할 일 진행"
                aria-valuemin={0}
                aria-valuemax={total}
                aria-valuenow={done}
                aria-valuetext={`${total}개 중 ${done}개 했어요`}
              >
                <div
                  className={`h-full rounded-full transition-[width] duration-300 ${allDone ? "bg-risk-low" : "bg-brand-600"}`}
                  style={{ width: `${total ? (done / total) * 100 : 0}%` }}
                />
              </div>
              <span className="shrink-0 text-sm font-semibold tabular-nums text-slate-600" aria-hidden>
                {done}/{total}
              </span>
            </div>

            <ol className="mt-4">
              {situation.steps.map((step, i) => {
                const checked = doneSteps.includes(i);
                return (
                  <li key={step.text} className="relative flex gap-3 pb-5 last:pb-0">
                    {i < situation.steps.length - 1 && (
                      <span className={`absolute bottom-0 left-3 top-7 w-px ${checked ? "bg-risk-low/40" : "bg-slate-300"}`} aria-hidden />
                    )}
                    <span
                      className={`relative mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white transition-colors ${
                        checked ? "bg-risk-low" : "bg-navy-900"
                      }`}
                      aria-hidden
                    >
                      {checked ? <Check className="h-4 w-4" strokeWidth={3} /> : i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className={`text-base transition-colors ${checked ? "text-slate-500" : "text-slate-800"}`}>
                        <span className="sr-only">{i + 1}. </span>
                        {keepDots(step.text)}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        {step.call && (
                          <a
                            href={`tel:${step.call.tel}`}
                            className="focus-ring inline-flex min-h-12 items-center gap-2 rounded-xl bg-brand-600 px-4 text-base font-bold text-white hover:bg-brand-700"
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
                            className="focus-ring inline-flex min-h-12 items-center gap-2 rounded-xl border border-line bg-white px-4 text-base font-semibold text-brand-700 hover:border-brand-200"
                          >
                            {step.link.label}
                            <ExternalLink className="h-4 w-4" aria-hidden />
                            <span className="sr-only">(새 창)</span>
                          </a>
                        )}
                        <button
                          type="button"
                          aria-pressed={checked}
                          aria-label={`${i + 1}번 했어요`}
                          onClick={() => updateProgress(toggleStep(progress, situation.id, i))}
                          className={`focus-ring press inline-flex min-h-11 items-center gap-1.5 rounded-xl border px-3 text-sm font-semibold transition-colors ${
                            checked
                              ? "border-risk-low/30 bg-risk-low-bg text-risk-low"
                              : "border-line bg-white text-slate-600 hover:border-brand-200 hover:text-navy-900"
                          }`}
                        >
                          {checked ? (
                            <CircleCheck className="h-[1.125rem] w-[1.125rem]" aria-hidden />
                          ) : (
                            <span className="h-[1.125rem] w-[1.125rem] rounded-full border-2 border-slate-300" aria-hidden />
                          )}
                          했어요
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>

            {/* 다 마치면 차분하게 마무리 */}
            {allDone && (
              <div className="animate-fade-in mt-5 flex items-start gap-3 rounded-xl bg-white px-4 py-3.5 ring-1 ring-risk-low/25">
                <CircleCheck className="mt-0.5 h-5 w-5 shrink-0 text-risk-low" aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="text-base font-bold text-navy-900">할 일을 모두 마쳤어요</p>
                  <p className="mt-0.5 text-sm text-slate-600">
                    처리 결과가 걱정되면 안내받은 기관에 다시 확인하거나 상담 전화를 이용하세요.
                  </p>
                </div>
              </div>
            )}

            <div className="mt-4 flex min-h-11 flex-wrap items-center justify-between gap-x-3 border-t border-line pt-2">
              <p className="py-1 text-sm text-slate-500">체크는 이 창을 닫으면 지워져요.</p>
              {done > 0 && (
                <button
                  type="button"
                  onClick={() => updateProgress(resetSituation(progress, situation.id))}
                  className="focus-ring -mr-1 inline-flex min-h-11 items-center gap-1.5 rounded-lg px-1 text-sm font-semibold text-slate-500 hover:text-navy-900"
                >
                  <RotateCcw className="h-4 w-4" aria-hidden />
                  체크 지우기
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
