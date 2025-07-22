"use server";

import { Effect, Schema } from "effect";
import type {
  CreateScheduleInput,
  UpdateScheduleInput,
  Schedule,
} from "@/lib/effects";
import {
  NonEmptyString,
  EventId,
  UserId,
  DateTimeString,
  ValidationError,
} from "@/lib/effects";
import {
  ScheduleService,
  AuthService,
  EventService,
} from "@/lib/effects/services/server";
import { runServerActionSafe } from "./runtime";

// スケジュール作成のServer Action
export const createSchedule = async (input: CreateScheduleInput) => {
  const effect = Effect.gen(function* () {
    const scheduleService = yield* ScheduleService;
    const schedule = yield* scheduleService.create(input);
    return schedule;
  });

  return runServerActionSafe(effect);
};

// スケジュール取得のServer Action
export const getSchedule = async (id: string) => {
  const effect = Effect.gen(function* () {
    const scheduleService = yield* ScheduleService;
    const schedule = yield* scheduleService.findById(id);
    return schedule;
  });

  return runServerActionSafe(effect);
};

// イベントとユーザーでスケジュール取得のServer Action
export const getScheduleByEventAndUser = async (
  eventId: string,
  userId: string,
) => {
  const effect = Effect.gen(function* () {
    const scheduleService = yield* ScheduleService;
    const schedule = yield* scheduleService.findByEventAndUser(eventId, userId);
    return schedule;
  });

  return runServerActionSafe(effect);
};

// スケジュール更新のServer Action
export const updateSchedule = async (input: UpdateScheduleInput) => {
  const effect = Effect.gen(function* () {
    const scheduleService = yield* ScheduleService;
    const schedule = yield* scheduleService.update(input);
    return schedule;
  });

  return runServerActionSafe(effect);
};

// スケジュール削除のServer Action
export const deleteSchedule = async (id: string) => {
  const effect = Effect.gen(function* () {
    const scheduleService = yield* ScheduleService;
    yield* scheduleService.delete(id);
    return { deleted: true };
  });

  return runServerActionSafe(effect);
};

// イベントのスケジュール一覧取得のServer Action
export const getSchedulesByEvent = async (eventId: string) => {
  const effect = Effect.gen(function* () {
    const scheduleService = yield* ScheduleService;
    const schedules = yield* scheduleService.listByEvent(eventId);
    return schedules;
  });

  return runServerActionSafe(effect);
};

// 時間帯集計のServer Action
export const getAggregatedTimeSlots = async (eventId: string) => {
  const effect = Effect.gen(function* () {
    const scheduleService = yield* ScheduleService;
    const aggregation = yield* scheduleService.aggregateTimeSlots(eventId);
    return aggregation;
  });

  return runServerActionSafe(effect);
};

// 参加可能時間の送信スキーマ
const SubmitAvailabilitySchema = Schema.Struct({
  eventId: Schema.String, // EventIdに変換する前の文字列
  participantName: Schema.optional(Schema.String),
  participantEmail: Schema.optional(Schema.String),
  scheduleId: Schema.optional(Schema.String), // 非認証ユーザーの既存スケジュールID
  availableSlots: Schema.Array(
    Schema.Struct({
      date: Schema.String, // PlainDateの文字列表現 (YYYY-MM-DD)
      time: Schema.String, // PlainTimeの文字列表現 (HH:MM)
    }),
  ),
});

// 参加可能時間を送信するServer Action
export const submitAvailability = async (input: unknown) => {
  const effect = Effect.gen(function* () {
    // 入力をバリデーション
    const validatedData = yield* Schema.decodeUnknown(SubmitAvailabilitySchema)(
      input,
    );

    // イベント情報を取得
    const eventService = yield* EventService;
    const event = yield* eventService.findById(
      Schema.decodeUnknownSync(EventId)(validatedData.eventId),
    );

    // ユーザー情報を取得
    const authService = yield* AuthService;
    const authState = yield* authService.getCurrentAuthState;

    let userId: string;
    let userName: string;

    if (
      authState.isAuthenticated &&
      authState.user &&
      "email" in authState.user
    ) {
      // 認証済みユーザー
      userId = authState.user.id;
      userName = authState.user.name || authState.user.email;
    } else {
      // 非認証ユーザー
      if (!validatedData.participantName || !validatedData.participantEmail) {
        return yield* Effect.fail(
          new ValidationError({
            field: "participantInfo",
            message: "非認証ユーザーは名前とメールアドレスが必須です",
          }),
        );
      }
      // セッションIDをユーザーIDとして使用
      userId = authState.sessionId;
      userName = validatedData.participantName;
    }

    // スケジュールを作成または更新
    const scheduleService = yield* ScheduleService;

    // 既存のスケジュールを確認
    let existingSchedule: Schedule | null = null;

    // 非認証ユーザーでscheduleIdが提供されている場合
    if (!authState.isAuthenticated && validatedData.scheduleId) {
      const scheduleResult = yield* Effect.either(
        scheduleService.findById(validatedData.scheduleId),
      );
      if (scheduleResult._tag === "Right") {
        // スケジュールがイベントに属していることを確認
        if (scheduleResult.right.eventId === validatedData.eventId) {
          existingSchedule = scheduleResult.right;
        }
      }
    } else {
      // 通常のユーザーIDベースの検索
      const existingScheduleResult = yield* Effect.either(
        scheduleService.findByEventAndUser(
          Schema.decodeUnknownSync(EventId)(validatedData.eventId),
          userId,
        ),
      );

      if (existingScheduleResult._tag === "Right") {
        existingSchedule = existingScheduleResult.right;
      }
    }

    // Availabilityのデータを構築
    // PlainTimeから分単位の時刻に変換
    const availabilities = validatedData.availableSlots.map((slot) => {
      const [hours, minutes] = slot.time.split(":").map(Number);
      const startTime = hours * 60 + minutes;
      const endTime = startTime + event.timeSlotDuration; // イベントのスロット期間を使用
      const dateStr = slot.date + "T00:00:00.000Z";
      return {
        date: Schema.decodeUnknownSync(DateTimeString)(dateStr),
        startTime,
        endTime,
      };
    });

    if (existingSchedule !== null) {
      // 既存のスケジュールを更新
      const schedule = yield* scheduleService.update({
        id: existingSchedule.id,
        availabilities,
      });
      return { scheduleId: schedule.id };
    } else {
      // 新規スケジュールを作成
      const createInput: CreateScheduleInput = {
        eventId: Schema.decodeUnknownSync(EventId)(validatedData.eventId),
        userId: authState.isAuthenticated
          ? Schema.decodeUnknownSync(UserId)(userId)
          : undefined,
        displayName: Schema.decodeUnknownSync(NonEmptyString)(userName),
        availabilities,
      };

      const schedule = yield* scheduleService.create(createInput);
      return { scheduleId: schedule.id };
    }
  });

  return runServerActionSafe(effect);
};
