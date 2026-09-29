"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ImageUp, MessageSquareText, RefreshCw, Trash2, X } from "lucide-react";
import type { AnalysisResult } from "@/lib/types";
import { analyzeMessage } from "@/lib/ai";
import { saveAnalysis } from "@/lib/storage";
import { DEMO_EXTRACTED_TEXT, FEATURED_SAMPLES, SAMPLE_MESSAGES } from "@/lib/samples";
import AnalysisLoader from "./AnalysisLoader";

type Mode = "text" | "image";
type OcrStatus = "idle" | "reading" | "ready";

const MAX_LENGTH = 2000;
const MIN_LENGTH = 6;
const ACCEPTED = ["image/png", "image/jpeg"];

function validate(text: string): string | null {
  const trimmed = text.trim();
  if (!trimmed) return "분석할 문자 내용을 입력해주세요.";
  if (trimmed.length < MIN_LENGTH) return `문자 내용을 조금 더 입력해주세요. (${MIN_LENGTH}자 이상)`;
  return null;
}

/** 문자 입력 → 검사 → 결과 저장 → 결과 페이지 이동까지의 핵심 흐름 */
export default function AnalyzeForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [mode, setMode] = useState<Mode>("text");
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [ocrStatus, setOcrStatus] = useState<OcrStatus>("idle");
  const [ocrText, setOcrText] = useState("");
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [submitting, setSubmitting] = useState(false);
  const pendingRef = useRef<Promise<AnalysisResult> | null>(null);
  const submittingRef = useRef(false);

  // 샘플 딥링크(/?sample=s1) 진입 시 자동 채움
  useEffect(() => {
    const sample = SAMPLE_MESSAGES.find((s) => s.id === searchParams.get("sample"));
    if (sample) {
      setMode("text");
      setText(sample.text);
    }
  }, [searchParams]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // 데모 OCR: 실제 인식 대신 예시 문장을 채운다 (화면에 명시)
  useEffect(() => {
    if (ocrStatus !== "reading") return;
    const timer = setTimeout(() => {
      setOcrText(DEMO_EXTRACTED_TEXT);
      setOcrStatus("ready");
    }, 900);
    return () => clearTimeout(timer);
  }, [ocrStatus]);

  const acceptFile = (f: File | undefined) => {
    if (!f) return;
    if (!ACCEPTED.includes(f.type)) {
      setError("이미지를 읽지 못했습니다. PNG·JPG 파일을 올리거나 문자 내용을 직접 입력해주세요.");
      return;
    }
    setError(null);
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
    setOcrText("");
    setOcrStatus("reading");
  };

  const resetImage = () => {
    setFile(null);
    setPreviewUrl(null);
    setOcrText("");
    setOcrStatus("idle");
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const switchMode = (next: Mode) => {
    setMode(next);
    setError(null);
  };

  const handleSubmit = () => {
    if (submittingRef.current) return;
    if (mode === "image" && ocrStatus !== "ready") {
      setError(ocrStatus === "reading" ? "문자를 인식하는 중이에요. 잠시만 기다려주세요." : "먼저 문자 캡처 이미지를 올려주세요.");
      return;
    }
    const value = mode === "text" ? text : ocrText;
    const invalid = validate(value);
    if (invalid) {
      setError(invalid);
      return;
    }
    setError(null);
    submittingRef.current = true;
    pendingRef.current = analyzeMessage(value.trim(), mode);
    setSubmitting(true);
  };

  const handleLoaderComplete = useCallback(async () => {
    const pending = pendingRef.current;
    if (!pending) return;
    const result = await pending;
    saveAnalysis(result);
    router.push(`/result/${result.id}?new=1`);
  }, [router]);

  const currentLength = mode === "text" ? text.length : ocrText.length;

  return (
    <div className="card p-4 md:p-6">
      {/* 입력 방식 */}
      <div className="grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1" role="tablist" aria-label="입력 방식">
        {(
          [
            ["text", "문자 붙여넣기", MessageSquareText],
            ["image", "캡처 이미지", ImageUp],
          ] as const
        ).map(([value, label, Icon]) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={mode === value}
            onClick={() => switchMode(value)}
            className={`focus-ring flex min-h-12 items-center justify-center gap-2 rounded-lg text-base font-semibold transition-colors ${
              mode === value ? "bg-white text-navy-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Icon className="h-5 w-5" aria-hidden />
            {label}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {mode === "text" ? (
          <div className="relative">
            <label htmlFor="message" className="sr-only">
              분석할 문자 내용
            </label>
            <textarea
              id="message"
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                if (error && e.target.value.trim()) setError(null);
              }}
              placeholder="받은 문자 내용을 그대로 붙여넣어 주세요."
              rows={6}
              maxLength={MAX_LENGTH}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "form-error" : undefined}
              className="block w-full resize-none rounded-xl border border-line bg-white px-4 pb-10 pt-3.5 text-base text-slate-800 outline-none transition-shadow placeholder:text-slate-400 focus:border-brand-300 focus:ring-4 focus:ring-brand-100"
            />
            <div className="pointer-events-none absolute inset-x-3 bottom-2.5 flex items-center justify-between">
              <span className="text-xs tabular-nums text-slate-400">
                {currentLength.toLocaleString()} / {MAX_LENGTH.toLocaleString()}
              </span>
              {text && (
                <button
                  type="button"
                  onClick={() => setText("")}
                  className="focus-ring pointer-events-auto inline-flex min-h-9 items-center gap-1 rounded-lg px-2 text-sm font-medium text-slate-500 hover:bg-slate-100"
                >
                  <X className="h-4 w-4" aria-hidden />
                  지우기
                </button>
              )}
            </div>
          </div>
        ) : (
          <div>
            <input
              ref={fileInputRef}
              id="capture-upload"
              type="file"
              accept={ACCEPTED.join(",")}
              className="sr-only"
              onChange={(e) => {
                acceptFile(e.target.files?.[0]);
                // 같은 파일을 다시 선택해도 change 이벤트가 발생하도록 초기화
                e.target.value = "";
              }}
            />
            {!file ? (
              <label
                htmlFor="capture-upload"
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragging(false);
                  acceptFile(e.dataTransfer.files?.[0]);
                }}
                className={`flex min-h-[11.5rem] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors ${
                  dragging ? "border-brand-400 bg-brand-50" : "border-slate-200 hover:border-brand-300 hover:bg-brand-50/40"
                }`}
              >
                <ImageUp className="h-8 w-8 text-brand-500" aria-hidden />
                <span className="text-base font-bold text-navy-900">문자 캡처 이미지 올리기</span>
                <span className="text-sm text-slate-500">눌러서 선택하거나 끌어다 놓으세요 · PNG, JPG</span>
              </label>
            ) : (
              <div className="animate-fade-in">
                <div className="flex items-center gap-3 rounded-xl border border-line px-3 py-2.5">
                  {previewUrl && (
                    // 방금 선택한 로컬 이미지 미리보기라 next/image 최적화 대상이 아님
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={previewUrl} alt="올린 캡처 미리보기" className="h-12 w-12 shrink-0 rounded-lg bg-slate-100 object-cover" />
                  )}
                  <p className="min-w-0 flex-1 truncate text-sm font-medium text-slate-700">{file.name}</p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    aria-label="다른 이미지 선택"
                    className="focus-ring flex h-11 w-11 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
                  >
                    <RefreshCw className="h-5 w-5" aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={resetImage}
                    aria-label="이미지 삭제"
                    className="focus-ring flex h-11 w-11 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
                  >
                    <Trash2 className="h-5 w-5" aria-hidden />
                  </button>
                </div>

                {ocrStatus === "reading" ? (
                  <div className="mt-3 rounded-xl bg-slate-50 px-4 py-4" role="status">
                    <p className="flex items-center gap-2 text-sm font-medium text-slate-600">
                      <span className="spinner h-4 w-4" aria-hidden />
                      이미지에서 문자를 읽고 있어요…
                    </p>
                    <div className="mt-3 space-y-2" aria-hidden>
                      <div className="skeleton h-3.5 w-11/12" />
                      <div className="skeleton h-3.5 w-9/12" />
                      <div className="skeleton h-3.5 w-10/12" />
                    </div>
                  </div>
                ) : (
                  <div className="mt-3">
                    <label htmlFor="ocr-text" className="flex items-baseline justify-between gap-2">
                      <span className="text-sm font-bold text-navy-900">인식된 문자 — 확인 후 검사하세요</span>
                      <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">
                        데모 OCR
                      </span>
                    </label>
                    <textarea
                      id="ocr-text"
                      value={ocrText}
                      onChange={(e) => setOcrText(e.target.value)}
                      rows={4}
                      maxLength={MAX_LENGTH}
                      className="mt-2 block w-full resize-none rounded-xl border border-line bg-white px-4 py-3 text-base text-slate-800 outline-none focus:border-brand-300 focus:ring-4 focus:ring-brand-100"
                    />
                    <p className="mt-1.5 text-xs text-slate-500">
                      실제 이미지 인식 대신 예시 문장을 채웠어요. 캡처 속 문자와 다르면 직접 고쳐주세요.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {error && (
        <p id="form-error" role="alert" className="mt-3 text-sm font-semibold text-risk-very">
          {error}
        </p>
      )}

      <button type="button" onClick={handleSubmit} disabled={submitting} className="btn-primary mt-4 w-full text-lg">
        위험도 검사하기
      </button>

      {mode === "text" && (
        <div className="mt-5 border-t border-line pt-4">
          <p className="text-sm font-semibold text-slate-500">샘플 문자로 체험해보기</p>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {FEATURED_SAMPLES.map(({ chip, sample }) => {
              const selected = text === sample.text;
              return (
                <button
                  key={sample.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => {
                    setText(sample.text);
                    setError(null);
                  }}
                  className={`focus-ring min-h-11 rounded-full border px-4 text-sm font-semibold transition-colors ${
                    selected
                      ? "border-brand-500 bg-brand-50 text-brand-700"
                      : "border-line bg-white text-slate-600 hover:border-brand-200 hover:text-navy-900"
                  }`}
                >
                  {chip}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {submitting && <AnalysisLoader onComplete={handleLoaderComplete} />}
    </div>
  );
}
