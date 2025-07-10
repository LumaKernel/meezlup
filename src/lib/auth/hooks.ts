"use client";

import { useEffect, useState } from "react";

/**
 * ユーザー認証状態
 */
export interface AuthUser {
  readonly id: string;
  readonly email: string;
  readonly name?: string;
  readonly picture?: string;
  readonly nickname?: string;
  readonly emailVerified?: boolean;
}

/**
 * 認証状態のインターフェース
 */
export interface UseAuthResult {
  readonly isAuthenticated: boolean;
  readonly isLoading: boolean;
  readonly user: AuthUser | null;
  readonly error?: Error;
}

/**
 * Auth0プロファイルレスポンスの型定義
 */
interface Auth0ProfileResponse {
  sub?: string;
  email?: string;
  name?: string;
  picture?: string;
  nickname?: string;
  email_verified?: boolean;
  given_name?: string;
  family_name?: string;
}

/**
 * 認証状態を取得するカスタムフック
 * Auth0 v4ではクライアント側でuseUserフックが提供されないため、
 * /auth/profileエンドポイントから取得
 */
export function useAuth(): UseAuthResult {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>(undefined);

  useEffect(() => {
    const fetchUser = async () => {
      console.log("[useAuth] Fetching user profile...");
      try {
        const response = await fetch("/auth/profile");
        console.log("[useAuth] Profile response status:", response.status);

        if (response.ok) {
          const data = (await response.json()) as Auth0ProfileResponse;
          console.log("[useAuth] Profile data:", data);

          if (data.sub && data.email) {
            const userData = {
              id: data.sub,
              email: data.email,
              name: data.name,
              picture: data.picture,
              nickname: data.nickname,
              emailVerified: data.email_verified,
            };
            console.log("[useAuth] Setting user:", userData);
            setUser(userData);
          } else {
            console.log("[useAuth] No user data in response");
          }
        } else if (response.status === 401) {
          console.log("[useAuth] User not authenticated (401)");
        } else {
          console.error(
            "[useAuth] Unexpected response status:",
            response.status,
          );
          throw new Error(
            `Failed to fetch user profile: ${response.status satisfies number}`,
          );
        }
      } catch (err) {
        console.error("[useAuth] Error fetching profile:", err);
        setError(err instanceof Error ? err : new Error("Unknown error"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser().catch((err: unknown) => {
      console.error("[useAuth] fetchUser error:", err);
      setError(err instanceof Error ? err : new Error("Unknown error"));
    });
  }, []);

  return {
    isAuthenticated: !!user,
    isLoading,
    user,
    error,
  };
}

/**
 * 認証アクションのインターフェース
 */
export interface UseAuthActionsResult {
  readonly login: (returnTo?: string) => void;
  readonly logout: (returnTo?: string) => void;
}

/**
 * 認証アクションを提供するカスタムフック
 */
export function useAuthActions(): UseAuthActionsResult {
  const login = (returnTo?: string) => {
    // i18nプレフィックスを除去してAuth0ルートにアクセス
    const currentPath = window.location.pathname;
    const localeMatch = currentPath.match(/^\/([a-z]{2})(\/.*)?$/);
    const actualReturnTo = returnTo || (localeMatch ? currentPath : "/");

    const loginUrl = "/auth/login";
    window.location.href = `${loginUrl satisfies string}?returnTo=${encodeURIComponent(actualReturnTo) satisfies string}`;
  };

  const logout = (returnTo?: string) => {
    // i18nプレフィックスを除去してAuth0ルートにアクセス
    const currentPath = window.location.pathname;
    const localeMatch = currentPath.match(/^\/([a-z]{2})(\/.*)?$/);
    const actualReturnTo = returnTo || (localeMatch ? currentPath : "/");

    const logoutUrl = "/auth/logout";
    window.location.href = `${logoutUrl satisfies string}?returnTo=${encodeURIComponent(actualReturnTo) satisfies string}`;
  };

  return {
    login,
    logout,
  };
}
