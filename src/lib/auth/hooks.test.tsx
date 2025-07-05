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
      json: async () => ({ user: null }),
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
      ok: true,
      json: async () => ({ user: null }),
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
      json: async () => ({ user: mockUser }),
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
    // @ts-expect-error - location is read-only
    window.location = originalLocation;
  });

  it("ログイン関数が正しいURLを設定する", () => {
    const { result } = renderHook(() => useAuthActions());

    result.current.login();
    expect(window.location.href).toBe("/auth/login");

    result.current.login("/dashboard");
    expect(window.location.href).toBe("/auth/login?returnTo=%2Fdashboard");
  });

  it("ログアウト関数が正しいURLを設定する", () => {
    const { result } = renderHook(() => useAuthActions());

    result.current.logout();
    expect(window.location.href).toBe("/auth/logout");

    result.current.logout("/");
    expect(window.location.href).toBe("/auth/logout?returnTo=%2F");
  });
});
