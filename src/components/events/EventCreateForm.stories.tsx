import type { Meta, StoryObj } from "@storybook/react";
import { EventCreateForm } from "./EventCreateForm";

const meta = {
  title: "Events/EventCreateForm",
  component: EventCreateForm,
  parameters: {
    layout: "padded",
    nextjs: {
      appDirectory: true,
      navigation: {
        push: () => {},
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof EventCreateForm>;

export default meta;
type Story = StoryObj<typeof meta>;

// 基本的な表示（日本語）
export const DefaultJapanese: Story = {
  args: {
    params: Promise.resolve({ locale: "ja" }),
  },
};

// 基本的な表示（英語）
export const DefaultEnglish: Story = {
  args: {
    params: Promise.resolve({ locale: "en" }),
  },
};

// フォーム入力済み（日本語）
export const FilledFormJapanese: Story = {
  args: {
    params: Promise.resolve({ locale: "ja" }),
  },
};

// フォーム入力済み（英語）
export const FilledFormEnglish: Story = {
  args: {
    params: Promise.resolve({ locale: "en" }),
  },
};

// エラー状態
export const WithError: Story = {
  args: {
    params: Promise.resolve({ locale: "ja" }),
  },
};

// 送信中の状態（モック）
export const SubmittingState: Story = {
  args: {
    params: Promise.resolve({ locale: "ja" }),
  },
  parameters: {
    docs: {
      description: {
        story:
          "送信中の状態を表示します。実際の動作では、送信ボタンがローディング状態になります。",
      },
    },
  },
};

// モバイル表示
export const MobileView: Story = {
  args: {
    params: Promise.resolve({ locale: "ja" }),
  },
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
  },
};

// タブレット表示
export const TabletView: Story = {
  args: {
    params: Promise.resolve({ locale: "ja" }),
  },
  parameters: {
    viewport: {
      defaultViewport: "tablet",
    },
  },
};
