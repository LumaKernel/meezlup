import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@/test/utils";
import { AuthGuard } from "./AuthGuard";
import { useAuth } from "@/lib/auth/hooks";
import { useRouter, useParams } from "next/navigation";
import type { MockAppRouterInstance, MockParams } from "@/test/mocks/types";

// モック
vi.mock("@/lib/auth/hooks", () => ({
  useAuth: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
  useParams: vi.fn(),
}));

// i18nのモック
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "auth:authRequired.title": "ログインが必要です",
        "auth:authRequired.message":
          "このページを表示するにはログインしてください。",
        "auth:loading.message": "確認中...",
      };
      return translations[key] || key;
    },
  }),
}));

describe("AuthGuard", () => {
  const mockPush = vi.fn();
  const mockParams: MockParams = { locale: "ja" };

  beforeEach(() => {
    vi.clearAllMocks();
    const mockRouter: MockAppRouterInstance = {
      push: mockPush,
      replace: vi.fn(),
      refresh: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      prefetch: vi.fn(),
    };
    vi.mocked(useRouter).mockReturnValue(mockRouter);
    vi.mocked(useParams).mockReturnValue(mockParams);
  });

  it("ローディング中はスピナーを表示", () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
      user: null,
    });

    render(
      <AuthGuard>
        <div>保護されたコンテンツ</div>
      </AuthGuard>,
    );

    const spinner = screen.getByTestId("loading-spinner");
    expect(spinner).toBeInTheDocument();
    expect(screen.queryByText("保護されたコンテンツ")).not.toBeInTheDocument();
  });

  it("認証済みの場合は子要素を表示", () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: {
        id: "auth0|123456",
        email: "test@example.com",
        name: "テストユーザー",
      },
    });

    render(
      <AuthGuard>
        <div>保護されたコンテンツ</div>
      </AuthGuard>,
    );

    expect(screen.getByText("保護されたコンテンツ")).toBeInTheDocument();
    expect(screen.queryByText("ログインが必要です")).not.toBeInTheDocument();
  });

  it("未認証の場合はリダイレクトされる", () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null,
    });

    render(
      <AuthGuard>
        <div>保護されたコンテンツ</div>
      </AuthGuard>,
    );

    expect(mockPush).toHaveBeenCalledWith("/api/auth/login?returnTo=%2F");
    expect(screen.getByText("認証が必要です...")).toBeInTheDocument();
    expect(screen.queryByText("保護されたコンテンツ")).not.toBeInTheDocument();
  });

  it("カスタムリダイレクトパスが指定された場合", () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null,
    });

    render(
      <AuthGuard redirectTo="/login">
        <div>保護されたコンテンツ</div>
      </AuthGuard>,
    );

    expect(mockPush).toHaveBeenCalledWith("/login?returnTo=%2F");
  });

  it("カスタムフォールバックコンポーネントを表示", () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null,
    });

    const CustomFallback = () => <div>カスタムフォールバック</div>;

    render(
      <AuthGuard fallback={<CustomFallback />}>
        <div>保護されたコンテンツ</div>
      </AuthGuard>,
    );

    expect(screen.getByText("カスタムフォールバック")).toBeInTheDocument();
    expect(screen.queryByText("ログインが必要です")).not.toBeInTheDocument();
  });

  it("複数の子要素を正しくレンダリング", () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: {
        id: "auth0|123456",
        email: "test@example.com",
        name: "テストユーザー",
      },
    });

    render(
      <AuthGuard>
        <div>コンテンツ1</div>
        <div>コンテンツ2</div>
        <div>コンテンツ3</div>
      </AuthGuard>,
    );

    expect(screen.getByText("コンテンツ1")).toBeInTheDocument();
    expect(screen.getByText("コンテンツ2")).toBeInTheDocument();
    expect(screen.getByText("コンテンツ3")).toBeInTheDocument();
  });
});
