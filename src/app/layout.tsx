import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import { ThemeProvider, ThemeToggle } from "@/components/theme-provider";
import GoogleAnalytics from "@/components/google-analytics";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "던파메타 - 던전앤파이터 캐릭터 검색 및 랭킹",
  description: "던전앤파이터 캐릭터 검색, 장비 세팅, 아바타, 랭킹 정보를 실시간으로 확인하세요. 네오플 오픈 API 기반 프리미엄 던파 전적 검색 서비스.",
};

const themeScript = `
  (function() {
    try {
      var storedTheme = localStorage.getItem('theme');
      var systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      var theme = storedTheme || systemTheme;
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (e) {}
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground transition-colors duration-200">
        <ThemeProvider>
          <GoogleAnalytics />
          <header className="sticky top-0 z-50 w-full border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md transition-colors duration-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
              <Link href="/" className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-rose-500 via-amber-500 to-rose-500 bg-clip-text text-transparent hover:opacity-90 transition-opacity">
                  던파메타
                </span>
              </Link>
              <div className="flex items-center space-x-4">
                <ThemeToggle />
              </div>
            </div>
          </header>
          <main className="flex-1 flex flex-col">
            {children}
          </main>
          <footer className="border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-500 dark:text-neutral-400 py-8 transition-colors duration-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-sm">
                © {new Date().getFullYear()} 던파메타 (Dunmeta). All rights reserved.
              </div>
              <div className="text-xs text-center md:text-right max-w-md">
                던파메타는 Neople Open API를 활용하여 제작되었습니다. 캐릭터 데이터 및 이미지 자산의 권리는 (주)네오플 및 넥슨에 있습니다.
              </div>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
