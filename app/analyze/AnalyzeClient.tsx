"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ImageUp, MessageSquareText } from "lucide-react";
import type { AnalysisResult } from "@/lib/types";
import { analyzeMessage } from "@/lib/ai";
import { saveAnalysis } from "@/lib/storage";
import { DEMO_EXTRACTED_TEXT, SAMPLE_MESSAGES } from "@/lib/samples";
import MessageInput from "@/components/MessageInput";
import ImageUploader from "@/components/ImageUploader";
import AnalysisLoader from "@/components/AnalysisLoader";
import ResultView from "@/components/ResultView";

type Phase = "input" | "loading" | "result";
type Mode = "text" | "image";

export default function AnalyzeClient() {
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<Mode>("text");
  const [phase, setPhase] = useState<Phase>("input");
  const [message, setMessage] = useState("");
  const [textError, setTextError] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const pendingRef = useRef<Promise<AnalysisResult> | null>(null);

  // 홈에서 샘플 체험으로 진입한 경우 자동 채움
  useEffect(() => {
    const sampleId = searchParams.get("sample");
    if (sampleId) {
      const sample = SAMPLE_MESSAGES.find((s) => s.id === sampleId);
      if (sample) setMessage(sample.text);
    }
  }, [searchParams]);

  const startAnalysis = useCallback((text: string, source: "text" | "image") => {
    pendingRef.current = analyzeMessage(text, source);
    setPhase("loading");
    window.scrollTo({ top: 0 });
  }, []);

  const handleTextSubmit = () => {
    if (!message.trim()) {
      setTextError("분석할 문자 내용을 입력해주세요.");
      return;
    }
    setTextError(null);
    startAnalysis(message, "text");
  };

  const handleImageSubmit = () => {
    setImageError(null);
    // MVP: OCR 대신 데모 추출 텍스트 사용 (실제 OCR API 연결 지점)
    startAnalysis(DEMO_EXTRACTED_TEXT, "image");
  };

  const handleLoaderComplete = useCallback(async () => {
    const pending = pendingRef.current;
    if (!pending) return;
    const analysis = await pending;
    saveAnalysis(analysis);
    setResult(analysis);
    setPhase("result");
    window.scrollTo({ top: 0 });
  }, []);

  const handleReset = useCallback(() => {
    setResult(null);
    setMessage("");
    setPhase("input");
    window.scrollTo({ top: 0 });
  }, []);

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 md:py-10">
      {phase === "input" && (
        <div className="animate-fade-up">
          <h1 className="text-2xl font-extrabold tracking-tight text-navy-900 md:text-3xl">
            문자 검사하기
          </h1>
          <p className="mt-2 text-[1.40625rem] text-slate-500">
            의심스러운 문자 내용을 넣으면 AI가 위험 신호를 확인해드립니다.
          </p>

          {/* 탭 */}
          <div className="mt-5 grid grid-cols-2 gap-1.5 rounded-2xl bg-slate-100 p-1.5" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={mode === "text"}
              onClick={() => setMode("text")}
              className={`flex min-h-11 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold transition-all ${
                mode === "text"
                  ? "bg-white text-brand-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <MessageSquareText className="h-4 w-4" aria-hidden />
              문자 내용 입력
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === "image"}
              onClick={() => setMode("image")}
              className={`flex min-h-11 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold transition-all ${
                mode === "image"
                  ? "bg-white text-brand-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <ImageUp className="h-4 w-4" aria-hidden />
              캡처 이미지 업로드
            </button>
          </div>

          <div className="mt-5">
            {mode === "text" ? (
              <MessageInput
                value={message}
                onChange={(v) => {
                  setMessage(v);
                  if (v.trim()) setTextError(null);
                }}
                onSubmit={handleTextSubmit}
                error={textError}
              />
            ) : (
              <ImageUploader
                onSubmit={handleImageSubmit}
                error={imageError}
                onError={setImageError}
              />
            )}
          </div>
        </div>
      )}

      {phase === "loading" && (
        <div className="py-10 md:py-16">
          <AnalysisLoader onComplete={handleLoaderComplete} />
        </div>
      )}

      {phase === "result" && result && (
        <div>
          <h1 className="mb-4 text-2xl font-extrabold tracking-tight text-navy-900 md:mb-5 md:text-3xl">
            문자 분석 결과
          </h1>
          <ResultView result={result} onReset={handleReset} />
        </div>
      )}
    </div>
  );
}
