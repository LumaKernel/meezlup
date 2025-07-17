"use client";

import { AuthProvider } from "@/lib/auth/provider";
import { Notifications } from "@mantine/notifications";
import "@/lib/i18n/client"; // i18nを初期化
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Layer, Context } from "effect";
import { useState, type ReactNode } from "react";
import {
  WebApiClientProvider,
  type WebApiClient,
} from "@/contexts/WebApiClientContext";

interface ProvidersProps {
  readonly children: ReactNode;
}

// 一時的なWebApiClientサービス
const WebApiClientTag = Context.GenericTag<WebApiClient>("@app/WebApiClient");

// 一時的なWebApiClientレイヤー（後で実際のサービスレイヤーに置き換え）
const createWebApiClientLayer = () => {
  return Layer.succeed(WebApiClientTag, {
    _tag: "WebApiClient",
  } as WebApiClient);
};

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // サーバー側で取得したデータを信頼する
            staleTime: 60 * 1000, // 1分
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  const [webApiClientLayer] = useState(() => createWebApiClientLayer());

  return (
    <QueryClientProvider client={queryClient}>
      <WebApiClientProvider layer={webApiClientLayer}>
        <AuthProvider>
          <Notifications />
          {children}
          <ReactQueryDevtools initialIsOpen={false} />
        </AuthProvider>
      </WebApiClientProvider>
    </QueryClientProvider>
  );
}
