import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { server } from "@/test/mocks/server";
import { http, HttpResponse } from "msw";
import { AllTheProviders } from "@/test/providers";
import { LoginButton } from "./LoginButton";

// テスト用のラッパーコンポーネント
function TestWrapper({ children }: { children: React.ReactNode }) {
  return <AllTheProviders>{children}</AllTheProviders>;
}

describe("LoginButton", () => {
  // window.location.hrefの保存と復元
  const originalLocation = window.location;

  beforeEach(() => {
    // locationを書き換え可能にする
    Object.defineProperty(window, 'location', {
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
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
      configurable: true,
    });
    server.resetHandlers();
  });

  it("ローディング中は無効化されたボタンを表示", () => {
    // MSWで遅延レスポンスを設定してローディング状態をシミュレート
    server.use(
      http.get("/api/user/profile", async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return new HttpResponse(null, { status: 401 });
      })
    );

    render(<LoginButton />, { wrapper: TestWrapper });

    // ローディング中の確認
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    // ローディングテキストの確認
    expect(button).toHaveTextContent("読み込み中...");
  });

  it("未認証時はログインボタンを表示", async () => {
    // MSWで未認証レスポンスを設定
    server.use(
      http.get("/api/user/profile", () => {
        return new HttpResponse(null, { status: 401 });
      })
    );

    render(<LoginButton />, { wrapper: TestWrapper });

    // ログインボタンが表示されるのを待つ
    const button = await screen.findByRole("button");
    expect(button).toHaveTextContent("ログイン");
    expect(button).not.toBeDisabled();
  });

  it("認証済み時はログアウトボタンを表示", async () => {
    const mockUser = {
      id: "user123",
      sub: "auth0|123456",
      email: "test@example.com",
      name: "テストユーザー",
      email_verified: true,
    };

    // MSWで認証済みレスポンスを設定
    server.use(
      http.get("/api/user/profile", () => {
        return HttpResponse.json(mockUser);
      })
    );

    render(<LoginButton />, { wrapper: TestWrapper });

    // ログアウトボタンが表示されるのを待つ
    const button = await screen.findByRole("button");
    await waitFor(() => {
      expect(button).toHaveTextContent("ログアウト");
    });
    expect(button).not.toBeDisabled();
  });

  it("ログインボタンクリックでリダイレクトする", async () => {
    // MSWで未認証レスポンスを設定
    server.use(
      http.get("/api/user/profile", () => {
        return new HttpResponse(null, { status: 401 });
      })
    );

    render(<LoginButton returnTo="/dashboard" />, { wrapper: TestWrapper });

    // ログインボタンが表示されるのを待つ
    const button = await screen.findByRole("button");
    
    // ボタンをクリック
    fireEvent.click(button);

    // window.location.hrefが変更されたことを確認
    expect(window.location.href).toBe("/auth/login?returnTo=%2Fdashboard");
  });

  it("ログアウトボタンクリックでリダイレクトする", async () => {
    const mockUser = {
      id: "user123",
      sub: "auth0|123456",
      email: "test@example.com",
      name: "テストユーザー",
      email_verified: true,
    };

    // MSWで認証済みレスポンスを設定
    server.use(
      http.get("/api/user/profile", () => {
        return HttpResponse.json(mockUser);
      })
    );

    render(<LoginButton returnTo="/" />, { wrapper: TestWrapper });

    // ログアウトボタンが表示されるのを待つ
    const button = await screen.findByRole("button");
    await waitFor(() => {
      expect(button).toHaveTextContent("ログアウト");
    });

    // ボタンをクリック
    fireEvent.click(button);

    // window.location.hrefが変更されたことを確認
    expect(window.location.href).toBe("/auth/logout?returnTo=%2F");
  });

  it("カスタムclassNameを適用する", async () => {
    // MSWで未認証レスポンスを設定
    server.use(
      http.get("/api/user/profile", () => {
        return new HttpResponse(null, { status: 401 });
      })
    );

    render(<LoginButton className="custom-class" />, { wrapper: TestWrapper });

    // ボタンが表示されるのを待つ
    const button = await screen.findByRole("button");
    expect(button).toHaveClass("custom-class");
  });

  it("returnToパラメータなしでもデフォルト動作する", async () => {
    // MSWで未認証レスポンスを設定
    server.use(
      http.get("/api/user/profile", () => {
        return new HttpResponse(null, { status: 401 });
      })
    );

    window.location.pathname = "/events/123";

    render(<LoginButton />, { wrapper: TestWrapper });

    // ログインボタンが表示されるのを待つ
    const button = await screen.findByRole("button");
    
    // ボタンをクリック
    fireEvent.click(button);

    // 現在のパスがreturnToパラメータとして使われることを確認
    expect(window.location.href).toBe("/auth/login?returnTo=%2Fevents%2F123");
  });
});