import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SettingsProvider } from "@/lib/settings";
import Header from "@/components/Header";
import MobileNav from "@/components/MobileNav";

export const metadata: Metadata = {
  title: {
    default: "ScamShield — AI 사기문자 판독",
    template: "%s | ScamShield",
  },
  description:
    "의심스러운 문자나 링크를 넣으면 AI가 위험 신호를 쉽고 빠르게 확인해드립니다.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#2563eb",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="min-h-dvh">
        <SettingsProvider>
          <Header />
          <main className="pb-24 md:pb-12">{children}</main>
          <MobileNav />
        </SettingsProvider>
      </body>
    </html>
  );
}
