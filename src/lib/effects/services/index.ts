import { Layer } from "effect";
import { DatabaseServiceLive } from "./database";
import { EventServiceLive } from "./event";
import { UserServiceLive } from "./user";
import { ScheduleServiceLive } from "./schedule";
import { AuthServiceLive } from "./auth";

// すべてのサービスを含むレイヤー
export const ServicesLive = Layer.mergeAll(
  DatabaseServiceLive,
  EventServiceLive,
  UserServiceLive,
  ScheduleServiceLive,
  AuthServiceLive,
);

// 各サービスの再エクスポート
export { AuthService, AuthServiceLive } from "./auth/service";
export {
  AuthenticatedUserSchema,
  AnonymousUserSchema,
  AuthStateSchema,
  type AuthenticatedUser,
  type AnonymousUser,
  type AuthState,
} from "./auth/schemas";
export * from "./database";
export * from "./event";
export { UserService, UserServiceLive, type UserServiceType } from "./user";
export {
  UserSchema,
  type User,
  type CreateUserInput,
  type UpdateUserInput,
  type Auth0User,
  type Language,
} from "./user/schemas";
export * from "./schedule";
