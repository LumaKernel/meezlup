"use client";

import { Effect, Option, Schema, pipe } from "effect";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { AuthUser } from "@/lib/auth/hooks";
import type { Event as EffectEvent } from "@/lib/effects/services/event/schemas";

// 参加者情報の型
export const ParticipantInfo = Schema.Struct({
  name: Schema.String,
  email: Schema.String,
  scheduleId: Schema.optional(Schema.String),
});

export type ParticipantInfo = Schema.Schema.Type<typeof ParticipantInfo>;

// ローカルストレージのキー生成
const makeStorageKey = (eventId: string, key: string): string =>
  `event-${eventId satisfies string}-${key satisfies string}`;

// ローカルストレージ操作のEffect
const LocalStorageEffect = {
  get: (key: string) =>
    Effect.sync(() => {
      if (typeof window === "undefined") return Option.none();
      const value = localStorage.getItem(key);
      return value ? Option.some(value) : Option.none();
    }),

  set: (key: string, value: string) =>
    Effect.sync(() => {
      if (typeof window === "undefined") return;
      localStorage.setItem(key, value);
    }),

  remove: (key: string) =>
    Effect.sync(() => {
      if (typeof window === "undefined") return;
      localStorage.removeItem(key);
    }),
};

// 参加者情報の取得Effect
const getParticipantInfo = (
  event: EffectEvent,
  user: AuthUser | null,
): Effect.Effect<ParticipantInfo> =>
  Effect.gen(function* () {
    // 認証済みユーザーの場合
    if (user) {
      return {
        name: user.name || user.email,
        email: user.email,
        scheduleId: undefined, // 認証済みユーザーはuserIdで照合するため不要
      };
    }

    // 非認証ユーザーの場合、ローカルストレージから復元
    const savedEmail = yield* LocalStorageEffect.get(
      makeStorageKey(event.id, "email"),
    );
    const savedName = yield* LocalStorageEffect.get(
      makeStorageKey(event.id, "name"),
    );
    const savedScheduleId = yield* LocalStorageEffect.get(
      makeStorageKey(event.id, "scheduleId"),
    );

    return {
      name: Option.getOrElse(savedName, () => ""),
      email: Option.getOrElse(savedEmail, () => ""),
      scheduleId: Option.getOrElse(savedScheduleId, () => undefined),
    };
  });

// 参加者情報の保存Effect
const saveParticipantInfo = (
  event: EffectEvent,
  info: ParticipantInfo,
  scheduleId?: string,
): Effect.Effect<void> =>
  Effect.gen(function* () {
    yield* LocalStorageEffect.set(
      makeStorageKey(event.id, "email"),
      info.email,
    );
    yield* LocalStorageEffect.set(makeStorageKey(event.id, "name"), info.name);
    if (scheduleId) {
      yield* LocalStorageEffect.set(
        makeStorageKey(event.id, "scheduleId"),
        scheduleId,
      );
    }
  });

// 現在のユーザーのスロット判定Effect
export const isCurrentUserSlot = (
  user: AuthUser | null,
  participantUserId: string | null,
  participantScheduleId: string,
  savedScheduleId: Option.Option<string>,
): boolean =>
  pipe(
    Option.fromNullable(user),
    Option.match({
      // 非認証ユーザーの場合：scheduleIdで照合
      onNone: () =>
        pipe(
          savedScheduleId,
          Option.match({
            onNone: () => false,
            onSome: (id) => id === participantScheduleId,
          }),
        ),
      // 認証済みユーザーの場合：userIdで照合
      onSome: (u) => participantUserId === u.id,
    }),
  );

// カスタムフック
export function useParticipantState(event: EffectEvent, user: AuthUser | null) {
  // 参加者情報の取得
  const { data: initialInfo } = useQuery({
    queryKey: ["participant", "info", event.id, user?.id],
    queryFn: async () => {
      return await pipe(getParticipantInfo(event, user), Effect.runPromise);
    },
  });

  // scheduleIdの取得
  const { data: savedScheduleId = Option.none() } = useQuery({
    queryKey: ["participant", "scheduleId", event.id],
    queryFn: async () => {
      return await pipe(
        LocalStorageEffect.get(makeStorageKey(event.id, "scheduleId")),
        Effect.runPromise,
      );
    },
  });

  // React Queryのデータから直接使用、またはローカル更新を保持
  const [localUpdates, setLocalUpdates] = useState<Partial<ParticipantInfo>>(
    {},
  );

  // 現在の参加者情報（React Queryデータ + ローカル更新）
  const participantInfo: ParticipantInfo = {
    ...(initialInfo || {
      name: "",
      email: "",
      scheduleId: undefined,
    }),
    ...localUpdates,
  };

  // 情報更新関数
  const updateParticipantInfo = (
    updates: Partial<ParticipantInfo>,
  ): ParticipantInfo => {
    setLocalUpdates((prev) => ({ ...prev, ...updates }));
    return { ...participantInfo, ...updates };
  };

  // 保存関数
  const saveInfo = (scheduleId?: string): Effect.Effect<void> =>
    saveParticipantInfo(event, participantInfo, scheduleId);

  return {
    participantInfo,
    savedScheduleId,
    updateParticipantInfo,
    saveInfo,
    isCurrentUserSlot: (
      participantUserId: string | null,
      participantScheduleId: string,
    ) =>
      isCurrentUserSlot(
        user,
        participantUserId,
        participantScheduleId,
        savedScheduleId,
      ),
  };
}
