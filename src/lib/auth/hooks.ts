"use client";

import { useUser as useAuth0User } from "@auth0/nextjs-auth0/client";
import { useMemo } from "react";

/**
 * ユーザー認証状態
 */
export interface AuthState {
  readonly isAuthenticated: boolean;
  readonly isLoading: boolean;
  readonly user: AuthUser | null;
  readonly error?: Error;
}

/**
 * 認証済みユーザー情報
 */
export interface AuthUser {
  readonly id: string;
  readonly email?: string;
  readonly name?: string;
  readonly picture?: string;
  readonly nickname?: string;
  readonly emailVerified?: boolean;
}

/**
 * 認証状態を取得するカスタムフック
 */
export function useAuth(): AuthState {
  const { error, isLoading, user } = useAuth0User();

  const authState = useMemo<AuthState>(() => {
    if (isLoading) {
      return {
        isAuthenticated: false,
        isLoading: true,
        user: null,
      };
    }

    if (error) {
      return {
        isAuthenticated: false,
        isLoading: false,
        user: null,
        error,
      };
    }

    if (!user) {
      return {
        isAuthenticated: false,
        isLoading: false,
        user: null,
      };
    }

    // Auth0のユーザー情報を正規化
    const authUser: AuthUser = {
      id: user.sub ?? "",
      email: user.email,
      name: user.name,
      picture: user.picture,
      nickname: user.nickname,
      emailVerified: user.email_verified,
    };

    return {
      isAuthenticated: true,
      isLoading: false,
      user: authUser,
    };
  }, [user, error, isLoading]);

  return authState;
}

/**
 * ログイン・ログアウト機能を提供するフック
 */
export function useAuthActions() {
  return {
    login: (returnTo?: string) => {
      const loginUrl = returnTo
        ? `/api/auth/login?returnTo=${encodeURIComponent(returnTo)}`
        : "/api/auth/login";
      window.location.href = loginUrl;
    },
    logout: (returnTo?: string) => {
      const logoutUrl = returnTo
        ? `/api/auth/logout?returnTo=${encodeURIComponent(returnTo)}`
        : "/api/auth/logout";
      window.location.href = logoutUrl;
    },
  };
}