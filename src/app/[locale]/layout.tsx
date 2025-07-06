import {
  SUPPORTED_LANGUAGES,
  type SupportedLanguage,
} from "@/lib/i18n/persistence";
import { I18nProvider } from "@/components/I18nProvider";
import type { ReactNode } from "react";

interface LocaleLayoutProps {
  readonly children: ReactNode;
  readonly params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return SUPPORTED_LANGUAGES.map((locale) => ({
    locale,
  }));
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  // 言語が有効かチェック
  if (!SUPPORTED_LANGUAGES.includes(locale as SupportedLanguage)) {
    // 無効な言語の場合はデフォルト言語にリダイレクト
    // ミドルウェアで処理されるため、ここでは何もしない
  }

  return (
    <I18nProvider locale={locale as SupportedLanguage}>{children}</I18nProvider>
  );
}
