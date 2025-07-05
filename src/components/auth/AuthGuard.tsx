"use client";

import { useAuth } from "@/lib/auth/hooks";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

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

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // 現在のURLを保持してログイン画面へリダイレクト
      const currentPath = window.location.pathname;
      const loginUrl = `${redirectTo}?returnTo=${encodeURIComponent(currentPath)}`;
      router.push(loginUrl);
    }
  }, [isAuthenticated, isLoading, redirectTo, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return fallback ? (
      <>{fallback}</>
    ) : (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">認証が必要です...</p>
      </div>
    );
  }

  return <>{children}</>;
}