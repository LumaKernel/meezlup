"use server";

import { Effect } from "effect";
import { ScheduleService, type CreateScheduleInput, type UpdateScheduleInput } from "@/lib/effects";
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
export const getScheduleByEventAndUser = async (eventId: string, userId: string) => {
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