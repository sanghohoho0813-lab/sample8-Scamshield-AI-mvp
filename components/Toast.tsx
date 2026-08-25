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
      className="animate-toast-in fixed bottom-20 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-xl bg-navy-900 px-4 py-3 text-sm font-medium text-white shadow-lg md:bottom-8"
    >
      {toast.tone === "success" ? (
        <CheckCircle2 className="h-4 w-4 text-emerald-400" aria-hidden />
      ) : (
        <Info className="h-4 w-4 text-brand-300" aria-hidden />
      )}
      {toast.message}
    </div>
  ) : null;

  return { show, node };
}
