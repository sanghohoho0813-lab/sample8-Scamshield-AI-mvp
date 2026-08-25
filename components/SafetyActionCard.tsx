import Link from "next/link";
import { ArrowRight, ShieldAlert } from "lucide-react";

interface SafetyActionCardProps {
  actions: string[];
}

/** "지금 해야 할 행동" 카드 */
export default function SafetyActionCard({ actions }: SafetyActionCardProps) {
  return (
    <section className="card overflow-hidden">
      <div className="flex items-center gap-2.5 border-b border-line bg-brand-600 px-4 py-3.5 md:px-5">
        <ShieldAlert className="h-5 w-5 text-white" aria-hidden />
        <h3 className="text-[15px] font-bold text-white">지금 해야 할 행동</h3>
      </div>
      <ol className="flex flex-col divide-y divide-line">
        {actions.map((action, i) => (
          <li key={action} className="flex items-start gap-3 px-4 py-3.5 md:px-5">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-700">
              {i + 1}
            </span>
            <p className="text-[15px] leading-relaxed text-slate-800">{action}</p>
          </li>
        ))}
      </ol>
      <div className="border-t border-line bg-slate-50/60 px-4 py-3 md:px-5">
        <Link
          href="/guide"
          className="inline-flex min-h-10 items-center gap-1 text-sm font-semibold text-brand-700 hover:text-brand-800"
        >
          안전 확인 방법 보기
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </section>
  );
}
