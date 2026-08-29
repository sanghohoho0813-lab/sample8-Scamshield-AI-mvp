"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FileImage, ImageUp, RefreshCw, ScanText, Trash2 } from "lucide-react";

interface ImageUploaderProps {
  onSubmit: (extracted: { fileName: string }) => void;
  error?: string | null;
  onError: (message: string | null) => void;
}

const ACCEPTED = ["image/png", "image/jpeg"];

export default function ImageUploader({ onSubmit, error, onError }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const acceptFile = useCallback(
    (f: File | undefined) => {
      if (!f) return;
      if (!ACCEPTED.includes(f.type)) {
        onError("이미지를 읽지 못했습니다. PNG 또는 JPG 파일을 올리거나, 문자 내용을 직접 입력해주세요.");
        return;
      }
      onError(null);
      setFile(f);
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return URL.createObjectURL(f);
      });
    },
    [onError],
  );

  const reset = () => {
    setFile(null);
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="flex flex-col gap-3">
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(",")}
        className="sr-only"
        id="capture-upload"
        onChange={(e) => acceptFile(e.target.files?.[0])}
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
          className={`flex min-h-56 cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
            dragging
              ? "border-brand-400 bg-brand-50"
              : "border-brand-200 bg-white hover:border-brand-300 hover:bg-brand-50/40"
          }`}
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
            <ImageUp className="h-7 w-7" aria-hidden />
          </span>
          <div>
            <p className="text-[1.6875rem] font-bold text-navy-900">문자 캡처 이미지를 올려주세요</p>
            <p className="mt-1 text-sm text-slate-500">
              파일을 끌어다 놓거나 눌러서 선택 · PNG, JPG, JPEG
            </p>
          </div>
          <span className="btn-secondary !min-h-10 !px-4 !py-2 text-sm">파일 선택</span>
        </label>
      ) : (
        <div className="card animate-fade-up overflow-hidden">
          {previewUrl && (
            // 미리보기: 사용자가 방금 선택한 로컬 이미지라 next/image 최적화 대상이 아님
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt="업로드한 문자 캡처 미리보기"
              className="max-h-80 w-full bg-slate-100 object-contain"
            />
          )}
          <div className="flex items-center justify-between gap-3 border-t border-line px-4 py-3">
            <p className="flex min-w-0 items-center gap-2 text-sm font-medium text-slate-700">
              <FileImage className="h-4 w-4 shrink-0 text-brand-500" aria-hidden />
              <span className="truncate">{file.name}</span>
            </p>
            <div className="flex shrink-0 gap-1.5">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="inline-flex min-h-9 items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-500 transition-colors hover:bg-slate-100"
              >
                <RefreshCw className="h-3.5 w-3.5" aria-hidden />
                다시 선택
              </button>
              <button
                type="button"
                onClick={reset}
                className="inline-flex min-h-9 items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-risk-very transition-colors hover:bg-risk-very-bg"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden />
                삭제
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <p role="alert" className="animate-fade-in rounded-xl bg-risk-very-bg px-3.5 py-2.5 text-sm font-medium text-risk-very">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={() => {
          if (!file) {
            onError("먼저 문자 캡처 이미지를 올려주세요.");
            return;
          }
          onSubmit({ fileName: file.name });
        }}
        className="btn-primary w-full text-base"
        disabled={!file}
      >
        <ScanText className="h-5 w-5" aria-hidden />
        이미지에서 문자 분석하기
      </button>

      <p className="text-center text-xs leading-relaxed text-slate-400">
        데모 모드에서는 대표 샘플 문자를 추출 텍스트로 사용합니다. 업로드한 이미지는 분석 후 저장되지
        않습니다.
      </p>
    </div>
  );
}
