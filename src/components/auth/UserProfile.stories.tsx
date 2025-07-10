import type { Meta, StoryObj } from "@storybook/react";
import { within, expect } from "@storybook/test";
import { vi } from "vitest";
import { UserProfile } from "./UserProfile";
import { I18nProvider } from "@/components/I18nProvider";
import * as authHooks from "@/lib/auth/hooks";

const meta = {
  title: "Components/Auth/UserProfile",
  component: UserProfile,
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
} satisfies Meta<typeof UserProfile>;

export default meta;
type Story = StoryObj<typeof meta>;

// 完全なプロフィール
export const CompleteProfile: Story = {
  decorators: [
    (Story) => {
      vi.spyOn(authHooks, "useAuth").mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        user: {
          id: "auth0|123456789",
          email: "user@example.com",
          name: "山田太郎",
          picture:
            "https://lh3.googleusercontent.com/a/ACg8ocI-xuPyH9QTI4EI2LbkjclUStclR5JaHhnCeNfWL-i55pg0DA=s96-c",
          nickname: "yamada",
          emailVerified: true,
        },
      });

      return <Story />;
    },
  ],
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("プロフィール情報が表示される", async () => {
      await expect(canvas.getByText("プロフィール")).toBeInTheDocument();
      await expect(canvas.getByText("user@example.com")).toBeInTheDocument();
      await expect(canvas.getByText("山田太郎")).toBeInTheDocument();
      await expect(canvas.getByText("auth0|123456789")).toBeInTheDocument();
      await expect(canvas.getByText("yamada")).toBeInTheDocument();
      await expect(canvas.getByText("はい")).toBeInTheDocument();
    });

    await step("アバター画像が表示される", async () => {
      const avatar = canvas.getByRole("img");
      await expect(avatar).toHaveAttribute("alt", "山田太郎");
    });

    await step("ログアウトボタンが表示される", async () => {
      await expect(
        canvas.getByRole("button", { name: /ログアウト/i }),
      ).toBeInTheDocument();
    });
  },
};

// 最小限のプロフィール
export const MinimalProfile: Story = {
  decorators: [
    (Story) => {
      vi.spyOn(authHooks, "useAuth").mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        user: {
          id: "google-oauth2|111748518355863512180",
          email: "minimal@example.com",
        },
      });

      return <Story />;
    },
  ],
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("必須フィールドのみ表示される", async () => {
      await expect(canvas.getByText("minimal@example.com")).toBeInTheDocument();
      await expect(
        canvas.getByText("google-oauth2|111748518355863512180"),
      ).toBeInTheDocument();
    });

    await step("デフォルトアバターが表示される", async () => {
      const avatar = canvas.getByRole("img");
      await expect(avatar).toHaveAttribute("alt", "minimal@example.com");
    });
  },
};

// メール未確認
export const UnverifiedEmail: Story = {
  decorators: [
    (Story) => {
      vi.spyOn(authHooks, "useAuth").mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        user: {
          id: "auth0|unverified123",
          email: "unverified@example.com",
          name: "未確認ユーザー",
          emailVerified: false,
        },
      });

      return <Story />;
    },
  ],
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("メール未確認が表示される", async () => {
      await expect(canvas.getByText("メール確認済み")).toBeInTheDocument();
      await expect(canvas.getByText("いいえ")).toBeInTheDocument();
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

      return <Story />;
    },
  ],
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("ローディングメッセージが表示される", async () => {
      await expect(canvas.getByText("読み込み中...")).toBeInTheDocument();
    });
  },
};

// 未認証状態
export const NotAuthenticated: Story = {
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

    await step("未認証メッセージが表示される", async () => {
      await expect(
        canvas.getByText("ログインしていません"),
      ).toBeInTheDocument();
    });
  },
};

// 長いテキスト
export const LongText: Story = {
  decorators: [
    (Story) => {
      vi.spyOn(authHooks, "useAuth").mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        user: {
          id: "auth0|very-long-auth0-id-that-might-wrap-or-truncate-in-the-ui-123456789",
          email:
            "very.long.email.address@example-domain-with-extremely-long-name.co.jp",
          name: "とても長い名前を持つユーザーさんですがちゃんと表示されます",
          nickname: "very_long_nickname_that_definitely_needs_proper_handling",
          emailVerified: true,
        },
      });

      return <Story />;
    },
  ],
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("長いテキストも適切に表示される", async () => {
      await expect(
        canvas.getByText(
          "auth0|very-long-auth0-id-that-might-wrap-or-truncate-in-the-ui-123456789",
        ),
      ).toBeInTheDocument();
      await expect(
        canvas.getByText(
          "very.long.email.address@example-domain-with-extremely-long-name.co.jp",
        ),
      ).toBeInTheDocument();
      await expect(
        canvas.getByText(
          "とても長い名前を持つユーザーさんですがちゃんと表示されます",
        ),
      ).toBeInTheDocument();
    });
  },
};

// カスタムスタイル
export const CustomStyle: Story = {
  args: {
    className: "shadow-lg border-2 border-blue-500",
  },
  decorators: [
    (Story) => {
      vi.spyOn(authHooks, "useAuth").mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        user: {
          id: "auth0|styled123",
          email: "styled@example.com",
          name: "スタイルユーザー",
          picture:
            "https://ui-avatars.com/api/?name=Style+User&background=3b82f6&color=fff",
        },
      });

      return <Story />;
    },
  ],
  play: async ({ canvasElement, step }) => {
    await step("カスタムクラスが適用される", async () => {
      // カードコンテナを探す
      const container = canvasElement.querySelector(
        ".shadow-lg.border-2.border-blue-500",
      );
      await expect(container).toBeInTheDocument();
    });
  },
};

// 様々なAuth0プロバイダー
export const DifferentProviders: Story = {
  decorators: [
    (Story) => {
      const providers = [
        {
          id: "google-oauth2|111748518355863512180",
          email: "google.user@gmail.com",
          name: "Google ユーザー",
          picture: "https://lh3.googleusercontent.com/a/default-user=s96-c",
        },
        {
          id: "github|123456",
          email: "github.user@example.com",
          name: "GitHub ユーザー",
          picture: "https://avatars.githubusercontent.com/u/123456?v=4",
        },
        {
          id: "auth0|abc123def456",
          email: "auth0.user@example.com",
          name: "Auth0 ユーザー",
        },
      ];

      // ランダムに1つ選択
      const user = providers[Math.floor(Math.random() * providers.length)];

      vi.spyOn(authHooks, "useAuth").mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        user: {
          ...user,
          emailVerified: true,
        },
      });

      return <Story />;
    },
  ],
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("プロバイダー情報が含まれるIDが表示される", async () => {
      // IDのパターンをチェック
      const idElements = canvas.getAllByText(/^(google-oauth2|github|auth0)\|/);
      await expect(idElements.length).toBeGreaterThan(0);
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

      return <Story />;
    },
  ],
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("エラーがあっても未認証メッセージが表示される", async () => {
      await expect(
        canvas.getByText("ログインしていません"),
      ).toBeInTheDocument();
    });
  },
};
