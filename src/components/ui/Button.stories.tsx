import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./Button";

const meta = {
  title: "UI/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: [
        "filled",
        "light",
        "outline",
        "transparent",
        "subtle",
        "default",
      ],
    },
    color: {
      control: "select",
      options: [
        "blue",
        "cyan",
        "dark",
        "grape",
        "gray",
        "green",
        "indigo",
        "lime",
        "orange",
        "pink",
        "red",
        "teal",
        "violet",
        "yellow",
      ],
    },
    size: {
      control: "select",
      options: ["xs", "sm", "md", "lg", "xl"],
    },
    radius: {
      control: "select",
      options: ["xs", "sm", "md", "lg", "xl"],
    },
    disabled: {
      control: "boolean",
    },
    loading: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// 基本的なボタン
export const Default: Story = {
  args: {
    children: "ボタン",
  },
};

// プライマリーボタン
export const Primary: Story = {
  args: {
    children: "プライマリー",
    color: "blue",
  },
};

// 大きいボタン
export const Large: Story = {
  args: {
    children: "大きいボタン",
    size: "lg",
  },
};

// 小さいボタン
export const Small: Story = {
  args: {
    children: "小さいボタン",
    size: "sm",
  },
};

// ローディング状態
export const Loading: Story = {
  args: {
    children: "送信",
    loading: true,
  },
};

// 無効化状態
export const Disabled: Story = {
  args: {
    children: "無効なボタン",
    disabled: true,
  },
};

// 色のバリエーション
export const Colors: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button color="gray">Gray</Button>
      <Button color="blue">Blue</Button>
      <Button color="cyan">Cyan</Button>
      <Button color="green">Green</Button>
      <Button color="yellow">Yellow</Button>
      <Button color="red">Red</Button>
    </div>
  ),
};

// バリアントのバリエーション
export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button variant="filled">Filled</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="light">Light</Button>
      <Button variant="subtle">Subtle</Button>
      <Button variant="transparent">Transparent</Button>
      <Button variant="default">Default</Button>
    </div>
  ),
};

// 角丸のバリエーション
export const Radius: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button radius="xs">XS</Button>
      <Button radius="sm">Small</Button>
      <Button radius="md">Medium</Button>
      <Button radius="lg">Large</Button>
      <Button radius="xl">XL</Button>
    </div>
  ),
};
