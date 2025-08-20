import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MantineProvider } from "@mantine/core";
import { I18nextProvider } from "react-i18next";
import i18n from "@/lib/i18n/client";
import { Temporal } from "temporal-polyfill";
import { ScheduleInputLayout } from "./ScheduleInputLayout";

// URL.createObjectURLとURL.revokeObjectURLのモック
// eslint-disable-next-line @typescript-eslint/unbound-method
const originalCreateObjectURL = global.URL.createObjectURL;
// eslint-disable-next-line @typescript-eslint/unbound-method
const originalRevokeObjectURL = global.URL.revokeObjectURL;

beforeAll(() => {
  global.URL.createObjectURL = vi.fn(() => "blob:mock-url");
  global.URL.revokeObjectURL = vi.fn();
});

afterAll(() => {
  global.URL.createObjectURL = originalCreateObjectURL;
  global.URL.revokeObjectURL = originalRevokeObjectURL;
});

// テスト用のラッパーコンポーネント
function TestWrapper({ children }: { readonly children: React.ReactNode }) {
  return (
    <MantineProvider>
      <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
    </MantineProvider>
  );
}

// テスト用の参加者データ
const testParticipants = [
  {
    id: "1",
    name: "田中太郎",
    email: "tanaka@example.com",
    availableSlots: new Set([
      "2025-01-20_09:00:00",
      "2025-01-20_09:30:00",
      "2025-01-20_10:00:00",
    ]),
  },
  {
    id: "2",
    name: "鈴木花子",
    email: "suzuki@example.com",
    availableSlots: new Set([
      "2025-01-20_09:00:00",
      "2025-01-20_09:30:00",
      "2025-01-21_14:00:00",
    ]),
  },
];

// 基本的なプロパティ
const baseProps = {
  dateRangeStart: Temporal.PlainDate.from("2025-01-20"),
  dateRangeEnd: Temporal.PlainDate.from("2025-01-21"),
  timeSlotDuration: 30 as const,
  currentUserSlots: new Set<string>(),
  participants: testParticipants,
  onSlotsChange: vi.fn(),
  isAutoSaving: false,
  hasUnsavedChanges: false,
  showSavedIndicator: false,
  showEmails: false,
};

describe("ScheduleInputLayout", () => {
  describe("基本的な表示", () => {
    it("コンポーネントが正しくレンダリングされること", () => {
      render(
        <TestWrapper>
          <ScheduleInputLayout {...baseProps} />
        </TestWrapper>,
      );

      // タイトルが表示されることを確認
      expect(screen.getByText("参加可能時間を選択")).toBeInTheDocument();
      expect(screen.getByText("全体の参加可能状況")).toBeInTheDocument();
    });

    it("初期状態でモーダルが表示されないこと", () => {
      render(
        <TestWrapper>
          <ScheduleInputLayout {...baseProps} />
        </TestWrapper>,
      );

      // モーダルが表示されていないことを確認
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  describe("モーダル表示", () => {
    it("クリック時にモーダルが開くこと", async () => {
      render(
        <TestWrapper>
          <ScheduleInputLayout {...baseProps} />
        </TestWrapper>,
      );

      // 参加者がいるセルを探す
      const cellWith2Participants = screen.getAllByText("2")[0];

      // クリックをシミュレート
      fireEvent.click(cellWith2Participants.closest('[role="button"]')!);

      // モーダルが表示されることを確認
      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
        expect(screen.getByText("2人が参加可能")).toBeInTheDocument();
        expect(screen.getByText("田中太郎")).toBeInTheDocument();
        expect(screen.getByText("鈴木花子")).toBeInTheDocument();
      });
    });

    it("モーダルにダウンロードボタンが表示されること", async () => {
      render(
        <TestWrapper>
          <ScheduleInputLayout {...baseProps} />
        </TestWrapper>,
      );

      // 参加者がいるセルをクリック
      const cellWith2Participants = screen.getAllByText("2")[0];
      fireEvent.click(cellWith2Participants.closest('[role="button"]')!);

      // ダウンロードボタンが表示されることを確認
      await waitFor(() => {
        expect(screen.getByRole("button", { name: "CSV" })).toBeInTheDocument();
        expect(
          screen.getByRole("button", { name: "JSON" }),
        ).toBeInTheDocument();
      });
    });

    it("モーダルを閉じることができること", async () => {
      render(
        <TestWrapper>
          <ScheduleInputLayout {...baseProps} />
        </TestWrapper>,
      );

      // 参加者がいるセルをクリック
      const cellWith2Participants = screen.getAllByText("2")[0];
      fireEvent.click(cellWith2Participants.closest('[role="button"]')!);

      // モーダルが表示されることを確認
      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      // 閉じるボタンをクリック
      const closeButton = screen.getByRole("button", { name: /close/i });
      fireEvent.click(closeButton);

      // モーダルが閉じることを確認
      await waitFor(() => {
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      });
    });

    it("メールアドレスが表示設定時に表示されること", async () => {
      render(
        <TestWrapper>
          <ScheduleInputLayout {...baseProps} showEmails={true} />
        </TestWrapper>,
      );

      // 参加者がいるセルをクリック
      const cellWith2Participants = screen.getAllByText("2")[0];
      fireEvent.click(cellWith2Participants.closest('[role="button"]')!);

      // モーダルにメールアドレスが表示されることを確認
      await waitFor(() => {
        expect(screen.getByText("(tanaka@example.com)")).toBeInTheDocument();
        expect(screen.getByText("(suzuki@example.com)")).toBeInTheDocument();
      });
    });
  });

  describe("保存状態の表示", () => {
    it("保存中状態が正しく表示されること", () => {
      render(
        <TestWrapper>
          <ScheduleInputLayout {...baseProps} isAutoSaving={true} />
        </TestWrapper>,
      );

      expect(screen.getByText("保存中...")).toBeInTheDocument();
    });

    it("保存済み状態が正しく表示されること", () => {
      render(
        <TestWrapper>
          <ScheduleInputLayout {...baseProps} showSavedIndicator={true} />
        </TestWrapper>,
      );

      expect(screen.getByText("保存済み")).toBeInTheDocument();
    });

    it("未保存状態が正しく表示されること", () => {
      render(
        <TestWrapper>
          <ScheduleInputLayout {...baseProps} hasUnsavedChanges={true} />
        </TestWrapper>,
      );

      expect(screen.getByText("未保存")).toBeInTheDocument();
    });
  });

  describe("ダウンロード機能", () => {
    it("CSVダウンロードボタンのクリックでダウンロード処理が実行されること", async () => {
      // createElementとclickをモック
      // eslint-disable-next-line @typescript-eslint/unbound-method, @typescript-eslint/no-deprecated
      const originalCreateElement = document.createElement;
      const clickSpy = vi.fn();
      let createElementCalled = false;

      // eslint-disable-next-line @typescript-eslint/no-deprecated
      document.createElement = vi.fn((tagName: string) => {
        const element = originalCreateElement.call(document, tagName);
        if (tagName === "a" && !createElementCalled) {
          element.click = clickSpy;
          createElementCalled = true;
        }
        return element;
      });

      render(
        <TestWrapper>
          <ScheduleInputLayout {...baseProps} />
        </TestWrapper>,
      );

      // 参加者がいるセルをクリック
      const cellWith2Participants = screen.getAllByText("2")[0];
      fireEvent.click(cellWith2Participants.closest('[role="button"]')!);

      // CSVボタンが表示されるのを待つ
      await waitFor(() => {
        expect(screen.getByRole("button", { name: "CSV" })).toBeInTheDocument();
      });

      // CSVボタンをクリック
      fireEvent.click(screen.getByRole("button", { name: "CSV" }));

      // ダウンロード処理が実行されたことを確認
      // eslint-disable-next-line @typescript-eslint/unbound-method, @typescript-eslint/no-deprecated
      expect(document.createElement).toHaveBeenCalledWith("a");
      expect(clickSpy).toHaveBeenCalled();

      // eslint-disable-next-line @typescript-eslint/no-deprecated
      document.createElement = originalCreateElement;
    });

    it("JSONダウンロードボタンのクリックでダウンロード処理が実行されること", async () => {
      // createElementとclickをモック
      // eslint-disable-next-line @typescript-eslint/unbound-method, @typescript-eslint/no-deprecated
      const originalCreateElement = document.createElement;
      const clickSpy = vi.fn();
      let createElementCalled = false;

      // eslint-disable-next-line @typescript-eslint/no-deprecated
      document.createElement = vi.fn((tagName: string) => {
        const element = originalCreateElement.call(document, tagName);
        if (tagName === "a" && !createElementCalled) {
          element.click = clickSpy;
          createElementCalled = true;
        }
        return element;
      });

      render(
        <TestWrapper>
          <ScheduleInputLayout {...baseProps} />
        </TestWrapper>,
      );

      // 参加者がいるセルをクリック
      const cellWith2Participants = screen.getAllByText("2")[0];
      fireEvent.click(cellWith2Participants.closest('[role="button"]')!);

      // JSONボタンが表示されるのを待つ
      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: "JSON" }),
        ).toBeInTheDocument();
      });

      // JSONボタンをクリック
      fireEvent.click(screen.getByRole("button", { name: "JSON" }));

      // ダウンロード処理が実行されたことを確認
      // eslint-disable-next-line @typescript-eslint/unbound-method, @typescript-eslint/no-deprecated
      expect(document.createElement).toHaveBeenCalledWith("a");
      expect(clickSpy).toHaveBeenCalled();

      // eslint-disable-next-line @typescript-eslint/no-deprecated
      document.createElement = originalCreateElement;
    });
  });
});
