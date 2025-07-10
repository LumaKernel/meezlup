import { vi } from "vitest";

// Auth関連のモックデータ型
export interface MockAuthData {
  auth: {
    isAuthenticated: boolean;
    isLoading: boolean;
    user: {
      id: string;
      email: string;
      name?: string;
      picture?: string;
      nickname?: string;
      emailVerified?: boolean;
    } | null;
    error?: Error;
  };
}

// モック関数
export const mockLogin = vi.fn((returnTo?: string) => {
  console.log("[Mock] Login called with returnTo:", returnTo);
});

export const mockLogout = vi.fn((returnTo?: string) => {
  console.log("[Mock] Logout called with returnTo:", returnTo);
});

// デフォルトのモックデータ
export const defaultMockAuthData: MockAuthData = {
  auth: {
    isAuthenticated: false,
    isLoading: false,
    user: null,
  },
};

// useAuthフックのモック実装
export const createMockUseAuth = (mockData: MockAuthData["auth"]) => {
  return () => mockData;
};

// useAuthActionsフックのモック実装
export const createMockUseAuthActions = () => {
  return () => ({
    login: mockLogin,
    logout: mockLogout,
  });
};
