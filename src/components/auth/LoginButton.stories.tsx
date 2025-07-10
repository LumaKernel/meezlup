import type { Meta, StoryObj } from "@storybook/react";
import { within, userEvent, expect, fn } from "@storybook/test";
import { vi } from "vitest";
import { LoginButton } from "./LoginButton";
import { I18nProvider } from "@/components/I18nProvider";
import * as authHooks from "@/lib/auth/hooks";

// モック関数
const mockLogin = fn();
const mockLogout = fn();

const meta = {
  title: "Components/Auth/LoginButton",
  component: LoginButton,
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <I18nProvider locale="ja">
        <Story />
      </I18nProvider>
    ),
  ],
  beforeEach: () => {
    // 各ストーリー実行前にモックをリセット
    mockLogin.mockClear();
    mockLogout.mockClear();
  },
} satisfies Meta<typeof LoginButton>;

export default meta;
type Story = StoryObj<typeof meta>;

// 未認証状態
export const NotAuthenticated: Story = {
  decorators: [
    (Story) => {
      // useAuthのモック
      vi.spyOn(authHooks, "useAuth").mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        user: null,
      });

      // useAuthActionsのモック
      vi.spyOn(authHooks, "useAuthActions").mockReturnValue({
        login: mockLogin,
        logout: mockLogout,
      });

      return <Story />;
    },
  ],
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("ログインボタンが表示される", async () => {
      const button = await canvas.findByRole("button");
      await expect(button).toHaveTextContent("ログイン");
      await expect(button).toBeEnabled();
    });

    await step("ボタンをクリックするとlogin関数が呼ばれる", async () => {
      const button = canvas.getByRole("button");
      await userEvent.click(button);
      await expect(mockLogin).toHaveBeenCalledTimes(1);
      await expect(mockLogin).toHaveBeenCalledWith(undefined);
    });
  },
};

// 認証済み状態
export const Authenticated: Story = {
  decorators: [
    (Story) => {
      vi.spyOn(authHooks, "useAuth").mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        user: {
          id: "auth0|123456",
          email: "test@example.com",
          name: "テストユーザー",
          picture: "https://example.com/avatar.jpg",
        },
      });

      vi.spyOn(authHooks, "useAuthActions").mockReturnValue({
        login: mockLogin,
        logout: mockLogout,
      });

      return <Story />;
    },
  ],
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("ログアウトボタンが表示される", async () => {
      const button = await canvas.findByRole("button");
      await expect(button).toHaveTextContent("ログアウト");
      await expect(button).toBeEnabled();
    });

    await step("ボタンをクリックするとlogout関数が呼ばれる", async () => {
      const button = canvas.getByRole("button");
      await userEvent.click(button);
      await expect(mockLogout).toHaveBeenCalledTimes(1);
      await expect(mockLogout).toHaveBeenCalledWith(undefined);
    });
  },
};

// ローディング状態
export const Loading: Story = {
  decorators: [
    (Story) => {
      vi.spyOn(authHooks, "useAuth").mockReturnValue({
        isAuthenticated: false,
        isLoading: true,
        user: null,
      });

      vi.spyOn(authHooks, "useAuthActions").mockReturnValue({
        login: mockLogin,
        logout: mockLogout,
      });

      return <Story />;
    },
  ],
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("ローディング中のボタンが表示される", async () => {
      const button = await canvas.findByRole("button");
      await expect(button).toHaveTextContent("読み込み中...");
      await expect(button).toBeDisabled();
    });

    await step("ボタンがクリックできない", async () => {
      const button = canvas.getByRole("button");
      await userEvent.click(button);
      await expect(mockLogin).not.toHaveBeenCalled();
      await expect(mockLogout).not.toHaveBeenCalled();
    });
  },
};

// カスタムスタイル
export const CustomStyle: Story = {
  args: {
    className: "text-lg px-8 py-3",
  },
  decorators: [
    (Story) => {
      vi.spyOn(authHooks, "useAuth").mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        user: null,
      });

      vi.spyOn(authHooks, "useAuthActions").mockReturnValue({
        login: mockLogin,
        logout: mockLogout,
      });

      return <Story />;
    },
  ],
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("カスタムクラスが適用される", async () => {
      const button = await canvas.findByRole("button");
      await expect(button).toHaveClass("text-lg", "px-8", "py-3");
    });
  },
};

// リターンURL指定
export const WithReturnUrl: Story = {
  args: {
    returnTo: "/dashboard",
  },
  decorators: [
    (Story) => {
      vi.spyOn(authHooks, "useAuth").mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        user: null,
      });

      vi.spyOn(authHooks, "useAuthActions").mockReturnValue({
        login: mockLogin,
        logout: mockLogout,
      });

      return <Story />;
    },
  ],
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("returnToパラメータが渡される", async () => {
      const button = await canvas.findByRole("button");
      await userEvent.click(button);
      await expect(mockLogin).toHaveBeenCalledWith("/dashboard");
    });
  },
};

// エラー状態
export const WithError: Story = {
  decorators: [
    (Story) => {
      vi.spyOn(authHooks, "useAuth").mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        error: new Error("認証エラーが発生しました"),
      });

      vi.spyOn(authHooks, "useAuthActions").mockReturnValue({
        login: mockLogin,
        logout: mockLogout,
      });

      return <Story />;
    },
  ],
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("エラーがあってもボタンは表示される", async () => {
      const button = await canvas.findByRole("button");
      await expect(button).toHaveTextContent("ログイン");
      await expect(button).toBeEnabled();
    });
  },
};

// インタラクティブなストーリー
export const Interactive: Story = {
  decorators: [
    (Story) => {
      // 初期状態は未認証
      let isAuthenticated = false;
      const user = {
        id: "auth0|123456",
        email: "test@example.com",
        name: "テストユーザー",
      };

      vi.spyOn(authHooks, "useAuth").mockImplementation(() => ({
        isAuthenticated,
        isLoading: false,
        user: isAuthenticated ? user : null,
      }));

      vi.spyOn(authHooks, "useAuthActions").mockReturnValue({
        login: mockLogin.mockImplementation(() => {
          isAuthenticated = true;
          // Storybookでは再レンダリングが必要
          console.log("ログインしました");
        }),
        logout: mockLogout.mockImplementation(() => {
          isAuthenticated = false;
          console.log("ログアウトしました");
        }),
      });

      return <Story />;
    },
  ],
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("初期状態：ログインボタンが表示される", async () => {
      const button = await canvas.findByRole("button");
      await expect(button).toHaveTextContent("ログイン");
    });

    await step("ログインボタンをクリック", async () => {
      const button = canvas.getByRole("button");
      await userEvent.click(button);
      await expect(mockLogin).toHaveBeenCalled();
    });
  },
};
