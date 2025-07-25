"use client";

import { use, useState, useEffect } from "react";
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
import { useTranslation } from "react-i18next";

import type { Event as EffectEvent } from "@/lib/effects/services/event/schemas";

interface EventDetailProps {
  readonly event: EffectEvent;
  readonly params: Promise<{ locale: string; id: string }>;
}

export function EventDetail({ event, params }: EventDetailProps) {
  const { locale } = use(params);
  const { t } = useTranslation("event");
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    // クライアント側でのみURLを設定
    setShareUrl(
      `${window.location.origin satisfies string}/${locale satisfies string}/events/${event.id satisfies string}/participate`,
    );
  }, [locale, event.id]);

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
                ? t("detail.linkOnly")
                : event.participantRestrictionType === "none"
                  ? t("detail.public")
                  : t("detail.private")}
            </Badge>
          </Group>
        </div>
      </Group>

      <Stack gap="lg">
        <Paper shadow="sm" p="lg" withBorder>
          <Title order={3} mb="md">
            {t("detail.title")}
          </Title>

          {event.description && (
            <>
              <Text size="sm" c="dimmed" mb="xs">
                {t("detail.description")}
              </Text>
              <Text mb="md" style={{ whiteSpace: "pre-wrap" }}>
                {event.description}
              </Text>
            </>
          )}

          <Group gap="xl">
            <div>
              <Text size="sm" c="dimmed">
                {t("detail.startDate")}
              </Text>
              <Text fw={500}>{formatDate(event.dateRangeStart)}</Text>
            </div>
            <div>
              <Text size="sm" c="dimmed">
                {t("detail.endDate")}
              </Text>
              <Text fw={500}>{formatDate(event.dateRangeEnd)}</Text>
            </div>
          </Group>

          {event.deadline && (
            <Box mt="md">
              <Text size="sm" c="dimmed">
                {t("detail.changeDeadline")}
              </Text>
              <Text fw={500}>{formatDate(event.deadline)}</Text>
            </Box>
          )}
        </Paper>

        <Paper shadow="sm" p="lg" withBorder>
          <Title order={3} mb="md">
            {t("detail.shareEvent")}
          </Title>

          <Text size="sm" mb="md">
            {t("detail.shareDescription")}
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
              {shareUrl || "\u00A0"}
            </Text>
            <CopyButton value={shareUrl || ""}>
              {({ copied, copy }) => (
                <Tooltip label={copied ? "Copied!" : "Copy"}>
                  <ActionIcon
                    color={copied ? "teal" : "gray"}
                    disabled={!shareUrl}
                    onClick={() => {
                      if (shareUrl) {
                        copy();
                        notifications.show({
                          message: t("detail.linkCopied"),
                          color: "teal",
                        });
                      }
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
            {t("detail.viewParticipationPage")}
          </Button>
        </Group>
      </Stack>
    </Stack>
  );
}
