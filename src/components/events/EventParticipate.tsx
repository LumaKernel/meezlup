"use client";

import { use, useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Title,
  Text,
  Paper,
  Stack,
  Group,
  Button,
  TextInput,
  Alert,
  Badge,
  Checkbox,
  Grid,
  Card,
  Loader,
  Center,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconCalendar, IconClock } from "@tabler/icons-react";
import { Temporal } from "temporal-polyfill";
import type { Event as EffectEvent } from "@/lib/effects/services/event/schemas";
import { useAuth } from "@/lib/auth/hooks";
import { submitAvailability } from "@/app/actions/schedule";

interface EventParticipateProps {
  readonly event: EffectEvent;
  readonly params: Promise<{ locale: string; id: string }>;
}

type TimeSlot = {
  date: Temporal.PlainDate;
  time: Temporal.PlainTime;
  selected: boolean;
};

export function EventParticipate({ event, params }: EventParticipateProps) {
  const { locale } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [participantName, setParticipantName] = useState("");
  const [participantEmail, setParticipantEmail] = useState("");
  const [timeSlots, setTimeSlots] = useState<Array<TimeSlot>>([]);
  const [loading, setLoading] = useState(true);

  // 認証状態に基づいてフォームを初期化
  useEffect(() => {
    if (user && "email" in user) {
      setParticipantEmail(user.email);
      setParticipantName(user.name || "");
    }
  }, [user]);

  // イベントの日付範囲から時間枠を生成
  useEffect(() => {
    const generateTimeSlots = () => {
      const slots: Array<TimeSlot> = [];
      const startDate = Temporal.PlainDate.from(
        event.dateRangeStart.split("T")[0],
      );
      const endDate = Temporal.PlainDate.from(event.dateRangeEnd.split("T")[0]);

      // 各日付に対して時間枠を生成
      let currentDate = startDate;
      while (Temporal.PlainDate.compare(currentDate, endDate) <= 0) {
        // 9:00から18:00まで、指定された時間幅で区切る
        const startTime = Temporal.PlainTime.from("09:00");
        const endTime = Temporal.PlainTime.from("18:00");
        let currentTime = startTime;

        while (Temporal.PlainTime.compare(currentTime, endTime) < 0) {
          slots.push({
            date: currentDate,
            time: currentTime,
            selected: false,
          });

          // 次の時間枠へ
          currentTime = currentTime.add({
            minutes: event.timeSlotDuration,
          });
        }

        currentDate = currentDate.add({ days: 1 });
      }

      setTimeSlots(slots);
      setLoading(false);
    };

    generateTimeSlots();
  }, [event]);

  const handleTimeSlotToggle = (index: number) => {
    setTimeSlots((prev) =>
      prev.map((slot, i) =>
        i === index ? { ...slot, selected: !slot.selected } : slot,
      ),
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 選択された時間枠を取得
    const selectedSlots = timeSlots.filter((slot) => slot.selected);
    if (selectedSlots.length === 0) {
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
        const result = await submitAvailability({
          eventId: event.id,
          participantName: user ? undefined : participantName,
          participantEmail: user ? undefined : participantEmail,
          availableSlots: selectedSlots.map((slot) => ({
            date: slot.date.toString(),
            time: slot.time.toString(),
          })),
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

  // 日付ごとにグループ化
  const slotsByDate = timeSlots.reduce<
    Record<string, Array<{ slot: TimeSlot; index: number }>>
  >((acc, slot, index) => {
    const dateStr = slot.date.toString();
    acc[dateStr] = acc[dateStr] ?? [];
    acc[dateStr].push({ slot, index });
    return acc;
  }, {});

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

      <form onSubmit={handleSubmit}>
        <Stack gap="lg">
          {error && (
            <Alert color="red" title={locale === "en" ? "Error" : "エラー"}>
              {error}
            </Alert>
          )}

          {!user && (
            <Paper shadow="sm" p="lg" withBorder>
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
          )}

          <Paper shadow="sm" p="lg" withBorder>
            <Title order={3} mb="md">
              {locale === "en"
                ? "Select Available Time Slots"
                : "参加可能な時間帯を選択"}
            </Title>
            <Text size="sm" c="dimmed" mb="lg">
              {locale === "en"
                ? "Check all the time slots when you are available"
                : "参加可能な時間帯をすべてチェックしてください"}
            </Text>

            <Stack gap="xl">
              {Object.entries(slotsByDate).map(([dateStr, slots]) => {
                const date = Temporal.PlainDate.from(dateStr);
                return (
                  <div key={dateStr}>
                    <Title order={4} mb="md">
                      <Group gap="xs">
                        <IconCalendar size={20} />
                        {date.toLocaleString(locale, {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </Group>
                    </Title>
                    <Grid>
                      {slots.map(({ index, slot }) => (
                        <Grid.Col span={{ base: 6, sm: 4, md: 3 }} key={index}>
                          <Card
                            padding="sm"
                            withBorder
                            style={{
                              cursor: "pointer",
                              backgroundColor: slot.selected
                                ? "var(--mantine-color-blue-0)"
                                : undefined,
                              borderColor: slot.selected
                                ? "var(--mantine-color-blue-6)"
                                : undefined,
                            }}
                            onClick={() => {
                              handleTimeSlotToggle(index);
                            }}
                          >
                            <Group gap="xs">
                              <Checkbox
                                checked={slot.selected}
                                onChange={() => {
                                  handleTimeSlotToggle(index);
                                }}
                                size="sm"
                              />
                              <Group gap="xs">
                                <IconClock size={16} />
                                <Text size="sm">
                                  {slot.time.toString().substring(0, 5)}
                                </Text>
                              </Group>
                            </Group>
                          </Card>
                        </Grid.Col>
                      ))}
                    </Grid>
                  </div>
                );
              })}
            </Stack>
          </Paper>

          <Group justify="flex-end">
            <Button
              variant="subtle"
              onClick={() => {
                router.back();
              }}
              disabled={isPending}
            >
              {locale === "en" ? "Cancel" : "キャンセル"}
            </Button>
            <Button type="submit" loading={isPending}>
              {locale === "en" ? "Submit Availability" : "参加可能時間を送信"}
            </Button>
          </Group>
        </Stack>
      </form>
    </Stack>
  );
}
