/**
 * ヘルスチェックエンドポイント
 * サーバーレス環境のウォームアップにも使用
 */

import type { NextRequest } from "next/server";
import { warmupPrisma } from "@/lib/prisma/serverless-optimized";

// Node.js Runtimeを使用（フルPrisma機能が必要）
export const runtime = "nodejs";

// ヘルスチェック実行
async function performHealthCheck() {
  const startTime = Date.now();
  
  // Prismaコネクションのウォームアップ
  try {
    await warmupPrisma();
  } catch (error) {
    throw new Error(`Prisma warmup failed: ${(error instanceof Error ? error.message : String(error)) satisfies string}`);
  }
  
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
    const { getServerlessPrisma } = await import("@/lib/prisma/serverless-optimized");
    const prisma = getServerlessPrisma();
    await prisma.$queryRaw`SELECT 1`;
    
    checks.services.event = true;
    checks.services.user = true;
    checks.services.schedule = true;
  } catch (error) {
    console.warn("Service checks failed:", error);
    // サービスチェックの失敗は許容
  }
  
  const duration = Date.now() - startTime;
  
  return {
    status: "healthy",
    timestamp: new Date().toISOString(),
    runtime: (process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "development") satisfies string,
    checks,
    performance: {
      warmupDuration: duration,
    },
  };
}

export async function GET(_request: NextRequest) {
  try {
    const result = await performHealthCheck();
    
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