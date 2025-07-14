import { fn } from "@storybook/test";

// Navigation関連のモックデータ型
export interface MockRouterInstance {
  push: (href: string) => void;
  replace: (href: string) => void;
  refresh: () => void;
  back: () => void;
  forward: () => void;
  prefetch: (href: string) => void;
}

export interface MockParams {
  locale: string;
  [key: string]: string;
}

// デフォルトのモックルーター
export const createMockRouter = (): MockRouterInstance => ({
  push: fn<(href: string) => void>(),
  replace: fn<(href: string) => void>(),
  refresh: fn<() => void>(),
  back: fn<() => void>(),
  forward: fn<() => void>(),
  prefetch: fn<(href: string) => void>(),
});

// デフォルトのモックパラメータ
export const createMockParams = (locale: string = "ja"): MockParams => ({
  locale,
});
