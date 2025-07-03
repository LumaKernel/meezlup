import { Schema } from "effect";
import {
  AvailabilityId,
  DateTimeString,
  EventId,
  NonEmptyString,
  PositiveInt,
  ScheduleId,
  UserId,
} from "../../types";

// 時間範囲（分単位: 0-1439）
export const TimeRangeSchema = Schema.Struct({
  startTime: Schema.Number.pipe(
    Schema.int(),
    Schema.greaterThanOrEqualTo(0),
    Schema.lessThan(1440)
  ),
  endTime: Schema.Number.pipe(
    Schema.int(),
    Schema.greaterThan(0),
    Schema.lessThanOrEqualTo(1440)
  ),
}).pipe(
  Schema.filter((range): range is typeof range => range.startTime < range.endTime, {
    message: () => "Start time must be before end time",
  })
);

// 参加可能時間帯
export const AvailabilitySchema = Schema.Struct({
  id: AvailabilityId,
  scheduleId: ScheduleId,
  date: DateTimeString,
  startTime: Schema.Number,
  endTime: Schema.Number,
  createdAt: DateTimeString,
});

// スケジュール作成のスキーマ
export const CreateScheduleSchema = Schema.Struct({
  eventId: EventId,
  userId: Schema.optional(UserId),
  displayName: NonEmptyString,
  availabilities: Schema.Array(
    Schema.Struct({
      date: DateTimeString,
      startTime: Schema.Number,
      endTime: Schema.Number,
    })
  ),
});

// スケジュール更新のスキーマ
export const UpdateScheduleSchema = Schema.Struct({
  id: ScheduleId,
  displayName: Schema.optional(NonEmptyString),
  availabilities: Schema.optional(
    Schema.Array(
      Schema.Struct({
        date: DateTimeString,
        startTime: Schema.Number,
        endTime: Schema.Number,
      })
    )
  ),
});

// スケジュール取得のスキーマ
export const ScheduleSchema = Schema.Struct({
  id: ScheduleId,
  eventId: EventId,
  userId: Schema.NullOr(UserId),
  displayName: NonEmptyString,
  createdAt: DateTimeString,
  updatedAt: DateTimeString,
  availabilities: Schema.Array(AvailabilitySchema),
});

// 集計結果のスキーマ
export const TimeSlotAggregationSchema = Schema.Struct({
  date: DateTimeString,
  startTime: Schema.Number,
  endTime: Schema.Number,
  participantCount: PositiveInt,
  participants: Schema.Array(
    Schema.Struct({
      scheduleId: ScheduleId,
      displayName: NonEmptyString,
      userId: Schema.NullOr(UserId),
    })
  ),
});

// 型エクスポート
export type CreateScheduleInput = Schema.Schema.Type<typeof CreateScheduleSchema>;
export type UpdateScheduleInput = Schema.Schema.Type<typeof UpdateScheduleSchema>;
export type Schedule = Schema.Schema.Type<typeof ScheduleSchema>;
export type Availability = Schema.Schema.Type<typeof AvailabilitySchema>;
export type TimeSlotAggregation = Schema.Schema.Type<typeof TimeSlotAggregationSchema>;