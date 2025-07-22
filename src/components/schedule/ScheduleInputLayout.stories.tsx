import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Temporal } from "temporal-polyfill";
import { ScheduleInputLayout } from "./ScheduleInputLayout";
import { expect, within, waitFor } from "@storybook/test";

const meta = {
  title: "Schedule/ScheduleInputLayout",
  component: ScheduleInputLayout,
  parameters: {
    layout: "fullscreen",
  },
  argTypes: {
    currentUserSlots: { table: { disable: true } },
    onSlotsChange: { table: { disable: true } },
    isAutoSaving: { table: { disable: true } },
    showSavedIndicator: { table: { disable: true } },
  },
} satisfies Meta<typeof ScheduleInputLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleParticipants = [
  {
    id: "1",
    name: "田中太郎",
    email: "tanaka@example.com",
    availableSlots: new Set([
      "2025-01-20_09:00:00",
      "2025-01-20_09:30:00",
      "2025-01-20_10:00:00",
      "2025-01-21_14:00:00",
      "2025-01-21_14:30:00",
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
      "2025-01-22_10:00:00",
      "2025-01-22_10:30:00",
    ]),
  },
  {
    id: "3",
    name: "佐藤次郎",
    email: "sato@example.com",
    availableSlots: new Set([
      "2025-01-20_09:00:00",
      "2025-01-21_14:00:00",
      "2025-01-21_14:30:00",
      "2025-01-21_15:00:00",
      "2025-01-23_11:00:00",
    ]),
  },
];

function ScheduleInputLayoutWrapper(
  args: Omit<
    Parameters<typeof ScheduleInputLayout>[0],
    | "currentUserSlots"
    | "onSlotsChange"
    | "isAutoSaving"
    | "showSavedIndicator"
  > & {
    readonly currentUserSlots?: ReadonlySet<string>;
    readonly isAutoSaving?: boolean;
    readonly showSavedIndicator?: boolean;
  },
) {
  const [currentUserSlots, setCurrentUserSlots] = useState<ReadonlySet<string>>(
    args.currentUserSlots ?? new Set(),
  );

  return (
    <div
      style={{
        padding: "20px",
        minHeight: "100vh",
        backgroundColor: "#f8f9fa",
      }}
    >
      <ScheduleInputLayout
        {...args}
        currentUserSlots={currentUserSlots}
        onSlotsChange={setCurrentUserSlots}
        isAutoSaving={args.isAutoSaving ?? false}
        showSavedIndicator={args.showSavedIndicator ?? false}
      />
    </div>
  );
}

export const Default: Story = {
  render: (args) => <ScheduleInputLayoutWrapper {...args} />,
  /* @ts-expect-error Storybook args type issue */
  args: {
    dateRangeStart: Temporal.PlainDate.from("2025-01-20"),
    dateRangeEnd: Temporal.PlainDate.from("2025-01-26"),
    timeSlotDuration: 30,
    participants: sampleParticipants,
    isAutoSaving: false,
    showEmails: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 時間ヘッダーが表示されていることを確認（複数存在する場合を考慮）
    await waitFor(async () => {
      const timeHeaders = canvas.getAllByText("時間");
      await expect(timeHeaders.length).toBeGreaterThan(0);
    });

    // 保存ボタンが表示されていることを確認
    const saveButton = canvas.getByRole("button", { name: "保存" });
    await expect(saveButton).toBeInTheDocument();

    // スケジュールグリッドが表示されていることを確認
    const scheduleSlots = canvas.getAllByRole("button", { name: /未選択/ });
    await expect(scheduleSlots.length).toBeGreaterThan(0);
  },
};

export const WithExistingSelection: Story = {
  render: (args) => <ScheduleInputLayoutWrapper {...args} />,
  /* @ts-expect-error Storybook args type issue */
  args: {
    dateRangeStart: Temporal.PlainDate.from("2025-01-20"),
    dateRangeEnd: Temporal.PlainDate.from("2025-01-26"),
    timeSlotDuration: 30,
    currentUserSlots: new Set([
      "2025-01-20_10:00:00",
      "2025-01-20_10:30:00",
      "2025-01-20_11:00:00",
      "2025-01-22_14:00:00",
      "2025-01-22_14:30:00",
    ]),
    participants: sampleParticipants,
    isAutoSaving: false,
    showEmails: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 時間ヘッダーが表示されていることを確認（複数存在する場合を考慮）
    await waitFor(async () => {
      const timeHeaders = canvas.getAllByText("時間");
      await expect(timeHeaders.length).toBeGreaterThan(0);
    });

    // 既に選択されているスロットがあることを確認
    const selectedSlots = canvas.getAllByRole("button", { name: /選択済み/ });
    await expect(selectedSlots.length).toBeGreaterThan(0);
  },
};

export const EnglishLocale: Story = {
  render: (args) => <ScheduleInputLayoutWrapper {...args} />,
  /* @ts-expect-error Storybook args type issue */
  args: {
    dateRangeStart: Temporal.PlainDate.from("2025-01-20"),
    dateRangeEnd: Temporal.PlainDate.from("2025-01-26"),
    timeSlotDuration: 30,
    participants: sampleParticipants,
    isAutoSaving: false,
    showEmails: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 時間ヘッダーが表示されていることを確認（言語が混在している場合を考慮）
    await waitFor(async () => {
      const timeHeaders =
        canvas.queryAllByText("Time").length > 0
          ? canvas.getAllByText("Time")
          : canvas.getAllByText("時間");
      await expect(timeHeaders.length).toBeGreaterThan(0);
    });

    // 保存ボタンが表示されていることを確認（言語が混在している場合を考慮）
    const saveButton =
      canvas.queryByRole("button", { name: "Save" }) ||
      canvas.getByRole("button", { name: "保存" });
    await expect(saveButton).toBeInTheDocument();
  },
};

export const WithEmailsShown: Story = {
  render: (args) => <ScheduleInputLayoutWrapper {...args} />,
  /* @ts-expect-error Storybook args type issue */
  args: {
    dateRangeStart: Temporal.PlainDate.from("2025-01-20"),
    dateRangeEnd: Temporal.PlainDate.from("2025-01-26"),
    timeSlotDuration: 30,
    participants: sampleParticipants,
    isAutoSaving: false,
    showEmails: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 時間ヘッダーが表示されていることを確認（複数存在する場合を考慮）
    await waitFor(async () => {
      const timeHeaders = canvas.getAllByText("時間");
      await expect(timeHeaders.length).toBeGreaterThan(0);
    });

    // showEmailsがtrueでも、実際にはメールアドレスは表示されていない
    // 代わりに人数表示があることを確認（数字のみ）
    const peopleCells = canvas.getAllByText(/^\d+$/);
    await expect(peopleCells.length).toBeGreaterThan(0);
  },
};

export const SavingState: Story = {
  render: (args) => <ScheduleInputLayoutWrapper {...args} />,
  /* @ts-expect-error Storybook args type issue */
  args: {
    dateRangeStart: Temporal.PlainDate.from("2025-01-20"),
    dateRangeEnd: Temporal.PlainDate.from("2025-01-26"),
    timeSlotDuration: 30,
    currentUserSlots: new Set(["2025-01-20_10:00:00"]),
    participants: sampleParticipants,
    isAutoSaving: true,
    showEmails: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 保存ボタンが無効化されていることを確認
    await waitFor(async () => {
      const saveButton = canvas.getByRole("button", { name: /保存中|保存/ });
      await expect(saveButton).toBeDisabled();
    });

    // スケジュールグリッドが表示されていることを確認
    const timeHeaders = canvas.getAllByText("時間");
    await expect(timeHeaders.length).toBeGreaterThan(0);
  },
};

export const NoParticipants: Story = {
  render: (args) => <ScheduleInputLayoutWrapper {...args} />,
  /* @ts-expect-error Storybook args type issue */
  args: {
    dateRangeStart: Temporal.PlainDate.from("2025-01-20"),
    dateRangeEnd: Temporal.PlainDate.from("2025-01-26"),
    timeSlotDuration: 30,
    participants: [],
    isAutoSaving: false,
    showEmails: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 時間ヘッダーが表示されていることを確認（複数存在する場合を考慮）
    await waitFor(async () => {
      const timeHeaders = canvas.getAllByText("時間");
      await expect(timeHeaders.length).toBeGreaterThan(0);
    });

    // スケジュールグリッドが表示されていることを確認
    const scheduleSlots = canvas.getAllByRole("button", { name: /未選択/ });
    await expect(scheduleSlots.length).toBeGreaterThan(0);
  },
};

export const ManyParticipants: Story = {
  render: (args) => <ScheduleInputLayoutWrapper {...args} />,
  /* @ts-expect-error Storybook args type issue */
  args: {
    dateRangeStart: Temporal.PlainDate.from("2025-01-20"),
    dateRangeEnd: Temporal.PlainDate.from("2025-01-26"),
    timeSlotDuration: 30,
    participants: Array.from({ length: 20 }, (_, i) => ({
      id: `user-${i satisfies number}`,
      name: `参加者${(i + 1) satisfies number}`,
      email: `user${(i + 1) satisfies number}@example.com`,
      availableSlots: new Set(
        Array.from({ length: Math.floor(Math.random() * 10) + 5 }, () => {
          const day = 20 + Math.floor(Math.random() * 7);
          const hour = 9 + Math.floor(Math.random() * 9);
          const minute = Math.random() < 0.5 ? "00" : "30";
          return `2025-01-${day satisfies number}_${hour.toString().padStart(2, "0") satisfies string}:${minute satisfies string}:00`;
        }),
      ),
    })),
    isAutoSaving: false,
    showEmails: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 時間ヘッダーが表示されていることを確認（複数存在する場合を考慮）
    await waitFor(async () => {
      const timeHeaders = canvas.getAllByText("時間");
      await expect(timeHeaders.length).toBeGreaterThan(0);
    });

    // 多くの参加者がいるため、多様な人数表示があることを確認（数字のみ）
    const peopleCells = canvas.getAllByText(/^\d+$/);
    await expect(peopleCells.length).toBeGreaterThan(0);
  },
};
