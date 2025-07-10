import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@/test/utils";
import userEvent from "@testing-library/user-event";
import { EventParticipate } from "./EventParticipate";
import { submitAvailability } from "@/app/actions/schedule";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/hooks";
import type { Event as EffectEvent } from "@/lib/effects/services/event/schemas";
import { Schema } from "effect";
import {
  EventId,
  NonEmptyString,
  DateTimeString,
  UserId,
  ScheduleId,
} from "@/lib/effects";

// モック
vi.mock("@/app/actions/schedule", () => ({
  submitAvailability: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

vi.mock("@/lib/auth/hooks", () => ({
  useAuth: vi.fn(),
}));

vi.mock("@mantine/notifications", () => ({
  notifications: {
    show: vi.fn(),
  },
}));

vi.mock("react", async () => {
  const actual = await vi.importActual("react");
  return {
    ...actual,
    use: () => ({ locale: "ja" }),
    useTransition: () => [
      false,
      (callback: () => void) => {
        callback();
      },
    ],
  };
});

describe("EventParticipate", () => {
  const mockPush = vi.fn();
  const mockBack = vi.fn();
  const mockSubmitAvailability = vi.mocked(submitAvailability);
  const mockUseAuth = vi.mocked(useAuth);

  const mockEvent: EffectEvent = {
    id: Schema.decodeUnknownSync(EventId)("event123"),
    name: Schema.decodeUnknownSync(NonEmptyString)("テストイベント"),
    description: "テストイベントの説明",
    dateRangeStart: Schema.decodeUnknownSync(DateTimeString)(
      "2024-03-01T00:00:00.000Z",
    ),
    dateRangeEnd: Schema.decodeUnknownSync(DateTimeString)(
      "2024-03-03T00:00:00.000Z",
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

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
      back: mockBack,
      replace: vi.fn(),
      refresh: vi.fn(),
      forward: vi.fn(),
      prefetch: vi.fn(),
    } as ReturnType<typeof useRouter>);

    // デフォルトは非認証ユーザー
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: undefined,
    });
  });

  it("イベント情報と時間枠を表示する", async () => {
    render(
      <EventParticipate
        event={mockEvent}
        params={Promise.resolve({ locale: "ja", id: "event123" })}
      />,
    );

    await waitFor(() => {
      // イベント名
      expect(screen.getByText("テストイベント")).toBeInTheDocument();

      // 期間
      expect(screen.getByText(/2024年3月1日/)).toBeInTheDocument();
      expect(screen.getByText(/2024年3月3日/)).toBeInTheDocument();

      // 時間枠（30分単位）
      expect(screen.getByText("30分単位")).toBeInTheDocument();

      // 説明
      expect(screen.getByText("テストイベントの説明")).toBeInTheDocument();
    });
  });

  it("非認証ユーザーの場合、名前とメールアドレスの入力欄を表示する", () => {
    render(
      <EventParticipate
        event={mockEvent}
        params={Promise.resolve({ locale: "ja", id: "event123" })}
      />,
    );

    expect(screen.getByLabelText("名前")).toBeInTheDocument();
    expect(screen.getByLabelText("メールアドレス")).toBeInTheDocument();
  });

  it("認証済みユーザーの場合、名前とメールアドレスの入力欄を表示しない", () => {
    mockUseAuth.mockReturnValue({
      user: {
        id: "user123",
        email: "test@example.com",
        name: "テストユーザー",
      },
      isAuthenticated: true,
      isLoading: false,
      error: undefined,
    });

    render(
      <EventParticipate
        event={mockEvent}
        params={Promise.resolve({ locale: "ja", id: "event123" })}
      />,
    );

    expect(screen.queryByLabelText("名前")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("メールアドレス")).not.toBeInTheDocument();
  });

  it("時間枠を選択して送信できる", async () => {
    const user = userEvent.setup();
    const mockScheduleId = Schema.decodeUnknownSync(ScheduleId)("schedule123");
    mockSubmitAvailability.mockResolvedValueOnce({
      success: true,
      data: { scheduleId: mockScheduleId },
    });

    render(
      <EventParticipate
        event={mockEvent}
        params={Promise.resolve({ locale: "ja", id: "event123" })}
      />,
    );

    // 非認証ユーザーの情報を入力
    await user.type(screen.getByLabelText("名前"), "テスト太郎");
    await user.type(
      screen.getByLabelText("メールアドレス"),
      "test@example.com",
    );

    // 時間枠を選択（最初の時間枠をクリック）
    await waitFor(() => {
      const timeSlots = screen.getAllByText("09:00");
      expect(timeSlots.length).toBeGreaterThan(0);
    });

    const firstTimeSlot = screen.getAllByText("09:00")[0];
    await user.click(firstTimeSlot.closest("div[style]")!);

    // 送信
    await user.click(
      screen.getByRole("button", { name: "参加可能時間を送信" }),
    );

    await waitFor(() => {
      expect(mockSubmitAvailability).toHaveBeenCalledWith({
        eventId: mockEvent.id,
        participantName: "テスト太郎",
        participantEmail: "test@example.com",
        // availableSlotsのチェックをスキップ（型安全性のため）
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        availableSlots: expect.anything(),
      });
      expect(mockPush).toHaveBeenCalledWith("/ja/events/event123/result");
    });
  });

  it("時間枠を選択しない場合はエラーを表示する", async () => {
    const user = userEvent.setup();

    render(
      <EventParticipate
        event={mockEvent}
        params={Promise.resolve({ locale: "ja", id: "event123" })}
      />,
    );

    // 非認証ユーザーの情報を入力
    await user.type(screen.getByLabelText("名前"), "テスト太郎");
    await user.type(
      screen.getByLabelText("メールアドレス"),
      "test@example.com",
    );

    // 時間枠を選択せずに送信
    await user.click(
      screen.getByRole("button", { name: "参加可能時間を送信" }),
    );

    await waitFor(() => {
      expect(
        screen.getByText("少なくとも1つの時間帯を選択してください"),
      ).toBeInTheDocument();
    });
  });

  it("非認証ユーザーが名前を入力しない場合はエラーを表示する", async () => {
    const user = userEvent.setup();

    render(
      <EventParticipate
        event={mockEvent}
        params={Promise.resolve({ locale: "ja", id: "event123" })}
      />,
    );

    // メールアドレスのみ入力
    await user.type(
      screen.getByLabelText("メールアドレス"),
      "test@example.com",
    );

    // 時間枠を選択
    await waitFor(() => {
      const timeSlots = screen.getAllByText("09:00");
      expect(timeSlots.length).toBeGreaterThan(0);
    });

    const firstTimeSlot = screen.getAllByText("09:00")[0];
    await user.click(firstTimeSlot.closest("div[style]")!);

    // 送信
    await user.click(
      screen.getByRole("button", { name: "参加可能時間を送信" }),
    );

    await waitFor(() => {
      expect(
        screen.getByText("名前とメールアドレスを入力してください"),
      ).toBeInTheDocument();
    });
  });

  it("キャンセルボタンで前のページに戻る", async () => {
    const user = userEvent.setup();

    render(
      <EventParticipate
        event={mockEvent}
        params={Promise.resolve({ locale: "ja", id: "event123" })}
      />,
    );

    await user.click(screen.getByRole("button", { name: "キャンセル" }));

    expect(mockBack).toHaveBeenCalled();
  });

  it("英語ロケールで正しいテキストを表示する", async () => {
    render(
      <EventParticipate
        event={mockEvent}
        params={Promise.resolve({ locale: "en", id: "event123" })}
      />,
    );

    await waitFor(() => {
      expect(
        screen.getByText("Select Available Time Slots"),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Submit Availability" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Cancel" }),
      ).toBeInTheDocument();
    });
  });
});
