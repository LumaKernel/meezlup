import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useEventCreation } from "./use-event-creation";
import { Temporal } from "temporal-polyfill";
import { Schema } from "effect";
import { EventId } from "@/lib/effects";
import React, { type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MantineProvider } from "@mantine/core";
import { I18nextProvider } from "react-i18next";
import i18n from "i18next";
import { NavigationProvider, ActionsProvider } from "@/lib/providers";
import type { NavigationContext, ActionsContext } from "@/lib/providers";
// import { EventFactory } from "@/test/factories"; - not used

// i18next setup
const testI18n = i18n.createInstance();
// eslint-disable-next-line @typescript-eslint/no-floating-promises
testI18n.init({
  lng: "ja",
  fallbackLng: "ja",
  resources: {
    ja: {
      event: {
        create: {
          eventNameRequired: "イベント名は必須です",
          eventNameMaxLength: "イベント名は100文字以内で入力してください",
          descriptionMaxLength: "説明は1000文字以内で入力してください",
          dateRangeInvalid: "終了日は開始日以降にしてください",
          maxParticipantsMin: "参加人数は1人以上で設定してください",
          error: "エラーが発生しました",
          unexpectedError: "予期しないエラーが発生しました",
        },
      },
    },
  },
});

describe("useEventCreation", () => {
  const mockPush = vi.fn();
  const mockCreate = vi.fn();

  const createWrapper = () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    const navigation: NavigationContext = {
      push: mockPush,
      replace: vi.fn(),
      back: vi.fn(),
      refresh: vi.fn(),
      params: {},
    };

    const actions: ActionsContext = {
      event: {
        create: mockCreate,
        update: vi.fn(),
        delete: vi.fn(),
        get: vi.fn(),
      },
      schedule: {
        create: vi.fn(),
        update: vi.fn(),
        submit: vi.fn(),
        getAggregated: vi.fn(),
        getByEvent: vi.fn(),
        getByEventAndUser: vi.fn(),
        delete: vi.fn(),
      },
    };

    return ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        <I18nextProvider i18n={testI18n}>
          <MantineProvider>
            <NavigationProvider value={navigation}>
              <ActionsProvider value={actions}>
                {children}
              </ActionsProvider>
            </NavigationProvider>
          </MantineProvider>
        </I18nextProvider>
      </QueryClientProvider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("初期状態が正しい", () => {
    const { result } = renderHook(() => useEventCreation("ja"), { wrapper: createWrapper() });

    expect(result.current.formData).toEqual({
      name: "",
      description: "",
      timeSlotDuration: 30,
      permission: "link-only",
      dateRange: undefined,
      changeDeadline: undefined,
      maxParticipants: undefined,
    });
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.fieldErrors).toEqual({});
    expect(result.current.isFormValid).toBe(false);
  });

  it("フィールドの更新が正しく動作する", () => {
    const { result } = renderHook(() => useEventCreation("ja"), { wrapper: createWrapper() });

    act(() => {
      result.current.updateField("name", "テストイベント");
    });

    expect(result.current.formData.name).toBe("テストイベント");
  });

  it("名前フィールドのバリデーションが動作する", () => {
    const { result } = renderHook(() => useEventCreation("ja"), { wrapper: createWrapper() });

    // 空の名前
    act(() => {
      result.current.updateField("name", "");
    });
    expect(result.current.fieldErrors.name).toBe("イベント名は必須です");

    // 長すぎる名前
    act(() => {
      result.current.updateField("name", "a".repeat(101));
    });
    expect(result.current.fieldErrors.name).toBe("イベント名は100文字以内で入力してください");

    // 正しい名前
    act(() => {
      result.current.updateField("name", "正しい名前");
    });
    expect(result.current.fieldErrors.name).toBeUndefined();
  });

  it("日付範囲のバリデーションが動作する", () => {
    const { result } = renderHook(() => useEventCreation("ja"), { wrapper: createWrapper() });

    const startDate = Temporal.PlainDate.from("2024-03-10");
    const endDate = Temporal.PlainDate.from("2024-03-09"); // 開始日より前

    act(() => {
      result.current.updateField("dateRange", { start: startDate, end: endDate });
    });

    expect(result.current.fieldErrors.dateRange).toBe("終了日は開始日以降にしてください");

    // 正しい日付範囲
    act(() => {
      result.current.updateField("dateRange", { 
        start: startDate, 
        end: Temporal.PlainDate.from("2024-03-11") 
      });
    });

    expect(result.current.fieldErrors.dateRange).toBeUndefined();
  });

  it("フォームの有効性が正しく判定される", () => {
    const { result } = renderHook(() => useEventCreation("ja"), { wrapper: createWrapper() });

    expect(result.current.isFormValid).toBe(false);

    act(() => {
      result.current.updateField("name", "テストイベント");
      result.current.updateField("dateRange", {
        start: Temporal.PlainDate.from("2024-03-10"),
        end: Temporal.PlainDate.from("2024-03-11"),
      });
    });

    expect(result.current.isFormValid).toBe(true);
  });

  it("フォーム送信が成功した場合にナビゲートする", async () => {
    const mockEventId = Schema.decodeUnknownSync(EventId)("event123");
    mockCreate.mockResolvedValue({
      data: { eventId: mockEventId },
    });

    const { result } = renderHook(() => useEventCreation("ja"), { wrapper: createWrapper() });

    act(() => {
      result.current.updateField("name", "テストイベント");
      result.current.updateField("dateRange", {
        start: Temporal.PlainDate.from("2024-03-10"),
        end: Temporal.PlainDate.from("2024-03-11"),
      });
    });

    const event = { preventDefault: vi.fn() } as React.FormEvent;

    act(() => {
      result.current.handleSubmit(event);
    });

    expect(event.preventDefault).toHaveBeenCalled();
    expect(mockCreate).toHaveBeenCalledWith({
      name: "テストイベント",
      description: "",
      timeSlotDuration: 30,
      permission: "link-only",
      dateRange: {
        start: "2024-03-10",
        end: "2024-03-11",
      },
      changeDeadline: undefined,
      maxParticipants: undefined,
    });
    expect(mockPush).toHaveBeenCalledWith("/ja/events/event123");
  });

  it("フォーム送信が失敗した場合にエラーを表示する", async () => {
    mockCreate.mockResolvedValue({
      error: "イベント作成に失敗しました",
    });

    const { result } = renderHook(() => useEventCreation("ja"), { wrapper: createWrapper() });

    act(() => {
      result.current.updateField("name", "テストイベント");
      result.current.updateField("dateRange", {
        start: Temporal.PlainDate.from("2024-03-10"),
        end: Temporal.PlainDate.from("2024-03-11"),
      });
    });

    const event = { preventDefault: vi.fn() } as React.FormEvent;

    act(() => {
      result.current.handleSubmit(event);
    });

    expect(result.current.error).toBe("イベント作成に失敗しました");
    expect(result.current.isSubmitting).toBe(false);
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("無効なフォームでは送信されない", async () => {
    const { result } = renderHook(() => useEventCreation("ja"), { wrapper: createWrapper() });

    const event = { preventDefault: vi.fn() } as React.FormEvent;

    act(() => {
      result.current.handleSubmit(event);
    });

    expect(mockCreate).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });
});