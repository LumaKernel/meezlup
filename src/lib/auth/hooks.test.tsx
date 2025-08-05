import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { server } from "@/test/mocks/server";
import { http, HttpResponse } from "msw";
import { AllTheProviders } from "@/test/providers";
import { useAuth, useAuthActions } from "./hooks";

describe("useAuth", () => {
  it("ローディング中の状態を返す", () => {
    // MSWで遅延レスポンスを設定
    server.use(
      http.get("/api/user/profile", async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        return new HttpResponse(null, { status: 401 });
      }),
    );

    const { result } = renderHook(() => useAuth(), {
      wrapper: AllTheProviders,
    });

    expect(result.current).toEqual({
      isAuthenticated: false,
      isLoading: true,
      user: null,
      error: null,
    });
  });

  it("未認証状態を返す", async () => {
    // MSWで401レスポンスを設定
    server.use(
      http.get("/api/user/profile", () => {
        return new HttpResponse(null, { status: 401 });
      }),
    );

    const { result } = renderHook(() => useAuth(), {
      wrapper: AllTheProviders,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current).toEqual({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      error: null,
    });
  });

  it("認証済み状態を返す", async () => {
    const mockUser = {
      id: "user123",
      sub: "auth0|123456",
      email: "test@example.com",
      name: "テストユーザー",
      picture: "https://example.com/avatar.jpg",
      nickname: "testuser",
      email_verified: true,
    };

    // MSWで認証済みレスポンスを設定
    server.use(
      http.get("/api/user/profile", () => {
        return HttpResponse.json(mockUser);
      }),
    );

    const { result } = renderHook(() => useAuth(), {
      wrapper: AllTheProviders,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current).toEqual({
      isAuthenticated: true,
      isLoading: false,
      user: {
        id: "user123",
        email: "test@example.com",
        name: "テストユーザー",
        picture: "https://example.com/avatar.jpg",
        nickname: "testuser",
        emailVerified: true,
      },
      error: null,
    });
  });

  it("エラー状態を処理する", async () => {
    // MSWで404エラーレスポンスを設定
    server.use(
      http.get("/api/user/profile", () => {
        return new HttpResponse(null, { status: 404 });
      }),
    );

    const { result } = renderHook(() => useAuth(), {
      wrapper: AllTheProviders,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.error?.message).toBe(
      "Failed to fetch user profile: 404",
    );
  });

  it("500エラーの場合はエラーをスローする", async () => {
    // MSWで500エラーレスポンスを設定
    server.use(
      http.get("/api/user/profile", () => {
        return new HttpResponse(null, { status: 500 });
      }),
    );

    const { result } = renderHook(() => useAuth(), {
      wrapper: AllTheProviders,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.error?.message).toBe(
      "Failed to fetch user profile: 500",
    );
  });

  it("部分的なユーザー情報でも処理できる", async () => {
    const mockUser = {
      id: "user123",
      sub: "auth0|123456",
      email: "test@example.com",
      // name, picture, nickname, email_verified は省略
    };

    // MSWで部分的なユーザー情報を返す
    server.use(
      http.get("/api/user/profile", () => {
        return HttpResponse.json(mockUser);
      }),
    );

    const { result } = renderHook(() => useAuth(), {
      wrapper: AllTheProviders,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current).toEqual({
      isAuthenticated: true,
      isLoading: false,
      user: {
        id: "user123",
        email: "test@example.com",
        name: undefined,
        picture: undefined,
        nickname: undefined,
        emailVerified: undefined,
      },
      error: null,
    });
  });
});

describe("useAuthActions", () => {
  // window.location.hrefの保存と復元
  const originalLocation = window.location;

  beforeEach(() => {
    // locationを書き換え可能にする
    Object.defineProperty(window, "location", {
      value: {
        ...originalLocation,
        href: "",
        pathname: "/",
      },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(window, "location", {
      value: originalLocation,
      writable: true,
      configurable: true,
    });
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

    result.current.login("/custom/path");
    expect(window.location.href).toBe("/auth/login?returnTo=%2Fcustom%2Fpath");

    result.current.logout("/another/path");
    expect(window.location.href).toBe(
      "/auth/logout?returnTo=%2Fanother%2Fpath",
    );
  });
});
