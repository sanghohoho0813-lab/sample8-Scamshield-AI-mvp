"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { FontScale } from "./types";
import { FONT_SCALE_KEY } from "./constants";

interface SettingsContextValue {
  fontScale: FontScale;
  setFontScale: (scale: FontScale) => void;
}

const SettingsContext = createContext<SettingsContextValue>({
  fontScale: "normal",
  setFontScale: () => {},
});

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [fontScale, setFontScaleState] = useState<FontScale>("normal");

  // 첫 페인트 전 인라인 스크립트가 적용한 값을 상태에 동기화
  useEffect(() => {
    const applied = document.documentElement.dataset.fontScale;
    if (applied === "large" || applied === "x-large") setFontScaleState(applied);
  }, []);

  const setFontScale = useCallback((scale: FontScale) => {
    setFontScaleState(scale);
    if (scale === "normal") delete document.documentElement.dataset.fontScale;
    else document.documentElement.dataset.fontScale = scale;
    try {
      window.localStorage.setItem(FONT_SCALE_KEY, scale);
    } catch {
      // 저장 불가 환경: 현재 세션에만 적용
    }
  }, []);

  return (
    <SettingsContext.Provider value={{ fontScale, setFontScale }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
