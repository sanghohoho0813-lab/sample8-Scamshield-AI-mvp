import { redirect } from "next/navigation";

/** 이전 경로 호환: 기록 상세는 결과 페이지로 통합 (/history/{id} → /result/{id}) */
export default async function HistoryDetailRedirect({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/result/${encodeURIComponent(id)}`);
}
