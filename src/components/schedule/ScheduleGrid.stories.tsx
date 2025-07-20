import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Temporal } from "temporal-polyfill";
import { ScheduleGrid } from "./ScheduleGrid";
import { expect, within, userEvent, waitFor } from "@storybook/test";

const meta = {
  title: "Schedule/ScheduleGrid",
  component: ScheduleGrid,
  parameters: {
    layout: "padded",
  },
  argTypes: {
    selectedSlots: { table: { disable: true } },
    onSlotsChange: { table: { disable: true } },
  },
} satisfies Meta<typeof ScheduleGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

function ScheduleGridWrapper(
  args: Omit<
    Parameters<typeof ScheduleGrid>[0],
    "selectedSlots" | "onSlotsChange"
  >,
) {
  const [selectedSlots, setSelectedSlots] = useState<ReadonlySet<string>>(
    new Set(),
  );

  return (
    <ScheduleGrid
      {...args}
      selectedSlots={selectedSlots}
      onSlotsChange={setSelectedSlots}
    />
  );
}

export const Default: Story = {
  render: (args) => <ScheduleGridWrapper {...args} />,
  /* @ts-expect-error Storybook args type issue */
  args: {
    dateRangeStart: Temporal.PlainDate.from("2025-01-20"),
    dateRangeEnd: Temporal.PlainDate.from("2025-01-26"),
    timeSlotDuration: 30,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // スケジュールグリッドが表示されることを確認
    await waitFor(async () => {
      // 時間のヘッダーが表示されている
      const timeHeader = canvas.getByText("時間");
      await expect(timeHeader).toBeInTheDocument();
    });

    // 時間スロットボタンが存在することを確認
    const slots = canvas.getAllByRole("button", { name: /未選択/ });
    await expect(slots.length).toBeGreaterThan(0);

    // 最初のスロットをクリック
    const firstSlot = slots[0];
    await userEvent.click(firstSlot);

    // 選択されたことを確認（アクセシビリティ名の変更で判定）
    await waitFor(async () => {
      await expect(firstSlot).toHaveAccessibleName(/選択済み/);
    });
  },
};

export const EnglishLocale: Story = {
  render: (args) => <ScheduleGridWrapper {...args} />,
  /* @ts-expect-error Storybook args type issue */
  args: {
    dateRangeStart: Temporal.PlainDate.from("2025-01-20"),
    dateRangeEnd: Temporal.PlainDate.from("2025-01-26"),
    timeSlotDuration: 30,
  },
};

export const FifteenMinuteSlots: Story = {
  render: (args) => <ScheduleGridWrapper {...args} />,
  /* @ts-expect-error Storybook args type issue */
  args: {
    dateRangeStart: Temporal.PlainDate.from("2025-01-20"),
    dateRangeEnd: Temporal.PlainDate.from("2025-01-22"),
    timeSlotDuration: 15,
  },
};

export const OneHourSlots: Story = {
  render: (args) => <ScheduleGridWrapper {...args} />,
  /* @ts-expect-error Storybook args type issue */
  args: {
    dateRangeStart: Temporal.PlainDate.from("2025-01-20"),
    dateRangeEnd: Temporal.PlainDate.from("2025-01-26"),
    timeSlotDuration: 60,
  },
};

export const LongDateRange: Story = {
  render: (args) => <ScheduleGridWrapper {...args} />,
  /* @ts-expect-error Storybook args type issue */
  args: {
    dateRangeStart: Temporal.PlainDate.from("2025-01-01"),
    dateRangeEnd: Temporal.PlainDate.from("2025-01-31"),
    timeSlotDuration: 60,
  },
};

export const WithPreselectedSlots: Story = {
  render: (args) => {
    const [selectedSlots, setSelectedSlots] = useState<ReadonlySet<string>>(
      new Set([
        "2025-01-20_09:00:00",
        "2025-01-20_09:30:00",
        "2025-01-20_10:00:00",
        "2025-01-21_14:00:00",
        "2025-01-21_14:30:00",
        "2025-01-21_15:00:00",
      ]),
    );

    return (
      <ScheduleGrid
        {...args}
        selectedSlots={selectedSlots}
        onSlotsChange={setSelectedSlots}
      />
    );
  },
  /* @ts-expect-error Storybook args type issue */
  args: {
    dateRangeStart: Temporal.PlainDate.from("2025-01-20"),
    dateRangeEnd: Temporal.PlainDate.from("2025-01-26"),
    timeSlotDuration: 30,
  },
};
