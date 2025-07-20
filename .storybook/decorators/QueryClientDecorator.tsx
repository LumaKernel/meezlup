import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Storybook用のQueryClient設定
// テスト環境に最適化された設定を使用
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        // Storybookでは自動的な再フェッチを無効化
        retry: false,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        // キャッシュ時間を短くしてStoryの切り替え時にクリーンな状態を保つ
        staleTime: 0,
        gcTime: 0,
      },
      mutations: {
        // エラー時の再試行を無効化
        retry: false,
      },
    },
    // エラーをコンソールに表示しない（Storybookの見た目を綺麗に保つ）
    logger: {
      log: console.log,
      warn: console.warn,
      error: () => {},
    },
  });

// QueryClientを各Storyで再利用するためのキャッシュ
let queryClient: QueryClient | null = null;

/**
 * React QueryのQueryClientProviderを提供するStorybookデコレーター
 */
export const withQueryClient = (Story: React.FC) => {
  // Storyごとに新しいQueryClientを作成（状態の汚染を防ぐ）
  React.useEffect(() => {
    queryClient = createTestQueryClient();
    return () => {
      queryClient?.clear();
      queryClient = null;
    };
  }, []);

  // 初回レンダリング時にQueryClientが存在しない場合は作成
  if (!queryClient) {
    queryClient = createTestQueryClient();
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Story />
    </QueryClientProvider>
  );
};
