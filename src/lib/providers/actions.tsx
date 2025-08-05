"use client";

import { createContext, useContext } from "react";
import type { ActionResponse } from "@/app/actions/runtime";
import type {
  TimeSlotAggregation,
  Schedule,
} from "@/lib/effects/services/schedule/schemas";
import type { Event } from "@/lib/effects/services/event/schemas";

// Server action types - これらは実際のアクションと同じシグネチャを持つ必要がある
/* eslint-disable @typescript-eslint/no-explicit-any */
export interface ActionsContext {
  readonly event: {
    readonly create: (...args: Array<any>) => Promise<ActionResponse<Event>>;
    readonly update: (...args: Array<any>) => Promise<ActionResponse<Event>>;
    readonly delete: (
      ...args: Array<any>
    ) => Promise<ActionResponse<{ readonly deleted: boolean }>>;
    readonly get: (eventId: string) => Promise<ActionResponse<Event>>;
  };
  readonly schedule: {
    readonly create: (...args: Array<any>) => Promise<ActionResponse<Schedule>>;
    readonly update: (...args: Array<any>) => Promise<ActionResponse<Schedule>>;
    readonly submit: (
      ...args: Array<any>
    ) => Promise<ActionResponse<{ readonly scheduleId: string }>>;
    readonly getAggregated: (
      eventId: string,
    ) => Promise<ActionResponse<Array<TimeSlotAggregation>>>;
    readonly getByEvent: (
      eventId: string,
    ) => Promise<ActionResponse<Array<Schedule>>>;
    readonly getByEventAndUser: (
      eventId: string,
      userId: string,
    ) => Promise<ActionResponse<Schedule>>;
    readonly delete: (
      scheduleId: string,
    ) => Promise<ActionResponse<{ readonly deleted: boolean }>>;
  };
}

const ActionsContext = createContext<ActionsContext | undefined>(undefined);

export interface ActionsProviderProps {
  readonly children: React.ReactNode;
  readonly value?: ActionsContext;
}

export function ActionsProvider({ children, value }: ActionsProviderProps) {
  // ActionsProviderは必ずvalueを提供する必要がある
  // 本番環境では、Server Componentからpropsとして渡される
  // テスト環境では、モック実装を提供する
  if (!value) {
    throw new Error("ActionsProvider requires a value prop");
  }

  return (
    <ActionsContext.Provider value={value}>{children}</ActionsContext.Provider>
  );
}

export function useActions() {
  const context = useContext(ActionsContext);
  if (context == null) {
    throw new Error("useActions must be used within ActionsProvider");
  }
  return context;
}
