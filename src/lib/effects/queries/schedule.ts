import "server-only";
import { Effect, pipe } from "effect";
import type { TimeSlotAggregation } from "@/lib/effects/services/schedule/schemas";
import { ScheduleService } from "@/lib/effects/services/server";
import type { AppError } from "@/lib/effects/errors";

/**
 * 時間帯集計を取得するEffect
 */
export const getAggregatedTimeSlotsEffect = (
  eventId: string,
): Effect.Effect<
  ReadonlyArray<TimeSlotAggregation>,
  AppError,
  ScheduleService
> =>
  pipe(
    Effect.gen(function* () {
      const scheduleService = yield* ScheduleService;
      const aggregation = yield* scheduleService.aggregateTimeSlots(eventId);
      return aggregation;
    }),
  );

/**
 * イベントのスケジュール一覧を取得するEffect
 */
export const getSchedulesByEventEffect = (eventId: string) =>
  pipe(
    Effect.gen(function* () {
      const scheduleService = yield* ScheduleService;
      const schedules = yield* scheduleService.listByEvent(eventId);
      return schedules;
    }),
  );
