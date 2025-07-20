"use client";

import { useQuery } from "@tanstack/react-query";

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
  readonly error?: Error | null;
}

/**
 * Auth0プロファイルレスポンスの型定義
 */
interface Auth0ProfileResponse {
  id?: string; // データベースID
  sub?: string; // Auth0 ID
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
  const {
    data: user = null,
    error,
    isLoading,
  } = useQuery<AuthUser | null>({
    queryKey: ["auth", "profile"],
    queryFn: async () => {
      console.log("[useAuth] Fetching user profile...");
      const response = await fetch("/api/user/profile");
      console.log("[useAuth] Profile response status:", response.status);

      if (response.ok) {
        const data = (await response.json()) as Auth0ProfileResponse;
        console.log("[useAuth] Profile data:", data);

        if (data.id && data.email) {
          const userData = {
            id: data.id, // データベースIDを使用
            email: data.email,
            name: data.name,
            picture: data.picture,
            nickname: data.nickname,
            emailVerified: data.email_verified,
          };
          console.log("[useAuth] Setting user:", userData);
          return userData;
        } else {
          console.log("[useAuth] No user data in response");
          return null;
        }
      } else if (response.status === 401) {
        console.log("[useAuth] User not authenticated (401)");
        return null;
      } else {
        console.error("[useAuth] Unexpected response status:", response.status);
        throw new Error(
          `Failed to fetch user profile: ${response.status satisfies number}`,
        );
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5分間キャッシュ
  });

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
