"use client";

import { Effect } from "effect";
import { Temporal } from "temporal-polyfill";
import type { TimeSlotAggregation } from "@/lib/effects/services/schedule/schemas";
import type { AuthUser } from "@/lib/auth/hooks";

// 参加者の型
export interface Participant {
  readonly id: string;
  readonly name: string;
  readonly email?: string;
  readonly availableSlots: ReadonlySet<string>;
}

// スロットIDを生成
export const makeSlotId = (
  date: Temporal.PlainDate,
  startTime: number,
): string => {
  const hours = Math.floor(startTime / 60);
  const minutes = startTime % 60;
  const time = `${hours.toString().padStart(2, "0") satisfies string}:${minutes.toString().padStart(2, "0") satisfies string}:00`;
  return `${date.toString() satisfies string}_${time satisfies string}`;
};

// DateTimeStringからスロットIDを生成するEffect
const dateTimeStringToSlotId = (
  dateTimeString: string,
  startTime: number,
): Effect.Effect<string, Error> =>
  Effect.gen(function* () {
    try {
      const instant = Temporal.Instant.from(dateTimeString);
      const zonedDateTime = instant.toZonedDateTimeISO("UTC");
      const plainDate = zonedDateTime.toPlainDate();
      return makeSlotId(plainDate, startTime);
    } catch (e) {
      return yield* Effect.fail(
        new Error(`Invalid date string: ${dateTimeString satisfies string}`, {
          cause: e,
        }),
      );
    }
  });

// 集計データから参加者とユーザースロットを抽出するEffect
export const extractParticipantsAndUserSlots = (
  aggregations: ReadonlyArray<TimeSlotAggregation>,
  user: AuthUser | null,
  isCurrentUserSlot: (
    participantUserId: string | null,
    participantScheduleId: string,
  ) => boolean,
): Effect.Effect<
  {
    participants: ReadonlyArray<Participant>;
    currentUserSlots: ReadonlySet<string>;
  },
  Error
> =>
  Effect.gen(function* () {
    const participantMap = new Map<string, Participant>();
    const currentUserSlots = new Set<string>();

    // 各スロットを処理
    for (const slot of aggregations) {
      const slotId = yield* dateTimeStringToSlotId(slot.date, slot.startTime);

      // 各参加者を処理
      for (const p of slot.participants) {
        // 参加者マップを更新
        const existing = participantMap.get(p.scheduleId);
        if (existing) {
          // 既存の参加者：スロットを追加
          const newSlots = new Set(existing.availableSlots);
          newSlots.add(slotId);
          participantMap.set(p.scheduleId, {
            ...existing,
            availableSlots: newSlots,
          });
        } else {
          // 新規参加者
          participantMap.set(p.scheduleId, {
            id: p.scheduleId,
            name: p.displayName,
            availableSlots: new Set([slotId]),
          });
        }

        // 現在のユーザーのスロットかチェック
        if (isCurrentUserSlot(p.userId, p.scheduleId)) {
          currentUserSlots.add(slotId);
        }
      }
    }

    return {
      participants: Array.from(participantMap.values()),
      currentUserSlots,
    };
  });

// 参加者データを処理する関数（フックではない）
export function processAggregations(
  aggregations: ReadonlyArray<TimeSlotAggregation> | null,
  user: AuthUser | null,
  isCurrentUserSlot: (
    participantUserId: string | null,
    participantScheduleId: string,
  ) => boolean,
): Effect.Effect<
  {
    participants: ReadonlyArray<Participant>;
    currentUserSlots: ReadonlySet<string>;
  },
  Error
> {
  if (!aggregations) {
    return Effect.succeed({
      participants: [],
      currentUserSlots: new Set<string>(),
    });
  }

  return extractParticipantsAndUserSlots(aggregations, user, isCurrentUserSlot);
}
