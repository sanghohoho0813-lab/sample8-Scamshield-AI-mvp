"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ExternalLink,
  Info,
  Link2,
  MessageSquareText,
  Phone,
  RotateCcw,
  Share2,
  Sparkles,
  Users,
} from "lucide-react";
import type { AnalysisResult } from "@/lib/types";
import RiskGauge from "./RiskGauge";
import RiskSignalCard from "./RiskSignalCard";
import HighlightedMessage from "./HighlightedMessage";
import SafetyActionCard from "./SafetyActionCard";
import { useToast } from "./Toast";

interface ResultViewProps {
  result: AnalysisResult;
  /** "다른 메시지 분석" 클릭 시 (없으면 /analyze로 이동하는 링크 노출) */
  onReset?: () => void;
  animateGauge?: boolean;
}

export default function ResultView({ result, onReset, animateGauge = true }: ResultViewProps) {
  const { show, node: toastNode } = useToast();

  const shareText = [
    "[ScamShield 문자 위험도 분석]",
    `위험도 ${result.score}/100 (${result.levelLabel})`,
    `유형: ${result.scamTypeLabel}`,
    "",
    result.summary,
    "",
    "※ 참고용 위험 신호 분석이며 실제 사기 여부를 확정하는 판정이 아닙니다.",
  ].join("\n");

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: "ScamShield 분석 결과", text: shareText });
        show("결과를 공유했어요.");
        return;
      }
    } catch {
      return; // 사용자가 공유를 취소한 경우
    }
    try {
      await navigator.clipboard.writeText(shareText);
      show("분석 결과를 복사했어요. 가족에게 붙여넣어 공유해보세요.");
    } catch {
      show("공유를 지원하지 않는 환경이에요.", "info");
    }
  };

  return (
    <div className="flex flex-col gap-4 md:gap-5">
      {/* 위험도 + 헤드라인 */}
      <section className="card animate-fade-up px-5 pb-6 pt-7 text-center md:px-8">
        <RiskGauge
          score={result.score}
          level={result.level}
          levelLabel={result.levelLabel}
          animate={animateGauge}
        />
        <h2 className="mt-4 text-lg font-bold text-navy-900 md:text-xl">{result.headline}</h2>
        <p className="mt-1.5 text-sm text-slate-500">
          분류: <span className="font-semibold text-slate-700">{result.scamTypeLabel}</span>
          {result.source === "image" && " · 캡처 이미지에서 추출한 문자"}
        </p>
        {result.level !== "low" && (
          <p className="mx-auto mt-4 flex max-w-md items-center justify-center gap-1.5 rounded-xl bg-risk-very-bg px-3 py-2.5 text-sm font-medium text-risk-very">
            <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden />
            문자 속 링크·번호로 바로 행동하지 않는 것이 좋습니다.
          </p>
        )}
      </section>

      {/* AI 요약 */}
      <section className="card animate-fade-up px-4 py-5 md:px-6" style={{ animationDelay: "60ms" }}>
        <h3 className="flex items-center gap-2 text-[1.6875rem] font-bold text-navy-900">
          <Sparkles className="h-4.5 w-4.5 text-violet-600" aria-hidden />
          AI 요약
        </h3>
        <p className="mt-2.5 text-[1.6875rem] leading-relaxed text-slate-800 md:text-base">
          {result.summary}
        </p>
      </section>

      {/* 지금 해야 할 행동 — 모바일 우선순위에 따라 상단 배치 */}
      <div className="animate-fade-up" style={{ animationDelay: "120ms" }}>
        <SafetyActionCard actions={result.actions} />
      </div>

      {/* 발견된 위험 신호 */}
      {result.signals.length > 0 && (
        <section className="animate-fade-up" style={{ animationDelay: "180ms" }}>
          <h3 className="mb-2.5 flex items-center gap-2 px-1 text-[1.6875rem] font-bold text-navy-900">
            <AlertTriangle className="h-4.5 w-4.5 text-risk-high" aria-hidden />
            발견된 위험 신호 {result.signals.length}건
          </h3>
          <div className="flex flex-col gap-2.5">
            {result.signals.map((signal) => (
              <RiskSignalCard key={signal.category} signal={signal} />
            ))}
          </div>
        </section>
      )}

      {/* 의심 문구 하이라이트 */}
      <section className="card animate-fade-up px-4 py-5 md:px-6" style={{ animationDelay: "240ms" }}>
        <h3 className="flex items-center gap-2 text-[1.6875rem] font-bold text-navy-900">
          <MessageSquareText className="h-4.5 w-4.5 text-brand-600" aria-hidden />
          원문에서 의심되는 문구
        </h3>
        <div className="mt-3">
          <HighlightedMessage message={result.message} highlights={result.highlights} />
        </div>
      </section>

      {/* 링크 분석 */}
      {result.urls.length > 0 && (
        <section className="card animate-fade-up px-4 py-5 md:px-6" style={{ animationDelay: "300ms" }}>
          <h3 className="flex items-center gap-2 text-[1.6875rem] font-bold text-navy-900">
            <Link2 className="h-4.5 w-4.5 text-teal-600" aria-hidden />
            링크 분석
          </h3>
          <div className="mt-3 flex flex-col gap-3">
            {result.urls.map((u) => (
              <div key={u.url} className="rounded-2xl border border-line bg-slate-50/70 px-4 py-3.5">
                <p className="flex items-center gap-1.5 break-all text-sm font-bold text-slate-800">
                  <ExternalLink className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
                  {u.url}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {u.isShortened && <Tag tone="warn">단축 URL</Tag>}
                  {u.suspiciousTld && <Tag tone="danger">의심 도메인</Tag>}
                  {u.officialMismatch && <Tag tone="danger">공식 도메인 불일치 가능성</Tag>}
                  {!u.isHttps && <Tag tone="warn">HTTPS 아님</Tag>}
                </div>
                <ul className="mt-2.5 flex flex-col gap-1">
                  {u.notes.map((note) => (
                    <li key={note} className="text-sm leading-relaxed text-slate-600">
                      · {note}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="mt-3 rounded-xl bg-brand-50 px-3.5 py-2.5 text-sm font-semibold text-brand-800">
            링크를 직접 열지 말고 공식 채널을 확인하세요.
          </p>
        </section>
      )}

      {/* 연락처 분석 */}
      {result.phones.length > 0 && (
        <section className="card animate-fade-up px-4 py-5 md:px-6" style={{ animationDelay: "340ms" }}>
          <h3 className="flex items-center gap-2 text-[1.6875rem] font-bold text-navy-900">
            <Phone className="h-4.5 w-4.5 text-emerald-600" aria-hidden />
            연락처 분석
          </h3>
          <div className="mt-3 flex flex-col gap-3">
            {result.phones.map((p) => (
              <div key={p.number} className="rounded-2xl border border-line bg-slate-50/70 px-4 py-3.5">
                <p className="text-sm font-bold text-slate-800">
                  {p.number}
                  <span className="ml-2 rounded-md bg-slate-200/70 px-1.5 py-0.5 text-xs font-semibold text-slate-600">
                    {p.type}
                  </span>
                </p>
                <ul className="mt-2 flex flex-col gap-1">
                  {p.notes.map((note) => (
                    <li key={note} className="text-sm leading-relaxed text-slate-600">
                      · {note}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 공유 / 다시 분석 */}
      <section
        className="card animate-fade-up flex flex-col gap-3 px-4 py-5 md:flex-row md:items-center md:justify-between md:px-6"
        style={{ animationDelay: "380ms" }}
      >
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
            <Users className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <p className="text-[1.6875rem] font-bold text-navy-900">가족에게 공유하기</p>
            <p className="mt-0.5 text-sm text-slate-500">
              부모님·가족에게 결과를 공유해 함께 확인해보세요.
            </p>
          </div>
        </div>
        <div className="flex gap-2.5">
          <button type="button" onClick={handleShare} className="btn-primary flex-1 md:flex-none">
            <Share2 className="h-4 w-4" aria-hidden />
            결과 공유하기
          </button>
          {onReset ? (
            <button type="button" onClick={onReset} className="btn-secondary flex-1 md:flex-none">
              <RotateCcw className="h-4 w-4" aria-hidden />
              다른 문자 분석
            </button>
          ) : (
            <Link href="/analyze" className="btn-secondary flex-1 md:flex-none">
              <RotateCcw className="h-4 w-4" aria-hidden />
              다른 문자 분석
            </Link>
          )}
        </div>
      </section>

      {/* 고지 */}
      <p className="flex gap-2 rounded-2xl border border-line bg-white/70 px-4 py-3.5 text-xs leading-relaxed text-slate-500 md:text-[1.4625rem]">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden />
        이 결과는 참고용 위험 신호 분석이며 실제 사기 여부를 확정하는 판정이 아닙니다.
        금융기관·공공기관 등은 문자에 포함된 연락처가 아닌 공식 홈페이지나 공식 대표번호를 통해
        직접 확인해주세요.
      </p>

      {toastNode}
    </div>
  );
}

function Tag({ children, tone }: { children: React.ReactNode; tone: "warn" | "danger" }) {
  return (
    <span
      className={`rounded-lg px-2 py-1 text-xs font-bold ${
        tone === "danger" ? "bg-risk-very-bg text-risk-very" : "bg-risk-caution-bg text-risk-caution"
      }`}
    >
      {children}
    </span>
  );
}
