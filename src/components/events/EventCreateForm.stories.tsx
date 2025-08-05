import type { Meta, StoryObj } from "@storybook/react";
import { EventCreateFormPresentation } from "./EventCreateFormPresentation";
import { expect, within, userEvent, waitFor, fn } from "@storybook/test";
import { Temporal } from "temporal-polyfill";

// Presentational Component Story
const metaPresentation = {
  title: "Events/EventCreateForm/Presentation",
  component: EventCreateFormPresentation,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof EventCreateFormPresentation>;

export default metaPresentation;
type PresentationStory = StoryObj<typeof metaPresentation>;

// デフォルトの翻訳関数
const defaultT = (key: string) => {
  const translations: Record<string, string> = {
    "create.title": "新しいイベントを作成",
    "create.eventName": "イベント名",
    "create.eventNamePlaceholder": "例: チーム会議",
    "create.description": "詳細説明",
    "create.descriptionPlaceholder": "イベントの詳細を入力してください",
    "create.dateRange": "開催期間",
    "create.selectDateRange": "期間を選択",
    "create.timeSlotDuration": "時間帯の幅",
    "create.selectDuration": "時間を選択",
    "create.15minutes": "15分",
    "create.30minutes": "30分",
    "create.1hour": "1時間",
    "create.changeDeadline": "変更期限",
    "create.changeDeadlinePlaceholder": "期限を選択（任意）",
    "create.maxParticipants": "最大参加人数",
    "create.maxParticipantsPlaceholder": "人数を入力（任意）",
    "create.permission": "公開設定",
    "create.selectPermission": "設定を選択",
    "create.public": "誰でも参加可能",
    "create.private": "ログインユーザーのみ",
    "create.linkOnly": "リンクを知っている人のみ",
    "create.cancel": "キャンセル",
    "create.createEvent": "イベントを作成",
    "create.error": "エラー",
  };
  return translations[key] || key;
};

// 基本的な表示
export const Default: PresentationStory = {
  args: {
    formData: {
      name: "",
      description: "",
      timeSlotDuration: 30 as const,
      permission: "link-only" as const,
    },
    onFieldChange: fn(),
    onSubmit: fn(),
    onCancel: fn(),
    isSubmitting: false,
    error: null,
    fieldErrors: {},
    isFormValid: false,
    t: defaultT,
  },
};

// フォーム入力済み
export const FilledForm: PresentationStory = {
  args: {
    formData: {
      name: "チーム定例会議",
      description: "毎週の進捗確認と課題共有",
      timeSlotDuration: 30 as const,
      permission: "private" as const,
      dateRange: {
        start: Temporal.PlainDate.from("2024-03-10"),
        end: Temporal.PlainDate.from("2024-03-15"),
      },
      maxParticipants: 10,
    },
    onFieldChange: fn(),
    onSubmit: fn(),
    onCancel: fn(),
    isSubmitting: false,
    error: null,
    fieldErrors: {},
    isFormValid: true,
    t: defaultT,
  },
};

// エラー状態
export const WithErrors: PresentationStory = {
  args: {
    formData: {
      name: "",
      description: "",
      timeSlotDuration: 30 as const,
      permission: "link-only" as const,
    },
    onFieldChange: fn(),
    onSubmit: fn(),
    onCancel: fn(),
    isSubmitting: false,
    error: "イベントの作成に失敗しました。もう一度お試しください。",
    fieldErrors: {
      name: "イベント名は必須です",
      dateRange: "開催期間を選択してください",
    },
    isFormValid: false,
    t: defaultT,
  },
};

// 送信中
export const Submitting: PresentationStory = {
  args: {
    formData: {
      name: "チーム定例会議",
      description: "毎週の進捗確認",
      timeSlotDuration: 30 as const,
      permission: "private" as const,
      dateRange: {
        start: Temporal.PlainDate.from("2024-03-10"),
        end: Temporal.PlainDate.from("2024-03-15"),
      },
    },
    onFieldChange: fn(),
    onSubmit: fn(),
    onCancel: fn(),
    isSubmitting: true,
    error: null,
    fieldErrors: {},
    isFormValid: true,
    t: defaultT,
  },
};

// インタラクティブなストーリー
export const Interactive: PresentationStory = {
  args: {
    ...Default.args,
    isFormValid: true, // テストのためにフォームを有効にする
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // まずコンポーネントがレンダリングされるのを待つ
    await waitFor(
      async () => {
        // placeholderで入力フィールドを見つける
        const titleInput = canvas.getByPlaceholderText("例: チーム会議");
        await expect(titleInput).toBeInTheDocument();
      },
      { timeout: 5000 },
    );

    // 入力フィールドを取得
    const titleInput = canvas.getByPlaceholderText("例: チーム会議");
    const descriptionInput =
      canvas.getByPlaceholderText("イベントの詳細を入力してください");

    // フォームに入力する
    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, "テストイベント");

    await userEvent.clear(descriptionInput);
    await userEvent.type(descriptionInput, "これはテストです");

    // フォーム入力後、少し待機
    await new Promise((resolve) => setTimeout(resolve, 100));

    // 送信ボタンが存在することを確認
    const submitButton = canvas.getByRole("button", { name: "イベントを作成" });
    await expect(submitButton).toBeInTheDocument();
  },
};

// Container系のストーリーはEventCreateFormContainer.stories.tsxに移動

// モバイル表示
export const MobileView: PresentationStory = {
  args: {
    ...Default.args,
  },
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
  },
};

// タブレット表示
export const TabletView: PresentationStory = {
  args: {
    ...Default.args,
  },
  parameters: {
    viewport: {
      defaultViewport: "tablet",
    },
  },
};
