import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "./providers";
import { MantineSetup } from "./mantine-setup";
import { ColorSchemeScript, mantineHtmlProps } from "@mantine/core";
import { dir } from "i18next";
import { FontStyles } from "./font-styles";
import "./mantine-styles.css";

const geistSans = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist-mono",
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
    <html
      lang={locale}
      dir={dir(locale)}
      className={`${geistSans.variable satisfies string} ${geistMono.variable satisfies string}`}
      {...mantineHtmlProps}
    >
      <head>
        <ColorSchemeScript />
      </head>
      <body className="antialiased">
        <FontStyles />
        <MantineSetup>
          <Providers>{children}</Providers>
        </MantineSetup>
      </body>
    </html>
  );
}
