import type { Meta, StoryObj } from '@storybook/react'
import { Button } from './Button'

const meta = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['solid', 'bordered', 'light', 'flat', 'faded', 'shadow', 'ghost'],
    },
    color: {
      control: 'select',
      options: ['default', 'primary', 'secondary', 'success', 'warning', 'danger'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    radius: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg', 'full'],
    },
    isDisabled: {
      control: 'boolean',
    },
    loading: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

// 基本的なボタン
export const Default: Story = {
  args: {
    children: 'ボタン',
  },
}

// プライマリーボタン
export const Primary: Story = {
  args: {
    children: 'プライマリー',
    color: 'primary',
  },
}

// 大きいボタン
export const Large: Story = {
  args: {
    children: '大きいボタン',
    size: 'lg',
  },
}

// 小さいボタン
export const Small: Story = {
  args: {
    children: '小さいボタン',
    size: 'sm',
  },
}

// ローディング状態
export const Loading: Story = {
  args: {
    children: '送信',
    loading: true,
  },
}

// 無効化状態
export const Disabled: Story = {
  args: {
    children: '無効なボタン',
    isDisabled: true,
  },
}

// 色のバリエーション
export const Colors: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button color="default">Default</Button>
      <Button color="primary">Primary</Button>
      <Button color="secondary">Secondary</Button>
      <Button color="success">Success</Button>
      <Button color="warning">Warning</Button>
      <Button color="danger">Danger</Button>
    </div>
  ),
}

// バリアントのバリエーション
export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button variant="solid">Solid</Button>
      <Button variant="bordered">Bordered</Button>
      <Button variant="light">Light</Button>
      <Button variant="flat">Flat</Button>
      <Button variant="faded">Faded</Button>
      <Button variant="shadow">Shadow</Button>
      <Button variant="ghost">Ghost</Button>
    </div>
  ),
}

// 角丸のバリエーション
export const Radius: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button radius="none">None</Button>
      <Button radius="sm">Small</Button>
      <Button radius="md">Medium</Button>
      <Button radius="lg">Large</Button>
      <Button radius="full">Full</Button>
    </div>
  ),
}