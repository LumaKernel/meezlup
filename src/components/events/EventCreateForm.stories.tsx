import type { Meta, StoryObj } from "@storybook/react";
import { EventCreateFormPresentation } from "./EventCreateFormPresentation";
import { EventCreateFormContainer } from "./EventCreateFormContainer";
import { expect, within, userEvent, waitFor } from "@storybook/test";
import { Temporal } from "temporal-polyfill";

// Presentational Component Story
const metaPresentation = {
  title: "Events/EventCreateForm/Presentation",
  component: EventCreateFormPresentation,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  argTypes: {
    onFieldChange: { action: "field-changed" },
    onSubmit: { action: "form-submitted" },
    onCancel: { action: "form-cancelled" },
  },
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
    onFieldChange: () => {},
    onSubmit: () => {},
    onCancel: () => {},
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
    onFieldChange: () => {},
    onSubmit: () => {},
    onCancel: () => {},
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
    onFieldChange: () => {},
    onSubmit: () => {},
    onCancel: () => {},
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
    onFieldChange: () => {},
    onSubmit: () => {},
    onCancel: () => {},
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
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    // フォームが表示されることを確認
    const titleInput = await canvas.findByLabelText("イベント名");
    await expect(titleInput).toBeInTheDocument();

    // フォームに入力する
    await userEvent.type(titleInput, "テストイベント");
    
    // onFieldChangeが呼ばれたことを確認
    await waitFor(() => {
      expect(args.onFieldChange).toHaveBeenCalledWith("name", "テ");
    });

    const descriptionInput = canvas.getByLabelText("詳細説明");
    await userEvent.type(descriptionInput, "これはテストです");

    // 送信ボタンをクリック
    const submitButton = canvas.getByRole("button", { name: "イベントを作成" });
    await userEvent.click(submitButton);

    // onSubmitが呼ばれたことを確認
    await waitFor(() => {
      expect(args.onSubmit).toHaveBeenCalled();
    });
  },
};

// Container Component Stories
export const ContainerStories = {
  title: "Events/EventCreateForm/Container",
  component: EventCreateFormContainer,
  parameters: {
    layout: "padded",
    nextjs: {
      appDirectory: true,
      navigation: {
        push: () => {},
        back: () => {},
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof EventCreateFormContainer>;

// Container - 日本語
export const ContainerJapanese: StoryObj<typeof ContainerStories> = {
  args: {
    params: Promise.resolve({ locale: "ja" }),
  },
};

// Container - 英語
export const ContainerEnglish: StoryObj<typeof ContainerStories> = {
  args: {
    params: Promise.resolve({ locale: "en" }),
  },
};

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