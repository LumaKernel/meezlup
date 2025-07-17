import { Effect, Context, Layer, Option, Schema } from "effect";

/**
 * LocalStorageのキータイプ
 */
export interface LocalStorageKey {
  readonly eventId: string;
  readonly key: string;
}

/**
 * LocalStorageに保存する参加者情報
 */
export const StoredParticipantInfo = Schema.Struct({
  name: Schema.String,
  email: Schema.String,
  scheduleId: Schema.optional(Schema.String),
});

export type StoredParticipantInfo = Schema.Schema.Type<
  typeof StoredParticipantInfo
>;

/**
 * LocalStorageService インターフェース
 */
export interface LocalStorageService {
  readonly get: (key: LocalStorageKey) => Effect.Effect<Option.Option<string>>;
  readonly set: (key: LocalStorageKey, value: string) => Effect.Effect<void>;
  readonly remove: (key: LocalStorageKey) => Effect.Effect<void>;
  readonly getParticipantInfo: (
    eventId: string,
  ) => Effect.Effect<
    Option.Option<StoredParticipantInfo>,
    never,
    LocalStorageService
  >;
  readonly setParticipantInfo: (
    eventId: string,
    info: StoredParticipantInfo,
  ) => Effect.Effect<void, never, LocalStorageService>;
  readonly getScheduleId: (
    eventId: string,
  ) => Effect.Effect<Option.Option<string>, never, LocalStorageService>;
  readonly setScheduleId: (
    eventId: string,
    scheduleId: string,
  ) => Effect.Effect<void, never, LocalStorageService>;
}

/**
 * LocalStorageService タグ
 */
export const LocalStorageService = Context.GenericTag<LocalStorageService>(
  "@app/LocalStorageService",
);

/**
 * ストレージキーを生成
 */
const makeStorageKey = (key: LocalStorageKey): string =>
  `event-${key.eventId satisfies string}-${key.key satisfies string}`;

/**
 * LocalStorageの実装
 */
const LocalStorageServiceImpl = LocalStorageService.of({
  get: (key) =>
    Effect.sync(() => {
      if (typeof window === "undefined") return Option.none();
      const value = localStorage.getItem(makeStorageKey(key));
      return value ? Option.some(value) : Option.none();
    }),

  set: (key, value) =>
    Effect.sync(() => {
      if (typeof window === "undefined") return;
      localStorage.setItem(makeStorageKey(key), value);
    }),

  remove: (key) =>
    Effect.sync(() => {
      if (typeof window === "undefined") return;
      localStorage.removeItem(makeStorageKey(key));
    }),

  getParticipantInfo: (eventId) =>
    Effect.gen(function* () {
      const service = yield* LocalStorageService;

      const name = yield* service.get({ eventId, key: "name" });
      const email = yield* service.get({ eventId, key: "email" });
      const scheduleId = yield* service.get({ eventId, key: "scheduleId" });

      // 名前とメールが両方ない場合はNone
      if (Option.isNone(name) && Option.isNone(email)) {
        return Option.none();
      }

      return Option.some({
        name: Option.getOrElse(name, () => ""),
        email: Option.getOrElse(email, () => ""),
        scheduleId: Option.getOrElse(scheduleId, () => undefined),
      });
    }),

  setParticipantInfo: (eventId, info) =>
    Effect.gen(function* () {
      const service = yield* LocalStorageService;

      yield* service.set({ eventId, key: "name" }, info.name);
      yield* service.set({ eventId, key: "email" }, info.email);

      if (info.scheduleId) {
        yield* service.set({ eventId, key: "scheduleId" }, info.scheduleId);
      }
    }),

  getScheduleId: (eventId) =>
    Effect.gen(function* () {
      const service = yield* LocalStorageService;
      return yield* service.get({ eventId, key: "scheduleId" });
    }),

  setScheduleId: (eventId, scheduleId) =>
    Effect.gen(function* () {
      const service = yield* LocalStorageService;
      yield* service.set({ eventId, key: "scheduleId" }, scheduleId);
    }),
});

/**
 * LocalStorageService レイヤー
 */
export const LocalStorageServiceLive = Layer.succeed(
  LocalStorageService,
  LocalStorageServiceImpl,
);
