import type { Meta, StoryObj } from "@storybook/react";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { I18nProvider } from "@/components/I18nProvider";
import { expect, within, userEvent, waitFor } from "@storybook/test";

const meta = {
  title: "Components/UI/LanguageSwitcher",
  component: LanguageSwitcher,
  parameters: {
    layout: "centered",
    nextjs: {
      appDirectory: true,
      navigation: {
        push: () => {},
        pathname: "/",
      },
    },
  },
  decorators: [
    (Story) => (
      <I18nProvider locale="ja">
        <Story />
      </I18nProvider>
    ),
  ],
} satisfies Meta<typeof LanguageSwitcher>;

export default meta;
type Story = StoryObj<typeof meta>;

// 基本的な表示（日本語）
export const JapaneseSelected: Story = {
  parameters: {
    nextjs: {
      navigation: {
        params: { locale: "ja" },
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // 言語切り替えボタンが表示されていることを確認
    await waitFor(async () => {
      const languageButton = canvas.getByRole("button", { name: /日本語|JA/i });
      await expect(languageButton).toBeInTheDocument();
    });
    
    // ボタンをクリックしてドロップダウンを開く
    const languageButton = canvas.getByRole("button", { name: /日本語|JA/i });
    await userEvent.click(languageButton);
    
    // 英語オプションが表示されていることを確認
    await waitFor(async () => {
      const englishOption = canvas.getByText(/English|EN/i);
      await expect(englishOption).toBeInTheDocument();
    });
  },
};

// 英語が選択されている状態
export const EnglishSelected: Story = {
  parameters: {
    nextjs: {
      navigation: {
        params: { locale: "en" },
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // 英語の言語切り替えボタンが表示されていることを確認
    await waitFor(async () => {
      const languageButton = canvas.getByRole("button", { name: /English|EN/i });
      await expect(languageButton).toBeInTheDocument();
    });
    
    // ボタンをクリックしてドロップダウンを開く
    const languageButton = canvas.getByRole("button", { name: /English|EN/i });
    await userEvent.click(languageButton);
    
    // 日本語オプションが表示されていることを確認
    await waitFor(async () => {
      const japaneseOption = canvas.getByText(/日本語|JA/i);
      await expect(japaneseOption).toBeInTheDocument();
    });
  },
};

// カスタムスタイル
export const CustomStyle: Story = {
  parameters: {
    nextjs: {
      navigation: {
        params: { locale: "ja" },
      },
    },
  },
  decorators: [
    (Story) => (
      <div
        style={{ background: "#f0f0f0", padding: "20px", borderRadius: "8px" }}
      >
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // カスタム背景内でも言語切り替えボタンが表示されていることを確認
    await waitFor(async () => {
      const languageButton = canvas.getByRole("button", { name: /日本語|JA/i });
      await expect(languageButton).toBeInTheDocument();
    });
    
    // ボタンが正しく動作することを確認
    const languageButton = canvas.getByRole("button", { name: /日本語|JA/i });
    await userEvent.click(languageButton);
    
    await waitFor(async () => {
      const englishOption = canvas.getByText(/English|EN/i);
      await expect(englishOption).toBeInTheDocument();
    });
  },
};
