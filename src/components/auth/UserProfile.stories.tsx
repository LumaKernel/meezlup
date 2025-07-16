import type { Meta, StoryObj } from "@storybook/react";
import { UserProfile } from "./UserProfile";
import { I18nProvider } from "@/components/I18nProvider";
import { expect, within, waitFor } from "@storybook/test";

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
  parameters: {
    auth: {
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
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 認証済みの場合、ユーザー情報が表示されることを確認
    await waitFor(
      async () => {
        const userEmail = canvas.getByText("user@example.com");
        await expect(userEmail).toBeInTheDocument();
      },
      { timeout: 5000 },
    );

    // 名前も表示されることを確認
    const userName = canvas.getByText("山田太郎");
    await expect(userName).toBeInTheDocument();
  },
};

// 最小限のプロフィール
export const MinimalProfile: Story = {
  parameters: {
    auth: {
      isAuthenticated: true,
      isLoading: false,
      user: {
        id: "google-oauth2|111748518355863512180",
        email: "minimal@example.com",
      },
    },
  },
};

// メール未確認
export const UnverifiedEmail: Story = {
  parameters: {
    auth: {
      isAuthenticated: true,
      isLoading: false,
      user: {
        id: "auth0|unverified123",
        email: "unverified@example.com",
        name: "未確認ユーザー",
        emailVerified: false,
      },
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
    },
  },
};

// 未認証状態
export const NotAuthenticated: Story = {
  parameters: {
    auth: {
      isAuthenticated: false,
      isLoading: false,
      user: null,
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 未認証の場合、「ログインしていません」と表示されることを確認
    await waitFor(
      async () => {
        const notAuthText = canvas.getByText("ログインしていません");
        await expect(notAuthText).toBeInTheDocument();
      },
      { timeout: 5000 },
    );
  },
};

// 長いテキスト
export const LongText: Story = {
  parameters: {
    auth: {
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
    },
  },
};

// カスタムスタイル
export const CustomStyle: Story = {
  args: {
    className: "shadow-lg border-2 border-blue-500",
  },
  parameters: {
    auth: {
      isAuthenticated: true,
      isLoading: false,
      user: {
        id: "auth0|styled123",
        email: "styled@example.com",
        name: "スタイルユーザー",
        picture:
          "https://ui-avatars.com/api/?name=Style+User&background=3b82f6&color=fff",
      },
    },
  },
};

// 様々なAuth0プロバイダー
export const DifferentProviders: Story = {
  parameters: {
    auth: (() => {
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

      return {
        isAuthenticated: true,
        isLoading: false,
        user: {
          ...user,
          emailVerified: true,
        },
      };
    })(),
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
    },
  },
};
