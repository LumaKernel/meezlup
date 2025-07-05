import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { LoginButton } from "./LoginButton";
import { useAuth, useAuthActions } from "@/lib/auth/hooks";

// Auth hooksをモック
vi.mock("@/lib/auth/hooks", () => ({
  useAuth: vi.fn(),
  useAuthActions: vi.fn(),
}));

describe("LoginButton", () => {
  const mockLogin = vi.fn();
  const mockLogout = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuthActions).mockReturnValue({
      login: mockLogin,
      logout: mockLogout,
    });
  });

  it("ローディング中は無効化されたボタンを表示", () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
      user: null,
    });

    render(<LoginButton />);

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent("読み込み中...");
  });

  it("未認証時はログインボタンを表示", () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null,
    });

    render(<LoginButton />);

    const button = screen.getByRole("button");
    expect(button).toHaveTextContent("ログイン");
    expect(button).not.toBeDisabled();
  });

  it("認証済み時はログアウトボタンを表示", () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: {
        id: "auth0|123456",
        email: "test@example.com",
        name: "テストユーザー",
      },
    });

    render(<LoginButton />);

    const button = screen.getByRole("button");
    expect(button).toHaveTextContent("ログアウト");
    expect(button).not.toBeDisabled();
  });

  it("ログインボタンクリックでlogin関数を呼ぶ", () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null,
    });

    render(<LoginButton returnTo="/dashboard" />);

    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(mockLogin).toHaveBeenCalledWith("/dashboard");
  });

  it("ログアウトボタンクリックでlogout関数を呼ぶ", () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: {
        id: "auth0|123456",
        email: "test@example.com",
        name: "テストユーザー",
      },
    });

    render(<LoginButton returnTo="/" />);

    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(mockLogout).toHaveBeenCalledWith("/");
  });

  it("カスタムclassNameを適用する", () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null,
    });

    render(<LoginButton className="custom-class" />);

    const button = screen.getByRole("button");
    expect(button).toHaveClass("custom-class");
  });
});
