import { Effect, Context, Layer, Schema } from "effect";
import type {
  Schedule as PrismaSchedule,
  Availability as PrismaAvailability,
} from "@prisma/client";
import { DatabaseService } from "../database";
import { DatabaseServiceLive } from "../database/service";
import { EventService } from "../event";
import { EventServiceLive } from "../event/service";
import {
  DatabaseError,
  NotFoundError,
  ValidationError,
  ConflictError,
} from "../../errors";
import {
  CreateScheduleSchema,
  UpdateScheduleSchema,
  ScheduleSchema,
  TimeSlotAggregationSchema,
  type CreateScheduleInput,
  type UpdateScheduleInput,
  type Schedule,
  type Availability as _Availability,
  type TimeSlotAggregation,
} from "./schemas";

// ScheduleServiceのインターフェース
export interface ScheduleServiceType {
  readonly create: (
    input: CreateScheduleInput,
  ) => Effect.Effect<
    Schedule,
    ValidationError | NotFoundError | ConflictError | DatabaseError
  >;
  readonly findById: (
    id: string,
  ) => Effect.Effect<Schedule, NotFoundError | DatabaseError>;
  readonly findByEventAndUser: (
    eventId: string,
    userId: string,
  ) => Effect.Effect<Schedule | null, DatabaseError>;
  readonly update: (
    input: UpdateScheduleInput,
  ) => Effect.Effect<Schedule, ValidationError | NotFoundError | DatabaseError>;
  readonly delete: (
    id: string,
  ) => Effect.Effect<void, NotFoundError | DatabaseError>;
  readonly listByEvent: (
    eventId: string,
  ) => Effect.Effect<ReadonlyArray<Schedule>, DatabaseError>;
  readonly aggregateTimeSlots: (
    eventId: string,
  ) => Effect.Effect<
    ReadonlyArray<TimeSlotAggregation>,
    NotFoundError | DatabaseError
  >;
}

// ScheduleServiceのタグ
export class ScheduleService extends Context.Tag("ScheduleService")<
  ScheduleService,
  ScheduleServiceType
>() {}

// PrismaのデータをアプリケーションのScheduleに変換
const transformSchedule = (
  schedule: PrismaSchedule & { availabilities: Array<PrismaAvailability> },
): Schedule => {
  const parsed = Schema.decodeUnknownSync(ScheduleSchema)({
    ...schedule,
    createdAt: schedule.createdAt.toISOString(),
    updatedAt: schedule.updatedAt.toISOString(),
    availabilities: schedule.availabilities.map((a) => ({
      id: a.id,
      scheduleId: a.scheduleId,
      date: a.date.toISOString(),
      startTime: a.startTime,
      endTime: a.endTime,
      createdAt: a.createdAt.toISOString(),
    })),
  });
  return parsed;
};

// ScheduleServiceの実装
const make = Effect.gen(function* () {
  const database = yield* DatabaseService;
  const eventService = yield* EventService;

  const create = (input: CreateScheduleInput) =>
    Effect.gen(function* () {
      // 入力検証
      const validated = yield* Schema.decodeUnknown(CreateScheduleSchema)(
        input,
      ).pipe(
        Effect.mapError(
          (error) =>
            new ValidationError({
              field: "input",
              message: error.message,
            }),
        ),
      );

      // イベントの存在確認
      yield* eventService.findById(validated.eventId);

      // ユーザーIDがある場合、同じイベント・ユーザーのスケジュールが既存でないか確認
      if (validated.userId) {
        const existing = yield* Effect.tryPromise({
          try: () =>
            database.client.schedule.findFirst({
              where: {
                eventId: validated.eventId,
                userId: validated.userId,
              },
            }),
          catch: (error) =>
            new DatabaseError({
              message: "Failed to check existing schedule",
              cause: error,
            }),
        });

        if (existing) {
          return yield* Effect.fail(
            new ConflictError({
              resource: "Schedule",
              message: "Schedule already exists for this user and event",
            }),
          );
        }
      }

      // トランザクションでスケジュールと参加可能時間帯を作成
      const schedule = yield* database.transaction((tx) =>
        Effect.gen(function* () {
          // スケジュール作成
          const newSchedule = yield* Effect.tryPromise({
            try: () =>
              tx.schedule.create({
                data: {
                  eventId: validated.eventId,
                  userId: validated.userId,
                  displayName: validated.displayName,
                },
              }),
            catch: (error) =>
              new DatabaseError({
                message: "Failed to create schedule",
                cause: error,
              }),
          });

          // 参加可能時間帯を作成
          if (validated.availabilities.length > 0) {
            yield* Effect.tryPromise({
              try: () =>
                tx.availability.createMany({
                  data: validated.availabilities.map((a) => ({
                    scheduleId: newSchedule.id,
                    date: new Date(a.date),
                    startTime: a.startTime,
                    endTime: a.endTime,
                  })),
                }),
              catch: (error) =>
                new DatabaseError({
                  message: "Failed to create availabilities",
                  cause: error,
                }),
            });
          }

          // 作成したスケジュールを参加可能時間帯付きで取得
          const scheduleWithAvailabilities = yield* Effect.tryPromise({
            try: () =>
              tx.schedule.findUnique({
                where: { id: newSchedule.id },
                include: { availabilities: true },
              }),
            catch: (error) =>
              new DatabaseError({
                message: "Failed to fetch created schedule",
                cause: error,
              }),
          });

          return scheduleWithAvailabilities!;
        }),
      );

      return transformSchedule(schedule);
    });

  const findById = (id: string) =>
    Effect.gen(function* () {
      const schedule = yield* Effect.tryPromise({
        try: () =>
          database.client.schedule.findUnique({
            where: { id },
            include: { availabilities: true },
          }),
        catch: (error) =>
          new DatabaseError({
            message: "Failed to find schedule",
            cause: error,
          }),
      });

      if (!schedule) {
        return yield* Effect.fail(
          new NotFoundError({
            resource: "Schedule",
            id,
          }),
        );
      }

      return transformSchedule(schedule);
    });

  const findByEventAndUser = (eventId: string, userId: string) =>
    Effect.gen(function* () {
      const schedule = yield* Effect.tryPromise({
        try: () =>
          database.client.schedule.findFirst({
            where: { eventId, userId },
            include: { availabilities: true },
          }),
        catch: (error) =>
          new DatabaseError({
            message: "Failed to find schedule by event and user",
            cause: error,
          }),
      });

      return schedule ? transformSchedule(schedule) : null;
    });

  const update = (input: UpdateScheduleInput) =>
    Effect.gen(function* () {
      // 入力検証
      const validated = yield* Schema.decodeUnknown(UpdateScheduleSchema)(
        input,
      ).pipe(
        Effect.mapError(
          (error) =>
            new ValidationError({
              field: "input",
              message: error.message,
            }),
        ),
      );

      // 既存スケジュールの確認
      yield* findById(validated.id);

      // トランザクションで更新
      const schedule = yield* database.transaction((tx) =>
        Effect.gen(function* () {
          // スケジュール更新
          if (validated.displayName !== undefined) {
            yield* Effect.tryPromise({
              try: () =>
                tx.schedule.update({
                  where: { id: validated.id },
                  data: { displayName: validated.displayName },
                }),
              catch: (error) =>
                new DatabaseError({
                  message: "Failed to update schedule",
                  cause: error,
                }),
            });
          }

          // 参加可能時間帯の更新（全削除して再作成）
          if (validated.availabilities !== undefined) {
            // 既存の参加可能時間帯を削除
            yield* Effect.tryPromise({
              try: () =>
                tx.availability.deleteMany({
                  where: { scheduleId: validated.id },
                }),
              catch: (error) =>
                new DatabaseError({
                  message: "Failed to delete existing availabilities",
                  cause: error,
                }),
            });

            // 新しい参加可能時間帯を作成
            if (validated.availabilities.length > 0) {
              yield* Effect.tryPromise({
                try: () =>
                  tx.availability.createMany({
                    data: validated.availabilities!.map((a) => ({
                      scheduleId: validated.id,
                      date: new Date(a.date),
                      startTime: a.startTime,
                      endTime: a.endTime,
                    })),
                  }),
                catch: (error) =>
                  new DatabaseError({
                    message: "Failed to create new availabilities",
                    cause: error,
                  }),
              });
            }
          }

          // 更新後のスケジュールを取得
          const updatedSchedule = yield* Effect.tryPromise({
            try: () =>
              tx.schedule.findUnique({
                where: { id: validated.id },
                include: { availabilities: true },
              }),
            catch: (error) =>
              new DatabaseError({
                message: "Failed to fetch updated schedule",
                cause: error,
              }),
          });

          return updatedSchedule!;
        }),
      );

      return transformSchedule(schedule);
    });

  const deleteSchedule = (id: string) =>
    Effect.gen(function* () {
      // 既存スケジュールの確認
      yield* findById(id);

      // 削除実行（関連する参加可能時間帯もカスケード削除される）
      yield* Effect.tryPromise({
        try: () =>
          database.client.schedule.delete({
            where: { id },
          }),
        catch: (error) =>
          new DatabaseError({
            message: "Failed to delete schedule",
            cause: error,
          }),
      });
    });

  const listByEvent = (eventId: string) =>
    Effect.gen(function* () {
      const schedules = yield* Effect.tryPromise({
        try: () =>
          database.client.schedule.findMany({
            where: { eventId },
            include: { availabilities: true },
            orderBy: { createdAt: "desc" },
          }),
        catch: (error) =>
          new DatabaseError({
            message: "Failed to list schedules",
            cause: error,
          }),
      });

      return schedules.map(transformSchedule);
    });

  const aggregateTimeSlots = (eventId: string) =>
    Effect.gen(function* () {
      // イベントの存在確認
      yield* eventService.findById(eventId);

      // すべてのスケジュールを取得
      const schedules = yield* listByEvent(eventId);

      // 時間帯ごとに集計
      const aggregationMap = new Map<
        string,
        {
          date: string;
          startTime: number;
          endTime: number;
          count: number;
          participants: Array<{
            scheduleId: string;
            displayName: string;
            userId: string | null;
          }>;
        }
      >();

      for (const schedule of schedules) {
        for (const availability of schedule.availabilities) {
          const key = `${availability.date satisfies string}-${availability.startTime satisfies number}-${availability.endTime satisfies number}`;

          if (!aggregationMap.has(key)) {
            aggregationMap.set(key, {
              date: availability.date,
              startTime: availability.startTime,
              endTime: availability.endTime,
              count: 0,
              participants: [],
            });
          }

          const slot = aggregationMap.get(key)!;
          slot.count += 1;
          slot.participants.push({
            scheduleId: schedule.id,
            displayName: schedule.displayName,
            userId: schedule.userId,
          });
        }
      }

      // 配列に変換してソートし、Schemaでバリデーション
      const rawAggregations = Array.from(aggregationMap.values())
        .sort((a, b) => {
          const dateCompare = a.date.localeCompare(b.date);
          if (dateCompare !== 0) return dateCompare;
          return a.startTime - b.startTime;
        })
        .map((slot) => ({
          date: slot.date,
          startTime: slot.startTime,
          endTime: slot.endTime,
          participantCount: slot.count,
          participants: slot.participants,
        }));

      return rawAggregations.map((agg) =>
        Schema.decodeUnknownSync(TimeSlotAggregationSchema)(agg),
      );
    });

  return {
    create,
    findById,
    findByEventAndUser,
    update,
    delete: deleteSchedule,
    listByEvent,
    aggregateTimeSlots,
  } satisfies ScheduleServiceType;
});

// ScheduleServiceのLayer
const ScheduleServiceLive = Layer.effect(ScheduleService, make).pipe(
  Layer.provide(Layer.merge(DatabaseServiceLive, EventServiceLive)),
);

export { ScheduleServiceLive };
