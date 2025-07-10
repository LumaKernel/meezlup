import React from "react";
import { I18nProvider } from "@/components/I18nProvider";
import type { SupportedLanguage } from "@/lib/i18n/persistence";

interface I18nDecoratorProps {
  children: React.ReactNode;
  locale?: SupportedLanguage;
}

export function I18nDecorator({ children, locale = "ja" }: I18nDecoratorProps) {
  return <I18nProvider locale={locale}>{children}</I18nProvider>;
}
