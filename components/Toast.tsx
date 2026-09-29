"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CheckCircle2, Info } from "lucide-react";

interface ToastState {
  message: string;
  tone: "success" | "info";
}

export function useToast() {
  const [toast, setToast] = useState<ToastState | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback((message: string, tone: "success" | "info" = "success") => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast({ message, tone });
    timerRef.current = setTimeout(() => setToast(null), 2400);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const node = toast ? (
    <div
      role="status"
      className="animate-toast-in fixed inset-x-4 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-50 mx-auto flex w-fit max-w-md items-center gap-2.5 rounded-xl bg-navy-900 px-4 py-3 text-base font-medium text-white shadow-[var(--shadow-overlay)] md:bottom-8"
    >
      {toast.tone === "success" ? (
        <CheckCircle2 className="h-5 w-5 shrink-0 text-brand-300" aria-hidden />
      ) : (
        <Info className="h-5 w-5 shrink-0 text-brand-300" aria-hidden />
      )}
      {toast.message}
    </div>
  ) : null;

  return { show, node };
}
