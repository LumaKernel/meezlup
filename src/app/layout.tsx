import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/lib/auth/provider";
import { HeroUIProvider } from "@heroui/react";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MeetzUp - 日程調整をもっとシンプルに",
  description: "友達や同僚との日程調整を簡単に。MeetzUpで最適な日時を見つけよう。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable satisfies string} ${geistMono.variable satisfies string} antialiased`}
      >
        <AuthProvider>
          <HeroUIProvider>
            {children}
          </HeroUIProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
