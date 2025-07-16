"use client";

import type { UseAuthResult, UseAuthActionsResult } from "@/lib/auth/hooks";

/**
 * Storybook用のモックuseAuthフック
 * グローバルコンテキストから認証データを取得
 */
export function useAuth(): UseAuthResult {
  // Storybookのグローバルコンテキストを確認
  const authData = (globalThis as any).__STORYBOOK_AUTH__;

  if (authData) {
    return authData;
  }

  // デフォルトの認証状態
  return {
    isAuthenticated: false,
    isLoading: false,
    user: null,
  };
}

/**
 * Storybook用のモックuseAuthActionsフック
 */
export function useAuthActions(): UseAuthActionsResult {
  // Storybookのグローバルコンテキストから関数を取得
  const authData = (globalThis as any).__STORYBOOK_AUTH__;

  if (authData?.login && authData?.logout) {
    return {
      login: authData.login,
      logout: authData.logout,
    };
  }

  // デフォルトの実装
  return {
    login: (returnTo?: string) => {
      console.log("[Mock] Login called with returnTo:", returnTo);
    },
    logout: (returnTo?: string) => {
      console.log("[Mock] Logout called with returnTo:", returnTo);
    },
  };
}
