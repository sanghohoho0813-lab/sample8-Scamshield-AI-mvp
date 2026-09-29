"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, Info, ScanSearch, Share2, Trash2 } from "lucide-react";
import type { HistoryEntry } from "@/lib/types";
import { RISK_STYLE } from "@/lib/risk-style";
import { guideForScamType } from "@/lib/guides";
import { deleteEntry, markShared } from "@/lib/storage";
import { formatDateTime } from "@/lib/format";
import RiskGauge from "./RiskGauge";
import SignalList from "./SignalList";
import HighlightedMessage from "./HighlightedMessage";

interface ResultViewProps {
  entry: HistoryEntry;
  /** 방금 분석한 결과인지 (게이지 애니메이션) */
  isNew?: boolean;
  /** 화면 하단 안내 메시지 (페이지의 토스트 하나를 공유) */
  notify: (message: string, tone?: "success" | "info") => void;
}

function buildShareText(entry: HistoryEntry): string {
  const r = entry.result;
  return [
    "[ScamShield 문자 위험도 검사]",
    `위험도 ${r.score}/100 · 위험 신호 ${RISK_STYLE[r.level].label}`,
    `유형: ${r.scamTypeLabel}`,
    "",
    `검사한 문자: “${entry.preview}”`,
    "",
    r.level === "low" ? "확인하면 좋은 점" : "지금 해야 할 행동",
    ...r.actions.slice(0, 3).map((a, i) => `${i + 1}. ${a}`),
    "",
    "※ 참고용 위험 신호 분석이며 사기 여부를 확정하지 않습니다.",
  ].join("\n");
}

export default function ResultView({ entry: initialEntry, isNew = false, notify: show }: ResultViewProps) {
  const router = useRouter();
  const [entry, setEntry] = useState(initialEntry);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [sharing, setSharing] = useState(false);

  const r = entry.result;
  const style = RISK_STYLE[r.level];
  const guide = guideForScamType(r.scamType);
  const isLow = r.level === "low";

  const handleShare = async () => {
    if (sharing) return;
    setSharing(true);
    const text = buildShareText(entry);
    try {
      if (typeof navigator.share === "function") {
        try {
          await navigator.share({ title: "ScamShield 검사 결과", text });
          setEntry((e) => ({ ...e, sharedAt: markShared(e.id) }));
          show("결과를 공유했어요.");
        } catch (err) {
          // 사용자가 공유 창을 닫은 경우는 조용히 무시
          if ((err as Error)?.name !== "AbortError") throw err;
        }
        return;
      }
      await navigator.clipboard.writeText(text);
      setEntry((e) => ({ ...e, sharedAt: markShared(e.id) }));
      show("결과를 복사했어요. 메신저에 붙여넣어 가족에게 보내세요.");
    } catch {
      show("이 브라우저에서는 공유할 수 없어요. 화면을 캡처해 보내주세요.", "info");
    } finally {
      setSharing(false);
    }
  };

  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    deleteEntry(entry.id);
    router.replace("/history?deleted=1");
  };

  const actionButtons = (
    <div className="flex flex-col gap-2.5">
      <button type="button" onClick={handleShare} disabled={sharing} className="btn-primary w-full">
        <Share2 className="h-5 w-5" aria-hidden />
        가족에게 공유하기
      </button>
      {entry.sharedAt && (
        <p className="flex items-center justify-center gap-1 text-sm text-slate-500">
          <Check className="h-4 w-4 text-brand-600" aria-hidden />
          {formatDateTime(entry.sharedAt)}에 공유했어요
        </p>
      )}
      <Link href="/" className="btn-secondary w-full">
        <ScanSearch className="h-5 w-5" aria-hidden />
        다른 문자 검사하기
      </Link>
    </div>
  );

  return (
    <div className="grid gap-4 md:gap-5 lg:grid-cols-[minmax(0,23rem)_minmax(0,1fr)] lg:items-start lg:gap-8">
      {/* ANSWER + WHY */}
      <aside className="flex flex-col gap-4 lg:sticky lg:top-32">
        <section className={`card overflow-hidden border-t-4 ${style.border} px-5 pb-6 pt-5`} aria-labelledby="verdict-heading">
          <RiskGauge score={r.score} level={r.level} animate={isNew} />
          <div className="mt-3 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center">
            <span className={`rounded-full px-3 py-1 text-sm font-bold ${style.bg} ${style.text}`}>위험 신호 {style.label}</span>
            <span className="text-sm text-slate-500">
              {r.scamTypeLabel}
              {r.source === "image" && " · 캡처 이미지(데모 OCR)"}
            </span>
          </div>
          <h1 id="verdict-heading" className="mt-4 text-xl font-bold text-navy-900">
            {r.headline}
          </h1>
          <p className="mt-1.5 text-base text-slate-600">{r.summary}</p>
        </section>
        <div className="hidden lg:block">{actionButtons}</div>
      </aside>

      <div className="flex min-w-0 flex-col gap-4 md:gap-5">
        {/* NEXT ACTION */}
        <section className="card overflow-hidden" aria-labelledby="actions-heading">
          <h2 id="actions-heading" className="px-5 pt-5 text-lg font-bold text-navy-900">
            {isLow ? "이렇게 한 번 더 확인해보세요" : "지금 해야 할 행동"}
          </h2>
          <ol className="mt-2 px-5 pb-2">
            {r.actions.map((action, i) => (
              <li key={action} className="flex gap-3 border-b border-line py-3 last:border-0">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
                  {i + 1}
                </span>
                <p className={`text-base ${i === 0 && !isLow ? "font-semibold text-navy-900" : "text-slate-700"}`}>{action}</p>
              </li>
            ))}
          </ol>
          <Link
            href={guide ? `/guide#${guide.id}` : "/guide"}
            className="focus-ring flex min-h-12 items-center justify-between gap-2 border-t border-line bg-slate-50/70 px-5 text-sm font-semibold text-brand-700 hover:bg-slate-50"
          >
            {guide ? `${guide.title} 예방법 자세히 보기` : "안전 확인 방법 보기"}
            <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
          </Link>
        </section>

        <div className="lg:hidden">{actionButtons}</div>

        {/* EVIDENCE */}
        <section className="card px-5 py-5" aria-labelledby="message-heading">
          <h2 id="message-heading" className="text-lg font-bold text-navy-900">
            {r.highlights.length > 0 ? "의심되는 문구" : "검사한 문자"}
          </h2>
          <div className="mt-3">
            <HighlightedMessage message={r.message} highlights={r.highlights} />
          </div>
        </section>

        {r.signals.length > 0 && (
          <section className="card overflow-hidden" aria-labelledby="signals-heading">
            <h2 id="signals-heading" className="px-5 pb-1 pt-5 text-lg font-bold text-navy-900">
              발견된 위험 신호 <span className="tabular-nums text-slate-400">{r.signals.length}</span>
            </h2>
            <SignalList signals={r.signals} />
          </section>
        )}

        {(r.urls.length > 0 || r.phones.length > 0) && (
          <section className="card px-5 py-5" aria-labelledby="contact-heading">
            <h2 id="contact-heading" className="text-lg font-bold text-navy-900">
              링크·연락처 확인
            </h2>
            <ul className="mt-2 divide-y divide-line">
              {r.urls.map((u) => (
                <li key={u.url} className="py-3.5">
                  <p className="text-sm font-semibold text-slate-500">링크</p>
                  <p className="mt-0.5 font-mono text-base font-medium text-navy-900 [overflow-wrap:anywhere]">{u.url}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {u.suspiciousTld && <Tag tone="danger">의심 도메인</Tag>}
                    {u.officialMismatch && <Tag tone="danger">공식 주소와 다를 가능성</Tag>}
                    {u.isShortened && <Tag tone="warn">단축 URL</Tag>}
                    {!u.isHttps && <Tag tone="warn">보안 연결 아님</Tag>}
                  </div>
                  <ul className="mt-2 flex flex-col gap-1 text-sm text-slate-600">
                    {u.notes.map((note) => (
                      <li key={note}>· {note}</li>
                    ))}
                  </ul>
                </li>
              ))}
              {r.phones.map((p) => (
                <li key={p.number} className="py-3.5">
                  <p className="text-sm font-semibold text-slate-500">연락처 · {p.type}</p>
                  <p className="mt-0.5 whitespace-nowrap text-base font-semibold tabular-nums text-navy-900">{p.number}</p>
                  <ul className="mt-2 flex flex-col gap-1 text-sm text-slate-600">
                    {p.notes.map((note) => (
                      <li key={note}>· {note}</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* 고지 · 분석 정보 · 기록 관리 */}
        <div className="flex flex-col gap-3 px-1 text-sm text-slate-500">
          <p className="flex gap-2">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden />
            <span>
              이 결과는 참고용 위험 신호 분석이며 실제 사기 여부를 확정하는 판정이 아닙니다. 금융기관·공공기관
              등은 문자에 포함된 연락처가 아닌 공식 홈페이지나 공식 대표번호를 통해 직접 확인해주세요.
            </span>
          </p>
          <p className="pl-6">
            {formatDateTime(r.createdAt)} 검사 · 분석 방식: 규칙 기반 데모 엔진
          </p>
          <div className="pl-6">
            {confirmDelete ? (
              <span className="inline-flex flex-wrap items-center gap-2">
                <span className="font-semibold text-navy-900">이 기록을 삭제할까요?</span>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="focus-ring min-h-10 rounded-lg bg-risk-very px-3 text-sm font-semibold text-white"
                >
                  삭제
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="focus-ring min-h-10 rounded-lg px-3 text-sm font-semibold text-slate-600 hover:bg-slate-100"
                >
                  취소
                </button>
              </span>
            ) : (
              <button
                type="button"
                onClick={handleDelete}
                className="focus-ring -ml-2 inline-flex min-h-10 items-center gap-1.5 rounded-lg px-2 font-semibold text-slate-500 hover:bg-slate-100 hover:text-navy-900"
              >
                <Trash2 className="h-4 w-4" aria-hidden />이 기록 삭제
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Tag({ children, tone }: { children: React.ReactNode; tone: "warn" | "danger" }) {
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-sm font-semibold ${
        tone === "danger" ? "bg-risk-very-bg text-risk-very" : "bg-risk-caution-bg text-risk-caution"
      }`}
    >
      {children}
    </span>
  );
}
