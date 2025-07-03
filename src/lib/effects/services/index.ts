import { Layer } from "effect";
import { DatabaseServiceLive } from "./database";
import { EventServiceLive } from "./event";
import { UserServiceLive } from "./user";
import { ScheduleServiceLive } from "./schedule";

// すべてのサービスを含むレイヤー
export const ServicesLive = Layer.mergeAll(
  DatabaseServiceLive,
  EventServiceLive,
  UserServiceLive,
  ScheduleServiceLive,
);

// 各サービスの再エクスポート
export * from "./database";
export * from "./event";
export * from "./user";
export * from "./schedule";
