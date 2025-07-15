import type { Meta, StoryObj } from "@storybook/react";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { I18nProvider } from "@/components/I18nProvider";

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
      <div style={{ background: "#f0f0f0", padding: "20px", borderRadius: "8px" }}>
        <Story />
      </div>
    ),
  ],
};