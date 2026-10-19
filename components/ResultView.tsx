"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Banknote,
  Check,
  ChevronDown,
  ChevronRight,
  HeartHandshake,
  Info,
  KeyRound,
  Landmark,
  LifeBuoy,
  Link2,
  Phone,
  Repeat2,
  ScanSearch,
  Share2,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  TimerReset,
  Trash2,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";
import type { HistoryEntry, RiskLevel } from "@/lib/types";
import { RISK_STYLE } from "@/lib/risk-style";
import { guideForScamType } from "@/lib/guides";
import { deleteEntry, getHistory, markShared } from "@/lib/storage";
import { formatRelative } from "@/lib/format";
import { buildShareText } from "@/lib/share";
import { keepDots } from "@/lib/typography";
import {
  REPEAT_WINDOW_DAYS,
  absentChecks,
  actionPlan,
  riskExplanations,
  scoreBreakdown,
  similarRecent,
  typeName,
  verdictHeadline,
  visibleHighlights,
} from "@/lib/verdict";
import RiskMeter from "./RiskMeter";
import RecoveryPicker from "./RecoveryPicker";
import HighlightedMessage from "./HighlightedMessage";
import SharePreviewDialog from "./SharePreviewDialog";

interface ResultViewProps {
  entry: HistoryEntry;
  /** 화면 안내 메시지 (페이지의 토스트 하나를 공유) */
  notify: (message: string, tone?: "success" | "info") => void;
}

/** 근거 종류별 아이콘 — 글을 읽기 전에 무엇에 관한 근거인지 먼저 보이게 */
const EVIDENCE_ICON: Record<string, LucideIcon> = {
  link: Link2,
  credential: KeyRound,
  money: Banknote,
  urgency: TimerReset,
  impersonation: Landmark,
  emotion: HeartHandshake,
  phone: Phone,
};

const STATUS: Record<RiskLevel, { icon: LucideIcon; label: string }> = {
  "very-high": { icon: ShieldAlert, label: "위험 매우 높음" },
  high: { icon: ShieldAlert, label: "위험 높음" },
  caution: { icon: TriangleAlert, label: "주의 필요" },
  low: { icon: ShieldCheck, label: "위험 낮음" },
};

export default function ResultView({ entry: initialEntry, notify: show }: ResultViewProps) {
  const router = useRouter();
  const [entry, setEntry] = useState(initialEntry);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [shareText, setShareText] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  // 결과 화면은 기록을 불러온 뒤(브라우저에서만) 그려지므로 첫 렌더에서 바로 계산해 화면이 밀리지 않게 한다
  const [repeats] = useState(() => similarRecent(initialEntry, getHistory()).length);

  const r = entry.result;
  const style = RISK_STYLE[r.level];
  const status = STATUS[r.level];
  const isLow = r.level === "low";
  const guide = guideForScamType(r.scamType);
  const steps = actionPlan(r);
  const explanations = riskExplanations(r);
  const highlights = visibleHighlights(r);
  const { items: scoreItems, approximate } = scoreBreakdown(r);

  const closeShare = useCallback(() => setShareText(null), []);
  const handleShared = (method: "share" | "copy") => {
    setEntry((e) => ({ ...e, sharedAt: markShared(e.id) }));
    setShareText(null);
    show(method === "share" ? "결과를 보냈어요." : "내용을 복사했어요. 메신저에 붙여넣어 보내세요.");
  };

  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    deleteEntry(entry.id);
    router.replace("/history?deleted=1");
  };

  const openShare = () => setShareText(buildShareText(entry, window.location.origin));

  return (
    <div className="grid gap-4 md:gap-5 lg:grid-cols-[minmax(0,25rem)_minmax(0,1fr)] lg:items-start lg:gap-8">
      {/* 결론 + 지금 할 일 */}
      <aside className="flex flex-col gap-4 lg:sticky lg:top-32">
        <section className="card px-5 pb-5 pt-5 md:px-6" aria-labelledby="verdict-heading">
          <p className={`flex items-center gap-2 text-base font-bold ${style.text}`}>
            <span className={`flex h-9 w-9 items-center justify-center rounded-full ${style.bg}`}>
              <status.icon className="h-5 w-5" aria-hidden />
            </span>
            {status.label}
          </p>
          <h1 id="verdict-heading" className="mt-3 text-2xl font-extrabold tracking-tight text-navy-900">
            {verdictHeadline(r)}
          </h1>

          <div className="mt-4 rounded-2xl bg-surface px-4 py-4">
            <h2 className="text-sm font-bold text-slate-500">{isLow ? "그래도 이것만 확인하세요" : "지금 이렇게 하세요"}</h2>
            <ol className="mt-3" aria-label="지금 해야 할 행동">
              {steps.map((step, i) => (
                <li key={step} className="relative flex gap-3 pb-4 last:pb-0">
                  {i < steps.length - 1 && <span className="absolute bottom-0 left-3 top-7 w-px bg-brand-200" aria-hidden />}
                  <span
                    className={`relative mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                      i === 0 ? "bg-brand-600 text-white" : "bg-white text-brand-700 ring-2 ring-inset ring-brand-200"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <p className={i === 0 ? "text-lg font-bold leading-snug text-navy-900" : "text-base text-slate-700"}>{keepDots(step)}</p>
                </li>
              ))}
            </ol>
          </div>

          <div className="mt-5">
            <RiskMeter level={r.level} score={r.score} />
          </div>

          {entry.sharedAt && (
            <p className="-mx-5 -mb-5 mt-5 flex items-center gap-2 rounded-b-[var(--radius-2xl)] border-t border-line bg-brand-50/60 px-5 py-3 text-sm font-semibold text-brand-800 md:-mx-6 md:px-6">
              <Check className="h-4 w-4 shrink-0" aria-hidden />
              {formatRelative(entry.sharedAt)} 가족에게 공유했어요
            </p>
          )}
        </section>

        {repeats > 0 && (
          <div className="flex gap-3 rounded-2xl border border-brand-100 bg-brand-50 px-4 py-4" role="note">
            <Repeat2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-700" aria-hidden />
            <div className="text-base text-slate-700">
              <p className="font-bold text-navy-900">
                최근 {REPEAT_WINDOW_DAYS}일 동안 {typeName(r.scamTypeLabel)} 문자를 {repeats}번 더 받으셨어요
              </p>
              <p className="mt-1">같은 수법이 반복되고 있어요. 문자 앱에서 발신 번호를 차단하고 스팸으로 신고해두세요.</p>
              <Link
                href={`/history?type=${r.scamType}`}
                className="focus-ring mt-1.5 inline-flex min-h-11 items-center gap-1 rounded-lg font-semibold text-brand-700"
              >
                같은 유형 기록 보기
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </div>
        )}

        <div className="hidden flex-col gap-2.5 lg:flex">
          <button type="button" onClick={openShare} className="btn-primary btn-lg w-full">
            <Share2 className="h-5 w-5" aria-hidden />
            가족에게 공유하기
          </button>
          <Link href="/" className="btn-secondary w-full">
            <ScanSearch className="h-5 w-5" aria-hidden />
            다른 문자 검사하기
          </Link>
        </div>
      </aside>

      <div className="flex min-w-0 flex-col gap-4 md:gap-5">
        {/* 이미 행동한 사용자 */}
        {isLow ? (
          <Link
            href="/help"
            className="focus-ring card group flex min-h-16 items-center gap-3.5 px-5 py-4 text-base font-semibold text-navy-900 hover:border-brand-200"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700">
              <LifeBuoy className="h-5 w-5" aria-hidden />
            </span>
            <span className="flex-1">이미 링크를 눌렀거나 돈을 보냈다면</span>
            <ChevronRight className="h-5 w-5 shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </Link>
        ) : (
          <section className="card px-5 py-5 md:px-6" aria-labelledby="recovery-heading">
            <h2 id="recovery-heading" className="text-lg font-bold text-navy-900">
              이미 링크를 눌렀거나 돈을 보냈나요?
            </h2>
            <p className="mt-1 text-base text-slate-500">상황을 고르면 지금 할 일을 순서대로 알려드려요.</p>
            <div className="mt-4">
              <RecoveryPicker />
            </div>
            <Link href="/help" className="focus-ring mt-3 inline-flex min-h-11 items-center gap-1 rounded-lg text-base font-semibold text-brand-700">
              신고·상담 전화번호 모두 보기
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </section>
        )}

        {/* 근거 */}
        <section className="card px-5 py-5 md:px-6" aria-labelledby="evidence-heading">
          <h2 id="evidence-heading" className="text-lg font-bold text-navy-900">
            {isLow ? "이렇게 확인했어요" : "왜 위험한가요?"}
          </h2>

          {!isLow && guide && (
            <div className="mt-3 flex gap-3.5 rounded-2xl bg-brand-50/70 px-4 py-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-brand-700 shadow-[var(--shadow-subtle)]">
                <guide.icon className="h-5 w-5" aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="text-base font-bold text-navy-900">{guide.title} 문자와 비슷해요</p>
                <p className="mt-0.5 text-base text-slate-600">{keepDots(guide.summary)}</p>
                <Link
                  href={`/guide#${guide.id}`}
                  className="focus-ring mt-1 inline-flex min-h-11 items-center gap-1 rounded-lg text-base font-semibold text-brand-700"
                >
                  {guide.title} 대처법 보기
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </div>
            </div>
          )}

          {isLow ? (
            <ul className="mt-3 flex flex-col gap-2.5" aria-label="확인한 항목">
              {absentChecks(r).map((check) => (
                <li key={check} className="flex gap-2.5 text-base text-slate-700">
                  <Check className="mt-1 h-5 w-5 shrink-0 text-risk-low" aria-hidden />
                  {check}
                </li>
              ))}
            </ul>
          ) : (
            <ul className="mt-2 divide-y divide-line" aria-label="이렇게 판단했어요">
              {explanations.map((item) => {
                const Icon = item.title === "모르는 앱을 설치하게 해요" ? Smartphone : (EVIDENCE_ICON[item.id] ?? TriangleAlert);
                return (
                  <li key={item.id} className="flex gap-3.5 py-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-100">
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-base font-bold text-navy-900">{keepDots(item.title)}</p>
                      {item.quotes.length > 0 && (
                        <p className="mt-1.5 flex flex-wrap gap-1.5">
                          {item.quotes.map((q) => (
                            <span
                              key={q}
                              className="max-w-full rounded-md bg-amber-50 px-2 py-0.5 text-base font-semibold text-amber-900 ring-1 ring-amber-200 [overflow-wrap:anywhere]"
                            >
                              “{q}”
                            </span>
                          ))}
                        </p>
                      )}
                      <p className="mt-1.5 text-base text-slate-600">{keepDots(item.why)}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          <h3 className="mt-4 flex flex-wrap items-baseline gap-x-2 text-base font-bold text-navy-900">
            받은 문자
            {r.source === "image" && <span className="text-sm font-semibold text-slate-500">캡처 이미지에서 읽음 (데모 OCR)</span>}
          </h3>
          <div className="mt-2">
            <HighlightedMessage
              message={r.message}
              highlights={highlights}
              hint={isLow ? "사기 문자에 자주 쓰이는 표현에는 참고로 밑줄을 그었어요." : undefined}
            />
          </div>
        </section>

        {/* 점수 근거 — 궁금한 분만 펼쳐 본다 */}
        <section className="card overflow-hidden" aria-labelledby="detail-heading">
          <button
            type="button"
            onClick={() => setDetailOpen((v) => !v)}
            aria-expanded={detailOpen}
            aria-controls="detail-panel"
            className="focus-ring flex min-h-16 w-full items-center justify-between gap-3 px-5 py-4 text-left hover:bg-slate-50 md:px-6"
          >
            <span>
              <span id="detail-heading" className="block text-lg font-bold text-navy-900">
                점수는 이렇게 매겼어요
              </span>
              <span className="mt-0.5 block text-sm text-slate-500">
                규칙 기반 분석 · 근거 {scoreItems.length}개
                {r.urls.length > 0 && ` · 링크 ${r.urls.length}개`}
                {r.phones.length > 0 && ` · 전화번호 ${r.phones.length}개`}
              </span>
            </span>
            <ChevronDown
              className={`h-5 w-5 shrink-0 text-slate-500 transition-transform duration-200 ${detailOpen ? "rotate-180" : ""}`}
              aria-hidden
            />
          </button>
          {detailOpen && (
            <div id="detail-panel" className="animate-fade-in border-t border-line px-5 pb-5 pt-4 md:px-6">
              <p className="text-base text-slate-600">
                사기 문자에 자주 쓰이는 표현·링크·전화번호 패턴을 찾아 점수를 더해요. 여러 신호가 함께 나오면 더 높게 봐요.
              </p>
              {scoreItems.length > 0 ? (
                <table className="mt-3 w-full text-base">
                  <caption className="sr-only">점수 계산 근거</caption>
                  <tbody className="divide-y divide-line">
                    {scoreItems.map((item, i) => (
                      <tr key={`${item.label}-${i}`}>
                        <th scope="row" className={`py-2.5 pr-3 text-left font-normal ${item.sub ? "pl-4 text-slate-500" : "text-slate-700"}`}>
                          {item.sub && <span aria-hidden>└ </span>}
                          {item.label}
                        </th>
                        <td className={`whitespace-nowrap py-2.5 text-right tabular-nums ${item.sub ? "text-slate-500" : "font-semibold text-navy-900"}`}>
                          +{item.points}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-navy-900/10">
                      <th scope="row" className="pt-3 text-left font-bold text-navy-900">
                        위험 점수
                      </th>
                      <td className="whitespace-nowrap pt-3 text-right font-extrabold tabular-nums text-navy-900">{r.score}점</td>
                    </tr>
                  </tfoot>
                </table>
              ) : (
                <p className="mt-3 text-base text-slate-600">사기 문자에 자주 쓰이는 표현을 찾지 못했어요.</p>
              )}
              {r.scoreCapNote && <p className="mt-2 text-sm text-slate-500">※ {r.scoreCapNote}</p>}
              {approximate && <p className="mt-2 text-sm text-slate-500">※ 이전 버전에서 검사한 기록이라 신호별 기본 점수만 보여드려요.</p>}

              {(r.urls.length > 0 || r.phones.length > 0) && (
                <>
                  <h3 className="mt-5 text-base font-bold text-navy-900">링크·전화번호</h3>
                  <ul className="mt-1 divide-y divide-line">
                    {r.urls.map((u) => (
                      <li key={u.url} className="py-3.5">
                        <p className="text-sm font-semibold text-slate-500">링크{u.isOfficial && " · 공식 주소로 보임"}</p>
                        <p className="mt-0.5 font-mono text-base font-medium text-navy-900 [overflow-wrap:anywhere]">{u.url}</p>
                        <ul className="mt-2 flex flex-col gap-1 text-base text-slate-600">
                          {u.notes.map((note) => (
                            <li key={note}>· {note}</li>
                          ))}
                        </ul>
                      </li>
                    ))}
                    {r.phones.map((p) => (
                      <li key={p.number} className="py-3.5">
                        <p className="text-sm font-semibold text-slate-500">전화번호 · {p.type}</p>
                        <p className="mt-0.5 whitespace-nowrap text-base font-semibold tabular-nums text-navy-900">{p.number}</p>
                        <ul className="mt-2 flex flex-col gap-1 text-base text-slate-600">
                          {p.notes.map((note) => (
                            <li key={note}>· {note}</li>
                          ))}
                        </ul>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          )}
        </section>

        {/* 고지 · 기록 관리 */}
        <div className="flex flex-col gap-3 px-1 text-sm text-slate-500">
          <p className="flex gap-2">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" aria-hidden />
            <span>
              이 결과는 참고용 위험 신호 안내이며 실제 사기 여부를 확정하지 않아요. 은행·기관에는 문자에 적힌 연락처가 아닌
              공식 홈페이지나 대표번호로 직접 확인해주세요.
            </span>
          </p>
          <div className="pl-6">
            {confirmDelete ? (
              <span className="inline-flex flex-wrap items-center gap-2">
                <span className="font-semibold text-navy-900">이 기록을 삭제할까요?</span>
                <button type="button" onClick={handleDelete} className="focus-ring min-h-11 rounded-lg bg-risk-very px-4 text-sm font-semibold text-white">
                  삭제
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="focus-ring min-h-11 rounded-lg px-4 text-sm font-semibold text-slate-600 hover:bg-slate-100"
                >
                  취소
                </button>
              </span>
            ) : (
              <button
                type="button"
                onClick={handleDelete}
                className="focus-ring -ml-2 inline-flex min-h-11 items-center gap-1.5 rounded-lg px-2 font-semibold text-slate-500 hover:bg-slate-100 hover:text-navy-900"
              >
                <Trash2 className="h-4 w-4" aria-hidden />이 기록 삭제
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 상세 화면의 실행 버튼은 엄지가 닿는 하단에 고정 — 하단 탭은 이 화면에서 숨긴다 */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur-md lg:hidden">
        {/* 폭이 좁거나 글자를 크게 키우면 보조 버튼은 아이콘만 남겨 주 버튼 문구가 한 줄로 유지되게 한다 (rem 기준 컨테이너 쿼리) */}
        <div className="@container mx-auto flex max-w-xl gap-2.5">
          <Link href="/" className="btn-secondary btn-lg shrink-0 px-3.5" aria-label="다른 문자 검사하기">
            <ScanSearch className="h-5 w-5" aria-hidden />
            <span className="hidden text-base @min-[22rem]:inline" aria-hidden>
              다른 문자
            </span>
          </Link>
          <button type="button" onClick={openShare} className="btn-primary btn-lg min-w-0 flex-1 whitespace-nowrap px-4 text-[1.0625rem]">
            <Share2 className="h-5 w-5 shrink-0" aria-hidden />
            <span className="truncate">가족에게 공유하기</span>
          </button>
        </div>
      </div>

      {shareText && (
        <SharePreviewDialog
          text={shareText}
          onClose={closeShare}
          onShared={handleShared}
          onError={() => show("이 브라우저에서는 공유할 수 없어요. 화면을 캡처해 보내주세요.", "info")}
        />
      )}
    </div>
  );
}
