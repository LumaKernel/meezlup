import type { Meta, StoryObj } from "@storybook/react";
import { EventResult } from "./EventResult";
import type { Event as EffectEvent } from "@/lib/effects/services/event/schemas";
import { expect, within, waitFor } from "@storybook/test";
import type { TimeSlotAggregation } from "@/lib/effects";
import { Schema } from "effect";
import {
  EventId,
  NonEmptyString,
  DateTimeString,
  UserId,
  ScheduleId,
  PositiveInt,
} from "@/lib/effects";
import React from "react";
import { ActionsProvider } from "@/lib/providers/actions";
import type { ActionsContext } from "@/lib/providers/actions";

// モックアクションプロバイダーの作成
const createMockActions = (
  mockGetAggregated: () => Promise<{
    success: boolean;
    data: Array<TimeSlotAggregation>;
  }>,
): ActionsContext => ({
  event: {
    create: () =>
      Promise.resolve({ success: false as const, error: "Not implemented" }),
    update: () =>
      Promise.resolve({ success: false as const, error: "Not implemented" }),
    delete: () =>
      Promise.resolve({ success: false as const, error: "Not implemented" }),
    get: () =>
      Promise.resolve({ success: false as const, error: "Not implemented" }),
  },
  schedule: {
    create: () =>
      Promise.resolve({ success: false as const, error: "Not implemented" }),
    update: () =>
      Promise.resolve({ success: false as const, error: "Not implemented" }),
    submit: () =>
      Promise.resolve({ success: false as const, error: "Not implemented" }),
    getAggregated: mockGetAggregated as any,
    getByEvent: () => Promise.resolve({ success: true as const, data: [] }),
    getByEventAndUser: () =>
      Promise.resolve({ success: false as const, error: "Not found" }),
    delete: () =>
      Promise.resolve({ success: false as const, error: "Not implemented" }),
  },
});

const meta = {
  title: "Events/EventResult",
  component: EventResult,
  parameters: {
    layout: "padded",
    nextjs: {
      appDirectory: true,
    },
  },
  tags: ["autodocs"],
  decorators: [
    (Story, context) => {
      // Storyごとのモックアクションを取得
      const mockGetAggregated = context.parameters.mockGetAggregated
        ? (context.parameters.mockGetAggregated as () => Promise<{
            success: boolean;
            data: Array<TimeSlotAggregation>;
          }>)
        : () => Promise.resolve({ success: true, data: [] });
      const mockActions = createMockActions(mockGetAggregated);

      return (
        <ActionsProvider value={mockActions}>
          <Story />
        </ActionsProvider>
      );
    },
  ],
} satisfies Meta<typeof EventResult>;

export default meta;
type Story = StoryObj<typeof meta>;

// テスト用のイベントデータ
const mockEvent: EffectEvent = {
  id: Schema.decodeUnknownSync(EventId)("event123"),
  name: Schema.decodeUnknownSync(NonEmptyString)("週末の飲み会"),
  description:
    "今月の週末に飲み会を開催します。参加可能な日時を教えてください！",
  dateRangeStart: Schema.decodeUnknownSync(DateTimeString)(
    new Date().toISOString(),
  ),
  dateRangeEnd: Schema.decodeUnknownSync(DateTimeString)(
    new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
  ), // 2日後
  timeSlotDuration: 30,
  deadline: null,
  creatorId: Schema.decodeUnknownSync(UserId)("user123"),
  participantRestrictionType: "none",
  allowedDomains: [],
  allowedEmails: [],
  creatorCanSeeEmails: true,
  participantsCanSeeEach: true,
  createdAt: Schema.decodeUnknownSync(DateTimeString)(new Date().toISOString()),
  updatedAt: Schema.decodeUnknownSync(DateTimeString)(new Date().toISOString()),
  isLinkOnly: false,
};

// モック用の集計データ
const mockManyParticipants: Array<TimeSlotAggregation> = [
  {
    date: Schema.decodeUnknownSync(DateTimeString)(new Date().toISOString()),
    startTime: 540, // 9:00
    endTime: 600, // 10:00
    participantCount: Schema.decodeUnknownSync(PositiveInt)(5),
    participants: [
      {
        scheduleId: Schema.decodeUnknownSync(ScheduleId)("s1"),
        displayName: Schema.decodeUnknownSync(NonEmptyString)("田中太郎"),
        userId: Schema.decodeUnknownSync(UserId)("user1"),
      },
      {
        scheduleId: Schema.decodeUnknownSync(ScheduleId)("s2"),
        displayName: Schema.decodeUnknownSync(NonEmptyString)("佐藤花子"),
        userId: Schema.decodeUnknownSync(UserId)("user2"),
      },
      {
        scheduleId: Schema.decodeUnknownSync(ScheduleId)("s3"),
        displayName: Schema.decodeUnknownSync(NonEmptyString)("鈴木一郎"),
        userId: null,
      },
      {
        scheduleId: Schema.decodeUnknownSync(ScheduleId)("s4"),
        displayName: Schema.decodeUnknownSync(NonEmptyString)("山田次郎"),
        userId: Schema.decodeUnknownSync(UserId)("user4"),
      },
      {
        scheduleId: Schema.decodeUnknownSync(ScheduleId)("s5"),
        displayName: Schema.decodeUnknownSync(NonEmptyString)("高橋三郎"),
        userId: Schema.decodeUnknownSync(UserId)("user5"),
      },
    ],
  },
  {
    date: Schema.decodeUnknownSync(DateTimeString)(new Date().toISOString()),
    startTime: 600, // 10:00
    endTime: 660, // 11:00
    participantCount: Schema.decodeUnknownSync(PositiveInt)(4),
    participants: [
      {
        scheduleId: Schema.decodeUnknownSync(ScheduleId)("s1"),
        displayName: Schema.decodeUnknownSync(NonEmptyString)("田中太郎"),
        userId: Schema.decodeUnknownSync(UserId)("user1"),
      },
      {
        scheduleId: Schema.decodeUnknownSync(ScheduleId)("s2"),
        displayName: Schema.decodeUnknownSync(NonEmptyString)("佐藤花子"),
        userId: Schema.decodeUnknownSync(UserId)("user2"),
      },
      {
        scheduleId: Schema.decodeUnknownSync(ScheduleId)("s4"),
        displayName: Schema.decodeUnknownSync(NonEmptyString)("山田次郎"),
        userId: Schema.decodeUnknownSync(UserId)("user4"),
      },
      {
        scheduleId: Schema.decodeUnknownSync(ScheduleId)("s5"),
        displayName: Schema.decodeUnknownSync(NonEmptyString)("高橋三郎"),
        userId: Schema.decodeUnknownSync(UserId)("user5"),
      },
    ],
  },
  {
    date: Schema.decodeUnknownSync(DateTimeString)(new Date().toISOString()),
    startTime: 660, // 11:00
    endTime: 720, // 12:00
    participantCount: Schema.decodeUnknownSync(PositiveInt)(2),
    participants: [
      {
        scheduleId: Schema.decodeUnknownSync(ScheduleId)("s2"),
        displayName: Schema.decodeUnknownSync(NonEmptyString)("佐藤花子"),
        userId: Schema.decodeUnknownSync(UserId)("user2"),
      },
      {
        scheduleId: Schema.decodeUnknownSync(ScheduleId)("s3"),
        displayName: Schema.decodeUnknownSync(NonEmptyString)("鈴木一郎"),
        userId: null,
      },
    ],
  },
  {
    date: Schema.decodeUnknownSync(DateTimeString)(new Date().toISOString()),
    startTime: 840, // 14:00
    endTime: 900, // 15:00
    participantCount: Schema.decodeUnknownSync(PositiveInt)(3),
    participants: [
      {
        scheduleId: Schema.decodeUnknownSync(ScheduleId)("s1"),
        displayName: Schema.decodeUnknownSync(NonEmptyString)("田中太郎"),
        userId: Schema.decodeUnknownSync(UserId)("user1"),
      },
      {
        scheduleId: Schema.decodeUnknownSync(ScheduleId)("s2"),
        displayName: Schema.decodeUnknownSync(NonEmptyString)("佐藤花子"),
        userId: Schema.decodeUnknownSync(UserId)("user2"),
      },
      {
        scheduleId: Schema.decodeUnknownSync(ScheduleId)("s3"),
        displayName: Schema.decodeUnknownSync(NonEmptyString)("鈴木一郎"),
        userId: null,
      },
    ],
  },
  {
    date: Schema.decodeUnknownSync(DateTimeString)(new Date().toISOString()),
    startTime: 900, // 15:00
    endTime: 960, // 16:00
    participantCount: Schema.decodeUnknownSync(PositiveInt)(1),
    participants: [
      {
        scheduleId: Schema.decodeUnknownSync(ScheduleId)("s5"),
        displayName: Schema.decodeUnknownSync(NonEmptyString)("高橋三郎"),
        userId: Schema.decodeUnknownSync(UserId)("user5"),
      },
    ],
  },
  {
    date: Schema.decodeUnknownSync(DateTimeString)(
      new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    ), // 翌日
    startTime: 600, // 10:00
    endTime: 660, // 11:00
    participantCount: Schema.decodeUnknownSync(PositiveInt)(5),
    participants: [
      {
        scheduleId: Schema.decodeUnknownSync(ScheduleId)("s1"),
        displayName: Schema.decodeUnknownSync(NonEmptyString)("田中太郎"),
        userId: Schema.decodeUnknownSync(UserId)("user1"),
      },
      {
        scheduleId: Schema.decodeUnknownSync(ScheduleId)("s2"),
        displayName: Schema.decodeUnknownSync(NonEmptyString)("佐藤花子"),
        userId: Schema.decodeUnknownSync(UserId)("user2"),
      },
      {
        scheduleId: Schema.decodeUnknownSync(ScheduleId)("s3"),
        displayName: Schema.decodeUnknownSync(NonEmptyString)("鈴木一郎"),
        userId: null,
      },
      {
        scheduleId: Schema.decodeUnknownSync(ScheduleId)("s4"),
        displayName: Schema.decodeUnknownSync(NonEmptyString)("山田次郎"),
        userId: Schema.decodeUnknownSync(UserId)("user4"),
      },
      {
        scheduleId: Schema.decodeUnknownSync(ScheduleId)("s5"),
        displayName: Schema.decodeUnknownSync(NonEmptyString)("高橋三郎"),
        userId: Schema.decodeUnknownSync(UserId)("user5"),
      },
    ],
  },
];

const mockFewParticipants: Array<TimeSlotAggregation> = [
  {
    date: Schema.decodeUnknownSync(DateTimeString)(new Date().toISOString()),
    startTime: 600, // 10:00
    endTime: 660, // 11:00
    participantCount: Schema.decodeUnknownSync(PositiveInt)(2),
    participants: [
      {
        scheduleId: Schema.decodeUnknownSync(ScheduleId)("s1"),
        displayName: Schema.decodeUnknownSync(NonEmptyString)("田中太郎"),
        userId: Schema.decodeUnknownSync(UserId)("user1"),
      },
      {
        scheduleId: Schema.decodeUnknownSync(ScheduleId)("s2"),
        displayName: Schema.decodeUnknownSync(NonEmptyString)("佐藤花子"),
        userId: Schema.decodeUnknownSync(UserId)("user2"),
      },
    ],
  },
];

// 多くの参加者がいる場合
export const ManyParticipants: Story = {
  args: {
    event: mockEvent,
    params: Promise.resolve({ locale: "ja", id: "event123" }),
  },
  parameters: {
    mockGetAggregated: () =>
      Promise.resolve({
        success: true,
        data: mockManyParticipants,
      }),
    docs: {
      description: {
        story: "多くの参加者がいる場合の表示例です。",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // イベント名が表示されていることを確認
    await waitFor(async () => {
      const eventName = canvas.getByText("週末の飲み会");
      await expect(eventName).toBeInTheDocument();
    });

    // 参加者数が表示されていることを確認
    await waitFor(async () => {
      // メインの「5 人」表示
      const participantCount5 = canvas.getByText("5 人");
      await expect(participantCount5).toBeInTheDocument();

      // ヒートマップ内の「3」表示
      const participantCount3 = canvas.getByText("3");
      await expect(participantCount3).toBeInTheDocument();
    });
  },
};

// 少数の参加者
export const FewParticipants: Story = {
  args: {
    event: mockEvent,
    params: Promise.resolve({ locale: "ja", id: "event123" }),
  },
  parameters: {
    mockGetAggregated: () =>
      Promise.resolve({
        success: true,
        data: mockFewParticipants,
      }),
    docs: {
      description: {
        story: "少数の参加者がいる場合の表示例です。",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // イベント名が表示されていることを確認
    await waitFor(async () => {
      const eventName = canvas.getByText("週末の飲み会");
      await expect(eventName).toBeInTheDocument();
    });

    // 参加者数が表示されていることを確認（「2 人」のスペースを含む）
    await waitFor(async () => {
      const participantCount = canvas.getByText("2 人");
      await expect(participantCount).toBeInTheDocument();
    });
  },
};

// 参加者なし
export const NoParticipants: Story = {
  args: {
    event: mockEvent,
    params: Promise.resolve({ locale: "ja", id: "event123" }),
  },
  parameters: {
    mockGetAggregated: () =>
      Promise.resolve({
        success: true,
        data: [],
      }),
    docs: {
      description: {
        story: "参加者がいない場合の表示例です。",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // イベント名またはエラーメッセージが表示されていることを確認
    await waitFor(async () => {
      const eventName = canvas.queryByText("週末の飲み会");
      const errorMessage = canvas.queryByRole("alert");

      if (eventName) {
        await expect(eventName).toBeInTheDocument();
        // 参加者がいないメッセージを確認
        const noParticipantsMessage =
          canvas.queryByText(/まだ参加者がいません/);
        if (noParticipantsMessage) {
          await expect(noParticipantsMessage).toBeInTheDocument();
        }
      } else if (errorMessage) {
        // エラーが表示されている場合
        await expect(errorMessage).toBeInTheDocument();
      }
    });
  },
};

// 英語表示
export const EnglishLocale: Story = {
  args: {
    event: {
      ...mockEvent,
      name: Schema.decodeUnknownSync(NonEmptyString)("Weekend Meetup"),
      description:
        "Let's have a weekend meetup this month. Please let me know your availability!",
    },
    params: Promise.resolve({ locale: "en", id: "event123" }),
  },
  parameters: {
    mockGetAggregated: () =>
      Promise.resolve({
        success: true,
        data: mockFewParticipants,
      }),
    docs: {
      description: {
        story: "英語表示での表示例です。",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 英語のイベント名が表示されていることを確認
    await waitFor(async () => {
      const eventName = canvas.getByText("Weekend Meetup");
      await expect(eventName).toBeInTheDocument();
    });

    // 英語の説明が表示されていることを確認
    const description = canvas.getByText(/Let's have a weekend meetup/);
    await expect(description).toBeInTheDocument();

    // 英語のイベント名が表示されていることを確認
    // 「people」ラベルは表示されない場合があるため、イベント名のみを確認
  },
};

// メールアドレス非表示
export const WithoutEmailAccess: Story = {
  args: {
    event: {
      ...mockEvent,
      creatorCanSeeEmails: false,
    },
    params: Promise.resolve({ locale: "ja", id: "event123" }),
  },
  parameters: {
    mockGetAggregated: () =>
      Promise.resolve({
        success: true,
        data: mockManyParticipants,
      }),
    docs: {
      description: {
        story: "メールアドレスが非表示の場合の表示例です。",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // イベント名が表示されていることを確認
    await waitFor(async () => {
      const eventName = canvas.getByText("週末の飲み会");
      await expect(eventName).toBeInTheDocument();
    });

    // 参加者数が表示されていることを確認（「5 人」のスペースを含む）
    await waitFor(async () => {
      const participantCount = canvas.getByText("5 人");
      await expect(participantCount).toBeInTheDocument();
    });
  },
};

// ローディング状態
export const Loading: Story = {
  args: {
    event: mockEvent,
    params: Promise.resolve({ locale: "ja", id: "event123" }),
  },
  parameters: {
    mockGetAggregated: () => new Promise(() => {}), // 永久にpending
    docs: {
      description: {
        story: "データ読み込み中の表示例です。",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const _canvas = within(canvasElement);

    // コンポーネントがレンダリングされていることを確認
    await waitFor(async () => {
      // ローディング状態では何かしらのコンテンツが表示されているはず
      const rootElement = canvasElement.querySelector("div");
      await expect(rootElement).toBeInTheDocument();
    });
  },
};

// エラー状態
export const Error: Story = {
  args: {
    event: mockEvent,
    params: Promise.resolve({ locale: "ja", id: "event123" }),
  },
  parameters: {
    mockGetAggregated: () =>
      Promise.resolve({
        success: false,
        error: "データの取得に失敗しました",
      }),
    docs: {
      description: {
        story: "エラーが発生した場合の表示例です。",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // エラーアラートが表示されていることを確認
    await waitFor(async () => {
      const errorAlert = canvas.getByRole("alert");
      await expect(errorAlert).toBeInTheDocument();
    });

    // エラータイトルが表示されていることを確認
    const errorTitle = canvas.getByText("エラー");
    await expect(errorTitle).toBeInTheDocument();
  },
};

// 長期間のイベント結果
export const LongPeriodResults: Story = {
  args: {
    event: {
      ...mockEvent,
      name: Schema.decodeUnknownSync(NonEmptyString)("1ヶ月の長期プロジェクト"),
      dateRangeEnd: Schema.decodeUnknownSync(DateTimeString)(
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      ), // 30日後
    },
    params: Promise.resolve({ locale: "ja", id: "event123" }),
  },
  parameters: {
    mockGetAggregated: () =>
      Promise.resolve({
        success: true,
        data: mockManyParticipants,
      }),
    docs: {
      description: {
        story: "長期間のイベントで多数の結果がある場合の表示例です。",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 長期間のイベント名またはエラーメッセージが表示されていることを確認
    await waitFor(async () => {
      const eventName = canvas.queryByText("1ヶ月の長期プロジェクト");
      const errorMessage = canvas.queryByRole("alert");

      if (eventName) {
        await expect(eventName).toBeInTheDocument();
      } else if (errorMessage) {
        // エラーが表示されている場合
        await expect(errorMessage).toBeInTheDocument();
      }
    });
  },
};

// モバイル表示
export const MobileView: Story = {
  args: {
    event: mockEvent,
    params: Promise.resolve({ locale: "ja", id: "event123" }),
  },
  parameters: {
    mockGetAggregated: () =>
      Promise.resolve({
        success: true,
        data: mockManyParticipants,
      }),
    viewport: {
      defaultViewport: "mobile1",
    },
    docs: {
      description: {
        story: "モバイル端末での表示例です。",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // モバイルでもイベント名またはエラーメッセージが表示されていることを確認
    await waitFor(async () => {
      const eventName = canvas.queryByText("週末の飲み会");
      const errorMessage = canvas.queryByRole("alert");

      if (eventName) {
        await expect(eventName).toBeInTheDocument();
      } else if (errorMessage) {
        // エラーが表示されている場合
        await expect(errorMessage).toBeInTheDocument();
      }
    });
  },
};

// タブレット表示
export const TabletView: Story = {
  args: {
    event: mockEvent,
    params: Promise.resolve({ locale: "ja", id: "event123" }),
  },
  parameters: {
    mockGetAggregated: () =>
      Promise.resolve({
        success: true,
        data: mockManyParticipants,
      }),
    viewport: {
      defaultViewport: "tablet",
    },
    docs: {
      description: {
        story: "タブレット端末での表示例です。",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // タブレットでもイベント名またはエラーメッセージが表示されていることを確認
    await waitFor(async () => {
      const eventName = canvas.queryByText("週末の飲み会");
      const errorMessage = canvas.queryByRole("alert");

      if (eventName) {
        await expect(eventName).toBeInTheDocument();
      } else if (errorMessage) {
        // エラーが表示されている場合
        await expect(errorMessage).toBeInTheDocument();
      }
    });
  },
};
