"use client";

import { LoginButton } from "@/components/auth/LoginButton";
import { useAuth } from "@/lib/auth/hooks";
import { useAuthRedirect } from "@/lib/auth/use-auth-redirect";
import { Button } from "@/components/ui/Button";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { use } from "react";
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
  if (i18n.language !== locale) {
    console.log("Current i18n language:", i18n.language);
    console.log("Locale from URL:", locale);
    i18n
      .changeLanguage(locale)
      .then(() => {
        console.log("Language changed to:", locale);
      })
      .catch(console.error);
  }

  // 認証後のリフレッシュ処理
  useAuthRedirect(isAuthenticated, isLoading);

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
