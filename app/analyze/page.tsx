import { Suspense } from "react";
import type { Metadata } from "next";
import AnalyzeClient from "./AnalyzeClient";

export const metadata: Metadata = {
  title: "문자 검사하기",
};

export default function AnalyzePage() {
  return (
    <Suspense fallback={<AnalyzeSkeleton />}>
      <AnalyzeClient />
    </Suspense>
  );
}

function AnalyzeSkeleton() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 md:px-6">
      <div className="skeleton h-8 w-48" />
      <div className="skeleton mt-3 h-4 w-72" />
      <div className="skeleton mt-6 h-48 w-full" />
      <div className="skeleton mt-4 h-12 w-full" />
    </div>
  );
}
