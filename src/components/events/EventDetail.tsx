"use client";

import { use, useState } from "react";
import {
  Title,
  Text,
  Paper,
  Group,
  Badge,
  Stack,
  Button,
  CopyButton,
  ActionIcon,
  Tooltip,
  Box,
} from "@mantine/core";
import { IconLink, IconCalendar } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { Temporal } from "temporal-polyfill";

import type { Event as EffectEvent } from "@/lib/effects/services/event/schemas";

interface EventDetailProps {
  readonly event: EffectEvent;
  readonly params: Promise<{ locale: string; id: string }>;
}

export function EventDetail({ event, params }: EventDetailProps) {
  const { locale } = use(params);
  const [shareUrl] = useState(() => {
    if (typeof window !== "undefined") {
      return `${window.location.origin satisfies string}/${locale satisfies string}/events/${event.id satisfies string}/participate`;
    }
    return "";
  });

  const formatDate = (dateTimeString: string) => {
    const plainDate = Temporal.PlainDate.from(dateTimeString.split("T")[0]);
    return plainDate.toLocaleString(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Stack gap="xl">
      <Group justify="space-between" mb="xl">
        <div>
          <Title order={1} mb="xs">
            {event.name}
          </Title>
          <Group gap="xs">
            <Badge>
              {event.isLinkOnly
                ? locale === "en"
                  ? "Link Only"
                  : "リンクのみ"
                : event.participantRestrictionType === "none"
                  ? locale === "en"
                    ? "Public"
                    : "公開"
                  : locale === "en"
                    ? "Private"
                    : "非公開"}
            </Badge>
          </Group>
        </div>
      </Group>

      <Stack gap="lg">
        <Paper shadow="sm" p="lg" withBorder>
          <Title order={3} mb="md">
            {locale === "en" ? "Event Details" : "イベント詳細"}
          </Title>

          {event.description && (
            <>
              <Text size="sm" c="dimmed" mb="xs">
                {locale === "en" ? "Description" : "説明"}
              </Text>
              <Text mb="md" style={{ whiteSpace: "pre-wrap" }}>
                {event.description}
              </Text>
            </>
          )}

          <Group gap="xl">
            <div>
              <Text size="sm" c="dimmed">
                {locale === "en" ? "Start Date" : "開始日"}
              </Text>
              <Text fw={500}>{formatDate(event.dateRangeStart)}</Text>
            </div>
            <div>
              <Text size="sm" c="dimmed">
                {locale === "en" ? "End Date" : "終了日"}
              </Text>
              <Text fw={500}>{formatDate(event.dateRangeEnd)}</Text>
            </div>
          </Group>

          {event.deadline && (
            <Box mt="md">
              <Text size="sm" c="dimmed">
                {locale === "en" ? "Change Deadline" : "変更期限"}
              </Text>
              <Text fw={500}>{formatDate(event.deadline)}</Text>
            </Box>
          )}
        </Paper>

        <Paper shadow="sm" p="lg" withBorder>
          <Title order={3} mb="md">
            {locale === "en" ? "Share Event" : "イベントを共有"}
          </Title>

          <Text size="sm" mb="md">
            {locale === "en"
              ? "Share this link with participants:"
              : "参加者にこのリンクを共有してください："}
          </Text>

          <Group>
            <Text
              size="sm"
              style={{
                padding: "8px 12px",
                backgroundColor: "var(--mantine-color-gray-0)",
                borderRadius: "var(--mantine-radius-sm)",
                fontFamily: "monospace",
                flex: 1,
              }}
            >
              {shareUrl}
            </Text>
            <CopyButton value={shareUrl}>
              {({ copied, copy }) => (
                <Tooltip label={copied ? "Copied!" : "Copy"}>
                  <ActionIcon
                    color={copied ? "teal" : "gray"}
                    onClick={() => {
                      copy();
                      notifications.show({
                        message:
                          locale === "en"
                            ? "Link copied to clipboard!"
                            : "リンクをコピーしました！",
                        color: "teal",
                      });
                    }}
                  >
                    <IconLink size={20} />
                  </ActionIcon>
                </Tooltip>
              )}
            </CopyButton>
          </Group>
        </Paper>

        <Group justify="center">
          <Button
            size="lg"
            leftSection={<IconCalendar size={20} />}
            component="a"
            href={`/${locale satisfies string}/events/${event.id satisfies string}/participate`}
          >
            {locale === "en" ? "View Participation Page" : "参加ページを表示"}
          </Button>
        </Group>
      </Stack>
    </Stack>
  );
}
