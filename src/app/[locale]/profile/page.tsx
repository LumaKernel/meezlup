"use client";

import { AuthGuard } from "@/components/auth/AuthGuard";
import { UserProfile } from "@/components/auth/UserProfile";
import { LoginButton } from "@/components/auth/LoginButton";
import { use, useEffect } from "react";
import { useTranslation } from "react-i18next";

interface ProfilePageProps {
  readonly params: Promise<{ locale: string }>;
}

/**
 * プロフィールページ
 * 認証が必要なページの例
 */
export default function ProfilePage({ params }: ProfilePageProps) {
  const { locale } = use(params);
  const { i18n, t } = useTranslation("common");

  // ロケールに基づいて言語を設定
  useEffect(() => {
    if (i18n.language !== locale) {
      i18n.changeLanguage(locale).catch(console.error);
    }
  }, [locale, i18n]);
  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-3xl font-bold mb-8">{t("navigation.profile")}</h1>

        <div className="space-y-6">
          <UserProfile />

          <div className="flex justify-end">
            <LoginButton />
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
