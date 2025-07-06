"use client";

import { Button } from "@/components/ui/Button";
import { useAuth, useAuthActions } from "@/lib/auth/hooks";

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

  if (isLoading) {
    return (
      <Button disabled loading className={className}>
        読み込み中...
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
        ログアウト
      </Button>
    );
  }

  return (
    <Button
      onClick={() => {
        login(returnTo);
      }}
      color="blue"
      className={className}
    >
      ログイン
    </Button>
  );
}
