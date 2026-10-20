"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Copy, LockKeyhole, Send, X } from "lucide-react";
import { useModal } from "./useModal";

interface SharePreviewDialogProps {
  text: string;
  onClose: () => void;
  /** 실제로 보내거나 복사했을 때 */
  onShared: (method: "share" | "copy") => void;
  /** 공유·복사가 모두 실패했을 때 */
  onError: () => void;
}

/**
 * 보내기 전에 "가족에게 이렇게 전달돼요"를 그대로 보여준다.
 * 받는 사람 입장에서 문맥이 있는지, 링크·번호가 가려졌는지를 보내는 사람이 직접 확인할 수 있다.
 */
export default function SharePreviewDialog({ text, onClose, onShared, onError }: SharePreviewDialogProps) {
  const [busy, setBusy] = useState(false);
  const [canShare, setCanShare] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useModal(panelRef, onClose);

  useEffect(() => {
    setCanShare(typeof navigator.share === "function");
  }, []);

  const copy = async () => {
    setBusy(true);
    try {
      await navigator.clipboard.writeText(text);
      onShared("copy");
    } catch {
      onError();
    } finally {
      setBusy(false);
    }
  };

  const share = async () => {
    setBusy(true);
    try {
      await navigator.share({ title: "ScamShield 검사 결과", text });
      onShared("share");
    } catch (err) {
      // 사용자가 공유 창을 닫은 경우는 조용히 무시
      if ((err as Error)?.name !== "AbortError") onError();
    } finally {
      setBusy(false);
    }
  };

  // 화면의 고정 버튼·헤더보다 항상 위에 오도록 body 바로 아래에 그린다
  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-end justify-center md:items-center md:p-6" role="presentation">
      <button type="button" aria-label="닫기" tabIndex={-1} onClick={onClose} className="absolute inset-0 bg-navy-900/40" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-title"
        tabIndex={-1}
        className="animate-sheet-in relative flex max-h-[88dvh] w-full max-w-lg flex-col rounded-t-3xl bg-white shadow-[var(--shadow-overlay)] outline-none md:rounded-3xl"
      >
        <div className="flex items-start justify-between gap-3 px-5 pb-2 pt-5 md:px-6">
          <div>
            <h2 id="share-title" className="text-xl font-bold text-navy-900">
              가족에게 이렇게 전달돼요
            </h2>
            <p className="mt-1 text-base text-slate-500">받는 분이 바로 이해할 수 있게 결과와 할 일을 함께 보내요.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="focus-ring -mr-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        {/* 긴 내용은 이 영역만 스크롤 — 키보드로도 스크롤할 수 있게 포커스를 받는다 */}
        <div className="focus-ring min-h-0 flex-1 overflow-y-auto px-5 md:px-6" tabIndex={0} role="region" aria-label="보낼 내용">
          <p className="whitespace-pre-wrap rounded-2xl rounded-tl-md bg-slate-100 px-4 py-4 text-[0.9375rem] leading-relaxed text-slate-800 [overflow-wrap:anywhere]">
            {text}
          </p>
          <p className="mt-3 flex gap-2 text-sm text-slate-500">
            <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden />
            문자 속 링크와 전화번호는 눌리지 않게 가렸어요. 검사 기록은 이 기기에만 남고 함께 보내지 않아요.
          </p>
        </div>

        {/* sticky: 공통 이동 버튼이 이 영역을 고정 요소로 알아보고 피해 간다 */}
        <div className="sticky bottom-0 flex flex-col gap-2.5 rounded-b-3xl bg-white px-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-4 md:px-6 md:pb-6">
          {canShare && (
            <button type="button" onClick={share} disabled={busy} className="btn-primary w-full">
              <Send className="h-5 w-5" aria-hidden />
              메신저로 보내기
            </button>
          )}
          <button type="button" onClick={copy} disabled={busy} className={`${canShare ? "btn-secondary" : "btn-primary"} w-full`}>
            <Copy className="h-5 w-5" aria-hidden />
            내용 복사하기
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
