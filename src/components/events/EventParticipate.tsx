"use client";

import { use, useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Title,
  Text,
  Paper,
  Stack,
  Group,
  TextInput,
  Alert,
  Badge,
  Loader,
  Center,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconCalendar } from "@tabler/icons-react";
import { Temporal } from "temporal-polyfill";
import { useTranslation } from "react-i18next";
import type { Event as EffectEvent } from "@/lib/effects/services/event/schemas";
import { useAuth } from "@/lib/auth/hooks";
import {
  submitAvailability,
  getAggregatedTimeSlots,
} from "@/app/actions/schedule";
import { ScheduleInputLayout } from "@/components/schedule/ScheduleInputLayout";

interface EventParticipateProps {
  readonly event: EffectEvent;
  readonly params: Promise<{ locale: string; id: string }>;
}

interface Participant {
  readonly id: string;
  readonly name: string;
  readonly email?: string;
  availableSlots: ReadonlySet<string>;
}

export function EventParticipate({ event, params }: EventParticipateProps) {
  const { locale } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useTranslation("schedule");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [participantName, setParticipantName] = useState("");
  const [participantEmail, setParticipantEmail] = useState("");
  const [selectedSlots, setSelectedSlots] = useState<ReadonlySet<string>>(
    new Set(),
  );
  const [participants, setParticipants] = useState<Array<Participant>>([]);
  const [loading, setLoading] = useState(true);

  // 認証状態に基づいてフォームを初期化
  useEffect(() => {
    if (user && "email" in user) {
      setParticipantEmail(user.email);
      setParticipantName(user.name || "");
    }
  }, [user]);

  // 既存の参加者データを取得
  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        const result = await getAggregatedTimeSlots(event.id);
        if (result.success) {
          // 参加者データを変換
          const participantMap = new Map<string, Participant>();
          const currentUserSlots = new Set<string>();

          result.data.forEach((slot) => {
            slot.participants.forEach((p) => {
              // 既存のparticipantMap処理
              if (!participantMap.has(p.scheduleId)) {
                participantMap.set(p.scheduleId, {
                  id: p.scheduleId,
                  name: p.displayName,
                  availableSlots: new Set<string>(),
                });
              }
              const participant = participantMap.get(p.scheduleId)!;

              // DateTimeString型から日付部分を適切に抽出
              const instant = Temporal.Instant.from(slot.date);
              const zonedDateTime = instant.toZonedDateTimeISO("UTC");
              const plainDate = zonedDateTime.toPlainDate();
              const dateStr = plainDate.toString();

              const hours = Math.floor(slot.startTime / 60);
              const minutes = slot.startTime % 60;
              const time = `${hours.toString().padStart(2, "0") satisfies string}:${minutes.toString().padStart(2, "0") satisfies string}:00`;
              const slotId = `${dateStr satisfies string}_${time satisfies string}`;

              // ReadonlySetを新しいSetに変換してから追加
              const newSlots = new Set(participant.availableSlots);
              newSlots.add(slotId);
              participant.availableSlots = newSlots;

              // 現在のユーザーのスケジュールをチェック
              if (user && p.userId === user.id) {
                currentUserSlots.add(slotId);
              }
            });
          });

          setParticipants(Array.from(participantMap.values()));

          // 現在のユーザーの既存スケジュールを設定
          if (currentUserSlots.size > 0) {
            setSelectedSlots(currentUserSlots);
          }
        }
      } catch (err) {
        console.error("参加者データ取得エラー:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchParticipants().catch((err: unknown) => {
      console.error("非同期エラー:", err);
    });
  }, [event.id, user]);

  // DateTimeString型から日付を抽出
  const startInstant = Temporal.Instant.from(event.dateRangeStart);
  const startZonedDateTime = startInstant.toZonedDateTimeISO("UTC");
  const dateRangeStart = startZonedDateTime.toPlainDate();

  const endInstant = Temporal.Instant.from(event.dateRangeEnd);
  const endZonedDateTime = endInstant.toZonedDateTimeISO("UTC");
  const dateRangeEnd = endZonedDateTime.toPlainDate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 選択された時間枠を取得
    if (selectedSlots.size === 0) {
      setError(t("participate.selectTimeSlot"));
      return;
    }

    // 非認証ユーザーの場合、名前とメールアドレスが必須
    if (!user && (!participantName || !participantEmail)) {
      setError(t("participate.enterNameAndEmail"));
      return;
    }

    startTransition(async () => {
      try {
        // スロットIDから日付と時間を抽出
        const availableSlots = Array.from(selectedSlots).map((slotId) => {
          const [date, time] = slotId.split("_");
          return {
            date,
            time: time.substring(0, 5), // HH:MM形式に変換
          };
        });

        const result = await submitAvailability({
          eventId: event.id,
          participantName: user ? undefined : participantName,
          participantEmail: user ? undefined : participantEmail,
          availableSlots,
        });

        if (!result.success) {
          setError(result.error);
          notifications.show({
            title: t("participate.error"),
            message: result.error,
            color: "red",
          });
        } else {
          notifications.show({
            title: t("participate.success"),
            message: t("participate.submitted"),
            color: "green",
          });

          // 結果ページにリダイレクト
          router.push(
            `/${locale satisfies string}/events/${event.id satisfies string}/result`,
          );
        }
      } catch (err) {
        console.error("参加登録エラー:", err);
        setError(t("participate.unexpectedError"));
      }
    });
  };

  if (loading) {
    return (
      <Center h={400}>
        <Loader size="lg" />
      </Center>
    );
  }

  const handleSave = () => {
    const form = document.getElementById("participate-form");
    if (form instanceof HTMLFormElement) {
      form.requestSubmit();
    }
  };

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
              {startInstant.toZonedDateTimeISO("UTC").toPlainDate().toLocaleString(locale)}{" "}
              -{" "}
              {endInstant.toZonedDateTimeISO("UTC").toPlainDate().toLocaleString(locale)}
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
                  value={participantName}
                  onChange={(e) => {
                    setParticipantName(e.target.value);
                  }}
                />
                <TextInput
                  label={t("participate.email")}
                  placeholder={t("participate.emailPlaceholder")}
                  type="email"
                  required
                  value={participantEmail}
                  onChange={(e) => {
                    setParticipantEmail(e.target.value);
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
          onSave={handleSave}
          isSaving={isPending}
          locale={locale}
          showEmails={event.creatorCanSeeEmails}
        />
      </Stack>
    </Stack>
  );
}
