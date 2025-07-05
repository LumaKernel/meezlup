import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useAuth, useAuthActions } from "./hooks";
import { UserProvider } from "@auth0/nextjs-auth0/client";
import type { ReactNode } from "react";

// Auth0のuseUserフックをモック
const mockUseUser = vi.fn();

vi.mock("@auth0/nextjs-auth0/client", () => ({
  useUser: () => mockUseUser(),
  UserProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

describe("useAuth", () => {

  it("ローディング中の状態を返す", () => {
    mockUseUser.mockReturnValue({
      user: undefined,
      error: undefined,
      isLoading: true,
    });

    const { result } = renderHook(() => useAuth());

    expect(result.current).toEqual({
      isAuthenticated: false,
      isLoading: true,
      user: null,
    });
  });

  it("未認証状態を返す", () => {
    mockUseUser.mockReturnValue({
      user: undefined,
      error: undefined,
      isLoading: false,
    });

    const { result } = renderHook(() => useAuth());

    expect(result.current).toEqual({
      isAuthenticated: false,
      isLoading: false,
      user: null,
    });
  });

  it("認証済み状態を返す", () => {
    const mockUser = {
      sub: "auth0|123456",
      email: "test@example.com",
      name: "テストユーザー",
      picture: "https://example.com/avatar.jpg",
      nickname: "testuser",
      email_verified: true,
    };

    mockUseUser.mockReturnValue({
      user: mockUser,
      error: undefined,
      isLoading: false,
    });

    const { result } = renderHook(() => useAuth());

    expect(result.current).toEqual({
      isAuthenticated: true,
      isLoading: false,
      user: {
        id: "auth0|123456",
        email: "test@example.com",
        name: "テストユーザー",
        picture: "https://example.com/avatar.jpg",
        nickname: "testuser",
        emailVerified: true,
      },
    });
  });

  it("エラー状態を処理する", () => {
    const mockError = new Error("認証エラー");

    mockUseUser.mockReturnValue({
      user: undefined,
      error: mockError,
      isLoading: false,
    });

    const { result } = renderHook(() => useAuth());

    expect(result.current).toEqual({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      error: mockError,
    });
  });
});

describe("useAuthActions", () => {
  // window.location.hrefのモック
  const originalLocation = window.location;

  beforeEach(() => {
    // @ts-expect-error - location is read-only
    delete window.location;
    // @ts-expect-error - location is read-only
    window.location = { href: "" };
  });

  afterEach(() => {
    window.location = originalLocation;
  });

  it("ログイン関数が正しいURLを設定する", () => {
    const { result } = renderHook(() => useAuthActions());

    result.current.login();
    expect(window.location.href).toBe("/api/auth/login");

    result.current.login("/dashboard");
    expect(window.location.href).toBe(
      "/api/auth/login?returnTo=%2Fdashboard",
    );
  });

  it("ログアウト関数が正しいURLを設定する", () => {
    const { result } = renderHook(() => useAuthActions());

    result.current.logout();
    expect(window.location.href).toBe("/api/auth/logout");

    result.current.logout("/");
    expect(window.location.href).toBe("/api/auth/logout?returnTo=%2F");
  });
});