"use client";

import { LoginButton } from "@/components/auth/LoginButton";
import { useAuth } from "@/lib/auth/hooks";
import { Button } from "@/components/ui/Button";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { use, useEffect } from "react";
import {
  Container,
  Group,
  Stack,
  Title,
  Text,
  Box,
  SimpleGrid,
  Center,
} from "@mantine/core";

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
    <Box mih="100vh">
      <Box
        component="header"
        style={{ borderBottom: "1px solid var(--mantine-color-gray-3)" }}
      >
        <Container size="xl" py="md">
          <Group justify="space-between">
            <Title order={2}>{t("app.title")}</Title>
            <Group gap="md">
              <LanguageSwitcher />
              {isAuthenticated && (
                <Link href={`/${locale satisfies string}/profile`}>
                  <Button variant="light" size="sm">
                    {t("navigation.profile")}
                  </Button>
                </Link>
              )}
              <LoginButton />
            </Group>
          </Group>
        </Container>
      </Box>

      <Box component="main">
        <Container size="xl" py="xl">
          <Container size="md">
            <Stack gap="xl" align="center" ta="center">
              <Title order={1} size={48}>
                {t("hero.title")}
                <Text span c="blue" inherit>
                  {t("hero.titleHighlight")}
                </Text>
                {t("hero.titleSuffix")}
              </Title>

              <Text size="xl" c="dimmed">
                {t("hero.subtitle1")}
                <br />
                {t("hero.subtitle2")}
              </Text>

              {isAuthenticated ? (
                <Stack gap="lg">
                  <Text size="lg">
                    {t("hero.welcome", { name: user?.name || user?.email })}
                  </Text>
                  <Group justify="center" gap="md">
                    <Link href={`/${locale satisfies string}/events/new`}>
                      <Button size="lg">{t("hero.createNewEvent")}</Button>
                    </Link>
                    <Link href={`/${locale satisfies string}/events`}>
                      <Button variant="outline" size="lg">
                        {t("hero.eventList")}
                      </Button>
                    </Link>
                  </Group>
                </Stack>
              ) : (
                <Stack gap="lg">
                  <Text size="lg" c="dimmed">
                    {t("hero.loginPrompt")}
                  </Text>
                  <LoginButton />
                </Stack>
              )}
            </Stack>
          </Container>

          {/* 機能紹介 */}
          <SimpleGrid cols={{ base: 1, md: 3 }} spacing="xl" mt={100}>
            <Stack gap="md" align="center" ta="center">
              <Center
                w={64}
                h={64}
                style={{
                  backgroundColor: "var(--mantine-color-blue-1)",
                  borderRadius: "50%",
                }}
              >
                <Text size="xl">📅</Text>
              </Center>
              <Title order={3} size="h4">
                {t("features.easyCreation.title")}
              </Title>
              <Text c="dimmed">{t("features.easyCreation.description")}</Text>
            </Stack>

            <Stack gap="md" align="center" ta="center">
              <Center
                w={64}
                h={64}
                style={{
                  backgroundColor: "var(--mantine-color-blue-1)",
                  borderRadius: "50%",
                }}
              >
                <Text size="xl">🤝</Text>
              </Center>
              <Title order={3} size="h4">
                {t("features.realTimeAdjustment.title")}
              </Title>
              <Text c="dimmed">
                {t("features.realTimeAdjustment.description")}
              </Text>
            </Stack>

            <Stack gap="md" align="center" ta="center">
              <Center
                w={64}
                h={64}
                style={{
                  backgroundColor: "var(--mantine-color-blue-1)",
                  borderRadius: "50%",
                }}
              >
                <Text size="xl">🔒</Text>
              </Center>
              <Title order={3} size="h4">
                {t("features.privacyFocused.title")}
              </Title>
              <Text c="dimmed">{t("features.privacyFocused.description")}</Text>
            </Stack>
          </SimpleGrid>
        </Container>
      </Box>

      <Box
        component="footer"
        mt={100}
        style={{ borderTop: "1px solid var(--mantine-color-gray-3)" }}
      >
        <Container size="xl" py="lg">
          <Text ta="center" c="dimmed">
            {t("footer.copyright")}
          </Text>
        </Container>
      </Box>
    </Box>
  );
}
