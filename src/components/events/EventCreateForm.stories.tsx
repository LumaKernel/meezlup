import type { Meta, StoryObj } from "@storybook/react";
import { EventCreateForm } from "./EventCreateForm";
import { within, userEvent, expect } from "@storybook/test";

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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // eslint-disable-next-line @typescript-eslint/await-thenable -- userEvent.setup() returns a Promise
    const user = await userEvent.setup();

    // イベント名を入力
    const nameInput = await canvas.findByLabelText("イベント名");
    await user.type(nameInput, "週末の飲み会");

    // 詳細説明を入力
    const descriptionInput = await canvas.findByLabelText("詳細説明");
    await user.type(
      descriptionInput,
      "今月の週末に飲み会を開催します。\n参加可能な日時を教えてください！",
    );

    // 時間帯の幅を選択
    const durationSelect = await canvas.findByLabelText("時間帯の幅");
    await user.click(durationSelect);
    const thirtyMinOption = await canvas.findByText("30分");
    await user.click(thirtyMinOption);

    // 公開設定を選択
    const permissionSelect = await canvas.findByLabelText("公開設定");
    await user.click(permissionSelect);
    const loginOnlyOption = await canvas.findByText("ログインユーザーのみ");
    await user.click(loginOnlyOption);
  },
};

// フォーム入力済み（英語）
export const FilledFormEnglish: Story = {
  args: {
    params: Promise.resolve({ locale: "en" }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // eslint-disable-next-line @typescript-eslint/await-thenable -- userEvent.setup() returns a Promise
    const user = await userEvent.setup();

    // イベント名を入力
    const nameInput = await canvas.findByLabelText("Event Name");
    await user.type(nameInput, "Weekend Meetup");

    // 詳細説明を入力
    const descriptionInput = await canvas.findByLabelText("Description");
    await user.type(
      descriptionInput,
      "Let's have a weekend meetup this month.\nPlease let me know your availability!",
    );

    // 時間帯の幅を選択
    const durationSelect = await canvas.findByLabelText("Time Slot Duration");
    await user.click(durationSelect);
    const oneHourOption = await canvas.findByText("1 hour");
    await user.click(oneHourOption);

    // 公開設定を選択
    const permissionSelect = await canvas.findByLabelText("Privacy Settings");
    await user.click(permissionSelect);
    const publicOption = await canvas.findByText("Public");
    await user.click(publicOption);
  },
};

// エラー状態
export const WithError: Story = {
  args: {
    params: Promise.resolve({ locale: "ja" }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // eslint-disable-next-line @typescript-eslint/await-thenable -- userEvent.setup() returns a Promise
    const user = await userEvent.setup();

    // 何も入力せずに送信ボタンをクリック
    const submitButton = await canvas.findByRole("button", {
      name: "イベントを作成",
    });
    await user.click(submitButton);

    // HTML5バリデーションが動作することを期待
    // （実際のエラー表示はブラウザ依存）
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // eslint-disable-next-line @typescript-eslint/await-thenable -- userEvent.setup() returns a Promise
    const user = await userEvent.setup();

    // 最小限の入力
    const nameInput = await canvas.findByLabelText("イベント名");
    await user.type(nameInput, "テストイベント");

    const durationSelect = await canvas.findByLabelText("時間帯の幅");
    await user.click(durationSelect);
    const thirtyMinOption = await canvas.findByText("30分");
    await user.click(thirtyMinOption);

    // 送信ボタンが存在することを確認
    const submitButton = await canvas.findByRole("button", {
      name: "イベントを作成",
    });
    await expect(submitButton).toBeInTheDocument();
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
