/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/require-await */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useAuth, useAuthActions } from "./hooks";

// fetchのモック
global.fetch = vi.fn();

describe("useAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("ローディング中の状態を返す", () => {
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    const { result } = renderHook(() => useAuth());

    expect(result.current).toEqual({
      isAuthenticated: false,
      isLoading: true,
      user: null,
      error: undefined,
    });
  });

  it("未認証状態を返す", async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 401,
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current).toEqual({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      error: undefined,
    });
  });

  it("認証済み状態を返す", async () => {
    const mockUser = {
      sub: "auth0|123456",
      email: "test@example.com",
      name: "テストユーザー",
      picture: "https://example.com/avatar.jpg",
      nickname: "testuser",
      email_verified: true,
    };

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockUser,
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

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
      error: undefined,
    });
  });

  it("エラー状態を処理する", async () => {
    (fetch as any).mockRejectedValueOnce(new Error("Network error"));

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current).toEqual({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      error: expect.any(Error),
    });
  });

  it("500エラーの場合はエラーをスローする", async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe(
      "Failed to fetch user profile: 500",
    );
  });

  it("部分的なユーザー情報でも処理できる", async () => {
    const mockUser = {
      sub: "auth0|123456",
      email: "test@example.com",
      // name, picture, nickname, email_verified は省略
    };

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockUser,
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current).toEqual({
      isAuthenticated: true,
      isLoading: false,
      user: {
        id: "auth0|123456",
        email: "test@example.com",
        name: undefined,
        picture: undefined,
        nickname: undefined,
        emailVerified: undefined,
      },
      error: undefined,
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
    window.location = {
      href: "",
      pathname: "/",
    };
  });

  afterEach(() => {
    // @ts-expect-error - location is read-only
    window.location = originalLocation;
  });

  it("ログイン関数が正しいURLを設定する", () => {
    const { result } = renderHook(() => useAuthActions());

    result.current.login();
    expect(window.location.href).toBe("/auth/login?returnTo=%2F");

    result.current.login("/dashboard");
    expect(window.location.href).toBe("/auth/login?returnTo=%2Fdashboard");
  });

  it("ログアウト関数が正しいURLを設定する", () => {
    const { result } = renderHook(() => useAuthActions());

    result.current.logout();
    expect(window.location.href).toBe("/auth/logout?returnTo=%2F");

    result.current.logout("/home");
    expect(window.location.href).toBe("/auth/logout?returnTo=%2Fhome");
  });

  it("i18nプレフィックス付きURLでも正しく動作する", () => {
    window.location.pathname = "/ja/dashboard";

    const { result } = renderHook(() => useAuthActions());

    result.current.login();
    expect(window.location.href).toBe("/auth/login?returnTo=%2Fja%2Fdashboard");

    result.current.logout();
    expect(window.location.href).toBe(
      "/auth/logout?returnTo=%2Fja%2Fdashboard",
    );
  });

  it("カスタムreturnToが優先される", () => {
    window.location.pathname = "/ja/dashboard";

    const { result } = renderHook(() => useAuthActions());

    result.current.login("/en/profile");
    expect(window.location.href).toBe("/auth/login?returnTo=%2Fen%2Fprofile");

    result.current.logout("/en");
    expect(window.location.href).toBe("/auth/logout?returnTo=%2Fen");
  });
});
