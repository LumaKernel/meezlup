import { Schema } from "effect";
import type { Schedule } from "@/lib/effects";
import {
  ScheduleId,
  EventId,
  UserId,
  NonEmptyString,
  DateTimeString,
} from "@/lib/effects";

// シンプルな時間枠の型（Availabilityの簡略版）
export interface SimpleAvailability {
  readonly date: string;
  readonly startTime: number;
  readonly endTime: number;
}

export const ScheduleFactory = {
  create: (overrides: Partial<Schedule> = {}): Schedule => ({
    id: Schema.decodeUnknownSync(ScheduleId)("schedule123"),
    eventId: Schema.decodeUnknownSync(EventId)("event123"),
    userId: Schema.decodeUnknownSync(UserId)("user123"),
    displayName: Schema.decodeUnknownSync(NonEmptyString)("テストユーザー"),
    availabilities: [],
    createdAt: Schema.decodeUnknownSync(DateTimeString)(
      "2024-01-01T00:00:00.000Z",
    ),
    updatedAt: Schema.decodeUnknownSync(DateTimeString)(
      "2024-01-01T00:00:00.000Z",
    ),
    ...overrides,
  }),

  withAvailabilities: (
    availabilities: ReadonlyArray<SimpleAvailability>,
    overrides: Partial<Schedule> = {},
  ): Schedule =>
    ScheduleFactory.create({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
      availabilities: availabilities as any, // Schedule型の完全なAvailability[]への変換はテスト時には不要
      ...overrides,
    }),

  anonymous: (overrides: Partial<Schedule> = {}): Schedule =>
    ScheduleFactory.create({
      userId: null,
      displayName: Schema.decodeUnknownSync(NonEmptyString)("匿名参加者"),
      ...overrides,
    }),
};

export const AvailabilityFactory = {
  create: (
    date: string,
    startTime: number,
    endTime: number,
  ): SimpleAvailability => ({
    date: Schema.decodeUnknownSync(DateTimeString)(date),
    startTime,
    endTime,
  }),

  // 30分スロット用のヘルパー
  halfHourSlot: (
    date: string,
    hour: number,
    minute: 0 | 30,
  ): SimpleAvailability => {
    const startTime = hour * 60 + minute;
    return AvailabilityFactory.create(date, startTime, startTime + 30);
  },

  // 1時間スロット用のヘルパー
  hourSlot: (date: string, hour: number): SimpleAvailability => {
    const startTime = hour * 60;
    return AvailabilityFactory.create(date, startTime, startTime + 60);
  },
};
