import type { ReactNode } from "react";

/** 하위 화면 공통 제목 — 크기·간격을 한곳에서 맞춘다 */
export default function PageHeader({ eyebrow, title, children }: { eyebrow?: string; title: string; children?: ReactNode }) {
  return (
    <div>
      {eyebrow && <p className="mb-1.5 text-sm font-bold text-brand-700">{eyebrow}</p>}
      <h1 className="text-2xl font-bold tracking-tight text-navy-900 md:text-3xl">{title}</h1>
      {children && <p className="mt-1.5 max-w-2xl text-base text-slate-500">{children}</p>}
    </div>
  );
}
