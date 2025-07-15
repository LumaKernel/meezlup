"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Box, Text, Paper } from "@mantine/core";
import { Temporal } from "temporal-polyfill";
import classes from "./ScheduleGrid.module.css";

interface ScheduleGridProps {
  readonly dateRangeStart: Temporal.PlainDate;
  readonly dateRangeEnd: Temporal.PlainDate;
  readonly timeSlotDuration: 15 | 30 | 60;
  readonly selectedSlots: ReadonlySet<string>;
  readonly onSlotsChange: (slots: ReadonlySet<string>) => void;
  readonly locale: string;
}

export function ScheduleGrid({
  dateRangeEnd,
  dateRangeStart,
  locale,
  onSlotsChange,
  selectedSlots,
  timeSlotDuration,
}: ScheduleGridProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState<"select" | "deselect" | null>(null);
  const [dragSelection, setDragSelection] = useState<Set<string>>(new Set());
  const gridRef = useRef<HTMLDivElement>(null);
  const mouseDownRef = useRef<{ slotId: string; isSelected: boolean } | null>(null);

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

  // セルのクリックハンドラ
  const handleCellClick = useCallback(
    (slotId: string) => {
      const newSelection = new Set(selectedSlots);
      if (newSelection.has(slotId)) {
        newSelection.delete(slotId);
      } else {
        newSelection.add(slotId);
      }
      onSlotsChange(newSelection);
    },
    [selectedSlots, onSlotsChange],
  );

  // マウスダウン（ドラッグ準備）
  const handleMouseDown = useCallback(
    (e: React.MouseEvent, slotId: string) => {
      e.preventDefault();
      const isSelected = selectedSlots.has(slotId);
      mouseDownRef.current = { slotId, isSelected };
      // 即座に視覚的フィードバックを提供
      setDragMode(isSelected ? "deselect" : "select");
      setDragSelection(new Set([slotId]));
    },
    [selectedSlots],
  );

  // マウスエンター（ドラッグ中の処理）
  const handleMouseEnter = useCallback(
    (slotId: string) => {
      // マウスダウン中にセルに入った場合、ドラッグを開始
      if (mouseDownRef.current && !isDragging) {
        setIsDragging(true);
        // すでにドラッグモードは設定済みなので、新しいセルを追加
        setDragSelection((prev) => {
          const newSelection = new Set(prev);
          newSelection.add(slotId);
          return newSelection;
        });
      } else if (isDragging) {
        setDragSelection((prev) => {
          const newSelection = new Set(prev);
          newSelection.add(slotId);
          return newSelection;
        });
      }
    },
    [isDragging],
  );

  // マウスアップ（ドラッグ終了またはクリック）
  const handleMouseUp = useCallback(() => {
    if (isDragging && dragMode) {
      // ドラッグ操作の完了
      const newSelection = new Set(selectedSlots);
      dragSelection.forEach((slotId) => {
        if (dragMode === "select") {
          newSelection.add(slotId);
        } else {
          newSelection.delete(slotId);
        }
      });
      onSlotsChange(newSelection);
    } else if (mouseDownRef.current && !isDragging) {
      // ドラッグせずにマウスアップした場合はクリックとして処理
      const { slotId } = mouseDownRef.current;
      handleCellClick(slotId);
    }
    
    // リセット
    setIsDragging(false);
    setDragMode(null);
    setDragSelection(new Set());
    mouseDownRef.current = null;
  }, [isDragging, dragMode, dragSelection, selectedSlots, onSlotsChange, handleCellClick]);

  // グローバルマウスイベントを管理
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      handleMouseUp();
    };
    
    const handleGlobalMouseLeave = () => {
      // マウスがドキュメントを離れた場合もリセット
      if (mouseDownRef.current && !isDragging) {
        mouseDownRef.current = null;
        setDragMode(null);
        setDragSelection(new Set());
      }
    };
    
    document.addEventListener("mouseup", handleGlobalMouseUp);
    document.addEventListener("mouseleave", handleGlobalMouseLeave);
    
    return () => {
      document.removeEventListener("mouseup", handleGlobalMouseUp);
      document.removeEventListener("mouseleave", handleGlobalMouseLeave);
    };
  }, [handleMouseUp, isDragging]);

  // セルの選択状態を取得
  const isCellSelected = (slotId: string) => {
    // ドラッグ選択中のセルの表示
    if (dragSelection.has(slotId) && dragMode) {
      return dragMode === "select";
    }
    return selectedSlots.has(slotId);
  };

  // 曜日を取得
  const getDayOfWeek = (date: Temporal.PlainDate) => {
    const days =
      locale === "ja"
        ? ["日", "月", "火", "水", "木", "金", "土"]
        : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return days[date.dayOfWeek % 7];
  };

  return (
    <Paper shadow="sm" p="md" withBorder>
      <Box className={classes.gridContainer}>
        {/* ヘッダー行 */}
        <Box className={classes.headerRow}>
          <Box className={classes.timeHeader}>
            {locale === "ja" ? "時間" : "Time"}
          </Box>
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
        <Box className={classes.gridBody} ref={gridRef}>
          {timeSlots.map((time) => (
            <Box key={time.toString()} className={classes.timeRow}>
              <Box className={classes.timeLabel}>
                {time.hour.toString().padStart(2, "0")}:
                {time.minute.toString().padStart(2, "0")}
              </Box>
              {dates.map((date) => {
                const slotId = getSlotId(date, time);
                const isSelected = isCellSelected(slotId);
                return (
                  <Box
                    key={slotId}
                    className={`${classes.cell satisfies string} ${
                      (isSelected ? classes.selected : "") satisfies string
                    } ${(date.dayOfWeek === 7 ? classes.sundayCell : "") satisfies string} ${
                      (date.dayOfWeek === 1
                        ? classes.mondayCell
                        : "") satisfies string
                    }`}
                    onMouseDown={(e) => {
                      handleMouseDown(e, slotId);
                    }}
                    onMouseEnter={() => {
                      handleMouseEnter(slotId);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleCellClick(slotId);
                      }
                    }}
                    data-selected={isSelected}
                    role="button"
                    tabIndex={0}
                    aria-label={`${date.toString() satisfies string} ${time.toString() satisfies string} - ${
                      (isSelected
                        ? locale === "ja"
                          ? "選択済み"
                          : "Selected"
                        : locale === "ja"
                          ? "未選択"
                          : "Not selected") satisfies string
                    }`}
                  />
                );
              })}
            </Box>
          ))}
        </Box>
      </Box>
    </Paper>
  );
}
