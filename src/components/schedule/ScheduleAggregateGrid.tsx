"use client";

import { useState, useCallback, useMemo } from "react";
import {
  Box,
  Stack,
  Group,
  Text,
  Paper,
  Tooltip,
  Button,
  Badge,
} from "@mantine/core";
import { IconDownload, IconUsers } from "@tabler/icons-react";
import { Temporal } from "temporal-polyfill";
import { useTranslation } from "react-i18next";
import classes from "./ScheduleAggregateGrid.module.css";

interface Participant {
  readonly id: string;
  readonly name: string;
  readonly email?: string;
  readonly availableSlots: ReadonlySet<string>;
}

interface ScheduleAggregateGridProps {
  readonly dateRangeStart: Temporal.PlainDate;
  readonly dateRangeEnd: Temporal.PlainDate;
  readonly timeSlotDuration: 15 | 30 | 60;
  readonly participants: ReadonlyArray<Participant>;
  readonly showEmails: boolean;
  readonly onSlotHover?: (
    slotId: string,
    participants: ReadonlyArray<Participant>,
  ) => void;
  readonly onSlotClick?: (
    slotId: string,
    participants: ReadonlyArray<Participant>,
  ) => void;
}

export function ScheduleAggregateGrid({
  dateRangeEnd,
  dateRangeStart,
  onSlotClick,
  onSlotHover,
  participants,
  showEmails,
  timeSlotDuration,
}: ScheduleAggregateGridProps) {
  const { t } = useTranslation("schedule");
  const [focusedSlot, setFocusedSlot] = useState<string | null>(null);
  const [hoveredSlot, setHoveredSlot] = useState<string | null>(null);

  // 日付の配列を生成
  const dates: Array<Temporal.PlainDate> = [];
  let currentDate = dateRangeStart;
  while (Temporal.PlainDate.compare(currentDate, dateRangeEnd) <= 0) {
    dates.push(currentDate);
    currentDate = currentDate.add({ days: 1 });
  }

  // 時間スロットの配列を生成
  const timeSlots: Array<Temporal.PlainTime> = [];
  const slotsPerHour = 60 / timeSlotDuration;
  for (let hour = 0; hour < 24; hour++) {
    for (let slot = 0; slot < slotsPerHour; slot++) {
      const minute = slot * timeSlotDuration;
      timeSlots.push(new Temporal.PlainTime(hour, minute));
    }
  }

  // スロットのIDを生成
  const getSlotId = (date: Temporal.PlainDate, time: Temporal.PlainTime) => {
    return `${date.toString() satisfies string}_${time.toString() satisfies string}`;
  };

  // 各スロットの参加者数を計算
  const slotParticipantCounts = useMemo(() => {
    const counts = new Map<string, number>();
    const slotParticipants = new Map<string, Array<Participant>>();

    dates.forEach((date) => {
      timeSlots.forEach((time) => {
        const slotId = getSlotId(date, time);
        const availableParticipants = participants.filter((p) =>
          p.availableSlots.has(slotId),
        );
        counts.set(slotId, availableParticipants.length);
        slotParticipants.set(slotId, availableParticipants);
      });
    });

    return { counts, slotParticipants };
  }, [dates, timeSlots, participants]);

  const maxParticipants = Math.max(...slotParticipantCounts.counts.values(), 1);

  // セルの背景色を取得
  const getCellColor = (count: number) => {
    if (count === 0) return "transparent";
    const intensity = count / maxParticipants;
    return `rgba(34, 139, 230, ${(intensity * 0.8) satisfies number})`; // Mantine blue
  };

  // セルのホバーハンドラ
  const handleCellHover = useCallback(
    (slotId: string) => {
      setHoveredSlot(slotId);
      const participants =
        slotParticipantCounts.slotParticipants.get(slotId) || [];
      onSlotHover?.(slotId, participants);
    },
    [slotParticipantCounts.slotParticipants, onSlotHover],
  );

  // セルのクリックハンドラ
  const handleCellClick = useCallback(
    (slotId: string) => {
      setFocusedSlot(focusedSlot === slotId ? null : slotId);
      const participants =
        slotParticipantCounts.slotParticipants.get(slotId) || [];
      onSlotClick?.(slotId, participants);
    },
    [focusedSlot, slotParticipantCounts.slotParticipants, onSlotClick],
  );

  // CSVダウンロード
  const downloadCSV = useCallback(() => {
    const headers = ["Date", "Time", "Participants", "Count"];
    const rows: Array<Array<string>> = [];

    dates.forEach((date) => {
      timeSlots.forEach((time) => {
        const slotId = getSlotId(date, time);
        const slotParticipants =
          slotParticipantCounts.slotParticipants.get(slotId) || [];
        const names = slotParticipants.map((p) => p.name).join(", ");
        rows.push([
          date.toString(),
          time.toString(),
          names,
          slotParticipants.length.toString(),
        ]);
      });
    });

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `schedule_${new Date().toISOString().split("T")[0] satisfies string}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [dates, timeSlots, slotParticipantCounts.slotParticipants]);

  // JSONダウンロード
  const downloadJSON = useCallback(() => {
    const data = dates.flatMap((date) =>
      timeSlots.map((time) => {
        const slotId = getSlotId(date, time);
        const slotParticipants =
          slotParticipantCounts.slotParticipants.get(slotId) || [];
        return {
          date: date.toString(),
          time: time.toString(),
          participants: slotParticipants.map((p) => ({
            name: p.name,
            ...(showEmails && { email: p.email }),
          })),
          count: slotParticipants.length,
        };
      }),
    );

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `schedule_${new Date().toISOString().split("T")[0] satisfies string}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [dates, timeSlots, slotParticipantCounts.slotParticipants, showEmails]);

  // 曜日を取得
  const getDayOfWeek = (date: Temporal.PlainDate) => {
    const dayKeys = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;
    return t(`weekdays.${dayKeys[date.dayOfWeek % 7] satisfies string}`);
  };

  return (
    <Paper shadow="sm" p="md" withBorder>
      <Stack gap="md">
        <Group justify="space-between">
          <Group gap="xs">
            <IconUsers size={20} />
            <Text fw={500}>{t("aggregate.availableTimes")}</Text>
            <Badge color="blue">
              {participants.length} {t("aggregate.participants")}
            </Badge>
          </Group>
          {focusedSlot && (
            <Group gap="xs">
              <Button
                size="xs"
                variant="light"
                leftSection={<IconDownload size={14} />}
                onClick={downloadCSV}
              >
                CSV
              </Button>
              <Button
                size="xs"
                variant="light"
                leftSection={<IconDownload size={14} />}
                onClick={downloadJSON}
              >
                JSON
              </Button>
            </Group>
          )}
        </Group>

        <Box className={classes.gridContainer}>
          {/* ヘッダー行 */}
          <Box className={classes.headerRow}>
            <Box className={classes.timeHeader}>{t("aggregate.time")}</Box>
            {dates.map((date) => (
              <Box
                key={date.toString()}
                className={`${classes.dateHeader satisfies string} ${
                  (date.dayOfWeek === 7 ? classes.sunday : "") satisfies string
                } ${(date.dayOfWeek === 1 ? classes.monday : "") satisfies string}`}
              >
                <Text size="sm" fw={500}>
                  {date.month}/{date.day}
                </Text>
                <Text size="xs" c="dimmed">
                  {getDayOfWeek(date)}
                </Text>
              </Box>
            ))}
          </Box>

          {/* グリッド本体 */}
          <Box className={classes.gridBody}>
            {timeSlots.map((time) => (
              <Box key={time.toString()} className={classes.timeRow}>
                <Box className={classes.timeLabel}>
                  {time.hour.toString().padStart(2, "0")}:
                  {time.minute.toString().padStart(2, "0")}
                </Box>
                {dates.map((date) => {
                  const slotId = getSlotId(date, time);
                  const count = slotParticipantCounts.counts.get(slotId) || 0;
                  const slotParticipants =
                    slotParticipantCounts.slotParticipants.get(slotId) || [];
                  const isFocused = focusedSlot === slotId;
                  const isHovered = hoveredSlot === slotId;

                  return (
                    <Tooltip
                      key={slotId}
                      label={
                        count > 0 ? (
                          <Stack gap={4}>
                            <Text size="xs" fw={500}>
                              {count} {t("aggregate.available")}
                            </Text>
                            {(isHovered || isFocused) && (
                              <Stack gap={2}>
                                {slotParticipants.slice(0, 5).map((p) => (
                                  <Text key={p.id} size="xs">
                                    {p.name}
                                  </Text>
                                ))}
                                {slotParticipants.length > 5 && (
                                  <Text size="xs" c="dimmed">
                                    +{slotParticipants.length - 5}{" "}
                                    {t("aggregate.more")}
                                  </Text>
                                )}
                              </Stack>
                            )}
                          </Stack>
                        ) : (
                          t("aggregate.noParticipants")
                        )
                      }
                      position="top"
                      withArrow
                      disabled={!isHovered && !isFocused}
                    >
                      <Box
                        className={`${classes.cell satisfies string} ${
                          (isFocused ? classes.focused : "") satisfies string
                        } ${(date.dayOfWeek === 7 ? classes.sundayCell : "") satisfies string} ${
                          (date.dayOfWeek === 1
                            ? classes.mondayCell
                            : "") satisfies string
                        }`}
                        style={{
                          backgroundColor: getCellColor(count),
                        }}
                        onMouseEnter={() => {
                          handleCellHover(slotId);
                        }}
                        onMouseLeave={() => {
                          setHoveredSlot(null);
                        }}
                        onClick={() => {
                          handleCellClick(slotId);
                        }}
                        role="button"
                        tabIndex={0}
                        aria-label={`${date.toString() satisfies string} ${time.toString() satisfies string} - ${
                          count satisfies number
                        } ${t("aggregate.participantsAvailable") satisfies string}`}
                      >
                        {count > 0 && (
                          <Text size="xs" className={classes.cellCount}>
                            {count}
                          </Text>
                        )}
                      </Box>
                    </Tooltip>
                  );
                })}
              </Box>
            ))}
          </Box>
        </Box>
      </Stack>
    </Paper>
  );
}
