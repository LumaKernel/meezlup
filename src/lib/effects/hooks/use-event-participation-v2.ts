"use client";

import { useState, useEffect as useReactEffect, useMemo } from "react";
import { Effect, Option, pipe, Runtime } from "effect";
import { useQuery, useMutation } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import type { Event as EffectEvent } from "@/lib/effects/services/event/schemas";
import { useAuth } from "@/lib/auth/hooks";
import {
  submitAvailability,
  getAggregatedTimeSlots,
} from "@/app/actions/schedule";
import {
  LocalStorageService,
  type StoredParticipantInfo,
  LocalStorageServiceLive,
} from "@/lib/effects/services";
import { processAggregations, type Participant } from "./time-slot-aggregation";

// ランタイムを作成（実際のプロジェクトではプロバイダーから取得すべき）
const runtime = Runtime.defaultRuntime;

export function useEventParticipationV2(event: EffectEvent, locale: string) {
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useTranslation("schedule");
  const [selectedSlots, setSelectedSlots] = useState<ReadonlySet<string>>(
    new Set(),
  );
  const [participantInfo, setParticipantInfo] = useState<StoredParticipantInfo>(
    {
      name: "",
      email: "",
      scheduleId: undefined,
    },
  );

  // LocalStorageから参加者情報を読み込む
  useReactEffect(() => {
    const loadParticipantInfo = pipe(
      Effect.gen(function* () {
        const localStorageService = yield* LocalStorageService;
        const storedInfo = yield* localStorageService.getParticipantInfo(
          event.id,
        );

        if (Option.isSome(storedInfo)) {
          return storedInfo.value;
        }

        // ユーザーが認証済みの場合はその情報を使用
        if (user) {
          return {
            name: user.name || user.email,
            email: user.email,
            scheduleId: undefined,
          };
        }

        return {
          name: "",
          email: "",
          scheduleId: undefined,
        };
      }),
      Effect.provide(LocalStorageServiceLive),
      Runtime.runPromise(runtime),
    );

    loadParticipantInfo.then(setParticipantInfo).catch((error: unknown) => {
      console.error("Failed to load participant info:", error);
    });
  }, [event.id, user]);

  // 集計データを取得
  const {
    data: aggregations,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["aggregatedTimeSlots", event.id],
    queryFn: async () => {
      const result = await getAggregatedTimeSlots(event.id);
      if (!result.success) {
        throw new Error(
          result.error || "Failed to fetch aggregated time slots",
        );
      }
      return result.data;
    },
  });

  // 現在のユーザーのスロット判定関数
  const isCurrentUserSlot = useMemo(() => {
    return (
      participantUserId: string | null,
      participantScheduleId: string,
    ) => {
      if (user) {
        // 認証済みユーザーの場合：userIdで照合
        return participantUserId === user.id;
      } else {
        // 非認証ユーザーの場合：scheduleIdで照合
        return participantInfo.scheduleId === participantScheduleId;
      }
    };
  }, [user, participantInfo.scheduleId]);

  // 参加者とユーザースロットの抽出
  const { currentUserSlots, participants } = useMemo(() => {
    if (!aggregations) {
      return {
        participants: [],
        currentUserSlots: new Set<string>(),
      };
    }

    const result = pipe(
      processAggregations(aggregations, user, isCurrentUserSlot),
      Effect.runSync,
    );

    return result;
  }, [aggregations, user, isCurrentUserSlot]);

  // 初回のみ選択済みスロットを設定
  useReactEffect(() => {
    if (currentUserSlots.size > 0 && selectedSlots.size === 0) {
      setSelectedSlots(currentUserSlots);
    }
  }, [currentUserSlots]); // selectedSlotsは依存配列に含めない（初回のみ実行）

  // 参加者情報の保存
  const saveParticipantInfo = async (scheduleId?: string) => {
    await pipe(
      Effect.gen(function* () {
        const localStorageService = yield* LocalStorageService;
        yield* localStorageService.setParticipantInfo(event.id, {
          ...participantInfo,
          scheduleId,
        });
      }),
      Effect.provide(LocalStorageServiceLive),
      Runtime.runPromise(runtime),
    );
  };

  // フォーム送信のミューテーション
  const submitMutation = useMutation({
    mutationFn: async () => {
      // バリデーション
      if (selectedSlots.size === 0) {
        throw new Error(t("participate.selectTimeSlot"));
      }

      if (!user && (!participantInfo.name || !participantInfo.email)) {
        throw new Error(t("participate.enterNameAndEmail"));
      }

      // スロットIDから日付と時間を抽出
      const availableSlots = Array.from(selectedSlots).map((slotId) => {
        const [date, time] = slotId.split("_");
        return {
          date,
          time: time.substring(0, 5), // HH:MM形式に変換
        };
      });

      // submitAvailability実行
      const result = await submitAvailability({
        eventId: event.id,
        participantName: !user ? participantInfo.name : undefined,
        participantEmail: !user ? participantInfo.email : undefined,
        scheduleId: !user ? participantInfo.scheduleId : undefined,
        availableSlots,
      });

      if (!result.success) {
        throw new Error(result.error || "Unknown error");
      }

      // 非認証ユーザーの場合、情報を保存
      if (!user && result.data.scheduleId) {
        await saveParticipantInfo(result.data.scheduleId);
      }

      return result.data;
    },
    onSuccess: () => {
      notifications.show({
        title: t("participate.success"),
        message: t("participate.submitted"),
        color: "green",
      });
      router.push(
        `/${locale satisfies string}/events/${event.id satisfies string}/result`,
      );
    },
    onError: (error: Error) => {
      notifications.show({
        title: t("participate.error"),
        message: error.message,
        color: "red",
      });
    },
  });

  // 参加者情報の更新
  const updateParticipantInfo = (updates: Partial<StoredParticipantInfo>) => {
    setParticipantInfo((prev) => ({ ...prev, ...updates }));
  };

  return {
    participants: participants as Array<Participant>,
    selectedSlots,
    setSelectedSlots,
    participantInfo,
    updateParticipantInfo,
    handleSubmit: (e: React.FormEvent) => {
      e.preventDefault();
      submitMutation.mutate();
    },
    isLoading,
    isPending: submitMutation.isPending,
    error: error?.message || submitMutation.error?.message || null,
  };
}
