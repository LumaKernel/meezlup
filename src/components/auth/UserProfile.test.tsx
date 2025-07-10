import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@/test/utils";
import { UserProfile } from "./UserProfile";
import { useAuth } from "@/lib/auth/hooks";

// モック
vi.mock("@/lib/auth/hooks", () => ({
  useAuth: vi.fn(),
}));

// i18nのモック
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "profile:title": "プロフィール",
        "profile:field.email": "メールアドレス",
        "profile:field.name": "名前",
        "profile:field.auth0Id": "Auth0 ID",
        "profile:field.nickname": "ニックネーム",
        "profile:field.emailVerified": "メール確認済み",
        "profile:field.emailVerified.yes": "はい",
        "profile:field.emailVerified.no": "いいえ",
        "profile:error.notAuthenticated": "ログインしていません",
        "profile:loading": "読み込み中...",
      };
      return translations[key] || key;
    },
  }),
}));

describe("UserProfile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("ローディング中はスケルトンを表示", () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
      user: null,
    });

    const { container } = render(<UserProfile />);
    const skeleton = container.querySelector(".animate-pulse");
    expect(skeleton).toBeInTheDocument();
  });

  it("未認証の場合はエラーメッセージを表示", () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null,
    });

    render(<UserProfile />);

    expect(screen.getByText("ログインしていません")).toBeInTheDocument();
  });

  it("認証済みの場合はユーザー情報を表示", () => {
    vi.mocked(useAuth).mockReturnValue({
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

    render(<UserProfile />);

    expect(screen.getByText("test@example.com")).toBeInTheDocument();
    expect(screen.getByText("テストユーザー")).toBeInTheDocument();
    expect(screen.getByText("✓ メール確認済み")).toBeInTheDocument();
    const avatar = screen.getByRole("img");
    expect(avatar).toHaveAttribute("src", "https://example.com/avatar.jpg");
    expect(avatar).toHaveAttribute("alt", "テストユーザー");
  });

  it("オプショナルフィールドがない場合も正しく表示", () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: {
        id: "auth0|789012",
        email: "minimal@example.com",
        // name, picture, nickname, emailVerified は undefined
      },
    });

    render(<UserProfile />);

    expect(screen.getByText("minimal@example.com")).toBeInTheDocument();
    expect(screen.getByText("名前なし")).toBeInTheDocument();
    expect(screen.queryByText("✓ メール確認済み")).not.toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("メール未確認の場合メール確認済みバッジが表示されない", () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: {
        id: "auth0|345678",
        email: "unverified@example.com",
        name: "未確認ユーザー",
        emailVerified: false,
      },
    });

    render(<UserProfile />);

    expect(screen.getByText("unverified@example.com")).toBeInTheDocument();
    expect(screen.getByText("未確認ユーザー")).toBeInTheDocument();
    expect(screen.queryByText("✓ メール確認済み")).not.toBeInTheDocument();
  });

  it("カスタムクラスが適用される", () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: {
        id: "auth0|123456",
        email: "test@example.com",
        name: "テストユーザー",
      },
    });

    render(<UserProfile className="custom-class" />);

    const card = screen
      .getByText("test@example.com")
      .closest(".mantine-Card-root");
    expect(card).toHaveClass("custom-class");
  });

  it("長いテキストも適切に表示される", () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: {
        id: "auth0|very-long-auth0-id-that-might-wrap-or-truncate-in-the-ui-123456789",
        email:
          "very.long.email.address@example-domain-with-extremely-long-name.co.jp",
        name: "とても長い名前を持つユーザーさんですがちゃんと表示されます",
        emailVerified: true,
      },
    });

    render(<UserProfile />);

    expect(
      screen.getByText(
        "very.long.email.address@example-domain-with-extremely-long-name.co.jp",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "とても長い名前を持つユーザーさんですがちゃんと表示されます",
      ),
    ).toBeInTheDocument();
  });
});
