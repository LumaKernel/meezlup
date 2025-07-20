import { fn } from "@storybook/test";
import * as actual from "../event";

// 実際のエクスポートをすべて再エクスポート
export * from "../event";

// モック関数を作成
export const createEvent = fn(actual.createEvent).mockName("createEvent");
export const getEvent = fn(actual.getEvent).mockName("getEvent");
export const updateEvent = fn(actual.updateEvent).mockName("updateEvent");
export const deleteEvent = fn(actual.deleteEvent).mockName("deleteEvent");
export const getEventsByCreator = fn(actual.getEventsByCreator).mockName(
  "getEventsByCreator",
);
