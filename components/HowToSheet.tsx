"use client";

import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowRight, TriangleAlert, X } from "lucide-react";
import { DEVICES, HOW_TO, guessDevice, type Device, type HowToTopic } from "@/lib/how-to";
import HowToIllustration from "./HowToIllustration";
import { useModal } from "./useModal";

interface HowToSheetProps {
  topic: HowToTopic;
  onClose: () => void;
}

/** "문자를 어떻게 복사하나요?" — 기기별 순서를 그림과 함께 보여주는 시트 */
export default function HowToSheet({ topic: initialTopic, onClose }: HowToSheetProps) {
  const [topic, setTopic] = useState(initialTopic);
  // 열릴 때만 그려지는 시트라 첫 렌더에서 기기를 바로 짐작해도 된다
  const [device, setDevice] = useState<Device>(() => guessDevice(navigator.userAgent));
  const panelRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useModal(panelRef, onClose);

  const guide = HOW_TO[topic];
  const other: HowToTopic = topic === "copy" ? "capture" : "copy";

  // 탭 사이는 좌우 화살표로 이동 (WAI-ARIA 탭 패턴)
  const onTabKey = (e: React.KeyboardEvent, index: number) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const next = (index + (e.key === "ArrowRight" ? 1 : -1) + DEVICES.length) % DEVICES.length;
    setDevice(DEVICES[next].value);
    tabRefs.current[next]?.focus();
  };

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-end justify-center md:items-center md:p-6" role="presentation">
      <button type="button" aria-label="닫기" tabIndex={-1} onClick={onClose} className="absolute inset-0 bg-navy-900/40" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="howto-title"
        tabIndex={-1}
        className="animate-sheet-in relative flex max-h-[90dvh] w-full max-w-lg flex-col rounded-t-3xl bg-white shadow-[var(--shadow-overlay)] outline-none md:rounded-3xl"
      >
        <div className="flex items-start justify-between gap-3 px-5 pb-3 pt-5 md:px-6">
          <h2 id="howto-title" className="text-xl font-bold text-navy-900">
            {guide.title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="focus-ring -mr-2 -mt-1.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <div className="px-5 md:px-6">
          <div className="grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1" role="tablist" aria-label="휴대폰 종류">
            {DEVICES.map((d, i) => (
              <button
                key={d.value}
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
                type="button"
                role="tab"
                id={`howto-tab-${d.value}`}
                aria-selected={device === d.value}
                aria-controls="howto-panel"
                tabIndex={device === d.value ? 0 : -1}
                onClick={() => setDevice(d.value)}
                onKeyDown={(e) => onTabKey(e, i)}
                className={`focus-ring min-h-11 rounded-lg text-base font-semibold transition-colors ${
                  device === d.value ? "bg-white text-navy-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        <div
          id="howto-panel"
          role="tabpanel"
          aria-labelledby={`howto-tab-${device}`}
          tabIndex={0}
          className="focus-ring min-h-0 flex-1 overflow-y-auto px-5 pb-12 pt-4 md:px-6 md:pb-2"
        >
          <div className="flex justify-center rounded-2xl bg-brand-50/60 px-4 py-3">
            <HowToIllustration topic={topic} device={device} />
          </div>

          <ol className="mt-4 flex flex-col gap-3" aria-label="순서">
            {guide.steps[device].map((step, i) => (
              <li key={step} className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
                  {i + 1}
                </span>
                <p className="pt-0.5 text-base text-slate-800">{step}</p>
              </li>
            ))}
          </ol>
          <p className="mt-3 pl-10 text-sm text-slate-500">{guide.tip[device]}</p>

          <p className="mt-4 flex gap-2.5 rounded-xl bg-amber-50 px-4 py-3 text-base text-amber-900">
            <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden />
            {guide.caution}
          </p>

          <button
            type="button"
            onClick={() => setTopic(other)}
            className="focus-ring mt-2 inline-flex min-h-11 items-center gap-1 rounded-lg px-1 text-base font-semibold text-brand-700 hover:text-brand-800"
          >
            {HOW_TO[other].switchLabel}도 보기
            <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
        </div>

        {/* sticky: 공통 이동 버튼이 이 영역을 고정 요소로 알아보고 피해 간다 */}
        <div className="sticky bottom-0 rounded-b-3xl bg-white px-5 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-3 md:px-6 md:pb-6">
          <button type="button" onClick={onClose} className="btn-primary w-full">
            알겠어요
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
