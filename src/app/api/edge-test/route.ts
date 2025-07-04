/**
 * Edge Runtime動作確認用エンドポイント
 */

import type { NextRequest } from "next/server";
import {
  testEdgeCompatibility,
  runtime as edgeRuntime,
  createEdgePrismaClient,
} from "@/lib/prisma/edge-compat";

// Edge Runtimeを明示的に指定
export const runtime = "edge";

export async function GET(_request: NextRequest) {
  const results = {
    runtime: edgeRuntime.type,
    timestamp: new Date().toISOString(),
    compatibility: await testEdgeCompatibility(),
    environment: {
      hasWebSocket: edgeRuntime.hasWebSocket,
      hasStreams: edgeRuntime.hasStreams,
      canAccessFileSystem: edgeRuntime.canAccessFileSystem,
      canUseNativeModules: edgeRuntime.canUseNativeModules,
    },
    prismaTest: {
      success: false,
      error: null as string | null,
      data: null as unknown,
    },
  };

  // Prisma接続テスト
  if (process.env.DATABASE_URL) {
    try {
      const prisma = await createEdgePrismaClient(process.env.DATABASE_URL);

      // 基本的なクエリテスト
      const testQuery =
        await prisma.$queryRaw`SELECT 1 as test, NOW() as timestamp`;

      results.prismaTest.success = true;
      results.prismaTest.data = testQuery;
    } catch (error) {
      results.prismaTest.success = false;
      results.prismaTest.error =
        error instanceof Error ? error.message : "Unknown error";
    }
  } else {
    results.prismaTest.error = "DATABASE_URL not configured";
  }

  return Response.json(results, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
