import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SettingsProvider } from "@/lib/settings";
import { FONT_SCALE_KEY } from "@/lib/constants";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SampleBridgeCTA from "@/components/SampleBridgeCTA";
import MobileNav from "@/components/MobileNav";
import Script from "next/script";

export const metadata: Metadata = {
  title: {
    default: "ScamShield — 사기문자 위험도 검사",
    template: "%s | ScamShield",
  },
  description:
    "의심스러운 문자나 링크를 넣으면 위험 신호와 지금 해야 할 행동을 쉽고 빠르게 알려드립니다.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
  viewportFit: "cover",
};

/** 저장된 글자 크기를 첫 페인트 전에 적용해 화면이 튀는 것을 막는다 */
const fontScaleScript = `try{var s=localStorage.getItem("${FONT_SCALE_KEY}");if(s==="large"||s==="x-large")document.documentElement.dataset.fontScale=s}catch(e){}`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: fontScaleScript }} />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="min-h-dvh">
        {/* 미래AI랩 데모 공용 뒤로·앞으로 버튼 */}
        <Script src="/mirae-history-nav.js" strategy="beforeInteractive" />
        <SettingsProvider>
          <Header />
          <main>{children}</main>
          <SampleBridgeCTA />
          <Footer />
          <div className="h-[calc(4rem+env(safe-area-inset-bottom))] md:hidden" aria-hidden />
          <MobileNav />
        </SettingsProvider>
      </body>
    </html>
  );
}
