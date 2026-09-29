import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "검사 결과",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
