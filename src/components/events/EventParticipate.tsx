"use client";

import { use } from "react";
import {
  Title,
  Text,
  Paper,
  Stack,
  Group,
  TextInput,
  Alert,
  Badge,
  Center,
  Loader,
} from "@mantine/core";
import { IconCalendar } from "@tabler/icons-react";
import { Temporal } from "temporal-polyfill";
import { useTranslation } from "react-i18next";
import type { Event as EffectEvent } from "@/lib/effects/services/event/schemas";
import { useAuth } from "@/lib/auth/hooks";
import { ScheduleInputLayout } from "@/components/schedule/ScheduleInputLayout";
import { useEventParticipationV2 } from "@/lib/effects/hooks/use-event-participation-v2";

interface EventParticipateProps {
  readonly event: EffectEvent;
  readonly params: Promise<{ locale: string; id: string }>;
}

// メインコンポーネント
export function EventParticipate({ event, params }: EventParticipateProps) {
  const { locale } = use(params);
  const { user } = useAuth();
  const { t } = useTranslation("schedule");

  const {
    error,
    handleSubmit,
    isAutoSaving,
    isLoading,
    participantInfo,
    participants,
    selectedSlots,
    setSelectedSlots,
    showSavedIndicator,
    updateParticipantInfo,
  } = useEventParticipationV2(event, locale);

  // ローディング中の表示
  if (isLoading) {
    return (
      <Center h={400}>
        <Loader size="lg" />
      </Center>
    );
  }

  // DateTimeString型から日付を抽出
  const startInstant = Temporal.Instant.from(event.dateRangeStart);
  const startZonedDateTime = startInstant.toZonedDateTimeISO("UTC");
  const dateRangeStart = startZonedDateTime.toPlainDate();

  const endInstant = Temporal.Instant.from(event.dateRangeEnd);
  const endZonedDateTime = endInstant.toZonedDateTimeISO("UTC");
  const dateRangeEnd = endZonedDateTime.toPlainDate();

  // 手動保存機能を削除（自動保存に変更）

  return (
    <Stack gap="xl">
      <Group justify="space-between" mb="xl">
        <div>
          <Title order={1} mb="xs">
            {event.name}
          </Title>
          <Group gap="xs">
            <IconCalendar size={20} />
            <Text size="sm" c="dimmed">
              {startInstant
                .toZonedDateTimeISO("UTC")
                .toPlainDate()
                .toLocaleString(locale)}{" "}
              -{" "}
              {endInstant
                .toZonedDateTimeISO("UTC")
                .toPlainDate()
                .toLocaleString(locale)}
            </Text>
          </Group>
        </div>
        <Badge size="lg">
          {event.timeSlotDuration === 15
            ? t("participate.minSlots")
            : event.timeSlotDuration === 30
              ? t("participate.halfHourSlots")
              : t("participate.hourSlots")}
        </Badge>
      </Group>

      {event.description && (
        <Paper shadow="xs" p="md" mb="xl" withBorder>
          <Text>{event.description}</Text>
        </Paper>
      )}

      <Stack gap="lg">
        {error && (
          <Alert color="red" title={t("participate.error")}>
            {error}
          </Alert>
        )}

        {!user && (
          <form id="participate-form" onSubmit={handleSubmit}>
            <Paper shadow="sm" p="lg" withBorder mb="lg">
              <Title order={3} mb="md">
                {t("participate.yourInformation")}
              </Title>
              <Stack gap="md">
                <TextInput
                  label={t("participate.name")}
                  placeholder={t("participate.namePlaceholder")}
                  required
                  value={participantInfo.name}
                  onChange={(e) => {
                    updateParticipantInfo({ name: e.target.value });
                  }}
                />
                <TextInput
                  label={t("participate.email")}
                  placeholder={t("participate.emailPlaceholder")}
                  type="email"
                  required
                  value={participantInfo.email}
                  onChange={(e) => {
                    updateParticipantInfo({ email: e.target.value });
                  }}
                />
              </Stack>
            </Paper>
          </form>
        )}
        {user && <form id="participate-form" onSubmit={handleSubmit} />}

        <ScheduleInputLayout
          dateRangeStart={dateRangeStart}
          dateRangeEnd={dateRangeEnd}
          timeSlotDuration={event.timeSlotDuration}
          currentUserSlots={selectedSlots}
          participants={participants}
          onSlotsChange={setSelectedSlots}
          isAutoSaving={isAutoSaving}
          showSavedIndicator={showSavedIndicator}
          showEmails={event.creatorCanSeeEmails}
        />
      </Stack>
    </Stack>
  );
}
