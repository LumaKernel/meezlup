import type { Meta, StoryObj } from "@storybook/react";
import { EventParticipate } from "./EventParticipate";
import type { Event as EffectEvent } from "@/lib/effects/services/event/schemas";
import { Schema } from "effect";
import { EventId, NonEmptyString, DateTimeString, UserId } from "@/lib/effects";

const meta = {
  title: "Events/EventParticipate",
  component: EventParticipate,
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
} satisfies Meta<typeof EventParticipate>;

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
    new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
  ), // 3日後
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

const mockEventEnglish: EffectEvent = {
  ...mockEvent,
  name: Schema.decodeUnknownSync(NonEmptyString)("Weekend Meetup"),
  description:
    "Let's have a weekend meetup this month. Please let me know your availability!",
};

// 基本的な表示（日本語・非認証）
export const UnauthenticatedJapanese: Story = {
  args: {
    event: mockEvent,
    params: Promise.resolve({ locale: "ja", id: "event123" }),
  },
};

// 基本的な表示（英語・非認証）
export const UnauthenticatedEnglish: Story = {
  args: {
    event: mockEventEnglish,
    params: Promise.resolve({ locale: "en", id: "event123" }),
  },
};

// 認証済みユーザー
export const AuthenticatedUser: Story = {
  args: {
    event: mockEvent,
    params: Promise.resolve({ locale: "ja", id: "event123" }),
  },
  parameters: {
    docs: {
      description: {
        story:
          "認証済みユーザーの場合、名前とメールアドレスの入力欄は表示されません。",
      },
    },
  },
};

// 時間枠選択済み
export const WithSelectedSlots: Story = {
  args: {
    event: mockEvent,
    params: Promise.resolve({ locale: "ja", id: "event123" }),
  },
};

// 長期間のイベント
export const LongPeriodEvent: Story = {
  args: {
    event: {
      ...mockEvent,
      name: Schema.decodeUnknownSync(NonEmptyString)("1ヶ月の長期プロジェクト"),
      description: "1ヶ月にわたるプロジェクトの定例会議の日程調整です。",
      dateRangeEnd: Schema.decodeUnknownSync(DateTimeString)(
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      ), // 30日後
    },
    params: Promise.resolve({ locale: "ja", id: "event123" }),
  },
};

// 15分刻みのイベント
export const FifteenMinuteSlots: Story = {
  args: {
    event: {
      ...mockEvent,
      name: Schema.decodeUnknownSync(NonEmptyString)("短時間ミーティング"),
      description: "15分刻みの短時間ミーティングです。",
      timeSlotDuration: 15,
    },
    params: Promise.resolve({ locale: "ja", id: "event123" }),
  },
};

// 1時間刻みのイベント
export const OneHourSlots: Story = {
  args: {
    event: {
      ...mockEvent,
      name: Schema.decodeUnknownSync(NonEmptyString)("ワークショップ"),
      description: "1時間単位のワークショップの日程調整です。",
      timeSlotDuration: 60,
    },
    params: Promise.resolve({ locale: "ja", id: "event123" }),
  },
};

// エラー状態（時間枠未選択）
export const ErrorNoSlotSelected: Story = {
  args: {
    event: mockEvent,
    params: Promise.resolve({ locale: "ja", id: "event123" }),
  },
};

// モバイル表示
export const MobileView: Story = {
  args: {
    event: mockEvent,
    params: Promise.resolve({ locale: "ja", id: "event123" }),
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
    event: mockEvent,
    params: Promise.resolve({ locale: "ja", id: "event123" }),
  },
  parameters: {
    viewport: {
      defaultViewport: "tablet",
    },
  },
};
