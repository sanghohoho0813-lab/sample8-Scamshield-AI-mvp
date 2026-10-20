import type { Metadata } from "next";
import Link from "next/link";
import EmptyState from "@/components/EmptyState";

export const metadata: Metadata = {
  title: "페이지를 찾을 수 없어요",
};

export default function NotFound() {
  return (
    <EmptyState
      art="lost"
      as="h1"
      large
      title="페이지를 찾을 수 없어요"
      description="주소가 바뀌었거나 잘못 입력된 것 같아요. 의심되는 문자가 있다면 바로 검사해보세요."
      className="mx-auto max-w-lg px-4 py-14 md:py-20"
    >
      <Link href="/" className="btn-primary">
        문자 검사하기
      </Link>
      <Link href="/guide" className="btn-secondary">
        안전 가이드 보기
      </Link>
    </EmptyState>
  );
}
