import type { Meta, StoryObj } from "@storybook/react";
import { EventResult } from "./EventResult";
import type { Event as EffectEvent } from "@/lib/effects/services/event/schemas";
import { Schema } from "effect";
import { EventId, NonEmptyString, DateTimeString, UserId } from "@/lib/effects";

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

// モックデータ生成関数は不要なので削除

// 多くの参加者がいる場合
export const ManyParticipants: Story = {
  args: {
    event: mockEvent,
    params: Promise.resolve({ locale: "ja", id: "event123" }),
  },
  parameters: {
    docs: {
      description: {
        story:
          "多くの参加者がいる場合の表示例です。実際の動作では、Server Actionからデータを取得します。",
      },
    },
  },
};

// 少数の参加者
export const FewParticipants: Story = {
  args: {
    event: mockEvent,
    params: Promise.resolve({ locale: "ja", id: "event123" }),
  },
  parameters: {
    docs: {
      description: {
        story:
          "少数の参加者がいる場合の表示例です。実際の動作では、Server Actionからデータを取得します。",
      },
    },
  },
};

// 参加者なし
export const NoParticipants: Story = {
  args: {
    event: mockEvent,
    params: Promise.resolve({ locale: "ja", id: "event123" }),
  },
  parameters: {
    docs: {
      description: {
        story:
          "参加者がいない場合の表示例です。実際の動作では、Server Actionからデータを取得します。",
      },
    },
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
    docs: {
      description: {
        story:
          "英語表示での表示例です。実際の動作では、Server Actionからデータを取得します。",
      },
    },
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
    docs: {
      description: {
        story:
          "メールアドレスが非表示の場合の表示例です。実際の動作では、Server Actionからデータを取得します。",
      },
    },
  },
};

// ローディング状態
export const Loading: Story = {
  args: {
    event: mockEvent,
    params: Promise.resolve({ locale: "ja", id: "event123" }),
  },
  parameters: {
    docs: {
      description: {
        story:
          "データ読み込み中の表示例です。実際の動作では、Server Actionからデータを取得します。",
      },
    },
  },
};

// エラー状態
export const Error: Story = {
  args: {
    event: mockEvent,
    params: Promise.resolve({ locale: "ja", id: "event123" }),
  },
  parameters: {
    docs: {
      description: {
        story:
          "エラーが発生した場合の表示例です。実際の動作では、Server Actionからデータを取得します。",
      },
    },
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
    docs: {
      description: {
        story:
          "長期間のイベントで多数の結果がある場合の表示例です。実際の動作では、Server Actionからデータを取得します。",
      },
    },
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
    docs: {
      description: {
        story:
          "モバイル端末での表示例です。実際の動作では、Server Actionからデータを取得します。",
      },
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
    docs: {
      description: {
        story:
          "タブレット端末での表示例です。実際の動作では、Server Actionからデータを取得します。",
      },
    },
  },
};
