import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { LoginButton } from "./LoginButton";
import { I18nProvider } from "@/components/I18nProvider";

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
  parameters: {
    auth: {
      isAuthenticated: false,
      isLoading: false,
      user: null,
      login: mockLogin,
      logout: mockLogout,
    },
  },
};

// 認証済み状態
export const Authenticated: Story = {
  parameters: {
    auth: {
      isAuthenticated: true,
      isLoading: false,
      user: {
        id: "auth0|123456",
        email: "test@example.com",
        name: "テストユーザー",
        picture: "https://example.com/avatar.jpg",
      },
      login: mockLogin,
      logout: mockLogout,
    },
  },
};

// ローディング状態
export const Loading: Story = {
  parameters: {
    auth: {
      isAuthenticated: false,
      isLoading: true,
      user: null,
      login: mockLogin,
      logout: mockLogout,
    },
  },
};

// カスタムスタイル
export const CustomStyle: Story = {
  args: {
    className: "text-lg px-8 py-3",
  },
  parameters: {
    auth: {
      isAuthenticated: false,
      isLoading: false,
      user: null,
      login: mockLogin,
      logout: mockLogout,
    },
  },
};

// リターンURL指定
export const WithReturnUrl: Story = {
  args: {
    returnTo: "/dashboard",
  },
  parameters: {
    auth: {
      isAuthenticated: false,
      isLoading: false,
      user: null,
      login: mockLogin,
      logout: mockLogout,
    },
  },
};

// エラー状態
export const WithError: Story = {
  parameters: {
    auth: {
      isAuthenticated: false,
      isLoading: false,
      user: null,
      error: new Error("認証エラーが発生しました"),
      login: mockLogin,
      logout: mockLogout,
    },
  },
};

// インタラクティブなストーリー
export const Interactive: Story = {
  parameters: {
    auth: {
      isAuthenticated: false,
      isLoading: false,
      user: null,
      login: mockLogin.mockImplementation(() => {
        console.log("ログインしました");
      }),
      logout: mockLogout.mockImplementation(() => {
        console.log("ログアウトしました");
      }),
    },
  },
};
