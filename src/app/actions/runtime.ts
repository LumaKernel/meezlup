"use server";

import { type Effect, type Layer, ManagedRuntime, Exit, Cause } from "effect";
import { ServicesLive } from "@/lib/effects";
import type { AppError } from "@/lib/effects";

// Server Actions用のランタイムを作成
let runtime: ManagedRuntime.ManagedRuntime<
  Layer.Layer.Success<typeof ServicesLive>,
  never
> | null = null;

// ランタイムを取得（遅延初期化）
export const getRuntime = () => {
  if (!runtime) {
    runtime = ManagedRuntime.make(ServicesLive);
  }
  return runtime;
};

// Server ActionでEffectを実行するヘルパー
export const runServerAction = <A, E extends AppError>(
  effect: Effect.Effect<A, E, Layer.Layer.Success<typeof ServicesLive>>
): Promise<A> => {
  const rt = getRuntime();
  return rt.runPromise(effect);
};

// 成功/失敗のレスポンス型
export type ActionResponse<T> =
  | { readonly success: true; readonly data: T }
  | { readonly success: false; readonly error: string };

// Server ActionでEffectを実行し、ActionResponseを返すヘルパー
export const runServerActionSafe = async <A, E extends AppError>(
  effect: Effect.Effect<A, E, Layer.Layer.Success<typeof ServicesLive>>
): Promise<ActionResponse<A>> => {
  const rt = getRuntime();
  const exit = await rt.runPromiseExit(effect);
  
  return Exit.match(exit, {
    onFailure: (cause) => {
      const failures = Cause.failures(cause);
      const failureArray = Array.from(failures);
      const firstError = failureArray[0];
      const error = firstError && 'message' in firstError && typeof firstError.message === 'string'
        ? firstError.message
        : "Unknown error";
      
      console.error("Server action failed:", cause);
      
      return {
        success: false,
        error,
      } as const;
    },
    onSuccess: (data) => ({
      success: true,
      data,
    }),
  });
};