import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MantineProvider } from "@mantine/core";
import { I18nextProvider } from "react-i18next";
import i18n from "@/lib/i18n/client";
import { Temporal } from "temporal-polyfill";
import { ScheduleInputLayout } from "./ScheduleInputLayout";

import { useMediaQuery } from "@mantine/hooks";

// MantineのuseMediaQueryをモック
vi.mock("@mantine/hooks", async () => {
  const actual = await vi.importActual("@mantine/hooks");
  return {
    ...actual,
    useMediaQuery: vi.fn(),
  };
});

const mockUseMediaQuery = vi.mocked(useMediaQuery);

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
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("デスクトップ表示", () => {
    beforeEach(() => {
      mockUseMediaQuery.mockReturnValue(true); // デスクトップ
    });

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

    it("ホバー時に参加者リストが表示され、グリッドも表示されたままであること", async () => {
      render(
        <TestWrapper>
          <ScheduleInputLayout {...baseProps} />
        </TestWrapper>,
      );

      // 参加者がいるセルを探す（"2"と表示されているセル）
      const cellWith2Participants = screen.getAllByText("2")[0];

      // ホバーをシミュレート
      fireEvent.mouseEnter(cellWith2Participants.closest('[role="button"]')!);

      // 参加者リストが表示されることを確認
      await waitFor(() => {
        expect(screen.getByText("2人が参加可能")).toBeInTheDocument();
      });

      // グリッドも表示されたままであることを確認
      const scheduleSlots = screen.getAllByRole("button", {
        name: /未選択|選択済み/,
      });
      expect(scheduleSlots.length).toBeGreaterThan(0);
    });

    it("モーダルが表示されないこと", () => {
      render(
        <TestWrapper>
          <ScheduleInputLayout {...baseProps} />
        </TestWrapper>,
      );

      // モーダルのタイトルが表示されていないことを確認
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  describe("モバイル表示", () => {
    beforeEach(() => {
      mockUseMediaQuery.mockReturnValue(false); // モバイル
    });

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

    it("ホバー時に参加者リストが切り替わらないこと", async () => {
      render(
        <TestWrapper>
          <ScheduleInputLayout {...baseProps} />
        </TestWrapper>,
      );

      // 参加者がいるセルを探す
      const cellWith2Participants = screen.getAllByText("2")[0];

      // ホバーをシミュレート
      fireEvent.mouseEnter(cellWith2Participants.closest('[role="button"]')!);

      // 参加者リストが表示されないことを確認（編集に戻るボタンが表示されない）
      await waitFor(() => {
        expect(screen.queryByText("編集に戻る")).not.toBeInTheDocument();
      });
    });

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
    beforeEach(() => {
      mockUseMediaQuery.mockReturnValue(true);
    });

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

  describe("レスポンシブ切り替え", () => {
    it("画面サイズ変更時に適切に動作が切り替わること", async () => {
      // 最初はデスクトップ
      mockUseMediaQuery.mockReturnValue(true);

      const { rerender } = render(
        <TestWrapper>
          <ScheduleInputLayout {...baseProps} />
        </TestWrapper>,
      );

      // 参加者がいるセルを探す
      const cellWith2Participants = screen.getAllByText("2")[0];
      const cell = cellWith2Participants.closest('[role="button"]')!;

      // デスクトップでホバー
      fireEvent.mouseEnter(cell);
      await waitFor(() => {
        expect(screen.getByText("編集に戻る")).toBeInTheDocument();
      });

      // モバイルに切り替え
      mockUseMediaQuery.mockReturnValue(false);
      rerender(
        <TestWrapper>
          <ScheduleInputLayout {...baseProps} />
        </TestWrapper>,
      );

      // モバイルでクリック
      fireEvent.click(cell);
      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });
    });
  });
});
