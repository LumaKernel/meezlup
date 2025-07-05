"use client";

import { Auth0Provider } from "@auth0/nextjs-auth0";
import type { ReactNode } from "react";

interface AuthProviderProps {
  readonly children: ReactNode;
}

/**
 * Auth0認証プロバイダー
 * アプリケーション全体で認証状態を管理
 */
export function AuthProvider({ children }: AuthProviderProps) {
  return (
    <Auth0Provider
      // エラー時のリダイレクト先
      loginUrl="/api/auth/login"
      // プロフィール取得のエンドポイント
      profileUrl="/api/auth/me"
    >
      {children}
    </Auth0Provider>
  );
}