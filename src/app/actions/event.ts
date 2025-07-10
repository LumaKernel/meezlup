"use server";

import { Effect, Schema, Option } from "effect";
import {
  EventService,
  AuthService,
  type CreateEventInput,
  type UpdateEventInput,
  AuthenticationError,
  NonEmptyString,
  DateTimeString,
} from "@/lib/effects";
import { runServerActionSafe } from "./runtime";
import { CreateEventRequest } from "@/lib/effects/services/event/create-event-schema";

// イベント作成のServer Action
export const createEvent = async (input: CreateEventInput) => {
  const effect = Effect.gen(function* () {
    const eventService = yield* EventService;
    const event = yield* eventService.create(input);
    return event;
  });

  return runServerActionSafe(effect);
};

// イベント取得のServer Action
export const getEvent = async (id: string) => {
  const effect = Effect.gen(function* () {
    const eventService = yield* EventService;
    const event = yield* eventService.findById(id);
    return event;
  });

  return runServerActionSafe(effect);
};

// イベント更新のServer Action
export const updateEvent = async (input: UpdateEventInput) => {
  const effect = Effect.gen(function* () {
    const eventService = yield* EventService;
    const event = yield* eventService.update(input);
    return event;
  });

  return runServerActionSafe(effect);
};

// イベント削除のServer Action
export const deleteEvent = async (id: string) => {
  const effect = Effect.gen(function* () {
    const eventService = yield* EventService;
    yield* eventService.delete(id);
    return { deleted: true };
  });

  return runServerActionSafe(effect);
};

// 作成者のイベント一覧取得のServer Action
export const getEventsByCreator = async (creatorId: string) => {
  const effect = Effect.gen(function* () {
    const eventService = yield* EventService;
    const events = yield* eventService.listByCreator(creatorId);
    return events;
  });

  return runServerActionSafe(effect);
};

// フォームからのイベント作成のServer Action
export const createEventAction = async (formData: unknown) => {
  const effect = Effect.gen(function* () {
    // フォームデータをバリデーション
    const validatedData =
      yield* Schema.decodeUnknown(CreateEventRequest)(formData);

    // 現在のユーザーを取得
    const authService = yield* AuthService;
    const authenticatedUserOption = yield* authService.getAuthenticatedUser;

    // Option.Someでない場合はエラー
    if (Option.isNone(authenticatedUserOption)) {
      return yield* Effect.fail(
        new AuthenticationError({
          message: "認証が必要です",
        }),
      );
    }

    const currentUser = authenticatedUserOption.value;

    // イベント作成のためのデータを構築
    // PlainDateの文字列表現をISO DateTime文字列に変換
    const startDateTime = `${validatedData.dateRange.start satisfies string}T00:00:00.000Z`;
    const endDateTime = `${validatedData.dateRange.end satisfies string}T23:59:59.999Z`;
    const deadlineDateTime = validatedData.changeDeadline
      ? `${validatedData.changeDeadline satisfies string}T23:59:59.999Z`
      : undefined;

    const createInput: CreateEventInput = {
      name: Schema.decodeUnknownSync(NonEmptyString)(validatedData.name),
      description: validatedData.description || undefined,
      dateRangeStart: Schema.decodeUnknownSync(DateTimeString)(startDateTime),
      dateRangeEnd: Schema.decodeUnknownSync(DateTimeString)(endDateTime),
      timeSlotDuration: validatedData.timeSlotDuration,
      deadline: deadlineDateTime
        ? Schema.decodeUnknownSync(DateTimeString)(deadlineDateTime)
        : undefined,
      creatorId: currentUser.id,
      participantRestrictionType:
        validatedData.permission === "public"
          ? "none"
          : validatedData.permission === "link-only"
            ? "none"
            : "login_required",
      allowedDomains: [],
      allowedEmails: [],
      creatorCanSeeEmails: true,
      participantsCanSeeEach: validatedData.permission === "public",
      isLinkOnly: validatedData.permission === "link-only",
    };

    // イベントを作成
    const eventService = yield* EventService;
    const event = yield* eventService.create(createInput);

    return { eventId: event.id };
  });

  return runServerActionSafe(effect);
};
