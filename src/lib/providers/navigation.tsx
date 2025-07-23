"use client";

import { createContext, useContext } from "react";
import { useRouter as useNextRouter, useParams as useNextParams } from "next/navigation";

export interface NavigationContext {
  readonly push: (path: string) => void;
  readonly replace: (path: string) => void;
  readonly back: () => void;
  readonly refresh: () => void;
  readonly params: Record<string, string>;
}

const NavigationContext = createContext<NavigationContext | undefined>(undefined);

export interface NavigationProviderProps {
  readonly children: React.ReactNode;
  readonly value?: NavigationContext;
}

export function NavigationProvider({ 
  children, 
  value 
}: NavigationProviderProps) {
  // valueが提供されている場合（テスト環境）は、Next.jsのルーターを使わない
  const router = value ? null : useNextRouter();
  const params = value ? {} : useNextParams();
  
  const defaultValue: NavigationContext = value ?? {
    push: (path) => { router!.push(path); },
    replace: (path) => { router!.replace(path); },
    back: () => { router!.back(); },
    refresh: () => { router!.refresh(); },
    params: params as Record<string, string>,
  };
  
  return (
    <NavigationContext.Provider value={defaultValue}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (context == null) {
    throw new Error("useNavigation must be used within NavigationProvider");
  }
  return context;
}