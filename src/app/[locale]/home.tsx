"use client";

import { LoginButton } from "@/components/auth/LoginButton";
import { useAuth } from "@/lib/auth/hooks";
import { Button } from "@/components/ui/Button";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { use, useEffect } from "react";

interface HomeProps {
  readonly params: Promise<{ locale: string }>;
}

export default function Home({ params }: HomeProps) {
  const { locale } = use(params);
  const { isAuthenticated, isLoading, user } = useAuth();
  const { i18n, t } = useTranslation("common");

  // ロケールに基づいて言語を設定
  useEffect(() => {
    console.log("Current i18n language:", i18n.language);
    console.log("Locale from URL:", locale);
    if (i18n.language !== locale) {
      i18n
        .changeLanguage(locale)
        .then(() => {
          console.log("Language changed to:", locale);
        })
        .catch(console.error);
    }
  }, [locale, i18n]);

  // 認証後のリフレッシュ処理（デバッグ情報付き）
  useEffect(() => {
    // URLパラメータをチェック
    const urlParams = new URLSearchParams(window.location.search);
    console.log("[Home] Current URL:", window.location.href);
    console.log("[Home] URL params:", urlParams.toString());
    console.log("[Home] Has auth param:", urlParams.has("auth"));
    console.log("[Home] Is authenticated:", isAuthenticated);
    console.log("[Home] Is loading:", isLoading);
    console.log("[Home] User:", user);

    if (urlParams.has("auth") && !isLoading) {
      console.log(
        "[Home] Auth param detected, waiting for authentication state...",
      );

      // authパラメータがある場合は、認証状態の取得を待つ
      if (!isAuthenticated) {
        // まだ認証されていない場合は、少し待ってから再試行
        const retryCount = parseInt(urlParams.get("retry") || "0");
        if (retryCount < 3) {
          console.log(
            `[Home] Retry attempt ${(retryCount + 1) satisfies number}/3`,
          );
          setTimeout(() => {
            urlParams.set("retry", String(retryCount + 1));
            window.location.search = urlParams.toString();
          }, 1000);
        } else {
          console.error("[Home] Failed to authenticate after 3 retries");
          // リトライ上限に達したら、パラメータを削除
          urlParams.delete("auth");
          urlParams.delete("retry");
          const queryString = urlParams.toString();
          const newUrl = queryString
            ? `${window.location.pathname satisfies string}?${queryString satisfies string}`
            : window.location.pathname;
          window.history.replaceState({}, "", newUrl);
        }
      } else {
        // 認証成功したら、パラメータを削除
        console.log("[Home] Authentication successful, cleaning URL");
        urlParams.delete("auth");
        urlParams.delete("retry");
        const queryString = urlParams.toString();
        const newUrl = queryString
          ? `${window.location.pathname satisfies string}?${queryString satisfies string}`
          : window.location.pathname;
        window.history.replaceState({}, "", newUrl);
      }
    }
  }, [isAuthenticated, isLoading, user]);

  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">{t("app.title")}</h1>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            {isAuthenticated && (
              <Link href={`/${locale satisfies string}/profile`}>
                <Button variant="light" size="sm">
                  {t("navigation.profile")}
                </Button>
              </Link>
            )}
            <LoginButton />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-5xl font-bold">
            {t("hero.title")}
            <span className="text-primary">{t("hero.titleHighlight")}</span>
            {t("hero.titleSuffix")}
          </h2>

          <p className="text-xl text-gray-600">
            {t("hero.subtitle1")}
            <br />
            {t("hero.subtitle2")}
          </p>

          {isAuthenticated ? (
            <div className="space-y-6">
              <p className="text-lg">
                {t("hero.welcome", { name: user?.name || user?.email })}
              </p>
              <div className="flex justify-center gap-4">
                <Link href={`/${locale satisfies string}/events/new`}>
                  <Button color="primary" size="lg">
                    {t("hero.createNewEvent")}
                  </Button>
                </Link>
                <Link href={`/${locale satisfies string}/events`}>
                  <Button variant="bordered" size="lg">
                    {t("hero.eventList")}
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <p className="text-lg text-gray-600">{t("hero.loginPrompt")}</p>
              <LoginButton className="text-lg px-8 py-3" />
            </div>
          )}
        </div>

        {/* 機能紹介 */}
        <div className="mt-24 grid md:grid-cols-3 gap-8">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <span className="text-2xl">📅</span>
            </div>
            <h3 className="text-xl font-semibold">
              {t("features.easyCreation.title")}
            </h3>
            <p className="text-gray-600">
              {t("features.easyCreation.description")}
            </p>
          </div>

          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <span className="text-2xl">🤝</span>
            </div>
            <h3 className="text-xl font-semibold">
              {t("features.realTimeAdjustment.title")}
            </h3>
            <p className="text-gray-600">
              {t("features.realTimeAdjustment.description")}
            </p>
          </div>

          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <span className="text-2xl">🔒</span>
            </div>
            <h3 className="text-xl font-semibold">
              {t("features.privacyFocused.title")}
            </h3>
            <p className="text-gray-600">
              {t("features.privacyFocused.description")}
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t mt-24">
        <div className="container mx-auto px-4 py-8 text-center text-gray-600">
          <p>{t("footer.copyright")}</p>
        </div>
      </footer>
    </div>
  );
}
