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
  Loader,
  Modal,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { IconCalendarEvent, IconUsers, IconCheck } from "@tabler/icons-react";
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
  const isDesktop = useMediaQuery("(min-width: 75em)"); // 1200px
  const [showParticipantList, setShowParticipantList] = useState(false);
  const [focusedParticipants, setFocusedParticipants] = useState<
    ReadonlyArray<Participant>
  >([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalParticipants, setModalParticipants] = useState<
    ReadonlyArray<Participant>
  >([]);

  // 右側グリッドのスロットホバー時の処理
  const handleSlotHover = useCallback(
    (slotId: string, slotParticipants: ReadonlyArray<Participant>) => {
      // デスクトップでのみホバー動作を有効化
      if (isDesktop) {
        setFocusedParticipants(slotParticipants);
        setShowParticipantList(true);
      }
    },
    [isDesktop],
  );

  // 右側グリッドのスロットクリック時の処理
  const handleSlotClick = useCallback(
    (slotId: string, slotParticipants: ReadonlyArray<Participant>) => {
      if (isDesktop) {
        // デスクトップでは従来通りの動作
        setFocusedParticipants(slotParticipants);
        setShowParticipantList(true);
      } else {
        // モバイルではモーダルを開く
        setModalParticipants(slotParticipants);
        setIsModalOpen(true);
      }
    },
    [isDesktop],
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

            <Box style={{ minHeight: "600px" }}>
              {showParticipantList && focusedParticipants.length > 0 && (
                <Paper shadow="sm" p="md" withBorder mb="md">
                  <Stack gap="sm">
                    <Group justify="space-between">
                      <Text fw={500}>
                        {t("input.participantCount", {
                          count: focusedParticipants.length,
                        })}
                      </Text>
                      <Button
                        size="xs"
                        variant="subtle"
                        onClick={handleBackToEdit}
                      >
                        {t("input.backToEdit")}
                      </Button>
                    </Group>
                    <Stack
                      gap="xs"
                      style={{ maxHeight: "150px", overflowY: "auto" }}
                    >
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
              )}
              <ScheduleGrid
                dateRangeStart={dateRangeStart}
                dateRangeEnd={dateRangeEnd}
                timeSlotDuration={timeSlotDuration}
                selectedSlots={currentUserSlots}
                onSlotsChange={onSlotsChange}
              />
            </Box>

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
              onSlotHover={handleSlotHover}
              onSlotClick={handleSlotClick}
            />

            <Text size="sm" c="dimmed">
              {t("input.hoverOrClickCells")}
            </Text>
          </Stack>
        </Grid.Col>
      </Grid>

      {/* モバイル用モーダル */}
      <Modal
        opened={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
        }}
        title={t("input.participantCount", {
          count: modalParticipants.length,
        })}
        size="sm"
        closeButtonProps={{
          "aria-label": t("input.close") || "Close",
        }}
      >
        <Stack gap="xs">
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
      </Modal>
    </Box>
  );
}
