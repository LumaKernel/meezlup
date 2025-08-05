import { describe, it, expect, vi } from "vitest";
import { renderWithProviders } from "@/test/providers";
import { useActions } from "./actions";
import { consumePromise } from "@/lib/utils/promise";

// テスト用コンポーネント
function TestComponent() {
  const actions = useActions();

  return (
    <div>
      <button
        onClick={() => {
          consumePromise(actions.event.create({ name: "Test Event" }));
        }}
      >
        Create Event
      </button>
      <button
        onClick={() => {
          consumePromise(actions.schedule.submit({ eventId: "123" }));
        }}
      >
        Submit Schedule
      </button>
    </div>
  );
}

describe("ActionsProvider", () => {
  it("カスタムアクション関数を提供できる", () => {
    const mockCreateEvent = vi.fn().mockResolvedValue({
      success: true,
      data: { id: "event123" },
    });

    const mockSubmitSchedule = vi.fn().mockResolvedValue({
      success: true,
      data: { scheduleId: "schedule123" },
    });

    const { getByText } = renderWithProviders(<TestComponent />, {
      actions: {
        event: {
          create: mockCreateEvent,
        },
        schedule: {
          submit: mockSubmitSchedule,
        },
      },
    });

    // Create Event のテスト
    getByText("Create Event").click();
    expect(mockCreateEvent).toHaveBeenCalledWith({ name: "Test Event" });

    // Submit Schedule のテスト
    getByText("Submit Schedule").click();
    expect(mockSubmitSchedule).toHaveBeenCalledWith({ eventId: "123" });
  });
});
