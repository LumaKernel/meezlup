/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment -- Storybookのモック関数として必要 */
import { fn } from "@storybook/test";
import * as actual from "../schedule";

// 実際のエクスポートをすべて再エクスポート
export * from "../schedule";

// モック関数を作成
// TypeScriptがpackage.jsonのimportsフィールドを認識しないため、
// Storybookで使用される際はanyとして扱われる必要がある
export const createSchedule = fn(actual.createSchedule).mockName(
  "createSchedule",
) as any;
export const getSchedule = fn(actual.getSchedule).mockName(
  "getSchedule",
) as any;
export const getScheduleByEventAndUser = fn(
  actual.getScheduleByEventAndUser,
).mockName("getScheduleByEventAndUser") as any;
export const updateSchedule = fn(actual.updateSchedule).mockName(
  "updateSchedule",
) as any;
export const deleteSchedule = fn(actual.deleteSchedule).mockName(
  "deleteSchedule",
) as any;
export const getSchedulesByEvent = fn(actual.getSchedulesByEvent).mockName(
  "getSchedulesByEvent",
) as any;
export const getAggregatedTimeSlots = fn(
  actual.getAggregatedTimeSlots,
).mockName("getAggregatedTimeSlots") as any;
export const submitAvailability = fn(actual.submitAvailability).mockName(
  "submitAvailability",
) as any;
