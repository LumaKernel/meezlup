import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

// Next.js navigation モックの型定義
export type MockAppRouterInstance = Pick<
  AppRouterInstance,
  "push" | "replace" | "refresh" | "back" | "forward" | "prefetch"
>;

export interface MockParams {
  locale: string;
  [key: string]: string | Array<string>;
}
