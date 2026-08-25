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

const FONT_KEY = "scamshield.fontScale.v1";

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

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(FONT_KEY) as FontScale | null;
      if (saved === "large" || saved === "x-large") {
        setFontScaleState(saved);
        document.documentElement.dataset.fontScale = saved;
      }
    } catch {
      // ignore
    }
  }, []);

  const setFontScale = useCallback((scale: FontScale) => {
    setFontScaleState(scale);
    document.documentElement.dataset.fontScale = scale;
    try {
      window.localStorage.setItem(FONT_KEY, scale);
    } catch {
      // ignore
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
