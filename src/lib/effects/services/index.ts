// クライアントサイドで使用可能なサービスのみインポート

// クライアントセーフなサービスのみを再エクスポート
// NOTE: DatabaseService, EventService, UserService, ScheduleServiceはserver-onlyのため除外

// Auth関連（クライアントセーフ）
export {
  AuthService,
  AuthServiceLive,
  AuthServiceLiveFull,
} from "./auth/service";
export {
  AuthenticatedUserSchema,
  AnonymousUserSchema,
  AuthStateSchema,
  type AuthenticatedUser,
  type AnonymousUser,
  type AuthState,
} from "./auth/schemas";

// LocalStorage関連（クライアントセーフ）
export {
  LocalStorageService,
  LocalStorageServiceLive,
  type StoredParticipantInfo,
} from "./local-storage";

// Schema型のみエクスポート（server-onlyでないもの）
export {
  UserSchema,
  type User,
  type CreateUserInput,
  type UpdateUserInput,
  type Auth0User,
  type Language,
} from "./user/schemas";

// Event schemasのみエクスポート（型定義のみ）
export {
  EventSchema,
  type Event,
  type CreateEventInput,
  type UpdateEventInput,
} from "./event/schemas";

// Schedule schemasのみエクスポート（型定義のみ）
export {
  ScheduleSchema,
  TimeSlotAggregationSchema,
  type Schedule,
  type TimeSlotAggregation,
  type CreateScheduleInput,
  type UpdateScheduleInput,
} from "./schedule/schemas";
