import { describe, it, expect, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { server } from "@/test/mocks/server";
import { http, HttpResponse } from "msw";
import { AllTheProviders } from "@/test/providers";
import { EventResult } from "./EventResult";
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

// テスト用のラッパーコンポーネント
function TestWrapper({ children }: { children: React.ReactNode }) {
  return <AllTheProviders>{children}</AllTheProviders>;
}

describe("EventResult", () => {
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
          scheduleId: Schema.decodeUnknownSync(ScheduleId)("s4"),
          displayName: Schema.decodeUnknownSync(NonEmptyString)("山田四郎"),
          userId: null,
        },
      ],
    },
  ];

  afterEach(() => {
    server.resetHandlers();
  });

  it("ローディング中はローダーを表示する", () => {
    // MSWで遅延レスポンスを設定してローディング状態をシミュレート
    server.use(
      http.post("/api/schedules/aggregate", async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return HttpResponse.json({
          success: true,
          data: [],
        });
      })
    );

    render(
      <TestWrapper>
        <EventResult
          event={mockEvent}
          params={Promise.resolve({ locale: "ja", id: "event123" })}
        />
      </TestWrapper>
    );

    // MantineのLoaderを確認
    const loader = document.querySelector(".mantine-Loader-root");
    expect(loader).toBeInTheDocument();
  });

  it("集計データを正しく表示する", async () => {
    // MSWで集計データを返す
    server.use(
      http.post("/api/schedules/aggregate", () => {
        return HttpResponse.json({
          success: true,
          data: mockAggregatedData,
        });
      })
    );

    render(
      <TestWrapper>
        <EventResult
          event={mockEvent}
          params={Promise.resolve({ locale: "ja", id: "event123" })}
        />
      </TestWrapper>
    );

    // タイトルが表示されるのを待つ
    await waitFor(() => {
      expect(screen.getByText("テストイベント")).toBeInTheDocument();
    });

    // 集計結果が表示される
    expect(screen.getByText("集計結果")).toBeInTheDocument();
    expect(screen.getByText("空き状況ヒートマップ")).toBeInTheDocument();
    expect(screen.getByText("最適な時間帯")).toBeInTheDocument();
  });

  it("エラー時はエラーメッセージを表示する", async () => {
    // MSWでエラーレスポンスを設定
    server.use(
      http.post("/api/schedules/aggregate", () => {
        return HttpResponse.json(
          { success: false, error: "データの取得に失敗しました" },
          { status: 500 }
        );
      })
    );

    render(
      <TestWrapper>
        <EventResult
          event={mockEvent}
          params={Promise.resolve({ locale: "ja", id: "event123" })}
        />
      </TestWrapper>
    );

    // エラーメッセージが表示されるのを待つ
    await waitFor(() => {
      expect(screen.getByText("エラー")).toBeInTheDocument();
      expect(screen.getByText("データの取得に失敗しました")).toBeInTheDocument();
    });
  });

  it("最適な時間帯を表示する", async () => {
    // MSWで集計データを返す
    server.use(
      http.post("/api/schedules/aggregate", () => {
        return HttpResponse.json({
          success: true,
          data: mockAggregatedData,
        });
      })
    );

    render(
      <TestWrapper>
        <EventResult
          event={mockEvent}
          params={Promise.resolve({ locale: "ja", id: "event123" })}
        />
      </TestWrapper>
    );

    // 最適な時間帯が表示されるのを待つ
    await waitFor(() => {
      expect(screen.getByText("最適な時間帯")).toBeInTheDocument();
      // 参加者数が最も多い時間帯が表示される
      expect(screen.getByText("3人が参加可能")).toBeInTheDocument();
    });
  });

  it("作成者がメールを見られる場合、参加者リストをツールチップに表示する", async () => {
    // MSWで集計データを返す
    server.use(
      http.post("/api/schedules/aggregate", () => {
        return HttpResponse.json({
          success: true,
          data: mockAggregatedData,
        });
      })
    );

    render(
      <TestWrapper>
        <EventResult
          event={mockEvent}
          params={Promise.resolve({ locale: "ja", id: "event123" })}
        />
      </TestWrapper>
    );

    // ツールチップが表示されることを確認
    await waitFor(() => {
      expect(screen.getByText("田中太郎")).toBeInTheDocument();
      expect(screen.getByText("鈴木花子")).toBeInTheDocument();
    });
  });

  it("作成者がメールを見られない場合、参加者リストを表示しない", async () => {
    const eventWithoutEmailVisibility = {
      ...mockEvent,
      creatorCanSeeEmails: false,
    };

    // MSWで集計データを返す
    server.use(
      http.post("/api/schedules/aggregate", () => {
        return HttpResponse.json({
          success: true,
          data: mockAggregatedData,
        });
      })
    );

    render(
      <TestWrapper>
        <EventResult
          event={eventWithoutEmailVisibility}
          params={Promise.resolve({ locale: "ja", id: "event123" })}
        />
      </TestWrapper>
    );

    // 参加者名が表示されないことを確認
    await waitFor(() => {
      expect(screen.getByText("集計結果")).toBeInTheDocument();
    });

    expect(screen.queryByText("田中太郎")).not.toBeInTheDocument();
    expect(screen.queryByText("鈴木花子")).not.toBeInTheDocument();
  });

  it("英語ロケールで正しいテキストを表示する", async () => {
    // MSWで集計データを返す
    server.use(
      http.post("/api/schedules/aggregate", () => {
        return HttpResponse.json({
          success: true,
          data: mockAggregatedData,
        });
      })
    );

    render(
      <TestWrapper>
        <EventResult
          event={mockEvent}
          params={Promise.resolve({ locale: "en", id: "event123" })}
        />
      </TestWrapper>
    );

    // 英語のテキストが表示されるのを待つ
    await waitFor(() => {
      expect(screen.getByText("Aggregated Results")).toBeInTheDocument();
      expect(screen.getByText("Availability Heatmap")).toBeInTheDocument();
      expect(screen.getByText("Best Time Slots")).toBeInTheDocument();
    });
  });

  it("リンクが正しく設定されている", async () => {
    // MSWで集計データを返す
    server.use(
      http.post("/api/schedules/aggregate", () => {
        return HttpResponse.json({
          success: true,
          data: mockAggregatedData,
        });
      })
    );

    render(
      <TestWrapper>
        <EventResult
          event={mockEvent}
          params={Promise.resolve({ locale: "ja", id: "event123" })}
        />
      </TestWrapper>
    );

    // リンクが表示されるのを待つ
    await waitFor(() => {
      const participateLink = screen.getByText("空き状況を更新").closest("a");
      expect(participateLink).toHaveAttribute("href", "/ja/events/event123/participate");

      const eventDetailLink = screen.getByText("イベント詳細に戻る").closest("a");
      expect(eventDetailLink).toHaveAttribute("href", "/ja/events/event123");
    });
  });

  it("参加者がいない場合も正しく表示する", async () => {
    // MSWで空のデータを返す
    server.use(
      http.post("/api/schedules/aggregate", () => {
        return HttpResponse.json({
          success: true,
          data: [],
        });
      })
    );

    render(
      <TestWrapper>
        <EventResult
          event={mockEvent}
          params={Promise.resolve({ locale: "ja", id: "event123" })}
        />
      </TestWrapper>
    );

    // 参加者がいないメッセージが表示されるのを待つ
    await waitFor(() => {
      expect(screen.getByText("集計結果")).toBeInTheDocument();
    });
  });
});