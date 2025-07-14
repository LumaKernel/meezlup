"use client";

import { use, useState, useEffect } from "react";
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
import type { Event as EffectEvent } from "@/lib/effects/services/event/schemas";
import { getAggregatedTimeSlots } from "@/app/actions/schedule";

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aggregatedSlots, setAggregatedSlots] = useState<Array<AggregatedSlot>>(
    [],
  );
  const [totalParticipants, setTotalParticipants] = useState(0);

  useEffect(() => {
    const fetchAggregation = async () => {
      try {
        setLoading(true);
        const result = await getAggregatedTimeSlots(event.id);

        if (!result.success) {
          setError(result.error);
        } else {
          // result.dataは直接TimeSlotAggregationの配列
          // Brand型を含むため、明示的に変換
          const slots: Array<AggregatedSlot> = result.data.map((slot) => ({
            date: slot.date,
            startTime: slot.startTime,
            endTime: slot.endTime,
            participantCount: slot.participantCount,
            participants: slot.participants.map((p) => ({
              scheduleId: p.scheduleId,
              displayName: p.displayName,
              userId: p.userId,
            })),
          }));
          setAggregatedSlots(slots);
          // ユニークな参加者数を計算
          const uniqueParticipants = new Set<string>();
          result.data.forEach((slot) => {
            slot.participants.forEach((p) => {
              uniqueParticipants.add(p.scheduleId);
            });
          });
          setTotalParticipants(uniqueParticipants.size);
        }
      } catch (err) {
        console.error("集計データ取得エラー:", err);
        setError(
          locale === "en"
            ? "Failed to load aggregated data"
            : "集計データの取得に失敗しました",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAggregation().catch((err: unknown) => {
      console.error("非同期エラー:", err);
    });
  }, [event.id, locale]);

  if (loading) {
    return (
      <Center h={400}>
        <Loader size="lg" />
      </Center>
    );
  }

  if (error) {
    return (
      <Alert color="red" title={locale === "en" ? "Error" : "エラー"}>
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
            {locale === "en" ? "Aggregated Results" : "集計結果"}
          </Text>
        </div>
        <Badge size="lg" leftSection={<IconUsers size={16} />}>
          {totalParticipants}{" "}
          {locale === "en"
            ? totalParticipants === 1
              ? "participant"
              : "participants"
            : "人"}
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
            {locale === "en"
              ? "Availability Heatmap"
              : "参加可能時間のヒートマップ"}
          </Title>
          <Text size="sm" c="dimmed" mb="lg">
            {locale === "en"
              ? "Darker colors indicate more participants are available"
              : "色が濃いほど多くの参加者が参加可能です"}
          </Text>

          <Stack gap="xl">
            {Object.entries(slotsByDate).map(([dateStr, slots]) => {
              // 日付文字列からZonedDateTimeへ変換
              let zonedDateTime;
              try {
                // ISO 8601形式の完全な日時文字列の場合
                if (dateStr.includes("T")) {
                  const instant = Temporal.Instant.from(dateStr);
                  zonedDateTime = instant.toZonedDateTimeISO("UTC");
                } else {
                  // 日付のみの場合
                  const plainDate = Temporal.PlainDate.from(dateStr);
                  const plainDateTime = plainDate.toPlainDateTime({
                    hour: 0,
                    minute: 0,
                  });
                  zonedDateTime = plainDateTime.toZonedDateTime("UTC");
                }
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
                                  {locale === "en"
                                    ? slot.participantCount === 1
                                      ? "participant"
                                      : "participants"
                                    : "人"}
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
            {locale === "en" ? "Best Time Slots" : "最適な時間帯"}
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
                            const plainDate = Temporal.PlainDate.from(
                              slot.date,
                            );
                            const plainDateTime = plainDate.toPlainDateTime({
                              hour: 0,
                              minute: 0,
                            });
                            return plainDateTime.toZonedDateTime("UTC");
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
            <Button variant="light">
              {locale === "en"
                ? "Update Your Availability"
                : "参加可能時間を更新"}
            </Button>
          </Link>
          <Link
            href={`/${locale satisfies string}/events/${event.id satisfies string}`}
          >
            <Button>
              {locale === "en" ? "Back to Event Details" : "イベント詳細に戻る"}
            </Button>
          </Link>
        </Group>
      </Stack>
    </Stack>
  );
}
