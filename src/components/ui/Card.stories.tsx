import type { Meta, StoryObj } from "@storybook/react";
import { Card } from "./Card";
import { Button } from "./Button";

const meta = {
  title: "UI/Card",
  component: Card,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    shadow: {
      control: "select",
      options: ["xs", "sm", "md", "lg", "xl"],
    },
    radius: {
      control: "select",
      options: ["xs", "sm", "md", "lg", "xl"],
    },
    withBorder: {
      control: "boolean",
    },
    padding: {
      control: "select",
      options: ["xs", "sm", "md", "lg", "xl"],
    },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

// 基本的なカード
export const Default: Story = {
  args: {
    children: "これはカードの内容です。",
  },
};

// ヘッダー付きカード
export const WithHeader: Story = {
  args: {
    header: <h3 className="text-lg font-bold">カードタイトル</h3>,
    children: "これはカードの内容です。ヘッダーが表示されています。",
  },
};

// フッター付きカード
export const WithFooter: Story = {
  args: {
    children: "これはカードの内容です。",
    footer: (
      <div className="flex gap-2">
        <Button size="sm">キャンセル</Button>
        <Button size="sm" color="blue">
          保存
        </Button>
      </div>
    ),
  },
};

// フルカード
export const FullCard: Story = {
  args: {
    header: <h3 className="text-lg font-bold">イベント詳細</h3>,
    children: (
      <div className="space-y-2">
        <p>イベント名: 忘年会</p>
        <p>日時: 2024年12月20日</p>
        <p>場所: 東京駅周辺</p>
        <p>参加者: 10名</p>
      </div>
    ),
    footer: (
      <div className="flex justify-between w-full">
        <Button size="sm" variant="light">
          詳細を見る
        </Button>
        <Button size="sm" color="blue">
          参加する
        </Button>
      </div>
    ),
  },
};

// 影のバリエーション
export const Shadows: Story = {
  args: {
    children: "影のテスト",
  },
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Card shadow="xs" className="w-48">
        <p>XS影</p>
      </Card>
      <Card shadow="sm" className="w-48">
        <p>小さい影</p>
      </Card>
      <Card shadow="md" className="w-48">
        <p>中くらいの影</p>
      </Card>
      <Card shadow="lg" className="w-48">
        <p>大きい影</p>
      </Card>
    </div>
  ),
};

// ボーダー付きカード
export const WithBorder: Story = {
  args: {
    withBorder: true,
    children: "ボーダーが適用されたカード",
  },
};
