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
      setError(
        locale === "en"
          ? "Please select at least one time slot"
          : "少なくとも1つの時間帯を選択してください",
      );
      return;
    }

    // 非認証ユーザーの場合、名前とメールアドレスが必須
    if (!user && (!participantName || !participantEmail)) {
      setError(
        locale === "en"
          ? "Please enter your name and email"
          : "名前とメールアドレスを入力してください",
      );
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
            title: locale === "en" ? "Error" : "エラー",
            message: result.error,
            color: "red",
          });
        } else {
          notifications.show({
            title: locale === "en" ? "Success" : "成功",
            message:
              locale === "en"
                ? "Your availability has been submitted"
                : "参加可能時間を送信しました",
            color: "green",
          });

          // 結果ページにリダイレクト
          router.push(
            `/${locale satisfies string}/events/${event.id satisfies string}/result`,
          );
        }
      } catch (err) {
        console.error("参加登録エラー:", err);
        setError(
          locale === "en"
            ? "An unexpected error occurred"
            : "予期しないエラーが発生しました",
        );
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
              {Temporal.PlainDate.from(
                event.dateRangeStart.split("T")[0],
              ).toLocaleString(locale)}{" "}
              -{" "}
              {Temporal.PlainDate.from(
                event.dateRangeEnd.split("T")[0],
              ).toLocaleString(locale)}
            </Text>
          </Group>
        </div>
        <Badge size="lg">
          {event.timeSlotDuration === 15
            ? locale === "en"
              ? "15 min slots"
              : "15分単位"
            : event.timeSlotDuration === 30
              ? locale === "en"
                ? "30 min slots"
                : "30分単位"
              : locale === "en"
                ? "1 hour slots"
                : "1時間単位"}
        </Badge>
      </Group>

      {event.description && (
        <Paper shadow="xs" p="md" mb="xl" withBorder>
          <Text>{event.description}</Text>
        </Paper>
      )}

      <Stack gap="lg">
        {error && (
          <Alert color="red" title={locale === "en" ? "Error" : "エラー"}>
            {error}
          </Alert>
        )}

        {!user && (
          <form id="participate-form" onSubmit={handleSubmit}>
            <Paper shadow="sm" p="lg" withBorder mb="lg">
              <Title order={3} mb="md">
                {locale === "en" ? "Your Information" : "参加者情報"}
              </Title>
              <Stack gap="md">
                <TextInput
                  label={locale === "en" ? "Name" : "名前"}
                  placeholder={
                    locale === "en" ? "Enter your name" : "名前を入力"
                  }
                  required
                  value={participantName}
                  onChange={(e) => {
                    setParticipantName(e.target.value);
                  }}
                />
                <TextInput
                  label={locale === "en" ? "Email" : "メールアドレス"}
                  placeholder={
                    locale === "en"
                      ? "Enter your email"
                      : "メールアドレスを入力"
                  }
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
