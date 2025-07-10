"use client";

import { useEffect, useState } from "react";
import { I18nextProvider } from "react-i18next";
import i18n from "@/lib/i18n/client";
import type { SupportedLanguage } from "@/lib/i18n/persistence";

interface I18nProviderProps {
  readonly children: React.ReactNode;
  readonly locale: SupportedLanguage;
}

export function I18nProvider({ children, locale }: I18nProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);

  // 初回レンダリング前に言語を同期的に設定
  if (!isInitialized && i18n.language !== locale) {
    // 同期的に言語を変更（ハイドレーションエラーを防ぐため）
    i18n.changeLanguage(locale).catch(console.error);
    setIsInitialized(true);
  }

  useEffect(() => {
    // URLのロケールと同期（ナビゲーション時）
    if (i18n.language !== locale) {
      i18n.changeLanguage(locale).catch(console.error);
    }
  }, [locale]);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
