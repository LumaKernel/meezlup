import type { Meta, StoryObj } from "@storybook/react";
import { Temporal } from "temporal-polyfill";
import { DateDisplay } from "./DateDisplay";

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
};

export const WithRelativeText: Story = {
  args: {
    zonedDateTime: Temporal.Now.zonedDateTimeISO("UTC"),
    locale: "ja",
    showIcon: true,
    dateOnly: true,
    showRelative: true,
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
};

export const YesterdayWithRelative: Story = {
  args: {
    zonedDateTime: Temporal.Now.zonedDateTimeISO("UTC").subtract({ days: 1 }),
    locale: "ja",
    showIcon: true,
    dateOnly: true,
    showRelative: true,
  },
};

export const WithIcon: Story = {
  args: {
    zonedDateTime: testDateTime,
    locale: "ja",
    showIcon: true,
    dateOnly: true,
  },
};

export const EnglishLocale: Story = {
  args: {
    zonedDateTime: testDateTime,
    locale: "en",
    showIcon: true,
    dateOnly: true,
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
};
