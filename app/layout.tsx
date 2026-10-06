import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SettingsProvider } from "@/lib/settings";
import { FONT_SCALE_KEY } from "@/lib/constants";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SampleBridgeCTA from "@/components/SampleBridgeCTA";
import MobileNav from "@/components/MobileNav";
import Script from "next/script";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — 사기문자 위험도 검사`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  creator: "미래AI랩",
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: SITE_NAME,
    title: "이 문자, 눌러도 괜찮을까요? — ScamShield",
    description: SITE_DESCRIPTION,
  },
  twitter: { card: "summary_large_image" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
  colorScheme: "light",
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
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="min-h-dvh">
        {/* 미래AI랩 데모 공용 뒤로·앞으로 버튼 */}
        <Script src="/mirae-history-nav.js" strategy="beforeInteractive" />
        <a href="#main" className="skip-link">
          본문으로 건너뛰기
        </a>
        <SettingsProvider>
          <Header />
          <main id="main" tabIndex={-1} className="outline-none">
            {children}
          </main>
          <SampleBridgeCTA />
          <Footer />
          <div className="h-[calc(4rem+env(safe-area-inset-bottom))] md:hidden" aria-hidden />
          <MobileNav />
        </SettingsProvider>
      </body>
    </html>
  );
}
