"use client";

import { I18nextProvider } from "react-i18next";
import i18n from "@/lib/i18n/client";
import type { SupportedLanguage } from "@/lib/i18n/persistence";

interface I18nProviderProps {
  readonly children: React.ReactNode;
  readonly locale: SupportedLanguage;
}

export function I18nProvider({ children, locale }: I18nProviderProps) {
  // レンダリング中に言語を同期（ハイドレーションエラーを防ぐため）
  if (i18n.language !== locale) {
    i18n.changeLanguage(locale).catch(console.error);
  }

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
