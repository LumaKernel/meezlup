"use client";

import { AuthGuard } from "@/components/auth/AuthGuard";
import { UserProfile } from "@/components/auth/UserProfile";
import { LoginButton } from "@/components/auth/LoginButton";
import { use } from "react";
import { useTranslation } from "react-i18next";
import { Container, Title, Stack, Group } from "@mantine/core";

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
  if (i18n.language !== locale) {
    i18n.changeLanguage(locale).catch(console.error);
  }
  return (
    <AuthGuard>
      <Container size="sm" py="lg">
        <Title order={1} mb="xl">
          {t("navigation.profile")}
        </Title>

        <Stack gap="lg">
          <UserProfile />

          <Group justify="flex-end">
            <LoginButton />
          </Group>
        </Stack>
      </Container>
    </AuthGuard>
  );
}
