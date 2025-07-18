"use client";

import { use, useMemo } from "react";
import {
  Title,
  Text,
  Paper,
  Stack,
  Group,
  Badge,
  Grid,
  Card,
  Loader,
  Center,
  Alert,
  Progress,
  Tooltip,
  Button,
} from "@mantine/core";
import { IconUsers, IconClock } from "@tabler/icons-react";
import Link from "next/link";
import { DateDisplay } from "@/components/ui/DateDisplay";
import { EventResultDateSection } from "./EventResultDateSection";
import { Temporal } from "temporal-polyfill";
import { useTranslation } from "react-i18next";
import type { Event as EffectEvent, TimeSlotAggregation } from "@/lib/effects";
import { getAggregatedTimeSlots } from "#app/actions/schedule";
import { useQuery } from "@tanstack/react-query";

interface EventResultProps {
  readonly event: EffectEvent;
  readonly params: Promise<{ locale: string; id: string }>;
}

type AggregatedSlot = {
  date: string;
  startTime: number;
  endTime: number;
  participantCount: number;
  participants: Array<{
    scheduleId: string;
    displayName: string;
    userId: string | null;
  }>;
};

export function EventResult({ event, params }: EventResultProps) {
  const { locale } = use(params);
  const { t } = useTranslation("event");
  const {
    data: aggregationResult,
    error: queryError,
    isLoading,
  } = useQuery({
    queryKey: ["schedule", "aggregation", event.id],
    queryFn: async () => {
      const result = await getAggregatedTimeSlots(event.id);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
  });

  const error = queryError ? t("result.failedToFetch") : null;

  const { aggregatedSlots, totalParticipants } = useMemo(() => {
    if (!aggregationResult) {
      return { aggregatedSlots: [], totalParticipants: 0 };
    }

    // result.dataは直接TimeSlotAggregationの配列
    // Brand型を含むため、明示的に変換
    const slots: Array<AggregatedSlot> = aggregationResult.map(
      (slot: TimeSlotAggregation) => ({
        date: slot.date,
        startTime: slot.startTime,
        endTime: slot.endTime,
        participantCount: slot.participantCount,
        participants: slot.participants.map(
          (p: TimeSlotAggregation["participants"][number]) => ({
            scheduleId: p.scheduleId,
            displayName: p.displayName,
            userId: p.userId,
          }),
        ),
      }),
    );

    // ユニークな参加者数を計算
    const uniqueParticipants = new Set<string>();
    aggregationResult.forEach((slot: TimeSlotAggregation) => {
      slot.participants.forEach(
        (p: TimeSlotAggregation["participants"][number]) => {
          uniqueParticipants.add(p.scheduleId);
        },
      );
    });

    return {
      aggregatedSlots: slots,
      totalParticipants: uniqueParticipants.size,
    };
  }, [aggregationResult]);

  if (isLoading) {
    return (
      <Center h={400}>
        <Loader size="lg" />
      </Center>
    );
  }

  if (error) {
    return (
      <Alert color="red" title={t("result.error")}>
        {error}
      </Alert>
    );
  }

  // 日付ごとにグループ化
  const slotsByDate = aggregatedSlots.reduce<
    Record<string, Array<AggregatedSlot>>
  >((acc, slot) => {
    acc[slot.date] = acc[slot.date] ?? [];
    acc[slot.date].push(slot);
    return acc;
  }, {});

  // 最大参加者数を取得（ヒートマップの色分け用）
  const maxParticipants = Math.max(
    ...aggregatedSlots.map((slot) => slot.participantCount),
    1,
  );

  const getHeatmapColor = (count: number) => {
    if (count === 0) return "gray.1";
    const intensity = count / maxParticipants;
    if (intensity >= 0.8) return "green.6";
    if (intensity >= 0.6) return "green.4";
    if (intensity >= 0.4) return "yellow.5";
    if (intensity >= 0.2) return "orange.4";
    return "red.3";
  };

  return (
    <Stack gap="xl">
      <Group justify="space-between" mb="xl">
        <div>
          <Title order={1} mb="xs">
            {event.name}
          </Title>
          <Text size="lg" c="dimmed">
            {t("result.aggregatedResults")}
          </Text>
        </div>
        <Badge size="lg" leftSection={<IconUsers size={16} />}>
          {totalParticipants}{" "}
          {totalParticipants === 1
            ? t("result.participant")
            : t("result.participants")}
        </Badge>
      </Group>

      {event.description && (
        <Paper shadow="xs" p="md" mb="xl" withBorder>
          <Text>{event.description}</Text>
        </Paper>
      )}

      <Stack gap="xl">
        <Paper shadow="sm" p="lg" withBorder>
          <Title order={3} mb="md">
            {t("result.availabilityHeatmap")}
          </Title>
          <Text size="sm" c="dimmed" mb="lg">
            {t("result.heatmapDescription")}
          </Text>

          <Stack gap="xl">
            {Object.entries(slotsByDate).map(([dateStr, slots]) => {
              // dateStrはDateTimeString型で、ISO 8601 UTC形式 (YYYY-MM-DDTHH:mm:ss[.sss]Z)
              let zonedDateTime;
              try {
                const instant = Temporal.Instant.from(dateStr);
                zonedDateTime = instant.toZonedDateTimeISO("UTC");
              } catch (error) {
                console.error("日付のパースに失敗しました:", dateStr, error);
                // エラーの場合はスキップ
                return null;
              }

              return (
                <EventResultDateSection
                  key={dateStr}
                  zonedDateTime={zonedDateTime}
                  locale={locale}
                >
                  <Grid>
                    {slots.map((slot) => {
                      const hours = Math.floor(slot.startTime / 60);
                      const minutes = slot.startTime % 60;
                      const timeStr = `${hours.toString().padStart(2, "0") satisfies string}:${minutes.toString().padStart(2, "0") satisfies string}`;
                      return (
                        <Grid.Col
                          span={{ base: 6, sm: 4, md: 3 }}
                          key={`${slot.date satisfies string}-${slot.startTime satisfies number}`}
                        >
                          <Tooltip
                            label={
                              <div>
                                <Text size="sm" fw={600}>
                                  {slot.participantCount}{" "}
                                  {slot.participantCount === 1
                                    ? t("result.participant")
                                    : t("result.participants")}
                                </Text>
                                {event.creatorCanSeeEmails &&
                                  slot.participants.length > 0 && (
                                    <Stack gap={4} mt="xs">
                                      {slot.participants.map((p) => (
                                        <Text key={p.scheduleId} size="xs">
                                          {p.displayName}
                                        </Text>
                                      ))}
                                    </Stack>
                                  )}
                              </div>
                            }
                          >
                            <Card
                              padding="sm"
                              withBorder
                              style={{
                                backgroundColor: `var(--mantine-color-${
                                  getHeatmapColor(
                                    slot.participantCount,
                                  ) satisfies string
                                })`,
                                cursor: "pointer",
                              }}
                            >
                              <Group justify="space-between">
                                <Group gap="xs">
                                  <IconClock size={16} />
                                  <Text size="sm" fw={500}>
                                    {timeStr}
                                  </Text>
                                </Group>
                                <Badge size="sm" variant="filled">
                                  {slot.participantCount}
                                </Badge>
                              </Group>
                            </Card>
                          </Tooltip>
                        </Grid.Col>
                      );
                    })}
                  </Grid>
                </EventResultDateSection>
              );
            })}
          </Stack>
        </Paper>

        <Paper shadow="sm" p="lg" withBorder>
          <Title order={3} mb="md">
            {t("result.bestTimeSlots")}
          </Title>
          <Stack gap="sm">
            {aggregatedSlots
              .sort((a, b) => b.participantCount - a.participantCount)
              .slice(0, 5)
              .map((slot) => {
                const hours = Math.floor(slot.startTime / 60);
                const minutes = slot.startTime % 60;
                const timeStr = `${hours.toString().padStart(2, "0") satisfies string}:${minutes.toString().padStart(2, "0") satisfies string}`;
                const percentage =
                  (slot.participantCount / totalParticipants) * 100;
                return (
                  <Card
                    key={`${slot.date satisfies string}-${slot.startTime satisfies number}`}
                    withBorder
                  >
                    <Group justify="space-between" mb="xs">
                      <Group gap="xs">
                        <DateDisplay
                          zonedDateTime={(() => {
                            // slot.dateはDateTimeString型で、ISO 8601 UTC形式 (YYYY-MM-DDTHH:mm:ss[.sss]Z)
                            // 例: "2025-07-14T00:00:00.000Z" または "2025-07-14T00:00:00Z"
                            const instant = Temporal.Instant.from(slot.date);
                            return instant.toZonedDateTimeISO("UTC");
                          })()}
                          locale={locale}
                          formatOptions={{
                            month: "short",
                            day: "numeric",
                          }}
                          dateOnly
                        />
                        <Text fw={500}>{timeStr}</Text>
                      </Group>
                      <Badge>
                        {slot.participantCount}/{totalParticipants}
                      </Badge>
                    </Group>
                    <Progress value={percentage} size="sm" color="blue" />
                  </Card>
                );
              })}
          </Stack>
        </Paper>

        <Group justify="center">
          <Link
            href={`/${locale satisfies string}/events/${event.id satisfies string}/participate`}
          >
            <Button variant="light">{t("result.updateAvailability")}</Button>
          </Link>
          <Link
            href={`/${locale satisfies string}/events/${event.id satisfies string}`}
          >
            <Button>{t("result.backToEventDetails")}</Button>
          </Link>
        </Group>
      </Stack>
    </Stack>
  );
}
