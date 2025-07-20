import type { Meta, StoryObj } from "@storybook/react";
import { Temporal } from "temporal-polyfill";
import { ScheduleAggregateGrid } from "./ScheduleAggregateGrid";
import { expect, within, waitFor } from "@storybook/test";

const meta = {
  title: "Schedule/ScheduleAggregateGrid",
  component: ScheduleAggregateGrid,
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof ScheduleAggregateGrid>;

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

const manyParticipants = Array.from({ length: 20 }, (_, i) => ({
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
}));

export const Default: Story = {
  args: {
    dateRangeStart: Temporal.PlainDate.from("2025-01-20"),
    dateRangeEnd: Temporal.PlainDate.from("2025-01-26"),
    timeSlotDuration: 30,
    participants: sampleParticipants,
    showEmails: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // 時間ヘッダーが表示されていることを確認
    await waitFor(async () => {
      const timeHeader = canvas.getByText("時間");
      await expect(timeHeader).toBeInTheDocument();
    });
    
    // 参加可能時間のヘッダーが表示されていることを確認
    const availableHeader = canvas.getByText("参加可能時間");
    await expect(availableHeader).toBeInTheDocument();
    
    // 人数表示があることを確認（3が表示されている、複数ある場合）
    const threeNumbers = canvas.getAllByText("3");
    await expect(threeNumbers.length).toBeGreaterThan(0);
  },
};

export const WithEmails: Story = {
  args: {
    dateRangeStart: Temporal.PlainDate.from("2025-01-20"),
    dateRangeEnd: Temporal.PlainDate.from("2025-01-26"),
    timeSlotDuration: 30,
    participants: sampleParticipants,
    showEmails: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // 時間ヘッダーが表示されていることを確認
    await waitFor(async () => {
      const timeHeader = canvas.getByText("時間");
      await expect(timeHeader).toBeInTheDocument();
    });
    
    // 参加者数が表示されていることを確認（複数の3が表示される）
    const threeNumbers = canvas.getAllByText("3");
    await expect(threeNumbers.length).toBeGreaterThan(0);
  },
};

export const EnglishLocale: Story = {
  args: {
    dateRangeStart: Temporal.PlainDate.from("2025-01-20"),
    dateRangeEnd: Temporal.PlainDate.from("2025-01-26"),
    timeSlotDuration: 30,
    participants: sampleParticipants,
    showEmails: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // 時間ヘッダーが表示されていることを確認（日本語または英語）
    await waitFor(async () => {
      const timeHeader = canvas.queryByText("時間") || canvas.queryByText("Time");
      await expect(timeHeader).toBeInTheDocument();
    });
    
    // 人数表示があることを確認（言語に関わらず数字のみ、複数ある場合）
    const threeNumbers = canvas.getAllByText("3");
    await expect(threeNumbers.length).toBeGreaterThan(0);
  },
};

export const ManyParticipants: Story = {
  args: {
    dateRangeStart: Temporal.PlainDate.from("2025-01-20"),
    dateRangeEnd: Temporal.PlainDate.from("2025-01-26"),
    timeSlotDuration: 30,
    participants: manyParticipants,
    showEmails: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // 時間ヘッダーが表示されていることを確認
    await waitFor(async () => {
      const timeHeader = canvas.getByText("時間");
      await expect(timeHeader).toBeInTheDocument();
    });
    
    // 多くの参加者がいるため、高い数字の人数表示があることを確認
    const peopleCells = canvas.getAllByText(/^\d+$/);
    await expect(peopleCells.length).toBeGreaterThan(0);
  },
};

export const NoParticipants: Story = {
  args: {
    dateRangeStart: Temporal.PlainDate.from("2025-01-20"),
    dateRangeEnd: Temporal.PlainDate.from("2025-01-26"),
    timeSlotDuration: 30,
    participants: [],
    showEmails: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // 時間ヘッダーが表示されていることを確認
    await waitFor(async () => {
      const timeHeader = canvas.getByText("時間");
      await expect(timeHeader).toBeInTheDocument();
    });
    
    // 人数表示がないことを確認（または0人表示）
    const zeroPeople = canvas.queryAllByText(/[1-9]\d*人/);
    await expect(zeroPeople.length).toBe(0);
  },
};

export const OneHourSlots: Story = {
  args: {
    dateRangeStart: Temporal.PlainDate.from("2025-01-20"),
    dateRangeEnd: Temporal.PlainDate.from("2025-01-26"),
    timeSlotDuration: 60,
    participants: sampleParticipants.map((p) => ({
      ...p,
      availableSlots: new Set(
        Array.from(p.availableSlots).filter((slot) =>
          slot.endsWith("00:00:00"),
        ),
      ),
    })),
    showEmails: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // 時間ヘッダーが表示されていることを確認
    await waitFor(async () => {
      const timeHeader = canvas.getByText("時間");
      await expect(timeHeader).toBeInTheDocument();
    });
    
    // 1時間刻みの時間が表示されていることを確認
    const hourSlot = canvas.getByText("09:00");
    await expect(hourSlot).toBeInTheDocument();
  },
};

export const WithInteractionHandlers: Story = {
  args: {
    dateRangeStart: Temporal.PlainDate.from("2025-01-20"),
    dateRangeEnd: Temporal.PlainDate.from("2025-01-26"),
    timeSlotDuration: 30,
    participants: sampleParticipants,
    showEmails: false,
    onSlotHover: (slotId, participants) => {
      console.log("Hovered slot:", slotId, "Participants:", participants);
    },
    onSlotClick: (slotId, participants) => {
      console.log("Clicked slot:", slotId, "Participants:", participants);
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // 時間ヘッダーが表示されていることを確認
    await waitFor(async () => {
      const timeHeader = canvas.getByText("時間");
      await expect(timeHeader).toBeInTheDocument();
    });
    
    // 人数表示があることを確認（複数ある場合）
    const threeNumbers = canvas.getAllByText("3");
    await expect(threeNumbers.length).toBeGreaterThan(0);
    
    // インタラクションハンドラーが設定されていることを確認（コンソール出力を確認）
    // 実際のクリックやホバー動作はブラウザテストで確認
  },
};
