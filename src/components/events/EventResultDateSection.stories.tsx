import type { Meta, StoryObj } from "@storybook/react";
import { Grid, Card, Text, Group, Badge, Stack } from "@mantine/core";
import { IconClock } from "@tabler/icons-react";
import { Temporal } from "temporal-polyfill";
import { EventResultDateSection } from "./EventResultDateSection";
import { expect, within, waitFor } from "@storybook/test";

const meta = {
  title: "Events/EventResultDateSection",
  component: EventResultDateSection,
  parameters: {
    layout: "padded",
  },
  argTypes: {
    zonedDateTime: {
      control: false,
      description: "Temporal.ZonedDateTimeインスタンス",
    },
    locale: {
      control: "select",
      options: ["ja", "en"],
      description: "表示言語",
    },
  },
} satisfies Meta<typeof EventResultDateSection>;

export default meta;
type Story = StoryObj<typeof meta>;

// サンプルの時間スロットデータ
const SampleTimeSlots = () => (
  <Grid>
    {[9, 10, 11, 14, 15, 16].map((hour) => (
      <Grid.Col span={{ base: 6, sm: 4, md: 3 }} key={hour}>
        <Card padding="sm" withBorder>
          <Group justify="space-between">
            <Group gap="xs">
              <IconClock size={16} />
              <Text size="sm" fw={500}>
                {`${hour.toString().padStart(2, "0") satisfies string}:00`}
              </Text>
            </Group>
            <Badge size="sm" variant="filled">
              3
            </Badge>
          </Group>
        </Card>
      </Grid.Col>
    ))}
  </Grid>
);

export const Default: Story = {
  args: {
    zonedDateTime: Temporal.Instant.from(
      "2025-01-20T00:00:00.000Z",
    ).toZonedDateTimeISO("UTC"),
    locale: "ja",
    children: <SampleTimeSlots />,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // 日付が表示されていることを確認（2025年1月20日）
    await waitFor(async () => {
      const dateText = canvas.getByText(/2025年1月20日/);
      await expect(dateText).toBeInTheDocument();
    });
    
    // 時間スロットが表示されていることを確認
    const timeSlots = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"];
    for (const time of timeSlots) {
      const timeElement = canvas.getByText(time);
      await expect(timeElement).toBeInTheDocument();
    }
    
    // 参加者数バッジが表示されていることを確認
    const badges = canvas.getAllByText("3");
    await expect(badges.length).toBeGreaterThan(0);
  },
};

export const EnglishLocale: Story = {
  args: {
    zonedDateTime: Temporal.Instant.from(
      "2025-01-20T00:00:00.000Z",
    ).toZonedDateTimeISO("UTC"),
    locale: "en",
    children: <SampleTimeSlots />,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // 英語形式で日付が表示されていることを確認
    await waitFor(async () => {
      const dateText = canvas.getByText(/January 20, 2025/);
      await expect(dateText).toBeInTheDocument();
    });
    
    // 時間スロットが表示されていることを確認
    const timeSlot = canvas.getByText("09:00");
    await expect(timeSlot).toBeInTheDocument();
  },
};

export const TokyoTimezone: Story = {
  args: {
    zonedDateTime: Temporal.Instant.from(
      "2025-01-20T00:00:00.000Z",
    ).toZonedDateTimeISO("Asia/Tokyo"),
    locale: "ja",
    children: <SampleTimeSlots />,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // 東京タイムゾーンでの日付が表示されていることを確認
    await waitFor(async () => {
      const dateText = canvas.getByText(/2025年1月20日/);
      await expect(dateText).toBeInTheDocument();
    });
    
    // 時間スロットが表示されていることを確認
    const timeSlot = canvas.getByText("09:00");
    await expect(timeSlot).toBeInTheDocument();
  },
};

export const NewYorkTimezone: Story = {
  args: {
    zonedDateTime: Temporal.Instant.from(
      "2025-01-20T00:00:00.000Z",
    ).toZonedDateTimeISO("America/New_York"),
    locale: "en",
    children: <SampleTimeSlots />,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // ニューヨークタイムゾーンでの日付が表示されていることを確認
    await waitFor(async () => {
      const dateText = canvas.getByText(/January 20, 2025/);
      await expect(dateText).toBeInTheDocument();
    });
    
    // 時間スロットが表示されていることを確認
    const timeSlot = canvas.getByText("09:00");
    await expect(timeSlot).toBeInTheDocument();
  },
};

export const DateOnlyFormat: Story = {
  args: {
    zonedDateTime: Temporal.PlainDate.from("2025-01-20").toZonedDateTime("UTC"),
    locale: "ja",
    children: <SampleTimeSlots />,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // 日付が表示されていることを確認
    await waitFor(async () => {
      const dateText = canvas.getByText(/2025年1月20日/);
      await expect(dateText).toBeInTheDocument();
    });
    
    // 時間スロットが表示されていることを確認
    const timeSlot = canvas.getByText("09:00");
    await expect(timeSlot).toBeInTheDocument();
  },
};

// エラーケースはTemporal型を受け取るため不要になりました

export const EmptySlots: Story = {
  args: {
    zonedDateTime: Temporal.Instant.from(
      "2025-01-20T00:00:00.000Z",
    ).toZonedDateTimeISO("UTC"),
    locale: "ja",
    children: (
      <Text c="dimmed" ta="center" py="xl">
        この日は参加可能な時間帯がありません
      </Text>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // 日付が表示されていることを確認
    await waitFor(async () => {
      const dateText = canvas.getByText(/2025年1月20日/);
      await expect(dateText).toBeInTheDocument();
    });
    
    // 空スロットのメッセージが表示されていることを確認
    const emptyMessage = canvas.getByText("この日は参加可能な時間帯がありません");
    await expect(emptyMessage).toBeInTheDocument();
  },
};

export const ManySlots: Story = {
  args: {
    zonedDateTime: Temporal.Instant.from(
      "2025-01-20T00:00:00.000Z",
    ).toZonedDateTimeISO("UTC"),
    locale: "ja",
    children: (
      <Grid>
        {Array.from({ length: 24 }, (_, i) => i).map((hour) => (
          <Grid.Col span={{ base: 6, sm: 4, md: 3, lg: 2 }} key={hour}>
            <Card padding="xs" withBorder>
              <Stack gap={4}>
                <Text size="xs" fw={500}>
                  {`${hour.toString().padStart(2, "0") satisfies string}:00`}
                </Text>
                <Badge size="xs" variant="light" fullWidth>
                  {Math.floor(Math.random() * 5) + 1}人
                </Badge>
              </Stack>
            </Card>
          </Grid.Col>
        ))}
      </Grid>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // 日付が表示されていることを確認
    await waitFor(async () => {
      const dateText = canvas.getByText(/2025年1月20日/);
      await expect(dateText).toBeInTheDocument();
    });
    
    // 24時間分のスロットが表示されていることを確認
    const firstSlot = canvas.getByText("00:00");
    const lastSlot = canvas.getByText("23:00");
    await expect(firstSlot).toBeInTheDocument();
    await expect(lastSlot).toBeInTheDocument();
    
    // 人数バッジが表示されていることを確認
    const peopleBadges = canvas.getAllByText(/人/);
    await expect(peopleBadges.length).toBe(24);
  },
};
