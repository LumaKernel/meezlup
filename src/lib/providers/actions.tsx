"use client";

import { createContext, useContext } from "react";

// Server action types - これらは実際のアクションと同じシグネチャを持つ必要がある
/* eslint-disable @typescript-eslint/no-explicit-any */
export interface ActionsContext {
  readonly event: {
    readonly create: (...args: Array<any>) => Promise<any>;
    readonly update: (...args: Array<any>) => Promise<any>;
    readonly delete: (...args: Array<any>) => Promise<any>;
    readonly get: (...args: Array<any>) => Promise<any>;
  };
  readonly schedule: {
    readonly create: (...args: Array<any>) => Promise<any>;
    readonly update: (...args: Array<any>) => Promise<any>;
    readonly submit: (...args: Array<any>) => Promise<any>;
    readonly getAggregated: (...args: Array<any>) => Promise<any>;
    readonly getByEvent: (...args: Array<any>) => Promise<any>;
    readonly getByEventAndUser: (...args: Array<any>) => Promise<any>;
    readonly delete: (...args: Array<any>) => Promise<any>;
  };
}

const ActionsContext = createContext<ActionsContext | undefined>(undefined);

export interface ActionsProviderProps {
  readonly children: React.ReactNode;
  readonly value?: ActionsContext;
}

export function ActionsProvider({ 
  children, 
  value 
}: ActionsProviderProps) {
  // ActionsProviderは必ずvalueを提供する必要がある
  // 本番環境では、Server Componentからpropsとして渡される
  // テスト環境では、モック実装を提供する
  if (!value) {
    throw new Error("ActionsProvider requires a value prop");
  }
  
  return (
    <ActionsContext.Provider value={value}>
      {children}
    </ActionsContext.Provider>
  );
}

export function useActions() {
  const context = useContext(ActionsContext);
  if (context == null) {
    throw new Error("useActions must be used within ActionsProvider");
  }
  return context;
}