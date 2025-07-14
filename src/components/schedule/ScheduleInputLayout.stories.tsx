import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Temporal } from "temporal-polyfill";
import { ScheduleInputLayout } from "./ScheduleInputLayout";

const meta = {
  title: "Schedule/ScheduleInputLayout",
  component: ScheduleInputLayout,
  parameters: {
    layout: "fullscreen",
  },
  argTypes: {
    currentUserSlots: { table: { disable: true } },
    onSlotsChange: { table: { disable: true } },
    onSave: { table: { disable: true } },
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
    "currentUserSlots" | "onSlotsChange" | "onSave"
  > & { currentUserSlots?: ReadonlySet<string> },
) {
  const [currentUserSlots, setCurrentUserSlots] = useState<ReadonlySet<string>>(
    args.currentUserSlots || new Set(),
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
        onSave={() => {
          console.log("Saving slots:", Array.from(currentUserSlots));
          alert(
            `保存しました: ${currentUserSlots.size satisfies number}個のスロット`,
          );
        }}
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
    isSaving: false,
    locale: "ja",
    showEmails: false,
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
    isSaving: false,
    locale: "ja",
    showEmails: false,
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
    isSaving: false,
    locale: "en",
    showEmails: false,
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
    isSaving: false,
    locale: "ja",
    showEmails: true,
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
    isSaving: true,
    locale: "ja",
    showEmails: false,
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
    isSaving: false,
    locale: "ja",
    showEmails: false,
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
    isSaving: false,
    locale: "ja",
    showEmails: false,
  },
};
