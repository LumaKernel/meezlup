import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@/test/utils";
import userEvent from "@testing-library/user-event";
import { EventCreateForm } from "./EventCreateForm";
import { createEventAction } from "@/app/actions/event";
import { useRouter } from "next/navigation";
import { Schema } from "effect";
import { EventId } from "@/lib/effects";

// モック
vi.mock("@/app/actions/event", () => ({
  createEventAction: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
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
    startTransition: (callback: () => void) => {
      callback();
    },
  };
});

describe("EventCreateForm", () => {
  const mockPush = vi.fn();
  const mockCreateEventAction = vi.mocked(createEventAction);

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
      replace: vi.fn(),
      refresh: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      prefetch: vi.fn(),
    } as ReturnType<typeof useRouter>);
  });

  it("必須フィールドをレンダリングする", () => {
    render(<EventCreateForm params={Promise.resolve({ locale: "ja" })} />);

    expect(screen.getByLabelText("イベント名")).toBeInTheDocument();
    expect(screen.getByLabelText("詳細説明")).toBeInTheDocument();
    expect(screen.getByLabelText("開催期間")).toBeInTheDocument();
    expect(screen.getByLabelText("時間帯の幅")).toBeInTheDocument();
    expect(screen.getByLabelText("公開設定")).toBeInTheDocument();
  });

  it("英語ロケールで正しいラベルを表示する", async () => {
    const params = Promise.resolve({ locale: "en" });
    render(<EventCreateForm params={params} />);

    await waitFor(() => {
      expect(screen.getByLabelText("Event Name")).toBeInTheDocument();
      expect(screen.getByLabelText("Description")).toBeInTheDocument();
      expect(screen.getByLabelText("Event Period")).toBeInTheDocument();
      expect(screen.getByLabelText("Time Slot Duration")).toBeInTheDocument();
      expect(screen.getByLabelText("Privacy Settings")).toBeInTheDocument();
    });
  });

  it("フォームを正常に送信する", async () => {
    const user = userEvent.setup();
    const mockEventId = Schema.decodeUnknownSync(EventId)("event123");
    mockCreateEventAction.mockResolvedValueOnce({
      success: true,
      data: { eventId: mockEventId },
    });

    render(<EventCreateForm params={Promise.resolve({ locale: "ja" })} />);

    // フォームに入力
    await user.type(screen.getByLabelText("イベント名"), "テストイベント");
    await user.type(
      screen.getByLabelText("詳細説明"),
      "これはテストイベントです",
    );

    // 時間帯の幅を選択 (Selectコンポーネントは入力フィールドとして扱う)
    const durationInput = screen.getByRole("combobox", { name: "時間帯の幅" });
    await user.click(durationInput);
    await user.click(screen.getByText("30分"));

    // 公開設定を選択
    const permissionInput = screen.getByRole("combobox", { name: "公開設定" });
    await user.click(permissionInput);
    await user.click(screen.getByText("ログインユーザーのみ"));

    // 送信
    await user.click(screen.getByRole("button", { name: "イベントを作成" }));

    await waitFor(() => {
      expect(mockCreateEventAction).toHaveBeenCalledWith({
        name: "テストイベント",
        description: "これはテストイベントです",
        // dateRangeのチェックをスキップ（型安全性のため）
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        dateRange: expect.anything(),
        timeSlotDuration: 30,
        changeDeadline: undefined,
        permission: "login",
      });
      expect(mockPush).toHaveBeenCalledWith(
        `/ja/events/${mockEventId satisfies string}`,
      );
    });
  });

  it("エラー時にエラーメッセージを表示する", async () => {
    const user = userEvent.setup();
    mockCreateEventAction.mockResolvedValueOnce({
      success: false,
      error: "イベント作成に失敗しました",
    });

    render(<EventCreateForm params={Promise.resolve({ locale: "ja" })} />);

    // 最小限の入力
    await user.type(screen.getByLabelText("イベント名"), "テストイベント");
    const durationInput = screen.getByRole("combobox", { name: "時間帯の幅" });
    await user.click(durationInput);
    await user.click(screen.getByText("30分"));

    // 送信
    await user.click(screen.getByRole("button", { name: "イベントを作成" }));

    await waitFor(() => {
      expect(
        screen.getByText("イベント作成に失敗しました"),
      ).toBeInTheDocument();
    });
  });

  it("必須フィールドが空の場合は送信しない", async () => {
    const user = userEvent.setup();
    render(<EventCreateForm params={Promise.resolve({ locale: "ja" })} />);

    // 名前を入力せずに送信
    await user.click(screen.getByRole("button", { name: "イベントを作成" }));

    expect(mockCreateEventAction).not.toHaveBeenCalled();
  });

  it("送信中はボタンを無効化する", async () => {
    const user = userEvent.setup();
    let resolvePromise:
      | ((value: Awaited<ReturnType<typeof createEventAction>>) => void)
      | undefined;
    const promise = new Promise<Awaited<ReturnType<typeof createEventAction>>>(
      (resolve) => {
        resolvePromise = resolve;
      },
    );
    mockCreateEventAction.mockReturnValueOnce(promise);

    render(<EventCreateForm params={Promise.resolve({ locale: "ja" })} />);

    // フォームに入力
    await user.type(screen.getByLabelText("イベント名"), "テストイベント");
    const durationInput = screen.getByRole("combobox", { name: "時間帯の幅" });
    await user.click(durationInput);
    await user.click(screen.getByText("30分"));

    const submitButton = screen.getByRole("button", { name: "イベントを作成" });

    // 送信
    await user.click(submitButton);

    // ボタンが無効化されていることを確認
    expect(submitButton).toBeDisabled();

    // Promiseを解決
    const mockEventId = Schema.decodeUnknownSync(EventId)("event123");
    if (resolvePromise) {
      resolvePromise({ success: true, data: { eventId: mockEventId } });
    }

    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
  });
});
