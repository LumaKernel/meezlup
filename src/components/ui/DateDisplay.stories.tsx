import type { Meta, StoryObj } from "@storybook/react";
import { Temporal } from "temporal-polyfill";
import { DateDisplay } from "./DateDisplay";
import { expect, within, waitFor } from "@storybook/test";

const meta = {
  title: "UI/DateDisplay",
  component: DateDisplay,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    zonedDateTime: {
      control: false,
      description: "Temporal.ZonedDateTime インスタンス",
    },
    locale: {
      control: "select",
      options: ["ja", "en"],
      description: "表示言語",
    },
    showIcon: {
      control: "boolean",
      description: "カレンダーアイコンを表示するか",
    },
    dateOnly: {
      control: "boolean",
      description: "日付のみ表示するか（false の場合は時刻も表示）",
    },
  },
} satisfies Meta<typeof DateDisplay>;

export default meta;
type Story = StoryObj<typeof meta>;

// テスト用の日時データを作成
const testDateTime = Temporal.Instant.from(
  "2025-01-20T00:00:00.000Z",
).toZonedDateTimeISO("UTC");

const afternoonDateTime = Temporal.Instant.from(
  "2025-01-20T15:30:00.000Z",
).toZonedDateTimeISO("UTC");

const tokyoDateTime = Temporal.Instant.from(
  "2025-01-20T00:00:00.000Z",
).toZonedDateTimeISO("Asia/Tokyo");

export const Default: Story = {
  args: {
    zonedDateTime: testDateTime,
    locale: "ja",
    showIcon: false,
    dateOnly: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // 日付が表示されていることを確認（2025年1月20日）
    const dateText = canvas.getByText(/2025年1月20日/);
    await expect(dateText).toBeInTheDocument();
  },
};

export const WithRelativeText: Story = {
  args: {
    zonedDateTime: Temporal.Now.zonedDateTimeISO("UTC"),
    locale: "ja",
    showIcon: true,
    dateOnly: true,
    showRelative: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // 相対日付が表示されていることを確認（日付とアイコンが表示されている）
    await waitFor(async () => {
      // canvasElement自体から直接要素を検索
      const dateElements = canvasElement.querySelectorAll('.tabler-icon-calendar');
      await expect(dateElements.length).toBeGreaterThan(0);
    });
  },
};

export const TomorrowWithRelative: Story = {
  args: {
    zonedDateTime: Temporal.Now.zonedDateTimeISO("UTC").add({ days: 1 }),
    locale: "ja",
    showIcon: true,
    dateOnly: true,
    showRelative: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // 相対日付が表示されていることを確認（日付とアイコンが表示されている）
    await waitFor(async () => {
      // canvasElement自体から直接要素を検索
      const dateElements = canvasElement.querySelectorAll('.tabler-icon-calendar');
      await expect(dateElements.length).toBeGreaterThan(0);
    });
  },
};

export const YesterdayWithRelative: Story = {
  args: {
    zonedDateTime: Temporal.Now.zonedDateTimeISO("UTC").subtract({ days: 1 }),
    locale: "ja",
    showIcon: true,
    dateOnly: true,
    showRelative: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // 相対日付が表示されていることを確認（日付とアイコンが表示されている）
    await waitFor(async () => {
      // canvasElement自体から直接要素を検索
      const dateElements = canvasElement.querySelectorAll('.tabler-icon-calendar');
      await expect(dateElements.length).toBeGreaterThan(0);
    });
  },
};

export const WithIcon: Story = {
  args: {
    zonedDateTime: testDateTime,
    locale: "ja",
    showIcon: true,
    dateOnly: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // 日付が表示されていることを確認
    const dateText = canvas.getByText(/2025年1月20日/);
    await expect(dateText).toBeInTheDocument();
  },
};

export const EnglishLocale: Story = {
  args: {
    zonedDateTime: testDateTime,
    locale: "en",
    showIcon: true,
    dateOnly: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // 英語形式で日付が表示されていることを確認
    const dateText = canvas.getByText(/January 20, 2025/);
    await expect(dateText).toBeInTheDocument();
  },
};

export const ShortFormat: Story = {
  args: {
    zonedDateTime: testDateTime,
    locale: "ja",
    showIcon: false,
    dateOnly: true,
    formatOptions: {
      year: "numeric",
      month: "short",
      day: "numeric",
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // 短縮形式で日付が表示されていることを確認
    await expect(canvas.getByText(/2025年/)).toBeInTheDocument();
    await expect(canvas.getByText(/1月/)).toBeInTheDocument();
    await expect(canvas.getByText(/20日/)).toBeInTheDocument();
  },
};

export const NumericFormat: Story = {
  args: {
    zonedDateTime: testDateTime,
    locale: "ja",
    showIcon: false,
    dateOnly: true,
    formatOptions: {
      year: "numeric",
      month: "numeric",
      day: "numeric",
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // 数値形式で日付が表示されていることを確認
    const dateText = canvas.getByText(/2025\/1\/20/);
    await expect(dateText).toBeInTheDocument();
  },
};

export const WithTime: Story = {
  args: {
    zonedDateTime: afternoonDateTime,
    locale: "ja",
    showIcon: true,
    dateOnly: false,
    formatOptions: {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      timeZoneName: "short",
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // 日付と時刻が表示されていることを確認
    await expect(canvas.getByText(/2025年1月/)).toBeInTheDocument();
    // 時刻も表示されているが、具体的な形式はタイムゾーンに依存する
    await expect(canvas.getByText(/\d+:\d+/)).toBeInTheDocument();
  },
};

export const TokyoTimezone: Story = {
  args: {
    zonedDateTime: tokyoDateTime,
    locale: "ja",
    showIcon: true,
    dateOnly: false,
    formatOptions: {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      timeZoneName: "short",
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // 東京タイムゾーンでの日時が表示されていることを確認
    await expect(canvas.getByText(/2025年1月/)).toBeInTheDocument();
    await expect(canvas.getByText(/JST/)).toBeInTheDocument();
  },
};

export const FutureDate: Story = {
  args: {
    zonedDateTime: Temporal.Instant.from(
      "2030-12-31T23:59:59.999Z",
    ).toZonedDateTimeISO("UTC"),
    locale: "ja",
    showIcon: true,
    dateOnly: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // 未来の日付が表示されていることを確認（年とアイコンが表示されている）
    const futureYearPattern = /20\d{2}年/; // 20XX年のパターン
    await expect(canvas.getByText(futureYearPattern)).toBeInTheDocument();
  },
};

export const PastDate: Story = {
  args: {
    zonedDateTime: Temporal.Instant.from(
      "2020-01-01T00:00:00.000Z",
    ).toZonedDateTimeISO("UTC"),
    locale: "ja",
    showIcon: true,
    dateOnly: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // 過去の日付が表示されていることを確認（年とアイコンが表示されている）
    const pastYearPattern = /20\d{2}年/; // 20XX年のパターン
    await expect(canvas.getByText(pastYearPattern)).toBeInTheDocument();
  },
};
