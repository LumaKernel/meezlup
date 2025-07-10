import type { Meta, StoryObj } from "@storybook/react";
import { within, expect } from "@storybook/test";
import { vi } from "vitest";
import { AuthGuard } from "./AuthGuard";
import { I18nProvider } from "@/components/I18nProvider";
import * as authHooks from "@/lib/auth/hooks";
import * as navigation from "next/navigation";
import type { MockAppRouterInstance, MockParams } from "@/test/mocks/types";

const meta = {
  title: "Components/Auth/AuthGuard",
  component: AuthGuard,
  parameters: {
    layout: "centered",
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
  beforeEach: () => {
    // ナビゲーションのモック
    const mockRouter: MockAppRouterInstance = {
      push: vi.fn(),
      replace: vi.fn(),
      refresh: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      prefetch: vi.fn(),
    };
    vi.spyOn(navigation, "useRouter").mockReturnValue(mockRouter);

    const mockParams: MockParams = {
      locale: "ja",
    };
    vi.spyOn(navigation, "useParams").mockReturnValue(mockParams);
  },
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

// 認証済み状態
export const Authenticated: Story = {
  args: {
    children: <ProtectedContent />,
  },
  decorators: [
    (Story) => {
      vi.spyOn(authHooks, "useAuth").mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        user: {
          id: "auth0|123456",
          email: "test@example.com",
          name: "テストユーザー",
        },
      });

      return <Story />;
    },
  ],
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("保護されたコンテンツが表示される", async () => {
      await expect(
        canvas.getByText("保護されたコンテンツ"),
      ).toBeInTheDocument();
      await expect(
        canvas.getByText("認証されたユーザーのみアクセス可能です"),
      ).toBeInTheDocument();
    });
  },
};

// 未認証状態
export const NotAuthenticated: Story = {
  args: {
    children: <ProtectedContent />,
  },
  decorators: [
    (Story) => {
      vi.spyOn(authHooks, "useAuth").mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        user: null,
      });

      return <Story />;
    },
  ],
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("ログイン必要メッセージが表示される", async () => {
      await expect(canvas.getByText("ログインが必要です")).toBeInTheDocument();
      await expect(
        canvas.getByText("このページを表示するにはログインしてください。"),
      ).toBeInTheDocument();
    });

    await step("ログインボタンが表示される", async () => {
      await expect(
        canvas.getByRole("button", { name: /ログイン/i }),
      ).toBeInTheDocument();
    });

    await step("保護されたコンテンツは表示されない", async () => {
      await expect(
        canvas.queryByText("保護されたコンテンツ"),
      ).not.toBeInTheDocument();
    });
  },
};

// ローディング状態
export const Loading: Story = {
  args: {
    children: <ProtectedContent />,
  },
  decorators: [
    (Story) => {
      vi.spyOn(authHooks, "useAuth").mockReturnValue({
        isAuthenticated: false,
        isLoading: true,
        user: null,
      });

      return <Story />;
    },
  ],
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("ローディングメッセージが表示される", async () => {
      await expect(canvas.getByText("確認中...")).toBeInTheDocument();
    });

    await step("保護されたコンテンツは表示されない", async () => {
      await expect(
        canvas.queryByText("保護されたコンテンツ"),
      ).not.toBeInTheDocument();
    });
  },
};

// フォールバック付き
export const WithFallback: Story = {
  args: {
    children: <ProtectedContent />,
    fallback: (
      <div style={{ textAlign: "center", padding: "40px" }}>
        <h2 style={{ color: "#666", marginBottom: "20px" }}>アクセス制限</h2>
        <p style={{ marginBottom: "20px" }}>
          このコンテンツを表示するにはログインが必要です。
        </p>
        <button
          style={{
            padding: "10px 20px",
            background: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          ログインページへ
        </button>
      </div>
    ),
  },
  decorators: [
    (Story) => {
      vi.spyOn(authHooks, "useAuth").mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        user: null,
      });

      return <Story />;
    },
  ],
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("カスタムフォールバックが表示される", async () => {
      await expect(canvas.getByText("アクセス制限")).toBeInTheDocument();
      await expect(
        canvas.getByText("このコンテンツを表示するにはログインが必要です。"),
      ).toBeInTheDocument();
      await expect(canvas.getByText("ログインページへ")).toBeInTheDocument();
    });
  },
};

// カスタム未認証
export const CustomUnauthorized: Story = {
  args: {
    children: <ProtectedContent />,
    fallback: (
      <div
        style={{
          textAlign: "center",
          padding: "40px",
          background: "#fee",
          borderRadius: "8px",
          border: "1px solid #fcc",
        }}
      >
        <h2 style={{ color: "#c00", marginBottom: "10px" }}>
          アクセス権限がありません
        </h2>
        <p style={{ marginBottom: "20px" }}>
          このコンテンツにアクセスするには管理者権限が必要です。
        </p>
        <button
          style={{
            padding: "10px 20px",
            background: "#c00",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          ホームに戻る
        </button>
      </div>
    ),
  },
  decorators: [
    (Story) => {
      vi.spyOn(authHooks, "useAuth").mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        user: null,
      });

      return <Story />;
    },
  ],
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("カスタム未認証メッセージが表示される", async () => {
      await expect(
        canvas.getByText("アクセス権限がありません"),
      ).toBeInTheDocument();
      await expect(
        canvas.getByText(
          "このコンテンツにアクセスするには管理者権限が必要です。",
        ),
      ).toBeInTheDocument();
    });
  },
};

// 複数の子要素
export const MultipleChildren: Story = {
  args: {
    children: (
      <>
        <div
          style={{
            marginBottom: "10px",
            padding: "10px",
            background: "#e0f2fe",
          }}
        >
          子要素1
        </div>
        <div
          style={{
            marginBottom: "10px",
            padding: "10px",
            background: "#dbeafe",
          }}
        >
          子要素2
        </div>
        <div style={{ padding: "10px", background: "#bfdbfe" }}>子要素3</div>
      </>
    ),
  },
  decorators: [
    (Story) => {
      vi.spyOn(authHooks, "useAuth").mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        user: {
          id: "auth0|123456",
          email: "test@example.com",
          name: "テストユーザー",
        },
      });

      return <Story />;
    },
  ],
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("すべての子要素が表示される", async () => {
      await expect(canvas.getByText("子要素1")).toBeInTheDocument();
      await expect(canvas.getByText("子要素2")).toBeInTheDocument();
      await expect(canvas.getByText("子要素3")).toBeInTheDocument();
    });
  },
};

// リダイレクト設定
export const WithRedirect: Story = {
  args: {
    children: <ProtectedContent />,
    redirectTo: "/login",
  },
  decorators: [
    (Story) => {
      const mockPush = vi.fn();

      const mockRouter: MockAppRouterInstance = {
        push: mockPush,
        replace: vi.fn(),
        refresh: vi.fn(),
        back: vi.fn(),
        forward: vi.fn(),
        prefetch: vi.fn(),
      };
      vi.spyOn(navigation, "useRouter").mockReturnValue(mockRouter);

      vi.spyOn(authHooks, "useAuth").mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        user: null,
      });

      return <Story />;
    },
  ],
  play: async ({ step }) => {
    await step("リダイレクトが実行される", async () => {
      const mockRouter = vi.mocked(navigation.useRouter).mock.results[0]
        ?.value as MockAppRouterInstance;
      await expect(mockRouter.push).toHaveBeenCalledWith("/login");
    });
  },
};

// エラー状態
export const WithError: Story = {
  args: {
    children: <ProtectedContent />,
  },
  decorators: [
    (Story) => {
      vi.spyOn(authHooks, "useAuth").mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        error: new Error("認証エラーが発生しました"),
      });

      return <Story />;
    },
  ],
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("エラーがあっても未認証画面が表示される", async () => {
      await expect(canvas.getByText("ログインが必要です")).toBeInTheDocument();
    });
  },
};
