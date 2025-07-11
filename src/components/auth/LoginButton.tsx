"use client";

import { Button } from "@/components/ui/Button";
import { useAuth, useAuthActions } from "@/lib/auth/hooks";
import { useTranslation } from "react-i18next";

interface LoginButtonProps {
  readonly returnTo?: string;
  readonly className?: string;
}

/**
 * ログインボタンコンポーネント
 * 認証状態に応じてログイン/ログアウトボタンを表示
 */
export function LoginButton({ className, returnTo }: LoginButtonProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { login, logout } = useAuthActions();
  const { t } = useTranslation("auth");

  if (isLoading) {
    return (
      <Button disabled loading className={className}>
        {t("common:ui.button.loading")}
      </Button>
    );
  }

  if (isAuthenticated && user) {
    return (
      <Button
        onClick={() => {
          logout(returnTo);
        }}
        variant="light"
        className={className}
      >
        {t("logout.button")}
      </Button>
    );
  }

  return (
    <Button
      onClick={() => {
        login(returnTo);
      }}
      className={className}
    >
      {t("login.button")}
    </Button>
  );
}
