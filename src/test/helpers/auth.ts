import type { User } from "@/lib/effects";

/**
 * テスト用の認証コンテキスト
 */
export interface TestAuthContext {
  readonly user: User | null;
  readonly isAuthenticated: boolean;
  readonly isLoading: boolean;
  readonly error: Error | null;
  readonly login: (returnTo?: string) => void;
  readonly logout: (returnTo?: string) => void;
}

/**
 * 認証済みユーザーのコンテキストを作成
 */
export const createAuthenticatedContext = (user: User): TestAuthContext => ({
  user,
  isAuthenticated: true,
  isLoading: false,
  error: null,
  login: () => {},
  logout: () => {},
});

/**
 * 未認証ユーザーのコンテキストを作成
 */
export const createUnauthenticatedContext = (): TestAuthContext => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  login: () => {},
  logout: () => {},
});

/**
 * ローディング中のコンテキストを作成
 */
export const createLoadingContext = (): TestAuthContext => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  login: () => {},
  logout: () => {},
});

/**
 * エラー状態のコンテキストを作成
 */
export const createErrorContext = (error: Error): TestAuthContext => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error,
  login: () => {},
  logout: () => {},
});