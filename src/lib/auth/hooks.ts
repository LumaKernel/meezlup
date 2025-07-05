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
      try {
        const response = await fetch("/auth/profile");
        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            setUser({
              id: data.user.sub,
              email: data.user.email,
              name: data.user.name,
              picture: data.user.picture,
              nickname: data.user.nickname,
              emailVerified: data.user.email_verified,
            });
          }
        } else if (response.status !== 401) {
          throw new Error("Failed to fetch user profile");
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
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
    const loginUrl = "/auth/login";
    if (returnTo) {
      window.location.href = `${loginUrl}?returnTo=${encodeURIComponent(returnTo)}`;
    } else {
      window.location.href = loginUrl;
    }
  };

  const logout = (returnTo?: string) => {
    const logoutUrl = "/auth/logout";
    if (returnTo) {
      window.location.href = `${logoutUrl}?returnTo=${encodeURIComponent(returnTo)}`;
    } else {
      window.location.href = logoutUrl;
    }
  };

  return {
    login,
    logout,
  };
}