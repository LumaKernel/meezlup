"use client";

import { Button, Group } from "@mantine/core";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { forwardRef } from "react";
import { storeLanguage, type SupportedLanguage } from "@/lib/i18n/persistence";

interface LanguageSwitcherProps {
  readonly className?: string;
}

export const LanguageSwitcher = forwardRef<
  HTMLDivElement,
  LanguageSwitcherProps
>(({ className }, ref) => {
  const router = useRouter();
  const { i18n } = useTranslation();

  const handleLanguageChange = async (locale: SupportedLanguage) => {
    // ローカルストレージに言語設定を保存
    storeLanguage(locale);

    // i18nの言語を変更
    await i18n.changeLanguage(locale);

    // Next.jsのルーターを使用して言語を切り替え
    const currentPath = window.location.pathname;
    let newPath: string;

    // 現在のパスから言語プレフィックスを削除
    const pathWithoutLocale = currentPath.replace(/^\/[a-z]{2}($|\/)/, "/");

    // 新しい言語でパスを構築
    if (pathWithoutLocale === "/") {
      newPath = `/${locale satisfies string}`;
    } else {
      newPath = `/${locale satisfies string}${pathWithoutLocale satisfies string}`;
    }

    // ルート変更
    router.push(newPath);
  };

  return (
    <Group ref={ref} className={className} gap="xs">
      <Button
        variant={i18n.language === "ja" ? "filled" : "outline"}
        size="compact-sm"
        onClick={() => {
          handleLanguageChange("ja").catch(console.error);
        }}
      >
        日本語
      </Button>
      <Button
        variant={i18n.language === "en" ? "filled" : "outline"}
        size="compact-sm"
        onClick={() => {
          handleLanguageChange("en").catch(console.error);
        }}
      >
        English
      </Button>
    </Group>
  );
});

LanguageSwitcher.displayName = "LanguageSwitcher";
