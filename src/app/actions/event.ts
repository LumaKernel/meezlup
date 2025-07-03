"use server";

import { Effect } from "effect";
import { EventService, type CreateEventInput, type UpdateEventInput } from "@/lib/effects";
import { runServerActionSafe } from "./runtime";

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