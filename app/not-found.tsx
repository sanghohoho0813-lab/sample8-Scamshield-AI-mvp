import type { Metadata } from "next";
import Link from "next/link";
import { SearchX } from "lucide-react";

export const metadata: Metadata = {
  title: "페이지를 찾을 수 없어요",
};

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-16 text-center md:py-24">
      <SearchX className="h-12 w-12 text-slate-300" aria-hidden />
      <h1 className="mt-5 text-2xl font-extrabold text-navy-900">페이지를 찾을 수 없어요</h1>
      <p className="mt-2 text-base text-slate-500">
        주소가 바뀌었거나 잘못 입력된 것 같아요. 의심되는 문자가 있다면 바로 검사해보세요.
      </p>
      <div className="mt-7 flex w-full flex-col gap-2.5 sm:w-auto sm:flex-row">
        <Link href="/" className="btn-primary">
          문자 검사하기
        </Link>
        <Link href="/guide" className="btn-secondary">
          안전 가이드 보기
        </Link>
      </div>
    </div>
  );
}
