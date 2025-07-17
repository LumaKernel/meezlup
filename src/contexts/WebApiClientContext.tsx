"use client";

import type { Layer } from "effect";
import { createContext, useContext } from "react";

// 一時的な型定義（後で実際のRPCクライアントに置き換え）
export interface WebApiClient {
  readonly _tag: "WebApiClient";
}

const WebApiClientLayerContext =
  createContext<Layer.Layer<WebApiClient> | null>(null);

export const useWebApiClientLayer = () => {
  const layer = useContext(WebApiClientLayerContext);
  if (layer == null) {
    throw new Error(
      "useWebApiClientLayer must be used within WebApiClientProvider",
    );
  }
  return layer;
};

type WebApiClientProviderProps = {
  readonly children: React.ReactNode;
  readonly layer: Layer.Layer<WebApiClient>;
};

export const WebApiClientProvider = ({
  children,
  layer,
}: WebApiClientProviderProps) => {
  return (
    <WebApiClientLayerContext.Provider value={layer}>
      {children}
    </WebApiClientLayerContext.Provider>
  );
};
