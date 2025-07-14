import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Temporal } from "temporal-polyfill";
import { ScheduleGrid } from "./ScheduleGrid";

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
    locale: "ja",
  },
};

export const EnglishLocale: Story = {
  render: (args) => <ScheduleGridWrapper {...args} />,
  /* @ts-expect-error Storybook args type issue */
  args: {
    dateRangeStart: Temporal.PlainDate.from("2025-01-20"),
    dateRangeEnd: Temporal.PlainDate.from("2025-01-26"),
    timeSlotDuration: 30,
    locale: "en",
  },
};

export const FifteenMinuteSlots: Story = {
  render: (args) => <ScheduleGridWrapper {...args} />,
  /* @ts-expect-error Storybook args type issue */
  args: {
    dateRangeStart: Temporal.PlainDate.from("2025-01-20"),
    dateRangeEnd: Temporal.PlainDate.from("2025-01-22"),
    timeSlotDuration: 15,
    locale: "ja",
  },
};

export const OneHourSlots: Story = {
  render: (args) => <ScheduleGridWrapper {...args} />,
  /* @ts-expect-error Storybook args type issue */
  args: {
    dateRangeStart: Temporal.PlainDate.from("2025-01-20"),
    dateRangeEnd: Temporal.PlainDate.from("2025-01-26"),
    timeSlotDuration: 60,
    locale: "ja",
  },
};

export const LongDateRange: Story = {
  render: (args) => <ScheduleGridWrapper {...args} />,
  /* @ts-expect-error Storybook args type issue */
  args: {
    dateRangeStart: Temporal.PlainDate.from("2025-01-01"),
    dateRangeEnd: Temporal.PlainDate.from("2025-01-31"),
    timeSlotDuration: 60,
    locale: "ja",
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
    locale: "ja",
  },
};
