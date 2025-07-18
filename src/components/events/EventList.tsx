"use client";

import { use } from "react";
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
import { useQuery } from "@tanstack/react-query";

interface EventListProps {
  readonly params: Promise<{ locale: string }>;
}

export function EventList({ params }: EventListProps) {
  const { locale } = use(params);
  const { t } = useTranslation("event");
  const { user } = useAuth();

  const {
    data: events = [],
    error: queryError,
    isLoading,
  } = useQuery({
    queryKey: ["events", "creator", user?.id],
    queryFn: async () => {
      if (!user?.id) {
        return [];
      }
      const result = await getEventsByCreator(user.id);
      if ("error" in result) {
        throw new Error(result.error);
      }
      // ReadonlyArrayを通常の配列に変換
      return [...result.data];
    },
    enabled: !!user?.id,
  });

  const error = queryError ? t("list.failedToFetch") : null;

  if (isLoading) {
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
        <Title order={1}>{t("list.myEvents")}</Title>
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
              <Button variant="light">{t("list.createEvent")}</Button>
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
