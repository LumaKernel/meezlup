import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "./providers";
import { MantineSetup } from "./mantine-setup";
import "./globals.css";
import { ColorSchemeScript, mantineHtmlProps } from "@mantine/core";
import { dir } from "i18next";

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
  description:
    "友達や同僚との日程調整を簡単に。MeetzUpで最適な日時を見つけよう。",
};

export default function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params?: { locale?: string };
}>) {
  const locale = params?.locale || "ja";

  return (
    <html lang={locale} dir={dir(locale)} {...mantineHtmlProps}>
      <head>
        <meta name="color-scheme" content="light" />
        <ColorSchemeScript
          defaultColorScheme="light"
          forceColorScheme="light"
        />
      </head>
      <body
        className={`${geistSans.variable satisfies string} ${geistMono.variable satisfies string} antialiased`}
      >
        <MantineSetup>
          <Providers>{children}</Providers>
        </MantineSetup>
      </body>
    </html>
  );
}
