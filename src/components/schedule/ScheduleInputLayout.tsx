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
  Loader,
  Modal,
} from "@mantine/core";
import {
  IconCalendarEvent,
  IconUsers,
  IconCheck,
  IconDownload,
} from "@tabler/icons-react";
import { type Temporal } from "temporal-polyfill";
import { useTranslation } from "react-i18next";
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
  readonly isAutoSaving: boolean;
  readonly hasUnsavedChanges: boolean;
  readonly showSavedIndicator: boolean;
  readonly showEmails: boolean;
}

export function ScheduleInputLayout({
  currentUserSlots,
  dateRangeEnd,
  dateRangeStart,
  hasUnsavedChanges,
  isAutoSaving,
  onSlotsChange,
  participants,
  showEmails,
  showSavedIndicator,
  timeSlotDuration,
}: ScheduleInputLayoutProps) {
  const { t } = useTranslation("schedule");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalParticipants, setModalParticipants] = useState<
    ReadonlyArray<Participant>
  >([]);
  const [modalSlotId, setModalSlotId] = useState<string>("");

  // 右側グリッドのスロットクリック時の処理
  const handleSlotClick = useCallback(
    (slotId: string, slotParticipants: ReadonlyArray<Participant>) => {
      setModalSlotId(slotId);
      setModalParticipants(slotParticipants);
      setIsModalOpen(true);
    },
    [],
  );

  // CSVダウンロード
  const downloadCSV = useCallback(() => {
    if (!modalSlotId || modalParticipants.length === 0) return;

    const headers = ["Name", showEmails ? "Email" : null].filter(Boolean);
    const rows = modalParticipants.map((p) => {
      const row = [p.name];
      if (showEmails && p.email) row.push(p.email);
      return row;
    });

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `participants_${modalSlotId satisfies string}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [modalSlotId, modalParticipants, showEmails]);

  // JSONダウンロード
  const downloadJSON = useCallback(() => {
    if (!modalSlotId || modalParticipants.length === 0) return;

    const data = modalParticipants.map((p) => ({
      name: p.name,
      ...(showEmails && p.email ? { email: p.email } : {}),
    }));

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `participants_${modalSlotId satisfies string}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [modalSlotId, modalParticipants, showEmails]);

  return (
    <Box className={classes.container}>
      <Grid gutter="lg" className={classes.grid}>
        {/* 左側：入力エリア */}
        <Grid.Col span={{ base: 12, lg: 6 }}>
          <Stack gap="md">
            <Group justify="space-between">
              <Group gap="xs">
                <IconCalendarEvent size={20} />
                <Title order={3}>{t("input.selectAvailableTimes")}</Title>
              </Group>
              <Group gap="xs">
                {isAutoSaving ? (
                  <>
                    <Loader size="xs" />
                    <Text size="sm" c="dimmed">
                      {t("input.saving")}
                    </Text>
                  </>
                ) : showSavedIndicator ? (
                  <>
                    <IconCheck size={16} color="var(--mantine-color-green-6)" />
                    <Text size="sm" c="dimmed">
                      {t("input.saved")}
                    </Text>
                  </>
                ) : hasUnsavedChanges ? (
                  <Text size="sm" c="dimmed">
                    {t("input.unsaved")}
                  </Text>
                ) : null}
              </Group>
            </Group>

            <ScheduleGrid
              dateRangeStart={dateRangeStart}
              dateRangeEnd={dateRangeEnd}
              timeSlotDuration={timeSlotDuration}
              selectedSlots={currentUserSlots}
              onSlotsChange={onSlotsChange}
            />

            <Text size="sm" c="dimmed">
              {t("input.dragToSelect")}
            </Text>
          </Stack>
        </Grid.Col>

        {/* 右側：集計表示エリア */}
        <Grid.Col span={{ base: 12, lg: 6 }}>
          <Stack gap="md">
            <Group gap="xs">
              <IconUsers size={20} />
              <Title order={3}>{t("input.overallAvailability")}</Title>
            </Group>

            <ScheduleAggregateGrid
              dateRangeStart={dateRangeStart}
              dateRangeEnd={dateRangeEnd}
              timeSlotDuration={timeSlotDuration}
              participants={participants}
              showEmails={showEmails}
              onSlotClick={handleSlotClick}
            />

            <Text size="sm" c="dimmed">
              {t("input.hoverOrClickCells")}
            </Text>
          </Stack>
        </Grid.Col>
      </Grid>

      {/* 参加者詳細モーダル */}
      <Modal
        opened={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
        }}
        title={t("input.participantCount", {
          count: modalParticipants.length,
        })}
        size="md"
        closeButtonProps={{
          "aria-label": t("input.close") || "Close",
        }}
      >
        <Stack gap="md">
          {modalParticipants.length > 0 && (
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

          <Stack gap="xs" style={{ maxHeight: "400px", overflowY: "auto" }}>
            {modalParticipants.length > 0 ? (
              modalParticipants.map((participant) => (
                <Group key={participant.id} gap="xs">
                  <Text size="sm">{participant.name}</Text>
                  {showEmails && participant.email && (
                    <Text size="xs" c="dimmed">
                      ({participant.email})
                    </Text>
                  )}
                </Group>
              ))
            ) : (
              <Text size="sm" c="dimmed">
                {t("aggregate.noParticipants")}
              </Text>
            )}
          </Stack>
        </Stack>
      </Modal>
    </Box>
  );
}
