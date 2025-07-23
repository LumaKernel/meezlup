import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { server } from "@/test/mocks/server";
import { http, HttpResponse } from "msw";
import { AllTheProviders } from "@/test/providers";
import { UserProfile } from "./UserProfile";

// テスト用のラッパーコンポーネント
function TestWrapper({ children }: { children: React.ReactNode }) {
  return <AllTheProviders>{children}</AllTheProviders>;
}

describe("UserProfile", () => {
  it("ローディング中はスケルトンを表示", () => {
    // MSWで遅延レスポンスを設定
    server.use(
      http.get("/api/user/profile", async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return new HttpResponse(null, { status: 401 });
      })
    );

    render(<UserProfile />, { wrapper: TestWrapper });
    
    // MantineのSkeletonコンポーネントを確認
    const skeletons = screen.getAllByTestId((content, element) => {
      return element?.classList.contains("mantine-Skeleton-root") ?? false;
    });
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("未認証の場合はエラーメッセージを表示", async () => {
    // MSWで未認証レスポンスを設定
    server.use(
      http.get("/api/user/profile", () => {
        return new HttpResponse(null, { status: 401 });
      })
    );

    render(<UserProfile />, { wrapper: TestWrapper });

    // 非同期でレンダリングされるのを待つ
    const errorMessage = await screen.findByText("ログインしていません");
    expect(errorMessage).toBeInTheDocument();
  });

  it("認証済みの場合はユーザー情報を表示", async () => {
    const mockUser = {
      id: "user123",
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
      })
    );

    render(<UserProfile />, { wrapper: TestWrapper });

    // ユーザー情報が表示されるのを待つ
    const userName = await screen.findByText("テストユーザー");
    expect(userName).toBeInTheDocument();

    const userEmail = await screen.findByText("test@example.com");
    expect(userEmail).toBeInTheDocument();

    const verifiedBadge = await screen.findByText(/メール確認済み/);
    expect(verifiedBadge).toBeInTheDocument();
  });

  it("オプショナルフィールドがない場合も正しく表示", async () => {
    const mockUser = {
      id: "user123",
      email: "test@example.com",
      // name, picture, nickname, email_verified は省略
    };

    // MSWで部分的なユーザー情報を返す
    server.use(
      http.get("/api/user/profile", () => {
        return HttpResponse.json(mockUser);
      })
    );

    render(<UserProfile />, { wrapper: TestWrapper });

    // 名前がない場合のフォールバック表示
    const fallbackName = await screen.findByText("名前なし");
    expect(fallbackName).toBeInTheDocument();

    const userEmail = await screen.findByText("test@example.com");
    expect(userEmail).toBeInTheDocument();
  });

  it("メール未確認の場合メール確認済みバッジが表示されない", async () => {
    const mockUser = {
      id: "user123",
      email: "test@example.com",
      name: "テストユーザー",
      email_verified: false,
    };

    // MSWでメール未確認のユーザーを返す
    server.use(
      http.get("/api/user/profile", () => {
        return HttpResponse.json(mockUser);
      })
    );

    render(<UserProfile />, { wrapper: TestWrapper });

    // ユーザー名が表示されるのを待つ
    await screen.findByText("テストユーザー");

    // メール確認済みバッジが表示されないことを確認
    const verifiedBadge = screen.queryByText(/メール確認済み/);
    expect(verifiedBadge).not.toBeInTheDocument();
  });

  it("カスタムクラスが適用される", async () => {
    // MSWで未認証レスポンスを設定
    server.use(
      http.get("/api/user/profile", () => {
        return new HttpResponse(null, { status: 401 });
      })
    );

    const { container } = render(
      <UserProfile className="custom-class" />,
      { wrapper: TestWrapper }
    );

    // カスタムクラスが適用されているか確認
    await screen.findByText("ログインしていません");
    const card = container.querySelector(".custom-class");
    expect(card).toBeInTheDocument();
  });

  it("長いテキストも適切に表示される", async () => {
    const mockUser = {
      id: "user123",
      email: "very.long.email.address@example.com",
      name: "非常に長い名前のテストユーザー",
      email_verified: true,
    };

    // MSWで長いテキストを含むユーザー情報を返す
    server.use(
      http.get("/api/user/profile", () => {
        return HttpResponse.json(mockUser);
      })
    );

    render(<UserProfile />, { wrapper: TestWrapper });

    // 長い名前とメールアドレスが表示される
    const longName = await screen.findByText("非常に長い名前のテストユーザー");
    expect(longName).toBeInTheDocument();

    const longEmail = await screen.findByText("very.long.email.address@example.com");
    expect(longEmail).toBeInTheDocument();
  });
});