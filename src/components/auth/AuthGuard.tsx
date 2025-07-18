"use client";

import { useAuth } from "@/lib/auth/hooks";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { Center, Loader, Text } from "@mantine/core";

interface AuthGuardProps {
  readonly children: ReactNode;
  readonly fallback?: ReactNode;
  readonly redirectTo?: string;
}

/**
 * 認証が必要なページを保護するコンポーネント
 */
export function AuthGuard({
  children,
  fallback,
  redirectTo = "/api/auth/login",
}: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // 認証が必要でまだ認証されていない場合はリダイレクト
  if (!isLoading && !isAuthenticated) {
    const currentPath = window.location.pathname;
    const loginUrl = `${redirectTo satisfies string}?returnTo=${encodeURIComponent(currentPath) satisfies string}`;
    router.push(loginUrl);
  }

  if (isLoading) {
    return (
      <Center mih="100vh">
        <Loader size="lg" data-testid="loading-spinner" />
      </Center>
    );
  }

  if (!isAuthenticated) {
    return fallback ? (
      <>{fallback}</>
    ) : (
      <Center mih="100vh">
        <Text c="dimmed">認証が必要です...</Text>
      </Center>
    );
  }

  return <>{children}</>;
}
