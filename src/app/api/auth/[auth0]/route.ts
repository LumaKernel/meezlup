import { handleAuth, handleCallback, handleLogin, handleLogout } from "@auth0/nextjs-auth0";
import type { NextRequest } from "next/server";

/**
 * Auth0認証ハンドラー
 * 
 * 以下のルートを提供:
 * - /api/auth/login - ログイン
 * - /api/auth/logout - ログアウト
 * - /api/auth/callback - Auth0コールバック
 * - /api/auth/me - ユーザー情報取得
 */
export const GET = handleAuth({
  login: handleLogin({
    authorizationParams: {
      // ユーザーが初回ログイン時にプロフィール情報の使用を許可するか確認
      prompt: "consent",
      // 追加のスコープを要求（必要に応じて）
      scope: "openid profile email",
    },
    returnTo: "/", // ログイン後のリダイレクト先
  }),
  logout: handleLogout({
    returnTo: "/", // ログアウト後のリダイレクト先
  }),
  callback: handleCallback({
    afterCallback: async (req: NextRequest, session: any) => {
      // コールバック後の処理（ユーザー情報の保存など）
      console.log("User logged in:", session.user);
      
      // 必要に応じてデータベースにユーザー情報を保存
      // TODO: Effectサービスレイヤーと連携
      
      return session;
    },
  }),
});

// POSTメソッドも同じハンドラーを使用
export const POST = handleAuth();