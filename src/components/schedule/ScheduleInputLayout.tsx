"use client";

import { useState, useCallback } from "react";
import {
  Box,
  Grid,
  Stack,
  Title,
  Text,
  Button,
  Group,
  Paper,
} from "@mantine/core";
import { IconCalendarEvent, IconUsers } from "@tabler/icons-react";
import { type Temporal } from "temporal-polyfill";
import { ScheduleGrid } from "./ScheduleGrid";
import { ScheduleAggregateGrid } from "./ScheduleAggregateGrid";
import classes from "./ScheduleInputLayout.module.css";

interface Participant {
  readonly id: string;
  readonly name: string;
  readonly email?: string;
  readonly availableSlots: ReadonlySet<string>;
}

interface ScheduleInputLayoutProps {
  readonly dateRangeStart: Temporal.PlainDate;
  readonly dateRangeEnd: Temporal.PlainDate;
  readonly timeSlotDuration: 15 | 30 | 60;
  readonly currentUserSlots: ReadonlySet<string>;
  readonly participants: ReadonlyArray<Participant>;
  readonly onSlotsChange: (slots: ReadonlySet<string>) => void;
  readonly onSave: () => void;
  readonly isSaving: boolean;
  readonly locale: string;
  readonly showEmails: boolean;
}

export function ScheduleInputLayout({
  currentUserSlots,
  dateRangeEnd,
  dateRangeStart,
  isSaving,
  locale,
  onSave,
  onSlotsChange,
  participants,
  showEmails,
  timeSlotDuration,
}: ScheduleInputLayoutProps) {
  const [showParticipantList, setShowParticipantList] = useState(false);
  const [focusedParticipants, setFocusedParticipants] = useState<
    ReadonlyArray<Participant>
  >([]);

  // 右側グリッドのスロットホバー時の処理
  const handleSlotHover = useCallback(
    (slotId: string, slotParticipants: ReadonlyArray<Participant>) => {
      setFocusedParticipants(slotParticipants);
      setShowParticipantList(true);
    },
    [],
  );

  // 右側グリッドのスロットクリック時の処理
  const handleSlotClick = useCallback(
    (slotId: string, slotParticipants: ReadonlyArray<Participant>) => {
      setFocusedParticipants(slotParticipants);
      setShowParticipantList(true);
    },
    [],
  );

  // 編集モードに戻る
  const handleBackToEdit = useCallback(() => {
    setShowParticipantList(false);
    setFocusedParticipants([]);
  }, []);

  return (
    <Box className={classes.container}>
      <Grid gutter="lg" className={classes.grid}>
        {/* 左側：入力エリア */}
        <Grid.Col span={{ base: 12, lg: 6 }}>
          <Stack gap="md">
            <Group justify="space-between">
              <Group gap="xs">
                <IconCalendarEvent size={20} />
                <Title order={3}>
                  {locale === "ja"
                    ? "参加可能時間を選択"
                    : "Select Available Times"}
                </Title>
              </Group>
              <Button
                onClick={onSave}
                loading={isSaving}
                disabled={currentUserSlots.size === 0}
              >
                {locale === "ja" ? "保存" : "Save"}
              </Button>
            </Group>

            {showParticipantList && focusedParticipants.length > 0 ? (
              <Paper shadow="sm" p="md" withBorder>
                <Stack gap="sm">
                  <Group justify="space-between">
                    <Text fw={500}>
                      {locale === "ja"
                        ? `参加可能な人 (${focusedParticipants.length satisfies number}人)`
                        : `Available Participants (${focusedParticipants.length satisfies number})`}
                    </Text>
                    <Button
                      size="xs"
                      variant="subtle"
                      onClick={handleBackToEdit}
                    >
                      {locale === "ja" ? "編集に戻る" : "Back to Edit"}
                    </Button>
                  </Group>
                  <Stack gap="xs">
                    {focusedParticipants.map((participant) => (
                      <Group key={participant.id} gap="xs">
                        <Text size="sm">{participant.name}</Text>
                        {showEmails && participant.email && (
                          <Text size="xs" c="dimmed">
                            ({participant.email})
                          </Text>
                        )}
                      </Group>
                    ))}
                  </Stack>
                </Stack>
              </Paper>
            ) : (
              <ScheduleGrid
                dateRangeStart={dateRangeStart}
                dateRangeEnd={dateRangeEnd}
                timeSlotDuration={timeSlotDuration}
                selectedSlots={currentUserSlots}
                onSlotsChange={onSlotsChange}
                locale={locale}
              />
            )}

            <Text size="sm" c="dimmed">
              {locale === "ja"
                ? "マウスでドラッグして複数の時間帯を選択できます"
                : "Drag with mouse to select multiple time slots"}
            </Text>
          </Stack>
        </Grid.Col>

        {/* 右側：集計表示エリア */}
        <Grid.Col span={{ base: 12, lg: 6 }}>
          <Stack gap="md">
            <Group gap="xs">
              <IconUsers size={20} />
              <Title order={3}>
                {locale === "ja"
                  ? "全体の参加可能状況"
                  : "Overall Availability"}
              </Title>
            </Group>

            <ScheduleAggregateGrid
              dateRangeStart={dateRangeStart}
              dateRangeEnd={dateRangeEnd}
              timeSlotDuration={timeSlotDuration}
              participants={participants}
              showEmails={showEmails}
              locale={locale}
              onSlotHover={handleSlotHover}
              onSlotClick={handleSlotClick}
            />

            <Text size="sm" c="dimmed">
              {locale === "ja"
                ? "セルをホバーまたはクリックして参加者を確認できます"
                : "Hover or click cells to see participants"}
            </Text>
          </Stack>
        </Grid.Col>
      </Grid>
    </Box>
  );
}
