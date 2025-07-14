import type { Meta, StoryObj } from "@storybook/react";
import { AuthGuard } from "./AuthGuard";
import { I18nProvider } from "@/components/I18nProvider";

const meta = {
  title: "Components/Auth/AuthGuard",
  component: AuthGuard,
  parameters: {
    layout: "centered",
    nextjs: {
      navigation: {
        push: () => {},
      },
      appDirectory: true,
    },
  },
  decorators: [
    (Story) => (
      <I18nProvider locale="ja">
        <div style={{ minWidth: "400px", padding: "20px" }}>
          <Story />
        </div>
      </I18nProvider>
    ),
  ],
} satisfies Meta<typeof AuthGuard>;

export default meta;
type Story = StoryObj<typeof meta>;

// 保護されたコンテンツのサンプル
const ProtectedContent = () => (
  <div
    style={{
      padding: "20px",
      background: "#f0f0f0",
      borderRadius: "8px",
      textAlign: "center",
    }}
  >
    <h2 style={{ margin: "0 0 10px 0" }}>保護されたコンテンツ</h2>
    <p style={{ margin: 0 }}>認証されたユーザーのみアクセス可能です</p>
  </div>
);

// 認証済みユーザーのストーリー
export const Authenticated: Story = {
  args: {
    children: <ProtectedContent />,
  },
  parameters: {
    auth: {
      isAuthenticated: true,
      isLoading: false,
      user: {
        id: "user123",
        email: "user@example.com",
        name: "テストユーザー",
        picture: "https://via.placeholder.com/150",
        emailVerified: true,
      },
    },
  },
};

// 未認証ユーザーのストーリー
export const Unauthenticated: Story = {
  args: {
    children: <ProtectedContent />,
  },
  parameters: {
    auth: {
      isAuthenticated: false,
      isLoading: false,
      user: null,
    },
  },
};

// ローディング中のストーリー
export const Loading: Story = {
  args: {
    children: <ProtectedContent />,
  },
  parameters: {
    auth: {
      isAuthenticated: false,
      isLoading: true,
      user: null,
    },
  },
};

// カスタムフォールバックのストーリー
export const CustomFallback: Story = {
  args: {
    children: <ProtectedContent />,
    fallback: (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <h3>アクセス権限がありません</h3>
        <p>ログインしてください</p>
      </div>
    ),
  },
  parameters: {
    auth: {
      isAuthenticated: false,
      isLoading: false,
      user: null,
    },
  },
};