import "server-only";
import { Layer } from "effect";
import { DatabaseServiceLive } from "./database";
import { EventServiceLive } from "./event";
import { UserServiceLive } from "./user";
import { ScheduleServiceLive } from "./schedule";
import { AuthServiceLiveFull } from "./auth";

// サーバーサイドのすべてのサービスを含むレイヤー
export const ServicesLive = Layer.mergeAll(
  DatabaseServiceLive,
  EventServiceLive,
  UserServiceLive,
  ScheduleServiceLive,
  AuthServiceLiveFull,
);

// サーバーサイドサービスの再エクスポート
export * from "./database";
export * from "./event";
export {
  UserService,
  UserServiceLive,
  type UserServiceType,
} from "./user/service";
export * from "./schedule";
export * from "./auth";
