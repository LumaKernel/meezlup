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
import { useTranslation } from "react-i18next";
import { getEventsByCreator } from "@/app/actions/event";
import { useAuth } from "@/lib/auth/hooks";
import type { Event } from "@/lib/effects/services/event/schemas";

interface EventListProps {
  readonly params: Promise<{ locale: string }>;
}

export function EventList({ params }: EventListProps) {
  const { locale } = use(params);
  const { t } = useTranslation("event");
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
        setError(t("list.failedToFetch"));
      } finally {
        setLoading(false);
      }
    };

    fetchEvents().catch((err: unknown) => {
      console.error("非同期エラー:", err);
    });
  }, [user?.id, locale]);

  if (loading) {
    return (
      <Center h={400}>
        <Loader size="lg" />
      </Center>
    );
  }

  if (error) {
    return (
      <Alert color="red" title={t("list.error")}>
        {error}
      </Alert>
    );
  }

  return (
    <div>
      <Group justify="space-between" mb="xl">
        <Title order={1}>
          {t("list.myEvents")}
        </Title>
        <Link href={`/${locale satisfies string}/events/new`}>
          <Button leftSection={<IconPlus size={18} />}>
            {t("list.createEvent")}
          </Button>
        </Link>
      </Group>

      {events.length === 0 ? (
        <Card withBorder p="xl">
          <Stack align="center" gap="md">
            <IconCalendar size={48} color="gray" />
            <Text size="lg" c="dimmed">
              {t("list.noEvents")}
            </Text>
            <Link href={`/${locale satisfies string}/events/new`}>
              <Button variant="light">
                {t("list.createEvent")}
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
                      ? t("list.linkOnly")
                      : event.participantRestrictionType === "none"
                        ? t("list.public")
                        : t("list.private")}
                  </Badge>
                </Group>
                {event.description && (
                  <Text size="sm" c="dimmed" mb="xs">
                    {event.description}
                  </Text>
                )}
                <Group gap="xs">
                  <Text size="sm">
                    {t("list.start")}{" "}
                    {Temporal.PlainDate.from(
                      event.dateRangeStart.split("T")[0],
                    ).toLocaleString(locale)}
                  </Text>
                  <Text size="sm">
                    {t("list.end")}{" "}
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
