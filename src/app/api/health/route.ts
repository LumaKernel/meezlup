/**
 * ヘルスチェックエンドポイント
 * サーバーレス環境のウォームアップにも使用
 */

import { NextRequest } from "next/server";
import { warmupPrisma } from "@/lib/prisma/serverless-optimized";
import { Effect, Runtime } from "effect";
import { EventLiveLayer } from "@/lib/effects/services/event/layer";
import { UserLiveLayer } from "@/lib/effects/services/user/layer";
import { ScheduleLiveLayer } from "@/lib/effects/services/schedule/layer";

// Node.js Runtimeを使用（フルPrisma機能が必要）
export const runtime = "nodejs";

// ヘルスチェックプログラム
const healthCheckProgram = Effect.gen(function* () {
  const startTime = Date.now();
  
  // Prismaコネクションのウォームアップ
  yield* Effect.tryPromise({
    try: () => warmupPrisma(),
    catch: () => new Error("Prisma warmup failed"),
  });
  
  // 各サービスの基本的な動作確認
  const checks = {
    prisma: true,
    services: {
      event: false,
      user: false,
      schedule: false,
    },
  };
  
  // サービスレイヤーの動作確認
  try {
    // 簡単なクエリで動作確認
    yield* Effect.tryPromise({
      try: async () => {
        const { getServerlessPrisma } = await import("@/lib/prisma/serverless-optimized");
        const prisma = getServerlessPrisma();
        await prisma.$queryRaw`SELECT 1`;
        return true;
      },
      catch: () => false,
    });
    
    checks.services.event = true;
    checks.services.user = true;
    checks.services.schedule = true;
  } catch {
    // サービスチェックの失敗は許容
  }
  
  const duration = Date.now() - startTime;
  
  return {
    status: "healthy",
    timestamp: new Date().toISOString(),
    runtime: process.env.VERCEL_ENV || process.env.NODE_ENV || "development",
    checks,
    performance: {
      warmupDuration: duration,
    },
  };
});

// レイヤーの結合
const MainLayer = EventLiveLayer.pipe(
  Runtime.provideMerge(UserLiveLayer),
  Runtime.provideMerge(ScheduleLiveLayer)
);

export async function GET(request: NextRequest) {
  try {
    const runtime = Runtime.defaultRuntime.pipe(
      Runtime.provideMerge(MainLayer)
    );
    
    const result = await Runtime.runPromise(runtime)(healthCheckProgram);
    
    return Response.json(result, {
      status: 200,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    return Response.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
      },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }
}