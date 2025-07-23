import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { server } from "@/test/mocks/server";
import { http, HttpResponse } from "msw";
import { AllTheProviders } from "@/test/providers";
import { AuthGuard } from "./AuthGuard";

// テスト用のナビゲーショントラッカー
let navigationHistory: Array<string> = [];

// AuthGuard用のテストコンポーネント
function TestAuthGuard({ 
  children, 
  fallback,
  redirectTo 
}: { 
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
}) {
  // router.pushを検知するための仕組み
  const originalPushState = window.history.pushState.bind(window.history);
  window.history.pushState = (...args: Parameters<typeof window.history.pushState>) => {
    navigationHistory.push(args[2] as string);
    originalPushState(...args);
  };

  return (
    <AllTheProviders>
      <AuthGuard fallback={fallback} redirectTo={redirectTo}>
        {children}
      </AuthGuard>
    </AllTheProviders>
  );
}

describe("AuthGuard", () => {
  // window.location.pathnameの保存と復元
  const originalLocation = window.location;
  const originalPushState = window.history.pushState.bind(window.history);

  beforeEach(() => {
    navigationHistory = [];
    // locationを書き換え可能にする
    Object.defineProperty(window, 'location', {
      value: {
        ...originalLocation,
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
    window.history.pushState = originalPushState;
    server.resetHandlers();
  });

  it("ローディング中はスピナーを表示", () => {
    // MSWで遅延レスポンスを設定してローディング状態をシミュレート
    server.use(
      http.get("/api/user/profile", async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return new HttpResponse(null, { status: 401 });
      })
    );

    render(
      <TestAuthGuard>
        <div>保護されたコンテンツ</div>
      </TestAuthGuard>
    );

    // ローディング中の確認
    const spinner = screen.getByTestId("loading-spinner");
    expect(spinner).toBeInTheDocument();
    expect(screen.queryByText("保護されたコンテンツ")).not.toBeInTheDocument();
  });

  it("認証済みの場合は子要素を表示", async () => {
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

    render(
      <TestAuthGuard>
        <div>保護されたコンテンツ</div>
      </TestAuthGuard>
    );

    // 認証後のコンテンツが表示されるのを待つ
    await waitFor(() => {
      expect(screen.getByText("保護されたコンテンツ")).toBeInTheDocument();
    });

    expect(screen.queryByText("認証が必要です...")).not.toBeInTheDocument();
  });

  it("未認証の場合は認証が必要メッセージを表示", async () => {
    // MSWで未認証レスポンスを設定
    server.use(
      http.get("/api/user/profile", () => {
        return new HttpResponse(null, { status: 401 });
      })
    );

    render(
      <TestAuthGuard>
        <div>保護されたコンテンツ</div>
      </TestAuthGuard>
    );

    // 認証が必要メッセージが表示されるのを待つ
    await waitFor(() => {
      expect(screen.getByText("認証が必要です...")).toBeInTheDocument();
    });

    expect(screen.queryByText("保護されたコンテンツ")).not.toBeInTheDocument();
  });

  it("カスタムフォールバックコンポーネントを表示", async () => {
    // MSWで未認証レスポンスを設定
    server.use(
      http.get("/api/user/profile", () => {
        return new HttpResponse(null, { status: 401 });
      })
    );

    const CustomFallback = () => <div>カスタムフォールバック</div>;

    render(
      <TestAuthGuard fallback={<CustomFallback />}>
        <div>保護されたコンテンツ</div>
      </TestAuthGuard>
    );

    // カスタムフォールバックが表示されるのを待つ
    await waitFor(() => {
      expect(screen.getByText("カスタムフォールバック")).toBeInTheDocument();
    });

    expect(screen.queryByText("認証が必要です...")).not.toBeInTheDocument();
    expect(screen.queryByText("保護されたコンテンツ")).not.toBeInTheDocument();
  });

  it("複数の子要素を正しくレンダリング", async () => {
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

    render(
      <TestAuthGuard>
        <div>コンテンツ1</div>
        <div>コンテンツ2</div>
        <div>コンテンツ3</div>
      </TestAuthGuard>
    );

    // すべてのコンテンツが表示されるのを待つ
    await waitFor(() => {
      expect(screen.getByText("コンテンツ1")).toBeInTheDocument();
      expect(screen.getByText("コンテンツ2")).toBeInTheDocument();
      expect(screen.getByText("コンテンツ3")).toBeInTheDocument();
    });
  });
});