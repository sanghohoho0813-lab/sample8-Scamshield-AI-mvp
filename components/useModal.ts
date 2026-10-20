"use client";

import { useEffect, type RefObject } from "react";

const FOCUSABLE = "a[href], button:not([disabled]):not([tabindex='-1']), [tabindex='0']";

/**
 * 시트·대화상자 공통 동작 — 열리면 패널로 포커스, 뒤 화면 스크롤 잠금, Esc로 닫기,
 * Tab 이동이 창 밖으로 빠져나가지 않게 가두고, 닫히면 열었던 버튼으로 포커스를 돌려준다.
 */
export function useModal(panelRef: RefObject<HTMLElement | null>, onClose: () => void) {
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab" && panelRef.current) {
        const focusables = panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE);
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement;
        if (e.shiftKey && (active === first || active === panelRef.current)) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && active === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    // 공통 이동 버튼(mirae-history-nav)은 창 크기가 바뀔 때 고정 요소를 피해 자리를 다시 고른다.
    // 시트가 열리고 닫힐 때도 같은 신호를 보내 시트 아래쪽 버튼을 가리지 않게 한다.
    const nudge = () => window.dispatchEvent(new Event("resize"));
    nudge();
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      opener?.focus();
      nudge();
    };
  }, [panelRef, onClose]);
}
