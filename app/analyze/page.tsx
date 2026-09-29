import { redirect } from "next/navigation";

/** 이전 경로 호환: 검사 입력은 홈에서 진행한다 (/analyze?sample=s1 → /?sample=s1) */
export default async function AnalyzePage({
  searchParams,
}: {
  searchParams: Promise<{ sample?: string }>;
}) {
  const { sample } = await searchParams;
  redirect(sample ? `/?sample=${encodeURIComponent(sample)}` : "/");
}
