import { describe, it, expect, beforeEach } from "vitest";
import { Effect, Option, Runtime } from "effect";
import {
  LocalStorageService,
  LocalStorageServiceLive,
  type StoredParticipantInfo,
} from "./local-storage";

describe("LocalStorageService", () => {
  const runtime = Runtime.defaultRuntime;

  beforeEach(() => {
    // LocalStorageをクリア
    localStorage.clear();
  });

  describe("基本的な get/set 操作", () => {
    it("値を保存して取得できる", async () => {
      const program = Effect.gen(function* () {
        const service = yield* LocalStorageService;

        // 値を保存
        yield* service.set({ eventId: "event1", key: "test" }, "testValue");

        // 値を取得
        const result = yield* service.get({ eventId: "event1", key: "test" });

        return result;
      });

      const result = await Runtime.runPromise(runtime)(
        Effect.provide(program, LocalStorageServiceLive),
      );

      expect(Option.isSome(result)).toBe(true);
      expect(Option.getOrElse(result, () => "")).toBe("testValue");
    });

    it("存在しない値を取得するとNoneを返す", async () => {
      const program = Effect.gen(function* () {
        const service = yield* LocalStorageService;
        return yield* service.get({ eventId: "event1", key: "nonexistent" });
      });

      const result = await Runtime.runPromise(runtime)(
        Effect.provide(program, LocalStorageServiceLive),
      );

      expect(Option.isNone(result)).toBe(true);
    });
  });

  describe("参加者情報の保存と取得", () => {
    it("参加者情報を保存して取得できる", async () => {
      const participantInfo: StoredParticipantInfo = {
        name: "山田太郎",
        email: "yamada@example.com",
        scheduleId: "schedule123",
        selectedSlots: ["2025-01-20_09:00", "2025-01-20_10:00"],
      };

      const program = Effect.gen(function* () {
        const service = yield* LocalStorageService;

        // 参加者情報を保存
        yield* service.setParticipantInfo("event1", participantInfo);

        // 参加者情報を取得
        return yield* service.getParticipantInfo("event1");
      });

      const result = await Runtime.runPromise(runtime)(
        Effect.provide(program, LocalStorageServiceLive),
      );

      expect(Option.isSome(result)).toBe(true);
      const info = Option.getOrElse(result, () => ({
        name: "",
        email: "",
        scheduleId: undefined,
        selectedSlots: undefined,
      }));

      expect(info.name).toBe("山田太郎");
      expect(info.email).toBe("yamada@example.com");
      expect(info.scheduleId).toBe("schedule123");
      expect(info.selectedSlots).toEqual([
        "2025-01-20_09:00",
        "2025-01-20_10:00",
      ]);
    });

    it("部分的な参加者情報も保存できる", async () => {
      const participantInfo: StoredParticipantInfo = {
        name: "鈴木次郎",
        email: "suzuki@example.com",
        scheduleId: undefined,
        selectedSlots: undefined,
      };

      const program = Effect.gen(function* () {
        const service = yield* LocalStorageService;
        yield* service.setParticipantInfo("event2", participantInfo);
        return yield* service.getParticipantInfo("event2");
      });

      const result = await Runtime.runPromise(runtime)(
        Effect.provide(program, LocalStorageServiceLive),
      );

      expect(Option.isSome(result)).toBe(true);
      const info = Option.getOrElse(result, () => ({
        name: "",
        email: "",
        scheduleId: undefined,
        selectedSlots: undefined,
      }));

      expect(info.name).toBe("鈴木次郎");
      expect(info.email).toBe("suzuki@example.com");
      expect(info.scheduleId).toBeUndefined();
      expect(info.selectedSlots).toBeUndefined();
    });
  });

  describe("選択した時間枠の保存と取得", () => {
    it("選択した時間枠を保存して取得できる", async () => {
      const slots = [
        "2025-01-20_09:00",
        "2025-01-20_10:00",
        "2025-01-20_11:00",
      ];

      const program = Effect.gen(function* () {
        const service = yield* LocalStorageService;

        // 時間枠を保存
        yield* service.setSelectedSlots("event3", slots);

        // 時間枠を取得
        return yield* service.getSelectedSlots("event3");
      });

      const result = await Runtime.runPromise(runtime)(
        Effect.provide(program, LocalStorageServiceLive),
      );

      expect(Option.isSome(result)).toBe(true);
      expect(Option.getOrElse(result, () => [])).toEqual(slots);
    });

    it("無効なJSON形式の場合はNoneを返す", async () => {
      // 直接LocalStorageに無効なJSONを設定
      localStorage.setItem("event-event4-selectedSlots", "invalid json");

      const program = Effect.gen(function* () {
        const service = yield* LocalStorageService;
        return yield* service.getSelectedSlots("event4");
      });

      const result = await Runtime.runPromise(runtime)(
        Effect.provide(program, LocalStorageServiceLive),
      );

      expect(Option.isNone(result)).toBe(true);
    });
  });

  describe("スケジュールIDの保存と取得", () => {
    it("スケジュールIDを保存して取得できる", async () => {
      const program = Effect.gen(function* () {
        const service = yield* LocalStorageService;

        // スケジュールIDを保存
        yield* service.setScheduleId("event5", "schedule456");

        // スケジュールIDを取得
        return yield* service.getScheduleId("event5");
      });

      const result = await Runtime.runPromise(runtime)(
        Effect.provide(program, LocalStorageServiceLive),
      );

      expect(Option.isSome(result)).toBe(true);
      expect(Option.getOrElse(result, () => "")).toBe("schedule456");
    });
  });
});
