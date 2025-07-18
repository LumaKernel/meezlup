import { fn } from "@storybook/test";
import * as actual from "./schedule";

// 実際のエクスポートをすべて再エクスポート
export * from "./schedule";

// モック関数を作成
export const getAggregatedTimeSlots = fn(actual.getAggregatedTimeSlots).mockName("getAggregatedTimeSlots");
export const addSchedule = fn(actual.addSchedule).mockName("addSchedule");
export const updateSchedule = fn(actual.updateSchedule).mockName("updateSchedule");
export const deleteSchedule = fn(actual.deleteSchedule).mockName("deleteSchedule");
export const getSchedule = fn(actual.getSchedule).mockName("getSchedule");
export const getSchedulesByEvent = fn(actual.getSchedulesByEvent).mockName("getSchedulesByEvent");