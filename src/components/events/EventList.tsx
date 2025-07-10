"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import {
  Title,
  Button,
  Group,
  Card,
  Text,
  Stack,
  Badge,
  Loader,
  Center,
  Alert,
} from "@mantine/core";
import { IconPlus, IconCalendar } from "@tabler/icons-react";
import { Temporal } from "temporal-polyfill";
import { getEventsByCreator } from "@/app/actions/event";
import { useAuth } from "@/lib/auth/hooks";
import type { Event } from "@/lib/effects/services/event/schemas";

interface EventListProps {
  readonly params: Promise<{ locale: string }>;
}

export function EventList({ params }: EventListProps) {
  const { locale } = use(params);
  const { user } = useAuth();
  const [events, setEvents] = useState<Array<Event>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    const fetchEvents = async () => {
      try {
        setLoading(true);
        const result = await getEventsByCreator(user.id);

        if ("error" in result) {
          setError(result.error);
        } else {
          // ReadonlyArrayを通常の配列に変換
          setEvents([...result.data]);
        }
      } catch (err) {
        console.error("イベント取得エラー:", err);
        setError(
          locale === "en"
            ? "Failed to fetch events"
            : "イベントの取得に失敗しました",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchEvents().catch((err: unknown) => {
      console.error("非同期エラー:", err);
    });
  }, [user?.id]);

  if (loading) {
    return (
      <Center h={400}>
        <Loader size="lg" />
      </Center>
    );
  }

  if (error) {
    return (
      <Alert color="red" title="エラー">
        {error}
      </Alert>
    );
  }

  return (
    <div>
      <Group justify="space-between" mb="xl">
        <Title order={1}>
          {locale === "en" ? "My Events" : "マイイベント"}
        </Title>
        <Link href={`/${locale satisfies string}/events/new`}>
          <Button leftSection={<IconPlus size={18} />}>
            {locale === "en" ? "Create Event" : "イベントを作成"}
          </Button>
        </Link>
      </Group>

      {events.length === 0 ? (
        <Card withBorder p="xl">
          <Stack align="center" gap="md">
            <IconCalendar size={48} color="gray" />
            <Text size="lg" c="dimmed">
              {locale === "en"
                ? "No events yet. Create your first event!"
                : "まだイベントがありません。最初のイベントを作成しましょう！"}
            </Text>
            <Link href={`/${locale satisfies string}/events/new`}>
              <Button variant="light">
                {locale === "en" ? "Create Event" : "イベントを作成"}
              </Button>
            </Link>
          </Stack>
        </Card>
      ) : (
        <Stack gap="md">
          {events.map((event) => (
            <Link
              key={event.id}
              href={`/${locale satisfies string}/events/${event.id satisfies string}`}
              style={{ textDecoration: "none" }}
            >
              <Card withBorder p="lg" style={{ cursor: "pointer" }}>
                <Group justify="space-between" mb="xs">
                  <Text size="lg" fw={600}>
                    {event.name}
                  </Text>
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
                {event.description && (
                  <Text size="sm" c="dimmed" mb="xs">
                    {event.description}
                  </Text>
                )}
                <Group gap="xs">
                  <Text size="sm">
                    {locale === "en" ? "Start:" : "開始:"}{" "}
                    {Temporal.PlainDate.from(
                      event.dateRangeStart.split("T")[0],
                    ).toLocaleString(locale)}
                  </Text>
                  <Text size="sm">
                    {locale === "en" ? "End:" : "終了:"}{" "}
                    {Temporal.PlainDate.from(
                      event.dateRangeEnd.split("T")[0],
                    ).toLocaleString(locale)}
                  </Text>
                </Group>
              </Card>
            </Link>
          ))}
        </Stack>
      )}
    </div>
  );
}
