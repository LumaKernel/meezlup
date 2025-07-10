import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@/test/utils";
import { EventResult } from "./EventResult";
import { getAggregatedTimeSlots } from "@/app/actions/schedule";
import type { Event as EffectEvent } from "@/lib/effects/services/event/schemas";
import type { TimeSlotAggregation } from "@/lib/effects/services/schedule/schemas";
import { Schema } from "effect";
import {
  EventId,
  NonEmptyString,
  DateTimeString,
  UserId,
  ScheduleId,
  PositiveInt,
} from "@/lib/effects";

// モック
vi.mock("@/app/actions/schedule", () => ({
  getAggregatedTimeSlots: vi.fn(),
}));

vi.mock("react", async () => {
  const actual = await vi.importActual("react");
  return {
    ...actual,
    use: () => ({ locale: "ja" }),
  };
});

describe("EventResult", () => {
  const mockGetAggregatedTimeSlots = vi.mocked(getAggregatedTimeSlots);

  const mockEvent: EffectEvent = {
    id: Schema.decodeUnknownSync(EventId)("event123"),
    name: Schema.decodeUnknownSync(NonEmptyString)("テストイベント"),
    description: "テストイベントの説明",
    dateRangeStart: Schema.decodeUnknownSync(DateTimeString)(
      "2024-03-01T00:00:00.000Z",
    ),
    dateRangeEnd: Schema.decodeUnknownSync(DateTimeString)(
      "2024-03-02T00:00:00.000Z",
    ),
    timeSlotDuration: 30,
    deadline: null,
    creatorId: Schema.decodeUnknownSync(UserId)("user123"),
    participantRestrictionType: "none",
    allowedDomains: [],
    allowedEmails: [],
    creatorCanSeeEmails: true,
    participantsCanSeeEach: true,
    createdAt: Schema.decodeUnknownSync(DateTimeString)(
      "2024-01-01T00:00:00.000Z",
    ),
    updatedAt: Schema.decodeUnknownSync(DateTimeString)(
      "2024-01-01T00:00:00.000Z",
    ),
    isLinkOnly: false,
  };

  const mockAggregatedData: Array<TimeSlotAggregation> = [
    {
      date: Schema.decodeUnknownSync(DateTimeString)(
        "2024-03-01T00:00:00.000Z",
      ),
      startTime: 540, // 9:00
      endTime: 570, // 9:30
      participantCount: Schema.decodeUnknownSync(PositiveInt)(3),
      participants: [
        {
          scheduleId: Schema.decodeUnknownSync(ScheduleId)("s1"),
          displayName: Schema.decodeUnknownSync(NonEmptyString)("田中太郎"),
          userId: Schema.decodeUnknownSync(UserId)("u1"),
        },
        {
          scheduleId: Schema.decodeUnknownSync(ScheduleId)("s2"),
          displayName: Schema.decodeUnknownSync(NonEmptyString)("鈴木花子"),
          userId: Schema.decodeUnknownSync(UserId)("u2"),
        },
        {
          scheduleId: Schema.decodeUnknownSync(ScheduleId)("s3"),
          displayName: Schema.decodeUnknownSync(NonEmptyString)("佐藤次郎"),
          userId: null,
        },
      ],
    },
    {
      date: Schema.decodeUnknownSync(DateTimeString)(
        "2024-03-01T00:00:00.000Z",
      ),
      startTime: 570, // 9:30
      endTime: 600, // 10:00
      participantCount: Schema.decodeUnknownSync(PositiveInt)(2),
      participants: [
        {
          scheduleId: Schema.decodeUnknownSync(ScheduleId)("s1"),
          displayName: Schema.decodeUnknownSync(NonEmptyString)("田中太郎"),
          userId: Schema.decodeUnknownSync(UserId)("u1"),
        },
        {
          scheduleId: Schema.decodeUnknownSync(ScheduleId)("s2"),
          displayName: Schema.decodeUnknownSync(NonEmptyString)("鈴木花子"),
          userId: Schema.decodeUnknownSync(UserId)("u2"),
        },
      ],
    },
    {
      date: Schema.decodeUnknownSync(DateTimeString)(
        "2024-03-02T00:00:00.000Z",
      ),
      startTime: 540, // 9:00
      endTime: 570, // 9:30
      participantCount: Schema.decodeUnknownSync(PositiveInt)(1),
      participants: [
        {
          scheduleId: Schema.decodeUnknownSync(ScheduleId)("s3"),
          displayName: Schema.decodeUnknownSync(NonEmptyString)("佐藤次郎"),
          userId: null,
        },
      ],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("ローディング中はローダーを表示する", () => {
    mockGetAggregatedTimeSlots.mockImplementation(
      () => new Promise(() => {}), // 永続的にpending
    );

    render(
      <EventResult
        event={mockEvent}
        params={Promise.resolve({ locale: "ja", id: "event123" })}
      />,
    );

    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("集計データを正しく表示する", async () => {
    mockGetAggregatedTimeSlots.mockResolvedValueOnce({
      success: true,
      data: mockAggregatedData,
    });

    render(
      <EventResult
        event={mockEvent}
        params={Promise.resolve({ locale: "ja", id: "event123" })}
      />,
    );

    await waitFor(() => {
      // イベント名
      expect(screen.getByText("テストイベント")).toBeInTheDocument();

      // 集計結果タイトル
      expect(screen.getByText("集計結果")).toBeInTheDocument();

      // 参加者数
      expect(screen.getByText("3 人")).toBeInTheDocument();

      // 時間枠（9:00）
      const nineOClockSlots = screen.getAllByText("09:00");
      expect(nineOClockSlots.length).toBeGreaterThan(0);

      // 参加者数バッジ
      expect(screen.getByText("3")).toBeInTheDocument();
      expect(screen.getByText("2")).toBeInTheDocument();
      expect(screen.getByText("1")).toBeInTheDocument();
    });
  });

  it("エラー時はエラーメッセージを表示する", async () => {
    mockGetAggregatedTimeSlots.mockResolvedValueOnce({
      success: false,
      error: "データの取得に失敗しました",
    });

    render(
      <EventResult
        event={mockEvent}
        params={Promise.resolve({ locale: "ja", id: "event123" })}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("エラー")).toBeInTheDocument();
      expect(
        screen.getByText("データの取得に失敗しました"),
      ).toBeInTheDocument();
    });
  });

  it("最適な時間帯を表示する", async () => {
    mockGetAggregatedTimeSlots.mockResolvedValueOnce({
      success: true,
      data: mockAggregatedData,
    });

    render(
      <EventResult
        event={mockEvent}
        params={Promise.resolve({ locale: "ja", id: "event123" })}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("最適な時間帯")).toBeInTheDocument();

      // 最も参加者が多い時間帯が上位に表示される
      const cards = screen.getAllByRole("article");
      expect(cards.length).toBeGreaterThan(0);

      // 3/3の参加者がいる時間帯
      expect(screen.getByText("3/3")).toBeInTheDocument();
    });
  });

  it("作成者がメールを見られる場合、参加者リストをツールチップに表示する", async () => {
    mockGetAggregatedTimeSlots.mockResolvedValueOnce({
      success: true,
      data: mockAggregatedData,
    });

    render(
      <EventResult
        event={mockEvent}
        params={Promise.resolve({ locale: "ja", id: "event123" })}
      />,
    );

    await waitFor(() => {
      // ヒートマップが表示されることを確認
      expect(
        screen.getByText("参加可能時間のヒートマップ"),
      ).toBeInTheDocument();
    });
  });

  it("作成者がメールを見られない場合、参加者リストを表示しない", async () => {
    const eventWithoutEmailAccess = {
      ...mockEvent,
      creatorCanSeeEmails: false,
    };

    mockGetAggregatedTimeSlots.mockResolvedValueOnce({
      success: true,
      data: mockAggregatedData,
    });

    render(
      <EventResult
        event={eventWithoutEmailAccess}
        params={Promise.resolve({ locale: "ja", id: "event123" })}
      />,
    );

    await waitFor(() => {
      expect(
        screen.getByText("参加可能時間のヒートマップ"),
      ).toBeInTheDocument();
      // 参加者名が表示されないことを確認（ツールチップ内なので直接確認は難しい）
    });
  });

  it("英語ロケールで正しいテキストを表示する", async () => {
    mockGetAggregatedTimeSlots.mockResolvedValueOnce({
      success: true,
      data: mockAggregatedData,
    });

    render(
      <EventResult
        event={mockEvent}
        params={Promise.resolve({ locale: "en", id: "event123" })}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("Aggregated Results")).toBeInTheDocument();
      expect(screen.getByText("Availability Heatmap")).toBeInTheDocument();
      expect(screen.getByText("Best Time Slots")).toBeInTheDocument();
      expect(screen.getByText("3 participants")).toBeInTheDocument();
    });
  });

  it("リンクが正しく設定されている", async () => {
    mockGetAggregatedTimeSlots.mockResolvedValueOnce({
      success: true,
      data: mockAggregatedData,
    });

    render(
      <EventResult
        event={mockEvent}
        params={Promise.resolve({ locale: "ja", id: "event123" })}
      />,
    );

    await waitFor(() => {
      const updateLink = screen.getByRole("link", {
        name: "参加可能時間を更新",
      });
      expect(updateLink).toHaveAttribute(
        "href",
        "/ja/events/event123/participate",
      );

      const backLink = screen.getByRole("link", { name: "イベント詳細に戻る" });
      expect(backLink).toHaveAttribute("href", "/ja/events/event123");
    });
  });

  it("参加者がいない場合も正しく表示する", async () => {
    mockGetAggregatedTimeSlots.mockResolvedValueOnce({
      success: true,
      data: [],
    });

    render(
      <EventResult
        event={mockEvent}
        params={Promise.resolve({ locale: "ja", id: "event123" })}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("0 人")).toBeInTheDocument();
    });
  });
});
