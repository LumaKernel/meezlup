"use client";

import type { ReactNode } from "react";

interface AuthProviderProps {
  readonly children: ReactNode;
}

/**
 * Auth0認証プロバイダー
 * Auth0 v4ではmiddlewareで認証を処理するため、
 * クライアント側のプロバイダーは不要
 */
export function AuthProvider({ children }: AuthProviderProps) {
  return <>{children}</>;
}